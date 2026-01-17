const body = '<?xml version="1.0"?>\n<methodCall>\n  <methodName>system.client_version</methodName>\n  <params>\n  </params>\n</methodCall>'
const contentLength = body.length
const headers = `CONTENT_LENGTH\x00${contentLength}\x00SCGI\x001\x00`
const headerLength = headers.length
const message = `${headerLength}:${headers},${body}`

console.log('Sending SCGI request...')
console.log('Body length:', contentLength)
console.log('Header length:', headerLength)

const socket = await Bun.connect({
  hostname: 'localhost',
  port: 8000,
  socket: {
    data: (socket, data) => {
      console.log('Response:', new TextDecoder().decode(data))
      socket.end()
      process.exit(0)
    },
    error: (socket, error) => {
      console.error('Error:', error)
      socket.end()
      process.exit(1)
    },
    open: (socket) => {
      console.log('Connected, sending...')
      socket.write(new TextEncoder().encode(message))
    },
  },
})
