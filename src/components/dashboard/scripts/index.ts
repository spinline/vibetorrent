// Combine all scripts for Dashboard
import { getDashboardScripts } from './drawer'
import { getContextMenuScripts } from './contextMenu'
import { getAddModalScripts } from './addModal'

export const getAllDashboardScripts = (): string => {
  return `
  (function() {
    let initAttempts = 0;
    const MAX_ATTEMPTS = 10;
    
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
        // Dashboard scripts
        ${getDashboardScripts()}
      } catch (e) {
        console.error('Dashboard scripts error:', e.message, e.stack);
        return;
      }
      
      try {
        // Context menu scripts
        ${getContextMenuScripts()}
      } catch (e) {
        console.error('Context menu scripts error:', e.message, e.stack);
        return;
      }
      
      try {
        // Add modal scripts
        ${getAddModalScripts()}
      } catch (e) {
        console.error('Add modal scripts error:', e.message, e.stack);
        return;
      }
      
      console.log('Dashboard initialized successfully');
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
