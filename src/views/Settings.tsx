import type { SystemInfo } from '../services/rtorrent-service'

interface SettingsProps {
  systemInfo: SystemInfo
}

export const Settings = ({ systemInfo }: SettingsProps) => {
  return (
    <html lang="en" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Settings - rTorrent Dashboard</title>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "primary": "#12a1a1",
                  "background-light": "#ffffff",
                  "background-dark": "#17191c",
                  "surface-dark": "#24272B",
                },
                fontFamily: {
                  "display": ["Space Grotesk", "sans-serif"],
                  "sans": ["Noto Sans", "sans-serif"]
                },
                borderRadius: {
                  "DEFAULT": "0.25rem",
                  "lg": "0.5rem",
                  "xl": "0.75rem",
                  "full": "9999px"
                },
              },
            },
          }
        `}} />
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .material-symbols-filled {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .active-nav {
            background-color: rgba(18, 161, 161, 0.15);
            border-left: 3px solid #12a1a1;
          }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #17191c; }
          ::-webkit-scrollbar-thumb { background: #34383d; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #4a4f56; }
        `}} />
      </head>
      <body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex">
        
        {/* Side Navigation Bar */}
        <aside class="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 bg-background-light dark:bg-background-dark">
          <div class="p-6 flex items-center gap-3">
            <div class="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined text-2xl">box_edit</span>
            </div>
            <div>
              <h1 class="text-xl font-bold tracking-tight">rTorrent</h1>
              <p class="text-xs text-primary font-medium" id="version-info">v{systemInfo.clientVersion} / lib {systemInfo.libraryVersion}</p>
            </div>
          </div>
          
          <nav class="flex-1 px-3 space-y-1">
            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2 mt-4">Transfers</div>
            
            <a id="nav-all" class="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="/">
              <span class="material-symbols-outlined">layers</span>
              <span class="text-sm font-medium text-slate-600 dark:text-slate-300">All Torrents</span>
            </a>
            
            <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="/?filter=downloading">
              <span class="material-symbols-outlined">downloading</span>
              <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Downloading</span>
            </a>
            
            <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="/?filter=seeding">
              <span class="material-symbols-outlined">upload</span>
              <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Seeding</span>
            </a>
            
            <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="/?filter=paused">
              <span class="material-symbols-outlined">pause_circle</span>
              <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Paused</span>
            </a>
            
            <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="/?filter=completed">
              <span class="material-symbols-outlined">check_circle</span>
              <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Completed</span>
            </a>
          </nav>
          
          <div class="p-4 border-t border-slate-200 dark:border-slate-800">
            <div class="mt-4 flex items-center gap-3 px-2">
              <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                <span class="material-symbols-outlined text-slate-500">person</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold truncate">Admin User</p>
                <p class="text-[10px] text-slate-500">{systemInfo.hostname}</p>
              </div>
              <a href="/settings" class="material-symbols-outlined text-primary cursor-pointer">settings</a>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* Top Header */}
          <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark flex items-center justify-between px-8 shrink-0">
            <h2 class="text-lg font-bold">Settings</h2>
          </header>
          
          {/* Content Area */}
          <div class="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-background-dark/50">
            
            <div class="max-w-4xl mx-auto space-y-8">
              
              {/* Connection Settings */}
              <div class="bg-background-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center gap-4 mb-6">
                  <div class="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span class="material-symbols-outlined">link</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">Connection</h3>
                    <p class="text-sm text-slate-500">Configure connection to rTorrent XML-RPC</p>
                  </div>
                </div>
                
                <form class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hostname</label>
                      <input type="text" value="localhost" class="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Port</label>
                      <input type="number" value="8000" class="w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                    </div>
                  </div>
                  
                  <div class="pt-2">
                    <button type="submit" class="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                      Test Connection
                    </button>
                  </div>
                </form>
              </div>

              {/* Interface Settings */}
              <div class="bg-background-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div class="flex items-center gap-4 mb-6">
                  <div class="size-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <span class="material-symbols-outlined">palette</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">Interface</h3>
                    <p class="text-sm text-slate-500">Customize the look and feel of the dashboard</p>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <div class="flex items-center justify-between py-2">
                    <div>
                      <p class="font-medium text-sm">Refresh Interval</p>
                      <p class="text-xs text-slate-500">How often to fetch new data</p>
                    </div>
                    <select class="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                      <option>1 second</option>
                      <option selected>2 seconds</option>
                      <option>5 seconds</option>
                      <option>10 seconds</option>
                    </select>
                  </div>
                  
                  <div class="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p class="font-medium text-sm">Theme</p>
                      <p class="text-xs text-slate-500">Toggle dark/light mode</p>
                    </div>
                    <select class="bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                      <option>Light</option>
                      <option selected>Dark</option>
                      <option>System</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* System Info Card */}
              <div class="bg-background-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div class="flex items-center gap-4 mb-6">
                  <div class="size-10 rounded-lg bg-slate-500/10 text-slate-500 flex items-center justify-center">
                    <span class="material-symbols-outlined">info</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">About</h3>
                    <p class="text-sm text-slate-500">System information</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                   <div class="p-3 bg-slate-50 dark:bg-background-dark rounded-lg">
                      <span class="text-slate-500 block text-xs uppercase mb-1">rTorrent Version</span>
                      <span class="font-mono">{systemInfo.clientVersion}</span>
                   </div>
                   <div class="p-3 bg-slate-50 dark:bg-background-dark rounded-lg">
                      <span class="text-slate-500 block text-xs uppercase mb-1">Library Version</span>
                      <span class="font-mono">{systemInfo.libraryVersion}</span>
                   </div>
                   <div class="p-3 bg-slate-50 dark:bg-background-dark rounded-lg">
                      <span class="text-slate-500 block text-xs uppercase mb-1">Hostname</span>
                      <span class="font-mono">{systemInfo.hostname}</span>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
