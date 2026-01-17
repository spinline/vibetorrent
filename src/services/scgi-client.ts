export class SCGIClient {
  private host: string
  private port: number

  constructor(host: string, port: number) {
    this.host = host
    this.port = port
  }

  async call<T>(method: string, params: any[] = []): Promise<T> {
    const requestBody = this.buildXMLRequest(method, params)
    const scgiMessage = this.buildSCGIMessage(requestBody)

    return new Promise((resolve, reject) => {
      let responseData = ''
      let resolved = false
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          reject(new Error('Connection timeout'))
        }
      }, 10000)

      Bun.connect({
        hostname: this.host,
        port: this.port,
        socket: {
          data: (socket, data) => {
            responseData += new TextDecoder().decode(data)
            
            // Check if we have a complete response
            if (responseData.includes('</methodResponse>')) {
              if (!resolved) {
                resolved = true
                clearTimeout(timeout)
                try {
                  const result = this.parseResponse<T>(responseData)
                  resolve(result)
                } catch (error) {
                  reject(error)
                }
              }
              socket.end()
            }
          },
          error: (socket, error) => {
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              reject(error)
            }
          },
          close: () => {
            if (!resolved && responseData) {
              resolved = true
              clearTimeout(timeout)
              try {
                const result = this.parseResponse<T>(responseData)
                resolve(result)
              } catch (error) {
                reject(error)
              }
            }
          },
          open: (socket) => {
            socket.write(scgiMessage)
          },
          connectError: (socket, error) => {
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              reject(new Error(`Connection failed: ${error}`))
            }
          },
        },
      }).catch(err => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          reject(err)
        }
      })
    })
  }

  private buildXMLRequest(method: string, params: any[]): string {
    let xml = '<?xml version="1.0"?>\n<methodCall>\n'
    xml += `  <methodName>${method}</methodName>\n`
    xml += '  <params>\n'
    
    for (const param of params) {
      xml += '    <param>\n'
      xml += `      ${this.valueToXML(param)}\n`
      xml += '    </param>\n'
    }
    
    xml += '  </params>\n</methodCall>'
    return xml
  }

  private valueToXML(value: any): string {
    if (typeof value === 'string') {
      return `<value><string>${this.escapeXML(value)}</string></value>`
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return `<value><i4>${value}</i4></value>`
      }
      return `<value><double>${value}</double></value>`
    } else if (typeof value === 'boolean') {
      return `<value><boolean>${value ? 1 : 0}</boolean></value>`
    } else if (Buffer.isBuffer(value)) {
      return `<value><base64>${value.toString('base64')}</base64></value>`
    } else if (Array.isArray(value)) {
      let xml = '<value><array><data>'
      for (const item of value) {
        xml += this.valueToXML(item)
      }
      xml += '</data></array></value>'
      return xml
    }
    return `<value><string>${String(value)}</string></value>`
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  private buildSCGIMessage(body: string): Uint8Array {
    const bodyBytes = new TextEncoder().encode(body)
    const contentLength = bodyBytes.length
    
    // SCGI headers as null-terminated key-value pairs
    const headers = `CONTENT_LENGTH\x00${contentLength}\x00SCGI\x001\x00`
    const headerLength = headers.length
    
    // Netstring format: length:content,
    const message = `${headerLength}:${headers},${body}`
    return new TextEncoder().encode(message)
  }

  private parseResponse<T>(response: string): T {
    const xmlStart = response.indexOf('<?xml')
    if (xmlStart === -1) {
      throw new Error('No XML found in response')
    }
    
    const xml = response.substring(xmlStart)
    return this.parseXMLValue(xml) as T
  }

  private parseXMLValue(xml: string): any {
    const faultMatch = xml.match(/<fault>[\s\S]*?<string>([^<]+)<\/string>[\s\S]*?<\/fault>/)
    if (faultMatch) {
      throw new Error(`XML-RPC Fault: ${faultMatch[1]}`)
    }

    // Find the param value
    const paramStart = xml.indexOf('<param>')
    const paramEnd = xml.lastIndexOf('</param>')
    if (paramStart === -1 || paramEnd === -1) {
      return null
    }

    const paramContent = xml.substring(paramStart, paramEnd + 8)
    const valueStart = paramContent.indexOf('<value>')
    const valueEnd = paramContent.lastIndexOf('</value>')
    
    if (valueStart === -1 || valueEnd === -1) {
      return null
    }

    const valueContent = paramContent.substring(valueStart + 7, valueEnd)
    return this.extractValue(valueContent)
  }

  private extractValue(content: string): any {
    content = content.trim()

    // Check for string
    if (content.startsWith('<string>')) {
      const end = content.indexOf('</string>')
      return end > 8 ? content.substring(8, end) : ''
    }

    // Check for integer
    const intMatch = content.match(/^<i[48]>(-?\d+)<\/i[48]>/)
    if (intMatch) return parseInt(intMatch[1], 10)

    // Check for double
    const doubleMatch = content.match(/^<double>([^<]+)<\/double>/)
    if (doubleMatch) return parseFloat(doubleMatch[1])

    // Check for boolean
    const boolMatch = content.match(/^<boolean>([01])<\/boolean>/)
    if (boolMatch) return boolMatch[1] === '1'

    // Check for array
    if (content.startsWith('<array>')) {
      return this.parseArray(content)
    }

    // Empty or plain string
    if (!content || content === '<string></string>') return ''

    return content
  }

  private parseArray(content: string): any[] {
    const values: any[] = []
    
    // Find <data> content
    const dataStart = content.indexOf('<data>')
    const dataEnd = content.lastIndexOf('</data>')
    if (dataStart === -1 || dataEnd === -1) return values

    const dataContent = content.substring(dataStart + 6, dataEnd)
    
    // Parse each <value> at the top level
    let pos = 0
    while (pos < dataContent.length) {
      const valueStart = dataContent.indexOf('<value>', pos)
      if (valueStart === -1) break

      // Find matching </value> by counting nested tags
      let depth = 1
      let searchPos = valueStart + 7
      let valueEnd = -1

      while (searchPos < dataContent.length && depth > 0) {
        const nextOpen = dataContent.indexOf('<value>', searchPos)
        const nextClose = dataContent.indexOf('</value>', searchPos)

        if (nextClose === -1) break

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++
          searchPos = nextOpen + 7
        } else {
          depth--
          if (depth === 0) {
            valueEnd = nextClose
          }
          searchPos = nextClose + 8
        }
      }

      if (valueEnd === -1) break

      const valueContent = dataContent.substring(valueStart + 7, valueEnd)
      values.push(this.extractValue(valueContent))
      pos = valueEnd + 8
    }

    return values
  }
}
