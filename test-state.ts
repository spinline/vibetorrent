import { SCGIClient } from './src/services/scgi-client'

const client = new SCGIClient('localhost', 8000)

async function test() {
  // Get first torrent hash
  const torrents = await client.call<any[][]>('d.multicall2', [
    '', 'main',
    'd.hash=', 'd.name=', 'd.state=', 'd.is_active=', 'd.is_open='
  ])
  
  if (torrents.length === 0) {
    console.log('No torrents found')
    return
  }
  
  const hash = torrents[0][0]
  console.log('Testing with:', torrents[0][1])
  console.log('Before - state:', torrents[0][2], 'is_active:', torrents[0][3], 'is_open:', torrents[0][4])
  
  // Stop and close
  console.log('\nCalling d.stop...')
  await client.call('d.stop', [hash])
  
  // Check state after stop
  let state = await client.call('d.state', [hash])
  let isActive = await client.call('d.is_active', [hash])
  let isOpen = await client.call('d.is_open', [hash])
  console.log('After stop - state:', state, 'is_active:', isActive, 'is_open:', isOpen)
  
  console.log('\nCalling d.close...')
  await client.call('d.close', [hash])
  
  // Check state after close
  state = await client.call('d.state', [hash])
  isActive = await client.call('d.is_active', [hash])
  isOpen = await client.call('d.is_open', [hash])
  console.log('After close - state:', state, 'is_active:', isActive, 'is_open:', isOpen)
  
  // Restart it
  console.log('\nRestarting...')
  await client.call('d.open', [hash])
  await client.call('d.start', [hash])
  
  state = await client.call('d.state', [hash])
  isActive = await client.call('d.is_active', [hash])
  isOpen = await client.call('d.is_open', [hash])
  console.log('After restart - state:', state, 'is_active:', isActive, 'is_open:', isOpen)
}

test().catch(console.error)
