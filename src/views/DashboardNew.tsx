import type { TorrentInfo, SystemInfo } from '../services/rtorrent-service'
import {
  DashboardSidebar,
  DashboardHeader,
  StatsGrid,
  TorrentTable,
  ViewTabs,
  DetailDrawer,
  DrawerBackdrop,
  ContextMenu,
  PrioritySubmenu,
  LabelModal,
  DeleteModal,
  AddTorrentModal,
  getAllDashboardScripts
} from '../components/dashboard'

interface DashboardProps {
  torrents: TorrentInfo[]
  systemInfo: SystemInfo
}

export const DashboardNew = ({ torrents, systemInfo }: DashboardProps) => {
  // Prepare sidebar counts (using original torrents for counts)
  const counts = {
    all: torrents.length,
    downloading: torrents.filter(t => t.state === 'downloading').length,
    seeding: torrents.filter(t => t.state === 'seeding').length,
    paused: torrents.filter(t => t.state === 'paused' || t.state === 'stopped').length,
    completed: torrents.filter(t => t.completed >= t.size).length,
    error: torrents.filter(t => t.state === 'error').length
  }

  // Extract unique labels
  const labels = [...new Set(torrents.map(t => t.label).filter(Boolean))]
  const labelCounts: Record<string, number> = {}
  labels.forEach(label => {
    labelCounts[label] = torrents.filter(t => t.label === label).length
  })

  // Stats for grid
  const stats = {
    downloadSpeed: systemInfo.downloadRate || 0,
    uploadSpeed: systemInfo.uploadRate || 0,
    diskFree: (systemInfo.diskSpace?.total || 0) - (systemInfo.diskSpace?.used || 0),
    diskTotal: systemInfo.diskSpace?.total || 0,
    activePeers: systemInfo.activePeers || 0,
    totalTorrents: torrents.length
  }

  return (
    <html lang="en" class="dark">
      <head>
        <title>rTorrent Web UI</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Inter', 'system-ui', 'sans-serif'],
                  display: ['Space Grotesk', 'Inter', 'sans-serif']
                },
                colors: {
                  primary: '#12a1a1',
                  'surface-dark': '#1a1c24',
                  'surface-darker': '#13151a',
                  'background-dark': '#0f1115',
                  'background-light': '#ffffff'
                }
              }
            }
          }
        `}} />
        <style dangerouslySetInnerHTML={{
          __html: `
          body { font-family: 'Inter', system-ui, sans-serif; }
          .drawer-shadow { box-shadow: -20px 0 60px rgba(0,0,0,0.5); }
          @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
          .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          .scrollbar-thin::-webkit-scrollbar { width: 6px; }
          .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
          .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #475569; }
          .material-symbols-outlined { font-size: 20px; font-variation-settings: 'FILL' 0, 'wght' 500; }
          .touch-callout-none { -webkit-touch-callout: none !important; }
        `}} />
      </head>
      <body class="bg-background-dark text-slate-100 antialiased overflow-hidden">
        <div class="flex h-[100dvh]" id="app-container">
          {/* Sidebar */}
          <DashboardSidebar
            labels={labels}
            labelCounts={labelCounts}
            counts={counts}
            filter="all"
            systemInfo={systemInfo}
          />

          {/* Main Content */}
          <main class="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <DashboardHeader />

            {/* Content Area */}
            <div class="flex-1 p-8 overflow-y-auto scrollbar-thin">
              {/* Stats Grid */}
              <StatsGrid stats={stats} />

              {/* View Tabs */}
              <ViewTabs />

              {/* Torrent Table */}
              <TorrentTable torrents={torrents} />
            </div>
          </main>
        </div>

        {/* Detail Drawer */}
        <DetailDrawer />
        <DrawerBackdrop />

        {/* Context Menu */}
        <ContextMenu />
        <PrioritySubmenu />

        {/* Modals */}
        <LabelModal />
        <DeleteModal />
        <AddTorrentModal />

        {/* Hidden Data */}
        <script
          id="initial-data"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              torrents,
              systemInfo,
              labels
            })
          }}
        />

        {/* Dashboard Scripts */}
        <script dangerouslySetInnerHTML={{ __html: getAllDashboardScripts() }} />
      </body>
    </html>
  )
}
