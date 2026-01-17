import { Hono } from 'hono'
import { rtorrent } from '../services/rtorrent-service'
import { sseManager } from '../services/sse'

export const apiRoutes = new Hono()

// SSE endpoint
apiRoutes.get('/events', async (c) => {
  return sseManager.handleConnection(c)
})

// Get all torrents
apiRoutes.get('/torrents', async (c) => {
  const torrents = await rtorrent.getTorrents()
  return c.json(torrents)
})

// Get system info
apiRoutes.get('/system', async (c) => {
  const info = await rtorrent.getSystemInfo()
  return c.json(info)
})

// Get single torrent details
apiRoutes.get('/torrents/:hash', async (c) => {
  const hash = c.req.param('hash')
  const torrents = await rtorrent.getTorrents()
  const torrent = torrents.find(t => t.hash === hash)
  
  if (!torrent) {
    return c.json({ error: 'Torrent not found' }, 404)
  }
  
  const [peersList, filesList, trackersList] = await Promise.all([
    rtorrent.getTorrentPeers(hash),
    rtorrent.getTorrentFiles(hash),
    rtorrent.getTorrentTrackers(hash),
  ])
  
  return c.json({ ...torrent, peersList, filesList, trackersList })
})

// Add torrent
apiRoutes.post('/torrents', async (c) => {
  try {
    const contentType = c.req.header('Content-Type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      const file = formData.get('torrent') as File
      const downloadPath = formData.get('downloadPath') as string || '/downloads'
      const priority = parseInt(formData.get('priority') as string || '1')
      const autoStart = formData.get('autoStart') !== 'false'
      const label = formData.get('label') as string || ''
      
      if (file) {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const success = await rtorrent.addTorrentFile(base64, {
          downloadPath,
          priority,
          autoStart,
          label
        })
        return c.json({ success })
      }
    }
    
    const body = await c.req.json()
    const { url, downloadPath = '/downloads', priority = 2, autoStart = true, label = '' } = body
    
    if (!url) {
      return c.json({ error: 'URL required' }, 400)
    }
    
    const success = await rtorrent.addTorrent(url, {
      downloadPath,
      priority,
      autoStart,
      label
    })
    return c.json({ success })
  } catch (error) {
    console.error('Error adding torrent:', error)
    return c.json({ error: 'Failed to add torrent' }, 500)
  }
})

// Torrent actions
apiRoutes.post('/torrents/:hash/start', async (c) => {
  const hash = c.req.param('hash')
  console.log('POST /api/torrents/' + hash + '/start')
  const success = await rtorrent.resumeTorrent(hash)
  console.log('resumeTorrent result:', success)
  return c.json({ success })
})

apiRoutes.post('/torrents/:hash/pause', async (c) => {
  const hash = c.req.param('hash')
  console.log('POST /api/torrents/' + hash + '/pause')
  const success = await rtorrent.pauseTorrent(hash)
  console.log('pauseTorrent result:', success)
  return c.json({ success })
})

apiRoutes.post('/torrents/:hash/stop', async (c) => {
  const hash = c.req.param('hash')
  console.log('POST /api/torrents/' + hash + '/stop')
  const success = await rtorrent.stopTorrent(hash)
  console.log('stopTorrent result:', success)
  return c.json({ success })
})

apiRoutes.post('/torrents/:hash/recheck', async (c) => {
  const hash = c.req.param('hash')
  const success = await rtorrent.recheckTorrent(hash)
  return c.json({ success })
})

apiRoutes.post('/torrents/:hash/reannounce', async (c) => {
  const hash = c.req.param('hash')
  const success = await rtorrent.reannounceTorrent(hash)
  return c.json({ success })
})

apiRoutes.post('/torrents/:hash/label', async (c) => {
  const hash = c.req.param('hash')
  const body = await c.req.json()
  const { label } = body
  const success = await rtorrent.setLabel(hash, label || '')
  return c.json({ success })
})

apiRoutes.delete('/torrents/:hash', async (c) => {
  const hash = c.req.param('hash')
  const query = c.req.query()
  const deleteFiles = query.deleteFiles === 'true'
  
  console.log('DELETE /api/torrents/' + hash, 'deleteFiles:', deleteFiles)
  
  try {
    const success = await rtorrent.removeTorrent(hash, deleteFiles)
    console.log('removeTorrent result:', success)
    return c.json({ success })
  } catch (error: any) {
    console.error(`Delete torrent ${hash} error:`, error)
    // Return success=true if torrent not found (already deleted)
    if (error?.message?.includes('Could not find info-hash')) {
      return c.json({ success: true, message: 'Torrent already removed' })
    }
    return c.json({ success: false, error: error?.message || 'Unknown error' })
  }
})

// Set torrent priority
apiRoutes.post('/torrents/:hash/priority', async (c) => {
  try {
    const hash = c.req.param('hash')
    const { priority } = await c.req.json()
    const success = await rtorrent.setTorrentPriority(hash, priority)
    return c.json({ success })
  } catch (error: any) {
    return c.json({ success: false, error: error?.message || 'Unknown error' })
  }
})

// Get torrent priority
apiRoutes.get('/torrents/:hash/priority', async (c) => {
  try {
    const hash = c.req.param('hash')
    const priority = await rtorrent.getTorrentPriority(hash)
    return c.json({ priority })
  } catch (error: any) {
    return c.json({ priority: 2, error: error?.message || 'Unknown error' })
  }
})

// Settings
apiRoutes.post('/settings/download-limit', async (c) => {
  const { limit } = await c.req.json()
  const success = await rtorrent.setDownloadLimit(limit)
  return c.json({ success })
})

apiRoutes.post('/settings/upload-limit', async (c) => {
  const { limit } = await c.req.json()
  const success = await rtorrent.setUploadLimit(limit)
  return c.json({ success })
})

// Connection status
apiRoutes.get('/status', async (c) => {
  const connected = rtorrent.isConnected()
  const error = rtorrent.getLastError()
  return c.json({ connected, error })
})

// Test connection
apiRoutes.get('/test', async (c) => {
  const connected = await rtorrent.testConnection()
  return c.json({ connected, error: rtorrent.getLastError() })
})
