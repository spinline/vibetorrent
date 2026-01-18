// Label Modal
export const LabelModal = () => (
  <div id="label-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-sm mx-4">
      <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 class="text-lg font-bold">Set Label</h3>
        <button id="label-modal-close" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined text-slate-400">close</span>
        </button>
      </div>
      <div class="p-6">
        <label class="block text-sm font-medium mb-2">Label</label>
        <input 
          type="text" 
          id="label-input"
          class="w-full bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" 
          placeholder="Enter label..."
        />
      </div>
      <div class="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
        <button id="label-cancel" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          Cancel
        </button>
        <button id="label-submit" class="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
          Save
        </button>
      </div>
    </div>
  </div>
)

// Delete Confirmation Modal
export const DeleteModal = () => (
  <div id="delete-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50">
    <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-sm mx-4">
      <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 class="text-lg font-bold text-red-500">Remove Torrent</h3>
        <button id="delete-modal-close" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <span class="material-symbols-outlined text-slate-400">close</span>
        </button>
      </div>
      <div class="p-6">
        <p id="delete-msg" class="text-sm text-slate-600 dark:text-slate-300"></p>
        <p id="delete-warn" class="text-xs text-red-500 mt-2 hidden">⚠️ This will also delete all downloaded files!</p>
      </div>
      <div class="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
        <button id="delete-cancel" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          Cancel
        </button>
        <button id="delete-submit" class="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
          Remove
        </button>
      </div>
    </div>
  </div>
)

