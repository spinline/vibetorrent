import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { getCookie } from 'hono/cookie'
import { Dashboard } from './views/Dashboard'
import { Settings } from './views/Settings'
import { apiRoutes } from './routes/api'
import { RTorrentService } from './services/rtorrent-service'

const app = new Hono()
const host = process.env.RTORRENT_HOST || 'localhost'
const rtorrentPort = parseInt(process.env.RTORRENT_PORT || '8000')

console.log(`[DEBUG] Initializing RTorrentService with Host: ${host}, Port: ${rtorrentPort}`)
console.log(`[DEBUG] Environment: RTORRENT_HOST=${process.env.RTORRENT_HOST}, RTORRENT_PORT=${process.env.RTORRENT_PORT}`)

const rtorrent = new RTorrentService(host, rtorrentPort)

// Static files
app.use('/public/*', serveStatic({ root: './' }))

// API routes
app.route('/api', apiRoutes)

const defaultStats = {
  downloadSpeed: 0,
  uploadSpeed: 0,
  diskFree: 0,
  diskTotal: 0,
  activePeers: 0,
  totalTorrents: 0
}

// Dashboard
app.get('/', async (c) => {
  // Prevent caching
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
  c.header('Pragma', 'no-cache')
  c.header('Expires', '0')

  try {
    const [torrents, systemInfo] = await Promise.all([
      rtorrent.getTorrents(),
      rtorrent.getSystemInfo()
    ])

    // Server-side sorting based on cookie
    const sortCookie = getCookie(c, 'rtorrent_sort')
    let sortedTorrents = [...torrents]

    if (sortCookie) {
      try {
        let sortParams
        try {
          // First try parsing directly (in case Hono decoded it)
          sortParams = JSON.parse(sortCookie)
        } catch (e) {
          // If that fails, try decoding first (client uses encodeURIComponent)
          sortParams = JSON.parse(decodeURIComponent(sortCookie))
        }

        const { column, direction } = sortParams

        sortedTorrents.sort((a: any, b: any) => {
          let valA, valB

          switch (column) {
            case 'name':
              valA = a.name.toLowerCase()
              valB = b.name.toLowerCase()
              break
            case 'size':
              valA = a.size
              valB = b.size
              break
            case 'progress':
              valA = a.size > 0 ? a.completed / a.size : 0
              valB = b.size > 0 ? b.completed / b.size : 0
              break
            case 'state':
              const stateOrder: Record<string, number> = { downloading: 0, seeding: 1, paused: 2, stopped: 3 }
              valA = stateOrder[a.state] ?? 4
              valB = stateOrder[b.state] ?? 4
              break
            case 'downloadRate':
              valA = a.downloadRate || 0
              valB = b.downloadRate || 0
              break
            case 'uploadRate':
              valA = a.uploadRate || 0
              valB = b.uploadRate || 0
              break
            case 'eta':
              valA = a.eta || Infinity
              valB = b.eta || Infinity
              break
            default:
              valA = a.name.toLowerCase()
              valB = b.name.toLowerCase()
          }

          if (valA < valB) return direction === 'asc' ? -1 : 1
          if (valA > valB) return direction === 'asc' ? 1 : -1
          return 0
        })

        console.log(`Sorted by ${column} ${direction} (Cookie: ${sortCookie})`)
      } catch (e) {
        console.error('Failed to parse sort cookie:', e)
        // Fallback to name asc if cookie is invalid
        sortedTorrents.sort((a, b) => a.name.localeCompare(b.name))
      }
    } else {
      // Default sort (Name ASC)
      sortedTorrents.sort((a, b) => a.name.localeCompare(b.name))
    }

    return c.html(<Dashboard torrents={sortedTorrents} systemInfo={systemInfo} />)
  } catch (error) {
    console.error('Error loading dashboard:', error)
    const defaultSystemInfo = {
      downloadRate: 0,
      uploadRate: 0,
      diskSpace: { used: 0, total: 0 },
      activePeers: 0,
      hostname: 'localhost',
      clientVersion: 'N/A',
      libraryVersion: 'N/A'
    }
    return c.html(<Dashboard torrents={[]} systemInfo={defaultSystemInfo} />)
  }
})

// Settings page
app.get('/settings', async (c) => {
  try {
    const systemInfo = await rtorrent.getSystemInfo()
    return c.html(<Settings systemInfo={systemInfo} />)
  } catch (error) {
    const defaultSystemInfo = {
      downloadRate: 0,
      uploadRate: 0,
      diskSpace: { used: 0, total: 0 },
      activePeers: 0,
      hostname: 'localhost',
      clientVersion: 'N/A',
      libraryVersion: 'N/A',
    }
    return c.html(<Settings systemInfo={defaultSystemInfo} />)
  }
})

// Torrent detail (handled by same page with JS)
app.get('/torrent/:hash', async (c) => {
  try {
    const [torrents, systemInfo] = await Promise.all([
      rtorrent.getTorrents(),
      rtorrent.getSystemInfo()
    ])

    return c.html(<Dashboard torrents={torrents} systemInfo={systemInfo} />)
  } catch (error) {
    const defaultSystemInfo = {
      downloadRate: 0,
      uploadRate: 0,
      diskSpace: { used: 0, total: 0 },
      activePeers: 0,
      hostname: 'localhost',
      clientVersion: 'N/A',
      libraryVersion: 'N/A'
    }
    return c.html(<Dashboard torrents={[]} systemInfo={defaultSystemInfo} />)
  }
})

const port = parseInt(process.env.PORT || '3001')
console.log(`🚀 rTorrent Web UI running at http://localhost:${port}`)
console.log(`📡 SSE endpoint available at /api/events`)

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 255, // Max value - SSE connections need long timeouts
}
