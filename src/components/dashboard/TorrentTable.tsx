import type { TorrentInfo } from '../../services/rtorrent-service'
import { formatBytes, formatSpeed, formatETA, getStatusBadge, getFileIcon, getFileIconColor } from './utils'

interface TorrentTableProps {
  torrents: TorrentInfo[]
}

export const TorrentTableHeader = () => (
  <thead class="bg-slate-50 dark:bg-background-dark/30 border-b border-slate-200 dark:border-slate-800">
    <tr>
      <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-1/3 cursor-pointer hover:text-primary transition-colors select-none" data-sort="name">
        <div class="flex items-center gap-1">Name <span class="material-symbols-outlined text-xs sort-icon" data-col="name">unfold_more</span></div>
      </th>
      <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none" data-sort="size">
        <div class="flex items-center gap-1">Size <span class="material-symbols-outlined text-xs sort-icon" data-col="size">unfold_more</span></div>
      </th>
      <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-48 cursor-pointer hover:text-primary transition-colors select-none" data-sort="progress">
        <div class="flex items-center gap-1">Progress <span class="material-symbols-outlined text-xs sort-icon" data-col="progress">unfold_more</span></div>
      </th>
      <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors select-none" data-sort="state">
        <div class="flex items-center gap-1">Status <span class="material-symbols-outlined text-xs sort-icon" data-col="state">unfold_more</span></div>
      </th>
      <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right cursor-pointer hover:text-primary transition-colors select-none whitespace-nowrap" data-sort="downloadRate">
        <div class="flex items-center justify-end gap-1">DL Speed <span class="material-symbols-outlined text-xs sort-icon" data-col="downloadRate">unfold_more</span></div>
      </th>
      <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right cursor-pointer hover:text-primary transition-colors select-none whitespace-nowrap" data-sort="uploadRate">
        <div class="flex items-center justify-end gap-1">UL Speed <span class="material-symbols-outlined text-xs sort-icon" data-col="uploadRate">unfold_more</span></div>
      </th>
      <th class="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right cursor-pointer hover:text-primary transition-colors select-none" data-sort="eta">
        <div class="flex items-center justify-end gap-1">ETA <span class="material-symbols-outlined text-xs sort-icon" data-col="eta">unfold_more</span></div>
      </th>
    </tr>
  </thead>
)

export const EmptyTorrents = () => (
  <tr>
    <td colSpan={7} class="px-6 py-12 text-center text-slate-500">
      <div class="flex flex-col items-center gap-3">
        <span class="material-symbols-outlined text-4xl text-slate-400">cloud_download</span>
        <p class="font-medium">No torrents yet</p>
        <p class="text-sm">Add a torrent to get started</p>
      </div>
    </td>
  </tr>
)

export const TorrentRow = ({ torrent }: { torrent: TorrentInfo }) => {
  const progress = torrent.size > 0 ? Math.min(100, Math.max(0, parseFloat(((torrent.completed / torrent.size) * 100).toFixed(2)))) : 0
  const dlSpeed = formatSpeed(torrent.downloadRate)
  const ulSpeed = formatSpeed(torrent.uploadRate)
  const progressColor = torrent.state === 'seeding' ? 'bg-emerald-500' : 
                       torrent.state === 'paused' || torrent.state === 'stopped' ? 'bg-orange-500' : 'bg-primary'
  
  return (
    <tr class="hover:bg-slate-50/50 dark:hover:bg-background-dark/20 transition-colors group cursor-pointer" data-hash={torrent.hash}>
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <span class={`material-symbols-outlined ${getFileIconColor(torrent.name)}`}>{getFileIcon(torrent.name)}</span>
          <div class="min-w-0">
            <div class="text-sm font-bold truncate max-w-xs" title={torrent.name}>{torrent.name}</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 text-sm font-medium whitespace-nowrap">{formatBytes(torrent.size)}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class={`h-full ${progressColor}`} style={`width: ${progress}%`}></div>
          </div>
          <span class="text-xs font-bold w-14 text-right">{progress}%</span>
        </div>
      </td>
      <td class="px-6 py-4" dangerouslySetInnerHTML={{ __html: getStatusBadge(torrent.state) }}></td>
      <td class={`px-6 py-4 text-sm font-${torrent.downloadRate > 0 ? 'bold' : 'medium'} text-right whitespace-nowrap ${torrent.downloadRate > 0 ? 'text-primary' : 'text-slate-400'}`}>
        {torrent.downloadRate > 0 ? `${dlSpeed.value} ${dlSpeed.unit}` : `0 KB/s`}
      </td>
      <td class={`px-6 py-4 text-sm font-${torrent.uploadRate > 0 ? 'bold' : 'medium'} text-right whitespace-nowrap ${torrent.uploadRate > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
        {torrent.uploadRate > 0 ? `${ulSpeed.value} ${ulSpeed.unit}` : `0 KB/s`}
      </td>
      <td class="px-6 py-4 text-sm font-medium text-right text-slate-500 whitespace-nowrap">
        {progress === 100 ? 'Done' : formatETA(torrent.eta)}
      </td>
    </tr>
  )
}

export const TorrentTable = ({ torrents }: TorrentTableProps) => (
  <div class="bg-background-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <table class="w-full text-left">
      <TorrentTableHeader />
      <tbody id="torrent-table-body" class="divide-y divide-slate-100 dark:divide-slate-800">
        {torrents.length === 0 ? (
          <EmptyTorrents />
        ) : (
          torrents.map((torrent) => <TorrentRow torrent={torrent} />)
        )}
      </tbody>
    </table>
    
    <div class="px-6 py-4 bg-slate-50 dark:bg-background-dark/30 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
      <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        Showing <span id="torrent-count">{torrents.length}</span> of <span id="total-count">{torrents.length}</span> torrents
      </p>
      <div class="flex gap-2">
        <button class="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded uppercase hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Prev</button>
        <button class="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded uppercase hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Next</button>
      </div>
    </div>
  </div>
)

export const ViewTabs = () => (
  <div class="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-8">
    <button class="pb-3 border-b-2 border-primary text-primary text-sm font-bold">Default View</button>
    <button class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold transition-all">Detailed Analytics</button>
    <button class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold transition-all">Trackers</button>
  </div>
)
