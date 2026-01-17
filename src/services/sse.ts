import { Context } from 'hono'
import { streamSSE } from 'hono/streaming'
import { rtorrent, TorrentInfo, SystemInfo } from './rtorrent-service'

interface SSEClient {
  id: string
  send: (event: string, data: string) => void
}

interface Patch {
  op: 'add' | 'replace' | 'remove'
  path: string
  value?: any
}

interface SSEState {
  torrents: Map<string, TorrentInfo>
  systemInfo: SystemInfo | null
}

/**
 * Modern SSE Manager with:
 * - Granular JSON Patch diffing (RFC 6902 style)
 * - Batching: Collects changes over interval before sending
 * - Throttling: Minimum change thresholds to ignore noise
 * - Adaptive polling: Slower when idle, faster when active
 */
class SSEManager {
  private clients: Map<string, SSEClient> = new Map()
  private lastState: SSEState = { torrents: new Map(), systemInfo: null }
  private pollInterval: Timer | null = null
  private pendingPatches: Patch[] = []
  private lastBroadcast: number = 0
  
  // Configuration
  private readonly BATCH_INTERVAL = 500 // Collect changes for 500ms before sending
  private readonly ACTIVE_POLL_INTERVAL = 1000 // Poll every 1s when active downloads
  private readonly IDLE_POLL_INTERVAL = 5000 // Poll every 5s when idle
  private readonly RATE_CHANGE_THRESHOLD = 1024 // Ignore rate changes < 1KB/s
  private readonly PROGRESS_CHANGE_THRESHOLD = 0.1 // Ignore progress changes < 0.1%

  private currentPollInterval: number = this.ACTIVE_POLL_INTERVAL
  private batchTimer: Timer | null = null

  constructor() {
    this.startPolling()
  }

  private startPolling() {
    if (this.pollInterval) return
    
    console.log('[SSE] Starting adaptive polling system...')
    this.schedulePoll()
  }

  private schedulePoll() {
    this.pollInterval = setTimeout(async () => {
      await this.poll()
      this.schedulePoll()
    }, this.currentPollInterval)
  }

  private async poll() {
    if (this.clients.size === 0) return

    try {
      const [torrents, systemInfo] = await Promise.all([
        rtorrent.getTorrents(),
        rtorrent.getSystemInfo(),
      ])

      const newState: SSEState = {
        torrents: new Map(torrents.map(t => [t.hash, t])),
        systemInfo
      }

      // Calculate patches
      const patches = this.calculateDiff(this.lastState, newState)
      
      if (patches.length > 0) {
        this.queuePatches(patches)
      }

      // Update state
      this.lastState = newState

      // Adaptive polling: check if any torrent is actively transferring
      const hasActiveTransfer = torrents.some(t => 
        t.downloadRate > 0 || t.uploadRate > 0 || t.state === 'downloading'
      )
      
      const newInterval = hasActiveTransfer 
        ? this.ACTIVE_POLL_INTERVAL 
        : this.IDLE_POLL_INTERVAL

      if (newInterval !== this.currentPollInterval) {
        console.log(`[SSE] Switching to ${hasActiveTransfer ? 'active' : 'idle'} polling (${newInterval}ms)`)
        this.currentPollInterval = newInterval
      }

    } catch (error) {
      console.error('[SSE] Polling error:', error)
    }
  }

