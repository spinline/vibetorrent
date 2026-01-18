import type { Child } from 'hono/jsx'
import { Icon } from '../ui'

// Dashboard Sidebar
interface DashboardSidebarProps {
  clientVersion: string
  libraryVersion: string
  totalCount: number
  downloadingCount: number
  seedingCount: number
  pausedCount: number
  labels: string[]
}

export const DashboardSidebar = ({
  clientVersion,
  libraryVersion,
  totalCount,
  downloadingCount,
  seedingCount,
  pausedCount,
  labels
}: DashboardSidebarProps) => (
  <>
    <div id="sidebar-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 hidden md:hidden transition-opacity opacity-0"></div>
    <aside id="dashboard-sidebar" class="fixed inset-y-0 left-0 z-40 w-64 transform -translate-x-full transition-transform duration-300 md:translate-x-0 md:static md:inset-auto md:flex border-r border-slate-200 dark:border-slate-800 flex-col h-screen sticky top-0 bg-background-light dark:bg-background-dark">
      <div class="p-6 flex items-center gap-3">
        <div class="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Icon name="box_edit" class="text-2xl" />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">rTorrent</h1>
          <p class="text-xs text-primary font-medium" id="version-info">v{clientVersion} / lib {libraryVersion}</p>
        </div>
      </div>

      <nav class="flex-1 px-3 space-y-1">
        <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2 mt-4">Transfers</div>

        <a id="nav-all" class="flex items-center gap-3 px-4 py-2.5 rounded-lg active-nav text-primary" href="#">
          <Icon name="layers" />
          <span class="text-sm font-medium">All Torrents</span>
          <span class="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold" id="all-count">{totalCount}</span>
        </a>

        <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="#" data-filter="downloading">
          <Icon name="downloading" />
          <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Downloading</span>
          <span class={`ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold ${downloadingCount === 0 ? 'hidden' : ''}`} id="downloading-count">{downloadingCount}</span>
        </a>

        <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="#" data-filter="seeding">
          <Icon name="upload" />
          <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Seeding</span>
          <span class={`ml-auto text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded font-bold ${seedingCount === 0 ? 'hidden' : ''}`} id="seeding-count">{seedingCount}</span>
        </a>

        <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="#" data-filter="paused">
          <Icon name="pause_circle" />
          <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Paused</span>
          <span class={`ml-auto text-[10px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded font-bold ${pausedCount === 0 ? 'hidden' : ''}`} id="paused-count">{pausedCount}</span>
        </a>

        {labels.length > 0 && (
          <>
            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-2 mt-6">Labels</div>
            {labels.map(label => (
              <a class="nav-filter flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors" href="#" data-filter={`label:${label}`}>
                <Icon name="label" />
                <span class="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
              </a>
            ))}
          </>
        )}
      </nav>

      <div class="p-3 border-t border-slate-200 dark:border-slate-800">
        <a href="/settings" class="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors text-slate-600 dark:text-slate-300">
          <Icon name="settings" />
          <span class="text-sm font-medium">Settings</span>
        </a>
      </div>
    </aside>
  </>
)

// Settings Sidebar
interface NavItem {
  id: string
  icon: string
  label: string
}

interface SettingsSidebarProps {
  hostname: string
  navItems?: NavItem[]
}

const defaultNavItems: NavItem[] = [
  { id: 'connection', icon: 'router', label: 'Connection' },
  { id: 'downloads', icon: 'download', label: 'Downloads' },
  { id: 'bittorrent', icon: 'share', label: 'BitTorrent' },
  { id: 'folders', icon: 'folder', label: 'Folders' },
  { id: 'webui', icon: 'terminal', label: 'Web UI' },
  { id: 'authentication', icon: 'security', label: 'Authentication' },
]

export const SettingsSidebar = ({ hostname, navItems = defaultNavItems }: SettingsSidebarProps) => (
  <>
    <div id="settings-sidebar-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 hidden md:hidden transition-opacity opacity-0"></div>
    <aside id="settings-sidebar" class="fixed inset-y-0 left-0 z-40 w-64 transform -translate-x-full transition-transform duration-300 md:translate-x-0 md:static md:inset-auto md:flex border-r border-slate-200 dark:border-slate-800 flex-col h-screen sticky top-0 bg-background-light dark:bg-background-dark">
      <div class="p-6 flex items-center gap-3">
        <a href="/" class="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
          <Icon name="arrow_back" class="text-2xl" />
        </a>
        <div>
          <h1 class="text-xl font-bold tracking-tight">Settings</h1>
          <p class="text-xs text-primary font-medium">Configuration</p>
        </div>
      </div>

      <nav class="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item, index) => (
          <a
            href="javascript:void(0)"
            onclick={`switchTab('${item.id}')`}
            data-tab={item.id}
            class={`nav-item flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors ${index === 0 ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-300'}`}
          >
            <Icon name={item.icon} />
            <span class="text-sm font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      <div class="p-4 border-t border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-3 px-2">
          <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
            <Icon name="person" class="text-slate-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">Admin User</p>
            <p class="text-[10px] text-slate-500">{hostname}</p>
          </div>
        </div>
      </div>
    </aside>
  </>
)
