import { SCGIClient } from './scgi-client'

export interface TorrentInfo {
  hash: string
  name: string
  size: number
  completed: number
  downloadRate: number
  uploadRate: number
  ratio: number
  state: 'downloading' | 'seeding' | 'paused' | 'stopped'
  progress: number
  eta: number
  peers: number
  seeds: number
  addedTime: number
  completedTime: number
  label: string
  savePath: string
  isPrivate: boolean
  isActive: boolean
  isOpen: boolean
  message: string
}

export interface SystemInfo {
  downloadRate: number
  uploadRate: number
  diskSpace: {
    used: number
    total: number
  }
  activePeers: number
  hostname: string
  clientVersion: string
  libraryVersion: string
}

export interface PeerInfo {
  address: string
  clientVersion: string
  downloadRate: number
  uploadRate: number
  progress: number
  isEncrypted: boolean
  isIncoming: boolean
}

export interface FileInfo {
  index: number
  path: string
  size: number
  completed: number
  priority: number
}

export interface TrackerInfo {
  url: string
  type: number
  enabled: boolean
  seeders: number
  leechers: number
}

export class RTorrentService {
  private client: SCGIClient
  private connected: boolean = false
  private lastError: string | null = null

  constructor(host: string = 'localhost', port: number = 8000) {
    this.client = new SCGIClient(host, port)
  }

  isConnected(): boolean {
    return this.connected
  }