  /**
   * Queue patches for batched sending
   * Collects patches and sends them together after BATCH_INTERVAL
   */
  private queuePatches(patches: Patch[]) {
    this.pendingPatches.push(...patches)

    // If no batch timer running, start one
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushPatches()
      }, this.BATCH_INTERVAL)
    }
  }

  /**
   * Send all pending patches to clients
   */
  private flushPatches() {
    this.batchTimer = null

    if (this.pendingPatches.length === 0) return

    // Merge and deduplicate patches (last value wins for same path)
    const mergedPatches = this.mergePatches(this.pendingPatches)
    
    if (mergedPatches.length > 0) {
      const patchData = mergedPatches.map(p => ({ path: p.path, value: p.value }))
      this.broadcast('patch', JSON.stringify(patchData))
      
      // Log summary instead of each patch
      const pathSummary = this.summarizePaths(mergedPatches)
      console.log(`[SSE] Batch sent: ${mergedPatches.length} patches (${pathSummary})`)
    }

    this.pendingPatches = []
  }

  /**
   * Merge patches: if same path has multiple updates, keep only the last one
   */
  private mergePatches(patches: Patch[]): Patch[] {
    const pathMap = new Map<string, Patch>()
    
    for (const patch of patches) {
      if (patch.op === 'remove') {
        // For removes, delete any pending updates for this path
        for (const key of pathMap.keys()) {
          if (key.startsWith(patch.path)) {
            pathMap.delete(key)
          }
        }
      }
      pathMap.set(patch.path, patch)
    }
    
    return Array.from(pathMap.values())
  }

  /**
   * Summarize paths for logging
   */
  private summarizePaths(patches: Patch[]): string {
    const torrentChanges = patches.filter(p => p.path.startsWith('/torrents/')).length
    const systemChanges = patches.filter(p => p.path.startsWith('/systemInfo')).length
    
    const parts: string[] = []
    if (torrentChanges > 0) parts.push(`${torrentChanges} torrent updates`)
    if (systemChanges > 0) parts.push(`${systemChanges} system updates`)
    
    return parts.join(', ') || 'no changes'
  }

  /**
   * Calculate diff between old and new state
   * Uses thresholds to ignore insignificant changes
   */
  private calculateDiff(oldState: SSEState, newState: SSEState): Patch[] {
    const patches: Patch[] = []

    // Compare torrents
    for (const [hash, newTorrent] of newState.torrents) {
      const oldTorrent = oldState.torrents.get(hash)
      
      if (!oldTorrent) {
        // New torrent added
        patches.push({ op: 'add', path: `/torrents/${hash}`, value: newTorrent })
      } else {
        // Check for significant changes
        const torrentPatches = this.diffTorrent(oldTorrent, newTorrent, hash)
        patches.push(...torrentPatches)
      }
    }

    // Check for removed torrents
    for (const hash of oldState.torrents.keys()) {
      if (!newState.torrents.has(hash)) {
        patches.push({ op: 'remove', path: `/torrents/${hash}`, value: null })
      }
    }

    // Granular systemInfo diff
    if (newState.systemInfo && oldState.systemInfo) {
      const sysPatches = this.diffSystemInfo(oldState.systemInfo, newState.systemInfo)
      patches.push(...sysPatches)
    } else if (newState.systemInfo) {
      patches.push({ op: 'replace', path: '/systemInfo', value: newState.systemInfo })
    }

    return patches
  }

  /**
   * Diff individual torrent with thresholds
   */
  private diffTorrent(oldT: TorrentInfo, newT: TorrentInfo, hash: string): Patch[] {
    const patches: Patch[] = []

    // Name changes (important for magnet links when metadata is fetched)
    if (oldT.name !== newT.name) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/name`, value: newT.name })
    }

    // Size changes (important for magnet links when metadata is fetched)
    if (oldT.size !== newT.size) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/size`, value: newT.size })
    }

    // State changes are always significant
    if (oldT.state !== newT.state) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/state`, value: newT.state })
    }

    // Rate changes with threshold (ignore < 1KB/s changes)
    if (Math.abs(newT.downloadRate - oldT.downloadRate) > this.RATE_CHANGE_THRESHOLD) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/downloadRate`, value: newT.downloadRate })
    }
    
    if (Math.abs(newT.uploadRate - oldT.uploadRate) > this.RATE_CHANGE_THRESHOLD) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/uploadRate`, value: newT.uploadRate })
    }

    // Progress changes with threshold (ignore < 0.1% changes)
    // But always update if size changed (magnet metadata)
    if (Math.abs(newT.progress - oldT.progress) > this.PROGRESS_CHANGE_THRESHOLD || oldT.size !== newT.size) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/progress`, value: newT.progress })
      patches.push({ op: 'replace', path: `/torrents/${hash}/completed`, value: newT.completed })
    }

    // ETA changes (only if significant - more than 5 seconds difference or state changed)
    const etaDiff = Math.abs((newT.eta || 0) - (oldT.eta || 0))
    if (etaDiff > 5 || (newT.eta === 0 && oldT.eta !== 0)) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/eta`, value: newT.eta })
    }

    // Peers change
    if (oldT.peers !== newT.peers) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/peers`, value: newT.peers })
    }

    // Ratio changes (only if changed by more than 0.01)
    if (Math.abs(newT.ratio - oldT.ratio) > 0.01) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/ratio`, value: newT.ratio })
    }

    // Label changes
    if (oldT.label !== newT.label) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/label`, value: newT.label })
    }

    // Message changes
    if (oldT.message !== newT.message) {
      patches.push({ op: 'replace', path: `/torrents/${hash}/message`, value: newT.message })
    }

    return patches
  }

  /**
   * Granular systemInfo diff with thresholds
   */
  private diffSystemInfo(oldSys: SystemInfo, newSys: SystemInfo): Patch[] {
    const patches: Patch[] = []

    // Download/Upload rate with threshold
    if (Math.abs(newSys.downloadRate - oldSys.downloadRate) > this.RATE_CHANGE_THRESHOLD) {
      patches.push({ op: 'replace', path: '/systemInfo/downloadRate', value: newSys.downloadRate })
    }
    
    if (Math.abs(newSys.uploadRate - oldSys.uploadRate) > this.RATE_CHANGE_THRESHOLD) {
      patches.push({ op: 'replace', path: '/systemInfo/uploadRate', value: newSys.uploadRate })
    }

    // Disk space (only if changed by more than 1MB)
    const DISK_THRESHOLD = 1024 * 1024
    if (oldSys.diskSpace && newSys.diskSpace) {
      // Calculate free from used and total
      const oldFree = oldSys.diskSpace.total - oldSys.diskSpace.used
      const newFree = newSys.diskSpace.total - newSys.diskSpace.used
      if (Math.abs(newFree - oldFree) > DISK_THRESHOLD) {
        patches.push({ op: 'replace', path: '/systemInfo/diskSpace', value: newSys.diskSpace })
      }
    }

    // Active peers
    if (oldSys.activePeers !== newSys.activePeers) {
      patches.push({ op: 'replace', path: '/systemInfo/activePeers', value: newSys.activePeers })
    }

    return patches
  }

  private broadcast(event: string, data: string) {
    const deadClients: string[] = []
    
    for (const [id, client] of this.clients) {
      try {
        client.send(event, data)
      } catch {
        deadClients.push(id)
      }
    }

    // Clean up dead clients
    for (const id of deadClients) {
      this.clients.delete(id)
      console.log(`[SSE] Removed dead client: ${id}`)
    }
  }

  async handleConnection(c: Context) {
    return streamSSE(c, async (stream) => {
      const clientId = crypto.randomUUID()
      
      const client: SSEClient = {
        id: clientId,
        send: (event: string, data: string) => {
          stream.writeSSE({ event, data })
        }
      }

      this.clients.set(clientId, client)
      console.log(`[SSE] Client connected: ${clientId} (total: ${this.clients.size})`)

      // Send initial full state
      const [torrents, systemInfo] = await Promise.all([
        rtorrent.getTorrents(),
        rtorrent.getSystemInfo(),
      ])

      // Update internal state
      this.lastState = {
        torrents: new Map(torrents.map(t => [t.hash, t])),
        systemInfo
      }

      // Convert torrents array to object keyed by hash for client
      const torrentsObj = torrents.reduce((acc, t) => ({ ...acc, [t.hash]: t }), {})

      await stream.writeSSE({
        event: 'init',
        data: JSON.stringify({
          torrents: torrentsObj,
          systemInfo,
          connected: rtorrent.isConnected(),
        })
      })

      console.log(`[SSE] Sent init with ${torrents.length} torrents`)

      // Keep connection alive with heartbeat
      while (true) {
        await stream.sleep(30000)
        try {
          await stream.writeSSE({ event: 'heartbeat', data: JSON.stringify({ ts: Date.now() }) })
        } catch {
          break
        }
      }

      this.clients.delete(clientId)
      console.log(`[SSE] Client disconnected: ${clientId} (total: ${this.clients.size})`)
    })
  }

  /**
   * Force an immediate poll and broadcast (useful after user actions)
   */
  async forceUpdate() {
    await this.poll()
    this.flushPatches()
  }
}

export const sseManager = new SSEManager()
