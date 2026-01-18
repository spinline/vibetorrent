import { formatSpeed, formatBytesShort } from './utils'

interface StatsGridProps {
  stats: {
    downloadSpeed: number
    uploadSpeed: number
    diskFree: number
    diskTotal: number
    activePeers: number
    totalTorrents: number
  }
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const downloadSpeed = formatSpeed(stats.downloadSpeed)
  const uploadSpeed = formatSpeed(stats.uploadSpeed)
  const diskFree = formatBytesShort(stats.diskFree)
  const diskTotal = formatBytesShort(stats.diskTotal)
  const diskPercent = stats.diskTotal > 0 
    ? Math.round(((stats.diskTotal - stats.diskFree) / stats.diskTotal) * 100) 
    : 0
  const totalPeers = stats.activePeers

  return (
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Download Speed */}
      <div class="bg-surface-dark p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col">
        <span class="text-xs font-bold text-slate-500 uppercase mb-2">Download Speed</span>
        <div class="flex items-end gap-2">
          <span class="text-2xl font-bold" id="dl-speed">{downloadSpeed.value}</span>
          <span class="text-sm text-slate-500 mb-1" id="dl-speed-unit">{downloadSpeed.unit}</span>
          {stats.downloadSpeed > 0 && (
            <span class="ml-auto text-emerald-500 flex items-center text-xs font-bold mb-1">
              <span class="material-symbols-outlined text-sm">trending_up</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Upload Speed */}
      <div class="bg-surface-dark p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col">
        <span class="text-xs font-bold text-slate-500 uppercase mb-2">Upload Speed</span>
        <div class="flex items-end gap-2">
          <span class="text-2xl font-bold" id="ul-speed">{uploadSpeed.value}</span>
          <span class="text-sm text-slate-500 mb-1" id="ul-speed-unit">{uploadSpeed.unit}</span>
          {stats.uploadSpeed > 0 && (
            <span class="ml-auto text-emerald-500 flex items-center text-xs font-bold mb-1">
              <span class="material-symbols-outlined text-sm">trending_up</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Disk Space */}
      <div class="bg-surface-dark p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col">
        <span class="text-xs font-bold text-slate-500 uppercase mb-2">Disk Space</span>
        <div class="flex items-end gap-2">
          <span class="text-2xl font-bold" id="disk-free">{diskFree.value}</span>
          <span class="text-sm text-slate-500 mb-1" id="disk-info">{diskFree.unit} free</span>
          <div class="ml-auto mb-1 w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div class={`h-full ${diskPercent > 80 ? 'bg-red-500' : diskPercent > 60 ? 'bg-orange-500' : 'bg-primary'}`} id="disk-bar" style={`width: ${diskPercent}%`}></div>
          </div>
        </div>
      </div>
      
      {/* Active Peers */}
      <div class="bg-surface-dark p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col">
        <span class="text-xs font-bold text-slate-500 uppercase mb-2">Active Peers</span>
        <div class="flex items-end gap-2">
          <span class="text-2xl font-bold" id="total-peers">{totalPeers}</span>
          <span class="text-sm text-slate-500 mb-1">Connections</span>
          <span class="ml-auto text-primary flex items-center text-xs font-bold mb-1">
            <span class="material-symbols-outlined text-sm">group</span>
          </span>
        </div>
      </div>
    </div>
  )
}
