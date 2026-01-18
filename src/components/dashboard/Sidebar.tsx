interface DashboardSidebarProps {
  labels: string[]
  labelCounts: Record<string, number>
  counts: {
    all: number
    downloading: number
    seeding: number
    paused: number
    completed: number
    error: number
  }
  filter: string
  systemInfo: {
    clientVersion?: string
    hostname?: string
    downloadRate?: number
    uploadRate?: number
    diskSpace?: { used: number; total: number }
    activePeers?: number
  }
}

export const DashboardSidebar = ({ labels, labelCounts, counts, filter, systemInfo }: DashboardSidebarProps) => {
  const downloadingCount = counts.downloading
  const seedingCount = counts.seeding
  const pausedCount = counts.paused
  const completedCount = counts.completed

  return (
    <aside class="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 flex-col h-screen sticky top-0 bg-background-light dark:bg-background-dark">
      {/* Logo */}
      <div class="p-6 flex items-center gap-3">
        <div class="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <span class="material-symbols-outlined text-2xl">box_edit</span>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">rTorrent</h1>
          <p class="text-xs text-primary font-medium" id="version-info">{systemInfo.clientVersion ? `v${systemInfo.clientVersion}` : ''}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav class="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2 mt-4">Transfers</div>

        <a id="nav-all" class={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${filter === 'all' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300'}`} data-filter="all">
          <span class="material-symbols-outlined">layers</span>
          <span class="text-sm font-medium">All Torrents</span>
          <span class="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold" id="all-count">{counts.all}</span>
        </a>

        <a class={`nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${filter === 'downloading' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300'}`} data-filter="downloading">
          <span class="material-symbols-outlined">downloading</span>
          <span class="text-sm font-medium">Downloading</span>
          <span class={`ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold ${downloadingCount === 0 ? 'hidden' : ''}`} id="downloading-count">{downloadingCount}</span>
        </a>

        <a class={`nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${filter === 'seeding' ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300'}`} data-filter="seeding">
          <span class="material-symbols-outlined">upload</span>
          <span class="text-sm font-medium">Seeding</span>
          <span class={`ml-auto text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded font-bold ${seedingCount === 0 ? 'hidden' : ''}`} id="seeding-count">{seedingCount}</span>
        </a>

        <a class={`nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${filter === 'paused' ? 'bg-orange-500/10 text-orange-500' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300'}`} data-filter="paused">
          <span class="material-symbols-outlined">pause_circle</span>
          <span class="text-sm font-medium">Paused</span>
          <span class={`ml-auto text-[10px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded font-bold ${pausedCount === 0 ? 'hidden' : ''}`} id="paused-count">{pausedCount}</span>
        </a>

        <a class={`nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${filter === 'completed' ? 'bg-slate-500/10 text-slate-400' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300'}`} data-filter="completed">
          <span class="material-symbols-outlined">check_circle</span>
          <span class="text-sm font-medium">Completed</span>
          <span class={`ml-auto text-[10px] bg-slate-500/20 text-slate-400 px-1.5 py-0.5 rounded font-bold ${completedCount === 0 ? 'hidden' : ''}`} id="completed-count">{completedCount}</span>
        </a>

        {/* Labels */}
        {labels.length > 0 && (
          <>
            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2 mt-8">Labels</div>
            {labels.map((label, i) => (
              <a class={`nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${filter === `label:${label}` ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-slate-300'}`} data-filter={`label:${label}`}>
                <span class={`w-2 h-2 rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500'][i % 5]}`}></span>
                <span class="text-sm font-medium">{label}</span>
                <span class="ml-auto text-[10px] bg-slate-500/20 text-slate-400 px-1.5 py-0.5 rounded font-bold">{labelCounts[label] || 0}</span>
              </a>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div class="p-4 border-t border-slate-200 dark:border-slate-800">
        <button id="sidebar-add" class="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-primary/20">
          <span class="material-symbols-outlined text-xl">add</span>
          <span class="text-sm">Add Torrent</span>
        </button>

        <div class="mt-4 flex items-center gap-3 px-2">
          <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
            <span class="material-symbols-outlined text-slate-500">person</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">Admin User</p>
            <p class="text-[10px] text-slate-500" id="hostname-info">{systemInfo.hostname || 'localhost'}</p>
          </div>
          <a href="/settings">
            <span class="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary">settings</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
