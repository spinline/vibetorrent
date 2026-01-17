const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>d.multicall2</methodName>
  <params>
    <param><value><string></string></value></param>
    <param><value><string>main</string></value></param>
    <param><value><string>d.hash=</string></value></param>
    <param><value><string>d.name=</string></value></param>
  </params>
</methodCall>`

const contentLength = body.length
const headers = `CONTENT_LENGTH\x00${contentLength}\x00SCGI\x001\x00`
const headerLength = headers.length
const message = `${headerLength}:${headers},${body}`

let responseData = ''

await Bun.connect({
  hostname: 'localhost',
  port: 8000,
  socket: {
    data: (socket, data) => {
      responseData += new TextDecoder().decode(data)
      if (responseData.includes('</methodResponse>')) {
        console.log('Response:', responseData)
        socket.end()
        process.exit(0)
      }
    },
    error: (socket, error) => {
      console.error('Error:', error)
      process.exit(1)
    },
    open: (socket) => {
      socket.write(new TextEncoder().encode(message))
    },
  },
})

setTimeout(() => process.exit(0), 5000)
