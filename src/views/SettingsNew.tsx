import type { SystemInfo } from '../services/rtorrent-service'
import { Layout } from '../components/layout/Layout'
import { SettingsSidebar } from '../components/layout/Sidebar'
import { PageHeader, MainContent, ContentArea } from '../components/layout/Header'
import { 
  ConnectionSection, 
  DownloadsSection, 
  BitTorrentSection, 
  FoldersSection, 
  WebUISection, 
  AuthenticationSection 
} from '../components/settings'
import { settingsScripts, settingsStyles } from '../components/settings/scripts'

interface SettingsProps {
  systemInfo: SystemInfo
}

export const Settings = ({ systemInfo }: SettingsProps) => {
  return (
    <Layout 
      title="Settings - rTorrent Dashboard"
      scripts={settingsScripts}
      styles={settingsStyles}
    >
      <SettingsSidebar hostname={systemInfo.hostname} />
      
      <MainContent>
        <PageHeader title="Connection" badge="Configuration">
          <div class="flex items-center gap-2 text-slate-500 text-xs">
            <span>Last synced: Just now</span>
            <span class="material-symbols-outlined text-sm cursor-pointer hover:animate-spin">refresh</span>
          </div>
        </PageHeader>
        
        <ContentArea maxWidth="4xl">
          <ConnectionSection active />
          <DownloadsSection />
          <BitTorrentSection />
          <FoldersSection />
          <WebUISection />
          <AuthenticationSection />
        </ContentArea>
      </MainContent>
    </Layout>
  )
}
