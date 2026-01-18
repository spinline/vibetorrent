// Context Menu component for right-click actions
export const ContextMenu = () => (
  <div id="context-menu" class="fixed hidden z-50 min-w-52 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden py-1">
    <div class="py-1">
      <button id="ctx-start" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-emerald-500 text-lg">play_arrow</span>
        <span>Start</span>
      </button>
      <button id="ctx-pause" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-orange-500 text-lg">pause</span>
        <span>Pause</span>
      </button>
      <button id="ctx-stop" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-slate-500 text-lg">stop</span>
        <span>Stop</span>
      </button>
    </div>
    
    <div class="border-t border-slate-200 dark:border-slate-800 py-1">
      <button id="ctx-recheck" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-blue-500 text-lg">refresh</span>
        <span>Recheck</span>
      </button>
      <button id="ctx-reannounce" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-purple-500 text-lg">campaign</span>
        <span>Reannounce</span>
      </button>
    </div>
    
    <div class="border-t border-slate-200 dark:border-slate-800 py-1">
      <button id="ctx-copy-magnet" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-primary text-lg">link</span>
        <span>Copy Magnet Link</span>
      </button>
      <button id="ctx-copy-hash" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-slate-500 text-lg">tag</span>
        <span>Copy Hash</span>
      </button>
    </div>
    
    <div class="border-t border-slate-200 dark:border-slate-800 py-1">
      <button id="ctx-set-label" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
        <span class="material-symbols-outlined text-amber-500 text-lg">label</span>
        <span>Set Label...</span>
      </button>
      <button id="ctx-priority-btn" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-indigo-500 text-lg">low_priority</span>
          <span>Priority</span>
        </div>
        <span class="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
      </button>
    </div>
    
    <div class="border-t border-slate-200 dark:border-slate-800 py-1">
      <button id="ctx-remove" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-500">
        <span class="material-symbols-outlined text-lg">delete</span>
        <span>Remove</span>
      </button>
      <button id="ctx-remove-data" class="ctx-item w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600 font-medium">
        <span class="material-symbols-outlined text-lg">delete_forever</span>
        <span>Remove with Data</span>
      </button>
    </div>
  </div>
)

// Priority Submenu
export const PrioritySubmenu = () => (
  <div id="priority-submenu" class="fixed z-[60] min-w-44 bg-white dark:bg-surface-dark rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden py-1.5 opacity-0 scale-95 pointer-events-none transition-all duration-150 origin-top-left">
    <div class="px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 mb-1">
      <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Set Priority</span>
    </div>
    <button data-priority="0" class="ctx-priority w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm group">
      <div class="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
        <span class="material-symbols-outlined text-slate-400 text-base">block</span>
      </div>
      <div class="flex-1">
        <span class="font-medium">Off</span>
        <p class="text-[10px] text-slate-400">Don't download</p>
      </div>
      <span class="priority-check opacity-0 material-symbols-outlined text-primary text-lg transition-opacity">check_circle</span>
    </button>
    <button data-priority="1" class="ctx-priority w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm group">
      <div class="size-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
        <span class="material-symbols-outlined text-blue-500 text-base">south</span>
      </div>
      <div class="flex-1">
        <span class="font-medium">Low</span>
        <p class="text-[10px] text-slate-400">Download last</p>
      </div>
      <span class="priority-check opacity-0 material-symbols-outlined text-blue-500 text-lg transition-opacity">check_circle</span>
    </button>
    <button data-priority="2" class="ctx-priority w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm group">
      <div class="size-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
        <span class="material-symbols-outlined text-emerald-500 text-base">horizontal_rule</span>
      </div>
      <div class="flex-1">
        <span class="font-medium">Normal</span>
        <p class="text-[10px] text-slate-400">Default priority</p>
      </div>
      <span class="priority-check opacity-0 material-symbols-outlined text-emerald-500 text-lg transition-opacity">check_circle</span>
    </button>
    <button data-priority="3" class="ctx-priority w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all text-sm group">
      <div class="size-7 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
        <span class="material-symbols-outlined text-orange-500 text-base">north</span>
      </div>
      <div class="flex-1">
        <span class="font-medium">High</span>
        <p class="text-[10px] text-slate-400">Download first</p>
      </div>
      <span class="priority-check opacity-0 material-symbols-outlined text-orange-500 text-lg transition-opacity">check_circle</span>
    </button>
  </div>
)