  getLastError(): string | null {
    return this.lastError
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.call('system.client_version')
      this.connected = true
      this.lastError = null
      return true
    } catch (error) {
      this.connected = false
      this.lastError = error instanceof Error ? error.message : 'Unknown error'
      return false
    }
  }

  async getSystemInfo(): Promise<SystemInfo> {
    try {
      const [downloadRate, uploadRate, clientVersion, libraryVersion] = await Promise.all([
        this.client.call<number>('throttle.global_down.rate'),
        this.client.call<number>('throttle.global_up.rate'),
        this.client.call<string>('system.client_version'),
        this.client.call<string>('system.library_version'),
      ])

      this.connected = true
      this.lastError = null

      let diskUsed = 0
      let diskTotal = 0
      try {
        const freeSpace = await this.client.call<number>('directory.default')
        diskTotal = 4 * 1024 ** 4
        diskUsed = diskTotal - (freeSpace || 0)
      } catch {
        diskUsed = 1.2 * 1024 ** 4
        diskTotal = 4 * 1024 ** 4
      }

      let activePeers = 0
      try {
        const torrents = await this.getTorrents()
        activePeers = torrents.reduce((sum, t) => sum + t.peers, 0)
      } catch {
        activePeers = 0
      }

      return {
        downloadRate,
        uploadRate,
        diskSpace: { used: diskUsed, total: diskTotal },
        activePeers,
        hostname: 'localhost',
        clientVersion,
        libraryVersion,
      }
    } catch (error) {
      this.connected = false
      this.lastError = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to get system info:', error)
      
      return {
        downloadRate: 0,
        uploadRate: 0,
        diskSpace: { used: 0, total: 0 },
        activePeers: 0,
        hostname: 'localhost',
        clientVersion: 'N/A',
        libraryVersion: 'N/A',
      }
    }
  }

  async getTorrents(): Promise<TorrentInfo[]> {
    try {
      const result = await this.client.call<any[][]>('d.multicall2', [
        '',
        'main',
        'd.hash=',
        'd.name=',
        'd.size_bytes=',
        'd.completed_bytes=',
        'd.down.rate=',
        'd.up.rate=',
        'd.ratio=',
        'd.state=',
        'd.is_active=',
        'd.is_open=',
        'd.peers_connected=',
        'd.timestamp.started=',
        'd.timestamp.finished=',
        'd.custom1=',
        'd.directory=',
        'd.is_private=',
        'd.message=',
        'd.complete=',
      ])

      this.connected = true
      this.lastError = null

      if (!Array.isArray(result)) {
        return []
      }

      return result.map((t) => {
        if (!Array.isArray(t)) return null
        
        const completed = t[3] || 0
        const size = t[2] || 0
        // Ensure progress is between 0-100 and handle edge cases
        let progress = 0
        if (size > 0 && completed >= 0) {
          progress = Math.min(100, Math.max(0, (completed / size) * 100))
        }
        const downloadRate = t[4] || 0
        const remaining = Math.max(0, size - completed)
        const eta = downloadRate > 0 ? remaining / downloadRate : 0

        let state: TorrentInfo['state'] = 'stopped'
        const isActive = t[8] === 1
        const isOpen = t[9] === 1
        const isComplete = t[17] === 1

        if (isActive && isOpen) {
          state = isComplete ? 'seeding' : 'downloading'
        } else if (isOpen && !isActive) {
          state = 'paused'
        }

        return {
          hash: t[0],
          name: t[1],
          size,
          completed,
          downloadRate,
          uploadRate: t[5],
          ratio: t[6] / 1000,
          state,
          progress,
          eta,
          peers: t[10],
          seeds: 0,
          addedTime: t[11],
          completedTime: t[12],
          label: t[13] || '',
          savePath: t[14],
          isPrivate: t[15] === 1,
          isActive,
          isOpen,
          message: t[16] || '',
        }
      }).filter((t): t is TorrentInfo => t !== null)
    } catch (error) {
      this.connected = false
      this.lastError = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to get torrents:', error)
      return []
    }
  }

  async getTorrentPeers(hash: string): Promise<PeerInfo[]> {
    try {
      const result = await this.client.call<any[][]>('p.multicall', [
        hash,
        '',
        'p.address=',
        'p.client_version=',
        'p.down_rate=',
        'p.up_rate=',
        'p.completed_percent=',
        'p.is_encrypted=',
        'p.is_incoming=',
      ])

      return result.map(p => ({
        address: p[0],
        clientVersion: p[1],
        downloadRate: p[2],
        uploadRate: p[3],
        progress: p[4],
        isEncrypted: p[5] === 1,
        isIncoming: p[6] === 1,
      }))
    } catch (error) {
      console.error('Failed to get peers:', error)
      return []
    }
  }

  async getTorrentFiles(hash: string): Promise<FileInfo[]> {
    try {
      const result = await this.client.call<any[][]>('f.multicall', [
        hash,
        '',
        'f.path=',
        'f.size_bytes=',
        'f.completed_chunks=',
        'f.size_chunks=',
        'f.priority=',
      ])

      return result.map((f, index) => ({
        index,
        path: f[0],
        size: f[1],
        completed: f[3] > 0 ? (f[2] / f[3]) * f[1] : 0,
        priority: f[4],
      }))
    } catch (error) {
      console.error('Failed to get files:', error)
      return []
    }
  }

  async getTorrentTrackers(hash: string): Promise<TrackerInfo[]> {
    try {
      const result = await this.client.call<any[][]>('t.multicall', [
        hash,
        '',
        't.url=',
        't.type=',
        't.is_enabled=',
        't.scrape_complete=',
        't.scrape_incomplete=',
      ])

      return result.map(t => ({
        url: t[0],
        type: t[1],
        enabled: t[2] === 1,
        seeders: t[3],
        leechers: t[4],
      }))
    } catch (error) {
      console.error('Failed to get trackers:', error)
      return []
    }
  }

  async addTorrent(url: string, options?: {
    downloadPath?: string
    priority?: number
    autoStart?: boolean
    label?: string
  }): Promise<boolean> {
    try {
      const { downloadPath = '/downloads', priority = 2, autoStart = true, label = '' } = options || {}
      
      // Build command options string
      // rTorrent's load commands accept optional tied-file and execution commands
      // d.directory.set sets download path, d.custom1.set sets label, d.priority.set sets priority
      const commands: string[] = []
      
      if (downloadPath && downloadPath !== '/downloads') {
        commands.push(`d.directory.set=${downloadPath}`)
      }
      
      if (label) {
        commands.push(`d.custom1.set=${label}`)
      }
      
      if (priority !== 2) {
        // priority: 0=off, 1=low, 2=normal, 3=high
        commands.push(`d.priority.set=${priority}`)
      }
      
      // Use load.start or load.normal based on autoStart
      const method = autoStart ? 'load.start' : 'load.normal'
      
      if (commands.length > 0) {
        await this.client.call(method, ['', url, ...commands])
      } else {
        await this.client.call(method, ['', url])
      }
      return true
    } catch (error) {
      console.error('Failed to add torrent:', error)
      return false
    }
  }

  async addTorrentFile(base64Data: string, options?: {
    downloadPath?: string
    priority?: number
    autoStart?: boolean
    label?: string
  }): Promise<boolean> {
    try {
      const { downloadPath = '/downloads', priority = 2, autoStart = true, label = '' } = options || {}
      const buffer = Buffer.from(base64Data, 'base64')
      
      // Build command options
      const commands: string[] = []
      
      if (downloadPath && downloadPath !== '/downloads') {
        commands.push(`d.directory.set=${downloadPath}`)
      }
      
      if (label) {
        commands.push(`d.custom1.set=${label}`)
      }
      
      if (priority !== 2) {
        commands.push(`d.priority.set=${priority}`)
      }
      
      // Use load.raw_start or load.raw based on autoStart
      const method = autoStart ? 'load.raw_start' : 'load.raw'
      
      if (commands.length > 0) {
        await this.client.call(method, ['', buffer, ...commands])
      } else {
        await this.client.call(method, ['', buffer])
      }
      return true
    } catch (error) {
      console.error('Failed to add torrent file:', error)
      return false
    }
  }

  async pauseTorrent(hash: string): Promise<boolean> {
    try {
      await this.client.call('d.pause', [hash])
      return true
    } catch (error) {
      console.error('Failed to pause torrent:', error)
      return false
    }
  }

  async resumeTorrent(hash: string): Promise<boolean> {
    try {
      // First check if torrent is closed (stopped)
      const isOpen = await this.client.call<number>('d.is_open', [hash])
      
      if (isOpen === 0) {
        // Torrent is closed/stopped, need to open first then start
        await this.client.call('d.open', [hash])
        await this.client.call('d.start', [hash])
      } else {
        // Torrent is open but paused, just resume
        await this.client.call('d.resume', [hash])
      }
      return true
    } catch (error) {
      console.error('Failed to resume torrent:', error)
      return false
    }
  }

  async stopTorrent(hash: string): Promise<boolean> {
    try {
      await this.client.call('d.stop', [hash])
      await this.client.call('d.close', [hash])
      return true
    } catch (error) {
      console.error('Failed to stop torrent:', error)
      return false
    }
  }

  async reannounceTorrent(hash: string): Promise<boolean> {
    try {
      await this.client.call('d.tracker_announce', [hash])
      return true
    } catch (error) {
      console.error('Failed to reannounce torrent:', error)
      return false
    }
  }

  async removeTorrent(hash: string, deleteFiles: boolean = false): Promise<boolean> {
    try {
      // First check if torrent exists and get path if we need to delete files
      let basePath = ''
      let isMultiFile = false
      
      try {
        await this.client.call('d.hash', [hash])
        
        if (deleteFiles) {
          // Get the base path and check if multi-file
          basePath = await this.client.call('d.base_path', [hash]) as string
          isMultiFile = (await this.client.call('d.is_multi_file', [hash])) === '1'
        }
      } catch (checkError: any) {
        // Torrent doesn't exist - might have been already removed
        if (checkError?.message?.includes('Could not find info-hash')) {
          console.log(`Torrent ${hash} already removed or not found`)
          return true // Consider it success since it's already gone
        }
        throw checkError
      }
      
      // Close and erase the torrent from rTorrent
      await this.client.call('d.close', [hash])
      await this.client.call('d.erase', [hash])
      
      // Delete files if requested
      if (deleteFiles && basePath) {
        try {
          const fs = await import('fs/promises')
          const path = await import('path')
          
          // Check if path exists
          try {
            await fs.access(basePath)
          } catch {
            console.log(`Path doesn't exist, skipping file deletion: ${basePath}`)
            return true
          }
          
          const stat = await fs.stat(basePath)
          
          if (stat.isDirectory()) {
            // Multi-file torrent - delete the entire directory
            await fs.rm(basePath, { recursive: true, force: true })
            console.log(`Deleted directory: ${basePath}`)
          } else {
            // Single file torrent - delete just the file
            await fs.unlink(basePath)
            console.log(`Deleted file: ${basePath}`)
          }
        } catch (fsError) {
          console.error('Failed to delete files:', fsError)
          // Don't fail the whole operation if file deletion fails
          // The torrent was already removed from rTorrent
        }
      }
      
      return true
    } catch (error: any) {
      // If "not found" error, treat as success (already removed)
      if (error?.message?.includes('Could not find info-hash')) {
        console.log(`Torrent ${hash} not found - treating as already removed`)
        return true
      }
      console.error('Failed to remove torrent:', error)
      return false
    }
  }

  async recheckTorrent(hash: string): Promise<boolean> {
    try {
      await this.client.call('d.check_hash', [hash])
      return true
    } catch (error) {
      console.error('Failed to recheck torrent:', error)
      return false
    }
  }

  async setDownloadLimit(limit: number): Promise<boolean> {
    try {
      await this.client.call('throttle.global_down.max_rate.set', ['', limit * 1024])
      return true
    } catch (error) {
      console.error('Failed to set download limit:', error)
      return false
    }
  }

  async setUploadLimit(limit: number): Promise<boolean> {
    try {
      await this.client.call('throttle.global_up.max_rate.set', ['', limit * 1024])
      return true
    } catch (error) {
      console.error('Failed to set upload limit:', error)
      return false
    }
  }

  async setLabel(hash: string, label: string): Promise<boolean> {
    try {
      await this.client.call('d.custom1.set', [hash, label])
      return true
    } catch (error) {
      console.error('Failed to set label:', error)
      return false
    }
  }

  async setTorrentPriority(hash: string, priority: number): Promise<boolean> {
    try {
      // priority: 0=off, 1=low, 2=normal, 3=high
      await this.client.call('d.priority.set', [hash, priority])
      await this.client.call('d.update_priorities', [hash])
      return true
    } catch (error) {
      console.error('Failed to set torrent priority:', error)
      return false
    }
  }

  async getTorrentPriority(hash: string): Promise<number> {
    try {
      const priority = await this.client.call<number>('d.priority', [hash])
      return priority
    } catch (error) {
      console.error('Failed to get torrent priority:', error)
      return 2 // Return normal as default
    }
  }

  async setFilePriority(hash: string, fileIndex: number, priority: number): Promise<boolean> {
    try {
      // priority: 0=off, 1=normal, 2=high (Note: rTorrent file priority values are different from torrent priority)
      // Actually standard values: 0=off, 1=normal, 2=high. 
      // Some sources say: 0=don't download, 1=normal, 2=high.
      
      // Target format: HASH:fINDEX
      const target = `${hash}:f${fileIndex}`
      await this.client.call('f.priority.set', [target, priority])
      await this.client.call('d.update_priorities', [hash])
      return true
    } catch (error) {
      console.error('Failed to set file priority:', error)
      return false
    }
  }
}

export const rtorrent = new RTorrentService()
