// Settings page client-side scripts
export const settingsScripts = `
  window.switchTab = function(tabId) {
    // Hide all sections
    var sections = document.querySelectorAll('.settings-section');
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.remove('active');
    }
    
    // Show target section
    var target = document.getElementById('section-' + tabId);
    if (target) target.classList.add('active');
    
    // Update nav items - remove active state from all
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
      navItems[i].classList.remove('active-nav', 'text-primary');
      navItems[i].classList.add('text-slate-600', 'dark:text-slate-300');
    }
    
    // Add active state to selected nav
    var activeNav = document.querySelector('[data-tab="' + tabId + '"]');
    if (activeNav) {
      activeNav.classList.add('active-nav', 'text-primary');
      activeNav.classList.remove('text-slate-600', 'dark:text-slate-300');
    }
    
    // Update header
    var titles = {
      connection: 'Connection',
      downloads: 'Downloads',
      bittorrent: 'BitTorrent',
      folders: 'Folders',
      webui: 'Web UI',
      authentication: 'Authentication'
    };
    var header = document.getElementById('header-title');
    if (header) header.textContent = titles[tabId] || 'Settings';
  }
`

// Settings page additional styles
export const settingsStyles = `
  .settings-section { display: none; }
  .settings-section.active { display: block !important; }
`
