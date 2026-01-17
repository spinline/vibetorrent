import { SCGIClient } from './src/services/scgi-client'

const client = new SCGIClient('localhost', 8000)

async function check() {
  const torrents = await client.call('d.multicall2', [
    '',
    'main',
    'd.hash=',
    'd.name=',
    'd.size_bytes=',
    'd.completed_bytes=',
    'd.bytes_done=',
    'd.left_bytes=',
    'd.ratio=',
    'd.complete=',
    'd.is_hash_checked=',
    'd.hashing=',
    'd.state=',
  ])
  
  for (const t of torrents as any[]) {
    const [hash, name, size, completed, bytesDone, leftBytes, ratio, complete, hashChecked, hashing, state] = t
    if (name.includes('Neil Young')) {
      console.log('=== Neil Young Torrent ===')
      console.log('Hash:', hash)
      console.log('Name:', name)
      console.log('Size (bytes):', size)
      console.log('Completed (bytes):', completed)
      console.log('Bytes Done:', bytesDone)
      console.log('Left Bytes:', leftBytes)
      console.log('Ratio:', ratio)
      console.log('Complete flag:', complete)
      console.log('Hash checked:', hashChecked)
      console.log('Hashing:', hashing)
      console.log('State:', state)
      console.log('')
      console.log('Progress:', ((completed / size) * 100).toFixed(6) + '%')
      console.log('Remaining:', size - completed, 'bytes')
    }
  }
}

check().then(() => process.exit(0))
