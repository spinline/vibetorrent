// Detail Drawer component for viewing torrent details
export const DetailDrawer = () => (
  <div id="detail-drawer" class="fixed top-0 right-0 bottom-0 w-full md:w-[648px] bg-surface-dark border-l border-slate-800 flex flex-col drawer-shadow z-50 transition-transform duration-300 ease-in-out translate-x-full">
    {/* Drawer Header */}
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-background-dark safe-h-16 safe-top">
      <h2 class="text-sm font-bold text-slate-300 uppercase tracking-widest">Details</h2>
      <button id="drawer-close" class="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>

    {/* Drawer Content */}
    <div id="drawer-content" class="flex-1 overflow-y-auto">
      {/* Loading State */}
      <div id="drawer-loading" class="flex items-center justify-center h-full">
        <div class="flex flex-col items-center gap-4">
          <span class="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p class="text-sm text-slate-400">Loading details...</p>
        </div>
      </div>

      {/* Loaded Content */}
      <div id="drawer-loaded" class="hidden">
        {/* Hero Section with Progress Ring */}
        <div class="p-8 flex flex-col items-center border-b border-slate-800/50 bg-gradient-to-b from-background-dark to-surface-dark">
          <div class="relative size-36 mb-6">
            <svg class="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <path class="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="2"></path>
              <path id="drawer-progress-ring" class="text-primary drop-shadow-[0_0_8px_rgba(18,161,161,0.6)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="0, 100" stroke-linecap="round" stroke-width="2"></path>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center flex-col">
              <span id="drawer-progress-text" class="text-3xl font-display font-bold text-white tracking-tighter">0<span class="text-lg text-primary">%</span></span>
              <span id="drawer-state-badge" class="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 px-2 py-0.5 bg-primary/10 rounded">--</span>
            </div>
          </div>
          <h2 id="drawer-torrent-name" class="text-lg font-bold text-center text-white mb-1 px-4 leading-tight max-w-full break-words">--</h2>
          <div id="drawer-hash" class="text-[10px] text-slate-500 font-mono mb-6">HASH: --</div>

          {/* Action Buttons */}
          <div class="flex items-center gap-4 w-full justify-center">
            <button id="drawer-btn-pause" class="flex flex-col items-center gap-1 group">
              <div class="size-10 rounded-full bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-white flex items-center justify-center transition-all border border-slate-700 shadow-lg">
                <span class="material-symbols-outlined">pause</span>
              </div>
              <span class="text-[10px] font-medium text-slate-500">Pause</span>
            </button>
            <button id="drawer-btn-start" class="flex flex-col items-center gap-1 group hidden">
              <div class="size-10 rounded-full bg-slate-800 group-hover:bg-emerald-900/30 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center transition-all border border-slate-700 group-hover:border-emerald-900/50 shadow-lg">
                <span class="material-symbols-outlined">play_arrow</span>
              </div>
              <span class="text-[10px] font-medium text-slate-500">Start</span>
            </button>
            <button id="drawer-btn-delete" class="flex flex-col items-center gap-1 group">
              <div class="size-10 rounded-full bg-slate-800 group-hover:bg-red-900/30 text-slate-300 group-hover:text-red-400 flex items-center justify-center transition-all border border-slate-700 group-hover:border-red-900/50 shadow-lg">
                <span class="material-symbols-outlined">delete</span>
              </div>
              <span class="text-[10px] font-medium text-slate-500">Delete</span>
            </button>
            <button id="drawer-btn-recheck" class="flex flex-col items-center gap-1 group">
              <div class="size-10 rounded-full bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-white flex items-center justify-center transition-all border border-slate-700 shadow-lg">
                <span class="material-symbols-outlined">sync</span>
              </div>
              <span class="text-[10px] font-medium text-slate-500">Recheck</span>
            </button>
            <button id="drawer-btn-label" class="flex flex-col items-center gap-1 group">
              <div class="size-10 rounded-full bg-slate-800 group-hover:bg-indigo-900/30 text-slate-300 group-hover:text-indigo-400 flex items-center justify-center transition-all border border-slate-700 group-hover:border-indigo-900/50 shadow-lg">
                <span class="material-symbols-outlined">label</span>
              </div>
              <span class="text-[10px] font-medium text-slate-500">Label</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div class="flex border-b border-slate-800 bg-background-dark px-6 sticky top-0 z-10">
          <button data-tab="overview" class="drawer-tab py-3 mr-6 text-xs font-bold text-primary border-b-2 border-primary transition-colors">Overview</button>
          <button data-tab="files" class="drawer-tab py-3 mr-6 text-xs font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent hover:border-slate-700 transition-colors">Files <span id="drawer-files-count" class="ml-1 text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full">0</span></button>
          <button data-tab="peers" class="drawer-tab py-3 mr-6 text-xs font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent hover:border-slate-700 transition-colors">Peers <span id="drawer-peers-count" class="ml-1 text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full">0</span></button>
          <button data-tab="trackers" class="drawer-tab py-3 text-xs font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent hover:border-slate-700 transition-colors">Trackers</button>
        </div>

        {/* Tab Content - Overview */}
        <div id="tab-overview" class="tab-content">
          <div class="p-6 grid grid-cols-2 gap-y-5 gap-x-4 border-b border-slate-800/50">
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Size</p>
              <p id="drawer-size" class="text-sm text-slate-200 font-mono">--</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Downloaded</p>
              <p id="drawer-downloaded" class="text-sm text-slate-200 font-mono">--</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Share Ratio</p>
              <p id="drawer-ratio" class="text-sm text-primary font-bold">--</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">ETA</p>
              <p id="drawer-eta" class="text-sm text-slate-200">--</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Peers</p>
              <p id="drawer-peers" class="text-sm text-slate-200 font-mono">--</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Label</p>
              <p id="drawer-label" class="text-sm text-slate-200">--</p>
            </div>
            <div class="col-span-2">
              <p class="text-[10px] text-slate-500 uppercase font-bold mb-1">Save Path</p>
              <p id="drawer-path" class="text-xs text-slate-300 font-mono break-all bg-slate-800/50 p-2 rounded border border-slate-800">--</p>
            </div>
          </div>

          {/* Speed Section */}
          <div class="p-6 bg-slate-900/30">
            <div class="flex justify-between items-end mb-3">
              <span class="text-xs font-bold text-slate-400">Transfer Speed</span>
              <div class="text-right">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-primary text-sm">arrow_downward</span>
                    <span id="drawer-dl-speed" class="text-sm font-bold text-primary font-mono">0 KB/s</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-emerald-500 text-sm">arrow_upward</span>
                    <span id="drawer-ul-speed" class="text-sm font-bold text-emerald-500 font-mono">0 KB/s</span>
                  </div>
                </div>
              </div>
            </div>
            <div id="speed-graph" class="h-12 flex items-end gap-0.5 border-b border-slate-800 pb-1">
              {/* Speed bars will be injected here */}
            </div>
          </div>

          {/* Files Preview */}
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Files Preview</h3>
              <button id="view-all-files" class="text-[10px] text-primary hover:text-white transition-colors font-bold">View All</button>
            </div>
            <div id="drawer-files-preview" class="space-y-2">
              {/* Files will be injected here */}
            </div>
          </div>
        </div>

        {/* Tab Content - Files */}
        <div id="tab-files" class="tab-content hidden flex flex-col h-full bg-[#0f1115]">
          {/* File Layout Header (Filter & Actions) */}
          <div class="px-6 py-4 border-b border-slate-800 bg-surface-dark/50 shrink-0">
            <div class="flex items-center gap-2 w-full">
              <input id="files-filter-input" class="bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 px-3 py-2 w-full focus:ring-1 focus:ring-primary focus:border-primary placeholder-slate-600 outline-none transition-all" placeholder="Filter files..." type="text" />
            </div>
          </div>

          {/* File Table Header */}
          <div class="flex-1 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-[#0f1115] z-10 shadow-sm border-b border-slate-800">
                <tr>
                  <th id="th-sort-name" class="group px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-300 transition-colors select-none" data-key="name">
                    <div class="flex items-center gap-1">
                      File Name
                      <span class="sort-icon material-symbols-outlined text-xs opacity-0 group-hover:opacity-50 transition-opacity">unfold_more</span>
                    </div>
                  </th>
                  <th id="th-sort-size" class="group px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right w-32 cursor-pointer hover:text-slate-300 transition-colors select-none" data-key="size">
                    <div class="flex items-center justify-end gap-1">
                      Size
                      <span class="sort-icon material-symbols-outlined text-xs opacity-0 group-hover:opacity-50 transition-opacity">unfold_more</span>
                    </div>
                  </th>
                  <th id="th-sort-progress" class="group px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-48 cursor-pointer hover:text-slate-300 transition-colors select-none" data-key="progress">
                    <div class="flex items-center gap-1">
                      Progress
                      <span class="sort-icon material-symbols-outlined text-xs opacity-0 group-hover:opacity-50 transition-opacity">unfold_more</span>
                    </div>
                  </th>
                  <th id="th-sort-priority" class="group px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-32 cursor-pointer hover:text-slate-300 transition-colors select-none" data-key="priority">
                    <div class="flex items-center justify-center gap-1">
                      Priority
                      <span class="sort-icon material-symbols-outlined text-xs opacity-0 group-hover:opacity-50 transition-opacity">unfold_more</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody id="drawer-files-list" class="divide-y divide-slate-800/50 text-sm">
                {/* Files injected here */}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div id="files-pagination" class="px-6 py-3 border-t border-slate-800 bg-surface-dark/50 shrink-0 flex items-center justify-between text-xs hidden">
            <span id="files-pagination-info" class="text-slate-500">Showing 0-0 of 0</span>
            <div class="flex gap-2">
              <button id="files-prev-page" class="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors">Previous</button>
              <button id="files-next-page" class="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors">Next</button>
            </div>
          </div>
        </div>

        {/* Tab Content - Peers */}
        <div id="tab-peers" class="tab-content hidden">
          <div class="p-4">
            <div id="drawer-peers-list" class="space-y-2">
              {/* Peers will be listed here */}
            </div>
          </div>
        </div>

        {/* Tab Content - Trackers */}
        <div id="tab-trackers" class="tab-content hidden">
          <div class="p-4">
            <div id="drawer-trackers-list" class="space-y-2">
              {/* Trackers will be listed here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Drawer backdrop
export const DrawerBackdrop = () => (
  <div id="drawer-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden"></div>
)
