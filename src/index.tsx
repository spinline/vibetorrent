import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { Dashboard } from './views/Dashboard'
import { Settings } from './views/Settings'
import { apiRoutes } from './routes/api'
import { RTorrentService } from './services/rtorrent-service'

const app = new Hono()
const rtorrent = new RTorrentService('localhost', 8000)

// Static files
app.use('/public/*', serveStatic({ root: './' }))

// API routes
app.route('/api', apiRoutes)

const defaultSystemInfo = {
  downloadRate: 0,
  uploadRate: 0,
  diskSpace: { used: 0, total: 0 },
  activePeers: 0,
  hostname: 'localhost',
  clientVersion: 'N/A',
  libraryVersion: 'N/A',
}

// Dashboard
app.get('/', async (c) => {
  try {
    const [torrents, systemInfo] = await Promise.all([
      rtorrent.getTorrents(),
      rtorrent.getSystemInfo()
    ])
    return c.html(<Dashboard torrents={torrents} systemInfo={systemInfo} />)
  } catch (error) {
    console.error('Error loading dashboard:', error)
    return c.html(<Dashboard torrents={[]} systemInfo={defaultSystemInfo} />)
  }
})

// Settings page
app.get('/settings', async (c) => {
  try {
    const systemInfo = await rtorrent.getSystemInfo()
    return c.html(<Settings systemInfo={systemInfo} />)
  } catch (error) {
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
    return c.html(<Dashboard torrents={[]} systemInfo={defaultSystemInfo} />)
  }
})

const port = 3000
console.log(`🚀 rTorrent Web UI running at http://localhost:${port}`)
console.log(`📡 SSE endpoint available at /api/events`)

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 255, // Max value - SSE connections need long timeouts
}
