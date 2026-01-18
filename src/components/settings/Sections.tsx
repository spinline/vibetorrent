import { Card, SectionHeader, Input, Toggle, Slider, Select, FormField, Divider } from '../ui'

interface SectionProps {
  active?: boolean
}

// Connection Section
export const ConnectionSection = ({ active = false }: SectionProps) => (
  <div id="section-connection" class={`settings-section space-y-8 ${active ? 'active' : ''}`}>
    <div>
      <h3 class="text-2xl font-bold mb-2">Network Connection</h3>
      <p class="text-slate-500 dark:text-slate-400">Configure your listening ports and encryption requirements.</p>
    </div>
    
    {/* Port Settings */}
    <Card>
      <SectionHeader icon="tune" title="Port Settings" />
      
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Listening Port Range</label>
          <div class="flex gap-2 items-center">
            <Input type="text" value="49160" placeholder="Min" />
            <span class="text-slate-500">-</span>
            <Input type="text" value="49300" placeholder="Max" />
          </div>
          <p class="mt-2 text-xs text-slate-500">Default recommended range: 49152-65535</p>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Randomize Port</label>
          <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg">
            <span class="text-sm">Randomize port each time rTorrent starts</span>
            <Toggle checked={false} />
          </div>
        </div>
      </div>
    </Card>

    {/* Bandwidth Limits */}
    <Card>
      <SectionHeader icon="speed" title="Global Bandwidth Limits" />
      
      <div class="space-y-8">
        <Slider 
          value={2500} 
          max={10000} 
          color="primary"
          label="Global Download Rate"
          displayValue="2,500"
          unit="KB/s"
          minLabel="Unlimited"
          maxLabel="10 MB/s"
        />
        
        <Slider 
          value={500} 
          max={5000} 
          color="purple"
          label="Global Upload Rate"
          displayValue="500"
          unit="KB/s"
          minLabel="Unlimited"
          maxLabel="5 MB/s"
        />
      </div>
    </Card>

    {/* Security & Privacy */}
    <Card>
      <SectionHeader icon="verified_user" title="Security & Privacy" />
      
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        <div class="flex items-center justify-between py-4">
          <FormField 
            label="Encryption Mode" 
            description="Define how rTorrent handles encrypted connections."
            horizontal
          >
            <Select 
              options={[
                { value: 'allow', label: 'Allow Encryption' },
                { value: 'prefer', label: 'Prefer Encryption' },
                { value: 'require', label: 'Require Encryption' },
              ]}
              value="require"
            />
          </FormField>
        </div>

        <div class="flex items-center justify-between py-4">
          <div>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">Allow Peer Exchange (PEX)</h4>
            <p class="text-xs text-slate-500 mt-0.5">Help find more peers by communicating with established peers.</p>
          </div>
          <Toggle checked={true} />
        </div>
      </div>
    </Card>
  </div>
)

// Downloads Section
export const DownloadsSection = () => (
  <div id="section-downloads" class="settings-section space-y-8">
    <div>
      <h3 class="text-2xl font-bold mb-2">Downloads</h3>
      <p class="text-slate-500 dark:text-slate-400">Manage file locations and download behaviors.</p>
    </div>
    
    <Card>
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Default Download Directory</label>
          <div class="flex gap-2">
            <Input type="text" value="/downloads/complete" class="flex-1" />
            <button class="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-600">Browse</button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Session Directory</label>
          <Input type="text" value="/downloads/.session" />
          <p class="mt-2 text-xs text-slate-500">Directory where rTorrent saves session data.</p>
        </div>

        <Divider class="my-4" />

        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">Start Downloads Automatically</h4>
            <p class="text-xs text-slate-500 mt-0.5">If disabled, new tasks will be added in "Stopped" state.</p>
          </div>
          <Toggle checked={true} />
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">Check Hash After Download</h4>
            <p class="text-xs text-slate-500 mt-0.5">Verify file integrity upon completion.</p>
          </div>
          <Toggle checked={true} />
        </div>
      </div>
    </Card>
  </div>
)

