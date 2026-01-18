// Combine all scripts for Dashboard
import { getDashboardScripts } from './drawer'
import { getContextMenuScripts } from './contextMenu'
import { getAddModalScripts } from './addModal'

export const getAllDashboardScripts = (): string => {
  return `
  (function() {
    let initAttempts = 0;
    const MAX_ATTEMPTS = 10;
    
    // Load initial data from SSR immediately to prevent flash of loading/default values
    var initialData = null;
    try {
      var dataEl = document.getElementById('initial-data');
      if (dataEl) {
        initialData = JSON.parse(dataEl.textContent || '{}');
      }
    } catch (e) {
      console.warn('Failed to parse initial data:', e);
    }
    
    // Build torrents map from initial data
    var initialTorrents = {};
    if (initialData && initialData.torrents) {
      initialData.torrents.forEach(function(t) {
        initialTorrents[t.hash] = t;
      });
    }
    
    // Build initial systemInfo from initial data
    var initialSystemInfo = {
      downloadRate: initialData?.systemInfo?.downloadRate || 0,
      uploadRate: initialData?.systemInfo?.uploadRate || 0,
      diskSpace: initialData?.systemInfo?.diskSpace || { used: 0, total: 0 },
      activePeers: initialData?.systemInfo?.activePeers || 0,
      hostname: initialData?.systemInfo?.hostname || 'localhost',
      clientVersion: initialData?.systemInfo?.clientVersion || ''
    };
    
    // Shared state and functions across dashboard scripts
    window.gState = { 
      torrents: initialTorrents, 
      systemInfo: initialSystemInfo
    };
    var state = window.gState;
    
    var updateUI, fetchTorrents, openDrawer, closeDrawer, showToast;
    var currentFilter, searchQuery, sortColumn, sortDirection;
    var drawer, drawerBackdrop, torrentTableBody, ctxMenu;
    
    // Global Mobile Menu Toggle Logic (using event delegation for robustness)
    document.addEventListener('click', function(e) {
      const toggleBtn = e.target.closest('#mobile-menu-toggle');
      const sidebar = document.getElementById('dashboard-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      
      if (toggleBtn) {
        e.preventDefault();
        if (sidebar && backdrop) {
          const isClosed = sidebar.classList.contains('-translate-x-full');
          if (isClosed) {
            sidebar.classList.remove('-translate-x-full');
            backdrop.classList.remove('hidden');
            requestAnimationFrame(() => backdrop.classList.remove('opacity-0'));
          } else {
            sidebar.classList.add('-translate-x-full');
            backdrop.classList.add('opacity-0');
            setTimeout(() => backdrop.classList.add('hidden'), 300);
          }
        }
        return;
      }
      
      const isBackdrop = e.target.id === 'sidebar-backdrop';
      if (isBackdrop && sidebar) {
        sidebar.classList.add('-translate-x-full');
        e.target.classList.add('opacity-0');
        setTimeout(() => e.target.classList.add('hidden'), 300);
      }
    });

    function initDashboard() {
      // Check if critical elements exist
      const criticalElements = [
        'torrent-table-body',
        'nav-all', 
        'dl-speed',
        'context-menu'
      ];
      
      const allExist = criticalElements.every(id => document.getElementById(id));
      
      if (!allExist && initAttempts < MAX_ATTEMPTS) {
        initAttempts++;
        setTimeout(initDashboard, 50);
        return;
      }
      
      try {
        // Dashboard, Context Menu, and Add Modal scripts
        ${getDashboardScripts()}
        ${getContextMenuScripts()}
        ${getAddModalScripts()}
        console.log('Dashboard initialized successfully');
      } catch (e) {
        console.error('Dashboard initialization error:', e.message, e.stack);
      }
    }
    
    // Start initialization
    if (document.readyState === 'complete') {
      setTimeout(initDashboard, 0);
    } else {
      window.addEventListener('load', function() {
        setTimeout(initDashboard, 0);
      });
    }
  })();
  `;
}

// Re-export individual scripts
export { getDashboardScripts } from './drawer'
export { getContextMenuScripts } from './contextMenu'
export { getAddModalScripts } from './addModal'
