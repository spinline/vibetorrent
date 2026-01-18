// Dashboard page client-side scripts
export const dashboardScripts = `
  // SSE connection for real-time updates
  let eventSource = null;
  
  function connectSSE() {
    if (eventSource) {
      eventSource.close();
    }
    
    eventSource = new EventSource('/api/events');
    
    eventSource.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);
        updateDashboard(data);
      } catch (e) {
        console.error('Error parsing SSE data:', e);
      }
    };
    
    eventSource.onerror = function() {
      console.log('SSE connection error, reconnecting...');
      setTimeout(connectSSE, 5000);
    };
  }
  
  function updateDashboard(data) {
    // Update stats
    if (data.systemInfo) {
      const dlSpeed = formatSpeed(data.systemInfo.downloadRate);
      const ulSpeed = formatSpeed(data.systemInfo.uploadRate);
      
      const dlEl = document.getElementById('dl-speed');
      const dlUnitEl = document.getElementById('dl-speed-unit');
      const ulEl = document.getElementById('ul-speed');
      const ulUnitEl = document.getElementById('ul-speed-unit');
      
      if (dlEl) dlEl.textContent = dlSpeed.value;
      if (dlUnitEl) dlUnitEl.textContent = dlSpeed.unit;
      if (ulEl) ulEl.textContent = ulSpeed.value;
      if (ulUnitEl) ulUnitEl.textContent = ulSpeed.unit;
    }
    
    // Update torrent table
    if (data.torrents) {
      updateTorrentTable(data.torrents);
    }
  }
  
  function formatSpeed(bytesPerSec) {
    if (bytesPerSec === 0) return { value: '0', unit: 'KB/s' };
    const k = 1024;
    if (bytesPerSec < k) return { value: bytesPerSec.toFixed(0), unit: 'B/s' };
    if (bytesPerSec < k * k) return { value: (bytesPerSec / k).toFixed(0), unit: 'KB/s' };
    return { value: (bytesPerSec / (k * k)).toFixed(1), unit: 'MB/s' };
  }
  
  function updateTorrentTable(torrents) {
    // Implementation for updating torrent rows
  }
  
  // Filter functionality
  document.querySelectorAll('.nav-filter').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      const filter = this.dataset.filter;
      filterTorrents(filter);
    });
  });
  
  function filterTorrents(filter) {
    // Implementation for filtering
  }
  
  // Search functionality
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      searchTorrents(query);
    });
  }
  
  function searchTorrents(query) {
    // Implementation for searching
  }
  
  // Initialize SSE on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectSSE);
  } else {
    connectSSE();
  }
`

// Dashboard additional styles  
export const dashboardStyles = `
  .neon-glow {
    box-shadow: 0 0 10px rgba(18, 161, 161, 0.3);
  }
  .drawer-shadow {
    box-shadow: -5px 0 25px rgba(0,0,0,0.5);
  }
  .tab-active {
    border-bottom: 2px solid #12a1a1;
    color: #12a1a1;
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  .speed-bar {
    animation: speed-bar-animate 2s ease-in-out infinite;
  }
`