// Add Torrent Modal
export const AddTorrentModal = () => (
  <div id="add-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden items-center justify-center">
    <div class="bg-surface-dark/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl w-full max-w-5xl mx-4 flex flex-col max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div class="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <h2 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <span class="material-symbols-outlined text-primary">add_circle</span>
          Add New Torrent
        </h2>
        <button id="modal-close" class="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/5">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      {/* Content */}
      <div class="flex flex-col md:flex-row flex-1 overflow-auto">
        {/* Left Side - Source */}
        <div class="flex-1 p-8 border-r border-white/5 flex flex-col gap-6">
          {/* Source Type Tabs */}
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-400 ml-1">Source Type</label>
            <div class="flex bg-surface-darker p-1 rounded-lg border border-white/5">
              <label class="cursor-pointer flex-1 relative group" id="tab-file">
                <input type="radio" name="source_type" value="file" id="source-file" class="peer sr-only" checked />
                <div class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium text-gray-400 transition-all peer-checked:bg-[#242933] peer-checked:text-white peer-checked:shadow-sm">
                  <span class="material-symbols-outlined text-[18px]">upload_file</span>
                  File Upload
                </div>
              </label>
              <label class="cursor-pointer flex-1 relative group" id="tab-url">
                <input type="radio" name="source_type" value="url" id="source-url" class="peer sr-only" />
                <div class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium text-gray-400 transition-all peer-checked:bg-[#242933] peer-checked:text-white peer-checked:shadow-sm">
                  <span class="material-symbols-outlined text-[18px]">link</span>
                  URL / Magnet
                </div>
              </label>
            </div>
          </div>
          
          {/* File Upload Zone */}
          <div id="file-content" class="flex-1 min-h-[280px] rounded-2xl flex flex-col items-center justify-center p-8 gap-6 transition-all duration-300 group cursor-pointer relative overflow-hidden border-2 border-dashed border-primary/20 hover:border-primary/50 bg-gradient-to-br from-[#12131a] via-[#161421] to-[#1c162e]">
            <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-600/10 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <input type="file" id="torrent-file" accept=".torrent" class="absolute inset-0 opacity-0 cursor-pointer z-20" />
            <div class="relative z-10 w-24 h-24 rounded-full bg-[#13151a] flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-all duration-300 shadow-lg">
              <span class="material-symbols-outlined text-primary text-5xl transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(18,161,161,0.5)]">cloud_upload</span>
            </div>
            <div class="text-center space-y-2 relative z-10">
              <p class="text-xl font-bold text-white tracking-tight">Drop .torrent file here</p>
              <p class="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">or click to browse local files</p>
            </div>
            <div class="mt-2 flex gap-3 text-xs font-mono relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
              <span class="bg-[#1a1b26] px-2.5 py-1 rounded text-primary border border-primary/20">.torrent</span>
              <span class="bg-[#1a1b26] px-2.5 py-1 rounded text-violet-300 border border-violet-500/20">max 50mb</span>
            </div>
            <p id="file-name" class="text-sm text-primary font-medium hidden relative z-10 mt-2"></p>
          </div>
          
          {/* URL Input Zone */}
          <div id="url-content" class="hidden flex-1 min-h-[280px] flex flex-col gap-4">
            <div class="flex-1 rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-[#12131a] via-[#161421] to-[#1c162e]">
              <label class="block text-sm font-medium text-gray-300 mb-3">Magnet Link or Torrent URL</label>
              <textarea 
                id="torrent-url"
                class="w-full h-32 bg-[#0d0e12] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-mono" 
                placeholder="magnet:?xt=urn:btih:... or https://..."
              ></textarea>
              <div class="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span class="material-symbols-outlined text-[16px]">info</span>
                Supports magnet links, torrent URLs, and info hashes
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Configuration */}
        <div class="flex-1 p-8 bg-surface-darker/30 flex flex-col gap-6">
          <div class="flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider mb-2">
            <span class="material-symbols-outlined text-[18px]">tune</span>
            Configuration
          </div>
          
          {/* Download Location */}
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-300">Download Location</label>
            <div class="flex items-center bg-[#0d0e12] border border-white/5 rounded-lg pr-1 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <input 
                type="text" 
                id="download-path"
                class="bg-transparent border-none text-white text-sm w-full p-3.5 focus:ring-0 placeholder-gray-600 font-mono" 
                placeholder="/path/to/download" 
                value="/downloads"
              />
              <button class="p-2 text-gray-400 hover:text-white transition-colors" title="Browse">
                <span class="material-symbols-outlined">folder_open</span>
              </button>
            </div>
            <div class="flex gap-2" id="path-shortcuts">
              <span class="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 cursor-pointer hover:bg-white/10 hover:text-white transition-colors" data-path="/downloads">/downloads</span>
              <span class="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 cursor-pointer hover:bg-white/10 hover:text-white transition-colors" data-path="/downloads/movies">/movies</span>
              <span class="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 cursor-pointer hover:bg-white/10 hover:text-white transition-colors" data-path="/downloads/music">/music</span>
            </div>
          </div>
          
          {/* Priority */}
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-300">Priority</label>
            <div class="grid grid-cols-3 gap-3">
              <label class="cursor-pointer">
                <input type="radio" name="priority" value="1" class="peer sr-only" />
                <div class="h-10 rounded-lg border border-white/10 bg-surface-darker flex items-center justify-center text-sm font-medium text-gray-400 hover:bg-white/5 peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/10 transition-all">
                  Low
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="priority" value="2" class="peer sr-only" checked />
                <div class="h-10 rounded-lg border border-white/10 bg-surface-darker flex items-center justify-center text-sm font-medium text-gray-400 hover:bg-white/5 peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/10 transition-all">
                  Normal
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="priority" value="3" class="peer sr-only" />
                <div class="h-10 rounded-lg border border-white/10 bg-surface-darker flex items-center justify-center text-sm font-medium text-gray-400 hover:bg-white/5 peer-checked:border-primary peer-checked:text-primary peer-checked:bg-primary/10 transition-all">
                  High
                </div>
              </label>
            </div>
          </div>
          
          {/* Labels */}
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-300">Labels</label>
            <div class="flex flex-wrap items-center gap-2 p-3 min-h-[50px] rounded-lg bg-[#0d0e12] border border-white/5 focus-within:ring-2 focus-within:ring-primary transition-all" id="add-labels-container">
              <input 
                type="text" 
                id="add-label-input"
                class="bg-transparent border-none text-white text-sm flex-1 min-w-[80px] p-1 focus:ring-0 placeholder-gray-600" 
                placeholder="Type and press Enter..."
              />
            </div>
          </div>
          
          {/* Auto Start */}
          <div class="pt-2">
            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative flex items-center">
                <input type="checkbox" id="auto-start" checked class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-surface-darker checked:border-primary checked:bg-primary transition-all" />
                <span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
              </div>
              <span class="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">Start download automatically</span>
            </label>
          </div>
          
          {/* Error Message */}
          <p id="add-error" class="text-red-500 text-sm hidden mt-auto"></p>
        </div>
      </div>
      
      {/* Footer */}
      <div class="p-6 border-t border-white/5 bg-[#15181e]/50 flex justify-end items-center gap-4">
        <button id="modal-cancel" class="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
          Cancel
        </button>
        <button id="modal-submit" class="px-8 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">bolt</span>
          Add Torrent
        </button>
      </div>
    </div>
  </div>
)
