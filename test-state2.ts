import { SCGIClient } from './src/services/scgi-client'

const client = new SCGIClient('localhost', 8000)

async function test() {
  const torrents = await client.call<any[][]>('d.multicall2', [
    '', 'main',
    'd.hash=', 'd.name=', 'd.state=', 'd.is_active=', 'd.is_open='
  ])
  
  console.log('All torrents:')
  for (const t of torrents) {
    console.log('  ' + t[1].substring(0, 40) + ' - state:' + t[2] + ' active:' + t[3] + ' open:' + t[4])
  }
  
  const active = torrents.find(t => t[4] === 1) || torrents[0]
  if (!active) return
  
  const hash = active[0]
  console.log('\nTesting with: ' + active[1].substring(0, 50))
  
  console.log('\nStarting...')
  await client.call('d.open', [hash])
  await client.call('d.start', [hash])
  
  let state = await client.call('d.state', [hash])
  let isActive = await client.call('d.is_active', [hash])
  let isOpen = await client.call('d.is_open', [hash])
  console.log('After start - state:' + state + ' active:' + isActive + ' open:' + isOpen)
  
  console.log('\nStopping (d.stop + d.close)...')
  await client.call('d.stop', [hash])
  await client.call('d.close', [hash])
  
  state = await client.call('d.state', [hash])
  isActive = await client.call('d.is_active', [hash])
  isOpen = await client.call('d.is_open', [hash])
  console.log('After stop+close - state:' + state + ' active:' + isActive + ' open:' + isOpen)
}

test().catch(console.error)