// BitTorrent Section
export const BitTorrentSection = () => (
  <div id="section-bittorrent" class="settings-section space-y-8">
    <div>
      <h3 class="text-2xl font-bold mb-2">BitTorrent</h3>
      <p class="text-slate-500 dark:text-slate-400">Advanced protocol settings.</p>
    </div>
    
    <Card>
      <div class="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Max Peers (Global)</label>
          <Input type="number" value="200" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Max Upload Slots (Global)</label>
          <Input type="number" value="30" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Max Peers per Torrent</label>
          <Input type="number" value="50" />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Min Peers per Torrent</label>
          <Input type="number" value="10" />
        </div>
      </div>

      <Divider class="my-4" />

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">Enable DHT Network</h4>
            <p class="text-xs text-slate-500 mt-0.5">Distributed Hash Table allows finding peers without a tracker.</p>
          </div>
          <Toggle checked={true} />
        </div>
        
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">Enable UDP Trackers</h4>
            <p class="text-xs text-slate-500 mt-0.5">Support for UDP tracker protocol.</p>
          </div>
          <Toggle checked={true} />
        </div>
      </div>
    </Card>
  </div>
)

// Folders Section
export const FoldersSection = () => (
  <div id="section-folders" class="settings-section space-y-8">
    <div>
      <h3 class="text-2xl font-bold mb-2">Folders & Auto-Watch</h3>
      <p class="text-slate-500 dark:text-slate-400">Configure watch directories for auto-loading torrents.</p>
    </div>
    
    <Card>
      <div class="flex items-center justify-between mb-4">
        <h4 class="font-bold text-lg">Watch Directories</h4>
        <button class="text-primary text-sm font-bold hover:underline flex items-center gap-1">
          <span class="material-symbols-outlined text-base">add</span> Add New
        </button>
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-background-dark rounded-lg border border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-slate-400">folder_open</span>
          <div class="flex-1">
            <p class="font-mono text-sm">/downloads/watch</p>
            <p class="text-xs text-slate-500">Action: Download to default directory</p>
          </div>
          <span class="material-symbols-outlined text-slate-400 cursor-pointer hover:text-red-500">delete</span>
        </div>
      </div>
    </Card>
  </div>
)

// Web UI Section
export const WebUISection = () => (
  <div id="section-webui" class="settings-section space-y-8">
    <div>
      <h3 class="text-2xl font-bold mb-2">Web Interface</h3>
      <p class="text-slate-500 dark:text-slate-400">Customize the look and feel of the dashboard.</p>
    </div>

    <Card>
      <div class="space-y-4">
        <div class="flex items-center justify-between py-2">
          <div>
            <p class="font-medium text-sm">Refresh Interval</p>
            <p class="text-xs text-slate-500">How often to fetch new data</p>
          </div>
          <Select 
            options={[
              { value: '1', label: '1 second' },
              { value: '2', label: '2 seconds' },
              { value: '5', label: '5 seconds' },
              { value: '10', label: '10 seconds' },
            ]}
            value="2"
          />
        </div>
        
        <Divider />
        
        <div class="flex items-center justify-between py-2">
          <div>
            <p class="font-medium text-sm">Theme</p>
            <p class="text-xs text-slate-500">Toggle dark/light mode</p>
          </div>
          <Select 
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            value="dark"
          />
        </div>

        <Divider />

        <div class="flex items-center justify-between py-2">
          <div>
            <p class="font-medium text-sm">Date Format</p>
            <p class="text-xs text-slate-500">How dates are displayed</p>
          </div>
          <Select 
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
            value="DD/MM/YYYY"
          />
        </div>
      </div>
    </Card>
  </div>
)

// Authentication Section
export const AuthenticationSection = () => (
  <div id="section-authentication" class="settings-section space-y-8">
    <div>
      <h3 class="text-2xl font-bold mb-2">Authentication</h3>
      <p class="text-slate-500 dark:text-slate-400">Manage user access and credentials.</p>
    </div>

    <Card>
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Username</label>
          <Input type="text" value="admin" disabled />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Change Password</label>
          <Input type="password" placeholder="Current Password" class="mb-2" />
          <Input type="password" placeholder="New Password" class="mb-2" />
          <Input type="password" placeholder="Confirm New Password" />
        </div>
        <div class="pt-2">
          <button class="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg text-sm shadow-lg shadow-primary/20 transition-all">
            Update Password
          </button>
        </div>
      </div>
    </Card>
  </div>
)
