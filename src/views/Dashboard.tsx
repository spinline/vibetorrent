import type { TorrentInfo, SystemInfo } from '../services/rtorrent-service'
import { Layout } from '../components/layout/Layout'
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

export const Dashboard = ({ torrents, systemInfo }: DashboardProps) => {
  // Prepare sidebar counts
  const counts = {
    all: torrents.length,
    downloading: torrents.filter(t => t.state === 'downloading').length,
    seeding: torrents.filter(t => t.state === 'seeding').length,
    paused: torrents.filter(t => t.state === 'paused' || t.state === 'stopped').length,
    completed: torrents.filter(t => t.completed >= t.size).length,
    error: 0
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
    <Layout
      title="rTorrent Web UI"
      scripts={getAllDashboardScripts()}
      styles={`
        .drawer-shadow { box-shadow: -20px 0 60px rgba(0,0,0,0.5); }
        @keyframes pulse-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}
    >
      <div class="flex h-[100dvh] w-full" id="app-container">
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

            <div class="mt-8">
              <ViewTabs />
              <TorrentTable torrents={torrents} />
            </div>
          </div>
        </main>
      </div>

      <DetailDrawer />
      <DrawerBackdrop />
      <ContextMenu />
      <PrioritySubmenu />
      <LabelModal />
      <DeleteModal />
      <AddTorrentModal />

      {/* Initial data for client-side scripts */}
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
    </Layout>
  )
}
