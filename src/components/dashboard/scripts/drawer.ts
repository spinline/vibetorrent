// Generate the dashboard client-side script
export const getDashboardScripts = (): string => {
  return `
    // State will be populated via SSE/API
    let state = {
      torrents: {},
      systemInfo: {
        downloadRate: 0,
        uploadRate: 0,
        diskSpace: { used: 0, total: 0 },
        activePeers: 0,
        hostname: 'localhost',
        clientVersion: 'N/A',
        libraryVersion: 'N/A'
      }
    };
    
    const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    };
    
    const formatBytesShort = (bytes) => {
      if (bytes === 0) return { value: '0', unit: 'B' };
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return { value: (bytes / Math.pow(k, i)).toFixed(1), unit: sizes[i] };
    };
    
    const formatSpeed = (bytesPerSec) => {
      if (bytesPerSec === 0) return { value: '0', unit: 'KB/s' };
      const k = 1024;
      if (bytesPerSec < k) return { value: bytesPerSec.toFixed(0), unit: 'B/s' };
      if (bytesPerSec < k * k) return { value: (bytesPerSec / k).toFixed(0), unit: 'KB/s' };
      return { value: (bytesPerSec / (k * k)).toFixed(1), unit: 'MB/s' };
    };
    
    const formatETA = (seconds) => {
      if (seconds <= 0 || !isFinite(seconds)) return '--';
      if (seconds < 60) return Math.round(seconds) + 's';
      if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + Math.round(seconds % 60) + 's';
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return hours + 'h ' + mins + 'm';
    };
    
    const getStatusBadge = (status) => {
      if (status === 'seeding') return '<span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase">Seeding</span>';
      if (status === 'downloading') return '<span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Downloading</span>';
      if (status === 'paused') return '<span class="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded uppercase">Paused</span>';
      if (status === 'stopped') return '<span class="px-2 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-bold rounded uppercase">Stopped</span>';
      return '<span class="px-2 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-bold rounded uppercase">' + status + '</span>';
    };
    
    const getFileIcon = (name) => {
      const lower = name.toLowerCase();
      if (lower.includes('.iso')) return 'description';
      if (lower.includes('.mkv') || lower.includes('.mp4') || lower.includes('.avi')) return 'video_library';
      if (lower.includes('.zip') || lower.includes('.rar') || lower.includes('.7z')) return 'folder_zip';
      return 'library_music';
    };
    
    const getFileIconColor = (name) => {
      const lower = name.toLowerCase();
      if (lower.includes('.iso')) return 'text-primary';
      if (lower.includes('.mkv') || lower.includes('.mp4') || lower.includes('.avi')) return 'text-emerald-500';
      if (lower.includes('.zip') || lower.includes('.rar') || lower.includes('.7z')) return 'text-orange-500';
      return 'text-purple-500';
    };
    
    // Toast notification system
    function showToast(message, type = 'info') {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 flex flex-col gap-2 z-[100]';
        document.body.appendChild(container);
      }
      
      const toast = document.createElement('div');
      const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-[#12a1a1]',
        warning: 'bg-yellow-500'
      };
      toast.className = 'px-4 py-2 rounded-lg text-white text-sm shadow-lg transform transition-all duration-300 translate-x-0 opacity-100 ' + (colors[type] || colors.info);
      toast.textContent = message;
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }
    
    // ========== DRAWER FUNCTIONALITY ==========
    const drawer = document.getElementById('detail-drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const fabContainer = document.getElementById('fab-container');
    let currentDrawerHash = null;
    let drawerData = null;
    let speedHistory = [];
    const MAX_SPEED_HISTORY = 20;
    let filesCurrentPage = 1;
    const FILES_PER_PAGE = 50;
    let filesFilterQuery = '';
    let filesSortKey = 'name';
    let filesSortDesc = false;
    
    function openDrawer(hash) {
      currentDrawerHash = hash;
      filesCurrentPage = 1;
      filesFilterQuery = '';
      filesSortKey = 'name';
      filesSortDesc = false;
      
      const filterInput = document.getElementById('files-filter-input');
      if (filterInput) filterInput.value = '';

      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
      drawerBackdrop.classList.remove('hidden');
      if (fabContainer) fabContainer.style.right = '620px';
      document.getElementById('drawer-loading').classList.remove('hidden');
      document.getElementById('drawer-loaded').classList.add('hidden');
      speedHistory = [];
      loadDrawerData(hash);
    }
    
    function closeDrawer() {
      currentDrawerHash = null;
      drawerData = null;
      drawer.classList.add('translate-x-full');
      drawer.classList.remove('translate-x-0');
      drawerBackdrop.classList.add('hidden');
      if (fabContainer) fabContainer.style.right = '32px';
    }
    
    async function loadDrawerData(hash) {
      try {
        const response = await fetch('/api/torrents/' + hash);
        if (!response.ok) throw new Error('Failed to load');
        drawerData = await response.json();
        renderDrawer();
      } catch (err) {
        console.error('Failed to load torrent details:', err);
        showToast('Failed to load details', 'error');
        closeDrawer();
      }
    }
    
    function renderDrawer() {
      if (!drawerData) return;
      
      document.getElementById('drawer-loading').classList.add('hidden');
      document.getElementById('drawer-loaded').classList.remove('hidden');
      
      const t = drawerData;
      const progress = t.size > 0 ? Math.min(100, (t.completed / t.size) * 100) : 0;
      
      document.getElementById('drawer-progress-ring').setAttribute('stroke-dasharray', progress + ', 100');
      document.getElementById('drawer-progress-text').innerHTML = progress.toFixed(1) + '<span class="text-lg text-primary">%</span>';
      
      const ring = document.getElementById('drawer-progress-ring');
      ring.classList.remove('text-primary', 'text-emerald-500', 'text-orange-500');
      if (t.state === 'seeding') ring.classList.add('text-emerald-500');
      else if (t.state === 'paused' || t.state === 'stopped') ring.classList.add('text-orange-500');
      else ring.classList.add('text-primary');
      
      const stateBadge = document.getElementById('drawer-state-badge');
      stateBadge.textContent = t.state.charAt(0).toUpperCase() + t.state.slice(1);
      stateBadge.className = 'text-[9px] font-bold uppercase tracking-widest mt-1 px-2 py-0.5 rounded ';
      if (t.state === 'seeding') stateBadge.className += 'text-emerald-500 bg-emerald-500/10';
      else if (t.state === 'paused' || t.state === 'stopped') stateBadge.className += 'text-orange-500 bg-orange-500/10';
      else stateBadge.className += 'text-primary bg-primary/10';
      
      document.getElementById('drawer-torrent-name').textContent = t.name;
      document.getElementById('drawer-hash').textContent = 'HASH: ' + t.hash.substring(0, 8) + '...' + t.hash.substring(t.hash.length - 4);
      
      const pauseBtn = document.getElementById('drawer-btn-pause');
      const startBtn = document.getElementById('drawer-btn-start');
      if (t.state === 'paused' || t.state === 'stopped') {
        pauseBtn.classList.add('hidden');
        startBtn.classList.remove('hidden');
      } else {
        pauseBtn.classList.remove('hidden');
        startBtn.classList.add('hidden');
      }
      
      document.getElementById('drawer-size').textContent = formatBytes(t.size);
      document.getElementById('drawer-downloaded').textContent = formatBytes(t.completed);
      document.getElementById('drawer-ratio').textContent = t.ratio.toFixed(2);
      document.getElementById('drawer-eta').textContent = progress >= 100 ? 'Complete' : formatETA(t.eta);
      document.getElementById('drawer-peers').textContent = t.peers + ' connected';
      document.getElementById('drawer-label').textContent = t.label || '(none)';
      document.getElementById('drawer-path').textContent = t.savePath || '--';
      
      const dlSpd = formatSpeed(t.downloadRate || 0);
      const ulSpd = formatSpeed(t.uploadRate || 0);
      document.getElementById('drawer-dl-speed').textContent = dlSpd.value + ' ' + dlSpd.unit;
      document.getElementById('drawer-ul-speed').textContent = ulSpd.value + ' ' + ulSpd.unit;
      
      speedHistory.push(t.downloadRate || 0);
      if (speedHistory.length > MAX_SPEED_HISTORY) speedHistory.shift();
      renderSpeedGraph();
      
      document.getElementById('drawer-files-count').textContent = drawerData.filesList ? drawerData.filesList.length : 0;
      document.getElementById('drawer-peers-count').textContent = drawerData.peersList ? drawerData.peersList.length : 0;
      
      renderFilesPreview();
      renderFilesList();
      renderPeersList();
      renderTrackersList();
    }
    
    function renderSpeedGraph() {
      const container = document.getElementById('speed-graph');
      const maxSpeed = Math.max(...speedHistory, 1);
      
      container.innerHTML = speedHistory.map((speed, i) => {
        const height = Math.max(5, (speed / maxSpeed) * 100);
        const opacity = 0.2 + (i / speedHistory.length) * 0.8;
        return '<div class="flex-1 bg-primary rounded-t-sm transition-all" style="height: ' + height + '%; opacity: ' + opacity + '"></div>';
      }).join('');
      
      for (let i = speedHistory.length; i < MAX_SPEED_HISTORY; i++) {
        container.innerHTML += '<div class="flex-1 bg-slate-800 rounded-t-sm" style="height: 5%"></div>';
      }
    }
    
    function renderFilesPreview() {
      const container = document.getElementById('drawer-files-preview');
      if (!drawerData.filesList || drawerData.filesList.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-500">No files</p>';
        return;
      }
      
      const files = drawerData.filesList.slice(0, 3);
      container.innerHTML = files.map(f => {
        const progress = f.size > 0 ? Math.min(100, (f.completed / f.size) * 100) : 0;
        const fileName = f.path.split('/').pop();
        return '<div class="flex items-center gap-3 p-3 rounded-lg bg-background-dark border border-slate-800">' +
          '<span class="material-symbols-outlined ' + getFileIconColor(fileName) + ' text-lg">' + getFileIcon(fileName) + '</span>' +
          '<div class="flex-1 min-w-0">' +
            '<p class="text-xs font-medium text-slate-200 truncate">' + fileName + '</p>' +
            '<div class="flex items-center gap-2 mt-1">' +
              '<div class="w-16 bg-slate-700 rounded-full h-1"><div class="bg-primary h-full rounded-full" style="width: ' + progress + '%"></div></div>' +
              '<span class="text-[10px] text-slate-500">' + progress.toFixed(0) + '%</span>' +
            '</div>' +
          '</div>' +
          '<span class="text-[10px] text-slate-400 font-mono">' + formatBytes(f.size) + '</span>' +
        '</div>';
      }).join('');
    }
    
    function renderFilesList() {
      const container = document.getElementById('drawer-files-list');
      const paginationFooter = document.getElementById('files-pagination');
      if (!drawerData.filesList || drawerData.filesList.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="text-sm text-slate-500 text-center py-8">No files</td></tr>';
        if(paginationFooter) paginationFooter.classList.add('hidden');
        return;
      }
      
      let filteredFiles = [...drawerData.filesList];
      if (filesFilterQuery) {
        const q = filesFilterQuery.toLowerCase();
        filteredFiles = filteredFiles.filter(f => f.path.toLowerCase().includes(q));
      }

      if (filteredFiles.length === 0) {
         container.innerHTML = '<tr><td colspan="5" class="text-sm text-slate-500 text-center py-8">No matching files</td></tr>';
         if(paginationFooter) paginationFooter.classList.add('hidden');
         return;
      }
      
      filteredFiles.sort((a, b) => {
        let valA, valB;
        
        switch(filesSortKey) {
            case 'size':
                valA = a.size; 
                valB = b.size;
                break;
            case 'progress':
                valA = a.size > 0 ? (a.completed / a.size) : 0;
                valB = b.size > 0 ? (b.completed / b.size) : 0;
                break;
            case 'priority':
                valA = a.priority;
                valB = b.priority;
                break;
            case 'name':
            default:
                valA = a.path.split('/').pop().toLowerCase();
                valB = b.path.split('/').pop().toLowerCase();
                break;
        }
        
        if (valA < valB) return filesSortDesc ? 1 : -1;
        if (valA > valB) return filesSortDesc ? -1 : 1;
        return 0;
      });

      document.querySelectorAll('thead th[data-key]').forEach(th => {
         const key = th.getAttribute('data-key');
         const icon = th.querySelector('.sort-icon');
         
         th.classList.remove('text-primary');
         th.classList.add('text-slate-500');
         
         if (key === filesSortKey) {
            th.classList.remove('text-slate-500');
            th.classList.add('text-primary');
            icon.style.opacity = '1';
            icon.textContent = filesSortDesc ? 'arrow_downward' : 'arrow_upward';
         } else {
            icon.style.opacity = '';
            icon.textContent = 'unfold_more';
         }
      });

      const totalItems = filteredFiles.length;
      const totalPages = Math.ceil(totalItems / FILES_PER_PAGE);
      
      if (filesCurrentPage > totalPages) filesCurrentPage = totalPages;
      if (filesCurrentPage < 1) filesCurrentPage = 1;

      const startIndex = (filesCurrentPage - 1) * FILES_PER_PAGE;
      const endIndex = Math.min(startIndex + FILES_PER_PAGE, totalItems);
      const pagedFiles = filteredFiles.slice(startIndex, endIndex);
      
      container.innerHTML = pagedFiles.map((f, i) => {
        const progress = f.size > 0 ? Math.min(100, (f.completed / f.size) * 100) : 0;
        const fileName = f.path.split('/').pop();
        const fileIndex = f.index !== undefined ? f.index : (drawerData.filesList.indexOf(f));
        
        let pBadgeClass = '';
        let pText = '';
        
        if (f.priority === 0) {
           pBadgeClass = 'bg-slate-900 text-slate-600 border border-slate-800'; 
           pText = 'Off';
        } else if (f.priority === 2) {
           pBadgeClass = 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(18,161,161,0.2)]';
           pText = 'High';
        } else {
           pBadgeClass = 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'; 
           pText = 'Normal';
        }

        return '<tr class="hover:bg-slate-800/30 transition-colors group">' +
          '<td class="px-6 py-3">' +
            '<div class="flex items-center gap-3">' +
              '<span class="material-symbols-outlined ' + getFileIconColor(fileName) + ' text-lg">' + getFileIcon(fileName) + '</span>' +
              '<span class="text-slate-200 font-medium truncate max-w-[200px]" title="' + f.path + '">' + fileName + '</span>' +
            '</div>' +
          '</td>' +
          '<td class="px-6 py-3 text-right text-slate-400 font-mono text-xs whitespace-nowrap">' + formatBytes(f.size) + '</td>' +
          '<td class="px-6 py-3">' +
            '<div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">' +
              '<div class="bg-primary h-full rounded-full" style="width: ' + progress + '%"></div>' +
            '</div>' +
            '<div class="flex justify-between mt-1">' +
              '<span class="text-[10px] text-primary font-bold">' + progress.toFixed(0) + '%</span>' +
              '<span class="text-[10px] text-slate-500">' + (progress >= 100 ? 'Done' : '') + '</span>' +
            '</div>' +
          '</td>' +
          '<td class="px-6 py-3 text-center">' +
            '<button class="file-priority-btn px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer hover:scale-105 transition-transform w-[60px] text-center ' + pBadgeClass + '" data-index="' + fileIndex + '" data-priority="' + f.priority + '">' +
              pText +
            '</button>' +
          '</td>' +
        '</tr>';
      }).join('');
      
      if (paginationFooter) {
        if (totalPages > 1) {
            paginationFooter.classList.remove('hidden');
            document.getElementById('files-pagination-info').textContent = 'Showing ' + (startIndex + 1) + '-' + endIndex + ' of ' + totalItems;
            
            const prevBtn = document.getElementById('files-prev-page');
            const nextBtn = document.getElementById('files-next-page');
            
            if(prevBtn) {
                prevBtn.disabled = filesCurrentPage === 1;
                prevBtn.onclick = function() { 
                    if(filesCurrentPage > 1) { filesCurrentPage--; renderFilesList(); } 
                };
            }
            if(nextBtn) {
                nextBtn.disabled = filesCurrentPage === totalPages;
                nextBtn.onclick = function() { 
                   if(filesCurrentPage < totalPages) { filesCurrentPage++; renderFilesList(); } 
                };
            }
        } else {
            paginationFooter.classList.add('hidden');
        }
      }
    }
    
    function renderPeersList() {
      const container = document.getElementById('drawer-peers-list');
      if (!drawerData.peersList || drawerData.peersList.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-500 text-center py-8">No peers connected</p>';
        return;
      }
      
      container.innerHTML = drawerData.peersList.map(p => {
        const dlSpd = formatSpeed(p.downloadRate || 0);
        const ulSpd = formatSpeed(p.uploadRate || 0);
        return '<div class="flex items-center gap-3 p-3 rounded-lg bg-background-dark border border-slate-800">' +
          '<div class="size-8 rounded-full bg-slate-800 flex items-center justify-center">' +
            '<span class="material-symbols-outlined text-slate-400 text-sm">' + (p.isIncoming ? 'arrow_downward' : 'arrow_upward') + '</span>' +
          '</div>' +
          '<div class="flex-1 min-w-0">' +
            '<p class="text-xs font-medium text-slate-200 font-mono">' + p.address + '</p>' +
            '<p class="text-[10px] text-slate-500 truncate">' + (p.clientVersion || 'Unknown client') + '</p>' +
          '</div>' +
          '<div class="text-right">' +
            '<p class="text-[10px] text-primary font-mono">↓ ' + dlSpd.value + ' ' + dlSpd.unit + '</p>' +
            '<p class="text-[10px] text-emerald-500 font-mono">↑ ' + ulSpd.value + ' ' + ulSpd.unit + '</p>' +
          '</div>' +
          '<div class="w-12 text-right">' +
            '<span class="text-[10px] text-slate-400">' + (p.progress || 0).toFixed(0) + '%</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }
    
    function renderTrackersList() {
      const container = document.getElementById('drawer-trackers-list');
      if (!drawerData.trackersList || drawerData.trackersList.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-500 text-center py-8">No trackers</p>';
        return;
      }
      
      container.innerHTML = drawerData.trackersList.map(t => {
        const hostname = t.url.replace(/^https?:\\/\\//, '').split('/')[0];
        return '<div class="flex items-center gap-3 p-3 rounded-lg bg-background-dark border border-slate-800">' +
          '<div class="size-8 rounded-full ' + (t.enabled ? 'bg-emerald-500/10' : 'bg-slate-800') + ' flex items-center justify-center">' +
            '<span class="material-symbols-outlined ' + (t.enabled ? 'text-emerald-500' : 'text-slate-500') + ' text-sm">dns</span>' +
          '</div>' +
          '<div class="flex-1 min-w-0">' +
            '<p class="text-xs font-medium text-slate-200 truncate">' + hostname + '</p>' +
            '<p class="text-[10px] text-slate-500">Seeds: ' + (t.seeders || 0) + ' | Leechers: ' + (t.leechers || 0) + '</p>' +
          '</div>' +
          '<span class="text-[10px] px-2 py-0.5 rounded ' + (t.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500') + '">' + 
            (t.enabled ? 'Active' : 'Disabled') + 
          '</span>' +
        '</div>';
      }).join('');
    }
    
    // Event listeners
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);
    
    // File Priority
    document.getElementById('drawer-files-list').addEventListener('click', async function(e) {
      const btn = e.target.closest('.file-priority-btn');
      if (!btn) return;
      if (!currentDrawerHash) return;
      
      e.stopPropagation();
      
      const index = parseInt(btn.dataset.index);
      const currentPriority = parseInt(btn.dataset.priority);
      
      let newPriority = 1;
      if (currentPriority === 1) newPriority = 2;
      else if (currentPriority === 2) newPriority = 0;
      else if (currentPriority === 0) newPriority = 1;

      const priorityNames = { 0: 'Off', 1: 'Normal', 2: 'High' };
      
      const file = drawerData.filesList.find((f, i) => (f.index !== undefined ? f.index === index : i === index));
      if (file) {
        file.priority = newPriority;
        renderFilesList();
      }
      
      try {
        const res = await fetch('/api/torrents/' + currentDrawerHash + '/files/' + index + '/priority', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priority: newPriority })
        });
        const result = await res.json();
        
        if (result.success) {
          showToast('File priority set to ' + priorityNames[newPriority], 'success');
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error('Failed to set file priority:', err);
        showToast('Error setting priority', 'error');
        if (file) {
          file.priority = currentPriority;
          renderFilesList();
        }
      }
    });
    
    // Tab switching
    document.querySelectorAll('.drawer-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        
        document.querySelectorAll('.drawer-tab').forEach(t => {
          t.classList.remove('text-primary', 'border-primary', 'font-bold');
          t.classList.add('text-slate-400', 'border-transparent', 'font-medium');
        });
        this.classList.remove('text-slate-400', 'border-transparent', 'font-medium');
        this.classList.add('text-primary', 'border-primary', 'font-bold');
        
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById('tab-' + tabName).classList.remove('hidden');
      });
    });
    
    document.getElementById('view-all-files').addEventListener('click', function() {
      document.querySelector('.drawer-tab[data-tab="files"]').click();
    });
    
    // Drawer action buttons
    document.getElementById('drawer-btn-pause').addEventListener('click', async function() {
      if (!currentDrawerHash) return;
      try {
        await fetch('/api/torrents/' + currentDrawerHash + '/pause', { method: 'POST' });
        showToast('Torrent paused', 'success');
        loadDrawerData(currentDrawerHash);
      } catch (err) {
        showToast('Failed to pause', 'error');
      }
    });
    
    document.getElementById('drawer-btn-start').addEventListener('click', async function() {
      if (!currentDrawerHash) return;
      try {
        await fetch('/api/torrents/' + currentDrawerHash + '/start', { method: 'POST' });
        showToast('Torrent started', 'success');
        loadDrawerData(currentDrawerHash);
      } catch (err) {
        showToast('Failed to start', 'error');
      }
    });
    
    document.getElementById('drawer-btn-delete').addEventListener('click', function() {
      if (!currentDrawerHash || !drawerData) return;
      hashToDelete = currentDrawerHash;
      document.getElementById('delete-msg').textContent = 'Are you sure you want to remove "' + drawerData.name.substring(0, 40) + (drawerData.name.length > 40 ? '...' : '') + '"?';
      document.getElementById('delete-warn').classList.add('hidden');
      document.getElementById('delete-modal').classList.remove('hidden');
      document.getElementById('delete-modal').classList.add('flex');
      closeDrawer();
    });
    
    document.getElementById('drawer-btn-recheck').addEventListener('click', async function() {
      if (!currentDrawerHash) return;
      try {
        await fetch('/api/torrents/' + currentDrawerHash + '/recheck', { method: 'POST' });
        showToast('Recheck started', 'success');
      } catch (err) {
        showToast('Failed to recheck', 'error');
      }
    });
    
    document.getElementById('drawer-btn-label').addEventListener('click', function() {
      if (!currentDrawerHash || !drawerData) return;
      hashToLabel = currentDrawerHash;
      document.getElementById('label-input').value = drawerData.label || '';
      document.getElementById('label-modal').classList.remove('hidden');
      document.getElementById('label-modal').classList.add('flex');
      document.getElementById('label-input').focus();
    });
    
    function updateDrawerIfOpen() {
      if (currentDrawerHash && state.torrents[currentDrawerHash]) {
        const t = state.torrents[currentDrawerHash];
        const progress = t.size > 0 ? Math.min(100, (t.completed / t.size) * 100) : 0;
        document.getElementById('drawer-progress-ring').setAttribute('stroke-dasharray', progress + ', 100');
        document.getElementById('drawer-progress-text').innerHTML = progress.toFixed(1) + '<span class="text-lg text-primary">%</span>';
        
        const dlSpd = formatSpeed(t.downloadRate || 0);
        const ulSpd = formatSpeed(t.uploadRate || 0);
        document.getElementById('drawer-dl-speed').textContent = dlSpd.value + ' ' + dlSpd.unit;
        document.getElementById('drawer-ul-speed').textContent = ulSpd.value + ' ' + ulSpd.unit;
        
        speedHistory.push(t.downloadRate || 0);
        if (speedHistory.length > MAX_SPEED_HISTORY) speedHistory.shift();
        renderSpeedGraph();
      }
    }
    // ========== END DRAWER FUNCTIONALITY ==========
    
    let currentFilter = 'all';
    let searchQuery = '';
    let sortColumn = 'name';
    let sortDirection = 'asc';
    
    function getFilteredTorrents() {
      let torrents = Object.values(state.torrents);
      
      if (currentFilter === 'downloading') {
        torrents = torrents.filter(t => t.state === 'downloading');
      } else if (currentFilter === 'seeding') {
        torrents = torrents.filter(t => t.state === 'seeding');
      } else if (currentFilter === 'paused') {
        torrents = torrents.filter(t => t.state === 'paused' || t.state === 'stopped');
      } else if (currentFilter === 'completed') {
        torrents = torrents.filter(t => t.completed === t.size);
      } else if (currentFilter.startsWith('label:')) {
        const label = currentFilter.substring(6);
        torrents = torrents.filter(t => t.label === label);
      }
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        torrents = torrents.filter(t => t.name.toLowerCase().includes(q) || t.hash.toLowerCase().includes(q));
      }
      
      torrents.sort((a, b) => {
        let valA, valB;
        
        switch (sortColumn) {
          case 'name':
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
            break;
          case 'size':
            valA = a.size;
            valB = b.size;
            break;
          case 'progress':
            valA = a.size > 0 ? a.completed / a.size : 0;
            valB = b.size > 0 ? b.completed / b.size : 0;
            break;
          case 'state':
            const stateOrder = { downloading: 0, seeding: 1, paused: 2, stopped: 3 };
            valA = stateOrder[a.state] ?? 4;
            valB = stateOrder[b.state] ?? 4;
            break;
          case 'downloadRate':
            valA = a.downloadRate || 0;
            valB = b.downloadRate || 0;
            break;
          case 'uploadRate':
            valA = a.uploadRate || 0;
            valB = b.uploadRate || 0;
            break;
          case 'eta':
            valA = a.eta || Infinity;
            valB = b.eta || Infinity;
            break;
          default:
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        }
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      return torrents;
    }
    
    function updateSortIcons() {
      document.querySelectorAll('.sort-icon').forEach(icon => {
        const col = icon.dataset.col;
        if (col === sortColumn) {
          icon.textContent = sortDirection === 'asc' ? 'expand_less' : 'expand_more';
          icon.classList.add('text-primary');
        } else {
          icon.textContent = 'unfold_more';
          icon.classList.remove('text-primary');
        }
      });
    }
    
    function updateUI() {
      const allTorrents = Object.values(state.torrents);
      const torrents = getFilteredTorrents();
      const systemInfo = state.systemInfo;
      
      const dlSpeed = formatSpeed(systemInfo.downloadRate || 0);
      const ulSpeed = formatSpeed(systemInfo.uploadRate || 0);
      const diskTotal = systemInfo.diskSpace?.total || 0;
      const diskUsed = systemInfo.diskSpace?.used || 0;
      const diskFree = diskTotal - diskUsed;
      const diskFreeFormatted = formatBytesShort(diskFree);
      const diskPercent = diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 100) : 0;
      
      // Safely update elements with null checks
      const setTextContent = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      };
      const setStyle = (id, prop, value) => {
        const el = document.getElementById(id);
        if (el) el.style[prop] = value;
      };
      
      setTextContent('dl-speed', dlSpeed.value);
      setTextContent('dl-speed-unit', dlSpeed.unit);
      setTextContent('ul-speed', ulSpeed.value);
      setTextContent('ul-speed-unit', ulSpeed.unit);
      setTextContent('disk-free', diskFreeFormatted.value);
      setTextContent('disk-info', diskFreeFormatted.unit + ' free');
      setStyle('disk-bar', 'width', diskPercent + '%');
      setTextContent('total-peers', allTorrents.reduce((sum, t) => sum + (t.peers || 0), 0));
      setTextContent('torrent-count', torrents.length);
      setTextContent('total-count', allTorrents.length);
      setTextContent('all-count', allTorrents.length);
      
      // Update version and hostname info
      const versionInfo = document.getElementById('version-info');
      const hostnameInfo = document.getElementById('hostname-info');
      if (versionInfo && systemInfo.clientVersion) {
        versionInfo.textContent = 'v' + systemInfo.clientVersion;
      }
      if (hostnameInfo && systemInfo.hostname) {
        hostnameInfo.textContent = systemInfo.hostname;
      }
      
      const dlCount = document.getElementById('downloading-count');
      const seedCount = document.getElementById('seeding-count');
      const pauseCount = document.getElementById('paused-count');
      const compCount = document.getElementById('completed-count');
      
      const downloadingCount = allTorrents.filter(t => t.state === 'downloading').length;
      const seedingCount = allTorrents.filter(t => t.state === 'seeding').length;
      const pausedCount = allTorrents.filter(t => t.state === 'paused' || t.state === 'stopped').length;
      const completedCount = allTorrents.filter(t => t.completed === t.size).length;
      
      if (dlCount) { dlCount.textContent = downloadingCount; dlCount.classList.toggle('hidden', downloadingCount === 0); }
      if (seedCount) { seedCount.textContent = seedingCount; seedCount.classList.toggle('hidden', seedingCount === 0); }
      if (pauseCount) { pauseCount.textContent = pausedCount; pauseCount.classList.toggle('hidden', pausedCount === 0); }
      if (compCount) { compCount.textContent = completedCount; compCount.classList.toggle('hidden', completedCount === 0); }
      
      const tbody = document.getElementById('torrent-table-body');
      if (torrents.length === 0) {
        const emptyMsg = currentFilter === 'all' ? 'No torrents yet' : 'No torrents match this filter';
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-slate-500"><div class="flex flex-col items-center gap-3"><span class="material-symbols-outlined text-4xl text-slate-400">cloud_download</span><p class="font-medium">' + emptyMsg + '</p></div></td></tr>';
        return;
      }
      
      tbody.innerHTML = torrents.map(torrent => {
        const progress = torrent.size > 0 ? Math.min(100, Math.max(0, parseFloat(((torrent.completed / torrent.size) * 100).toFixed(2)))) : 0;
        const dlSpd = formatSpeed(torrent.downloadRate || 0);
        const ulSpd = formatSpeed(torrent.uploadRate || 0);
        const progressColor = torrent.state === 'seeding' ? 'bg-emerald-500' : 
                             torrent.state === 'paused' || torrent.state === 'stopped' ? 'bg-orange-500' : 'bg-primary';
        
        return '<tr class="hover:bg-slate-50/50 dark:hover:bg-background-dark/20 transition-colors group cursor-pointer" data-hash="' + torrent.hash + '">' +
          '<td class="px-6 py-4"><div class="flex items-center gap-3"><span class="material-symbols-outlined ' + getFileIconColor(torrent.name) + '">' + getFileIcon(torrent.name) + '</span><div class="min-w-0"><div class="text-sm font-bold truncate max-w-xs" title="' + torrent.name + '">' + torrent.name + '</div></div></div></td>' +
          '<td class="px-6 py-4 text-sm font-medium whitespace-nowrap">' + formatBytes(torrent.size) + '</td>' +
          '<td class="px-6 py-4"><div class="flex items-center gap-3"><div class="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div class="h-full ' + progressColor + '" style="width: ' + progress + '%"></div></div><span class="text-xs font-bold w-14 text-right">' + progress + '%</span></div></td>' +
          '<td class="px-6 py-4">' + getStatusBadge(torrent.state) + '</td>' +
          '<td class="px-6 py-4 text-sm whitespace-nowrap ' + (torrent.downloadRate > 0 ? 'font-bold text-primary' : 'font-medium text-slate-400') + ' text-right">' + (torrent.downloadRate > 0 ? dlSpd.value + ' ' + dlSpd.unit : '0 KB/s') + '</td>' +
          '<td class="px-6 py-4 text-sm whitespace-nowrap ' + (torrent.uploadRate > 0 ? 'font-bold text-emerald-500' : 'font-medium text-slate-400') + ' text-right">' + (torrent.uploadRate > 0 ? ulSpd.value + ' ' + ulSpd.unit : '0 KB/s') + '</td>' +
          '<td class="px-6 py-4 text-sm font-medium text-right text-slate-500 whitespace-nowrap">' + (progress === 100 ? 'Done' : formatETA(torrent.eta)) + '</td>' +
        '</tr>';
      }).join('');
      
      tbody.querySelectorAll('tr[data-hash]').forEach(row => {
        row.addEventListener('click', function(e) {
          if (e.button === 2) return;
          const hash = this.dataset.hash;
          if (hash) openDrawer(hash);
        });
      });
      
      updateDrawerIfOpen();
    }
    
    function applyPatch(path, value) {
      const parts = path.split('/').filter(Boolean);
      if (parts[0] === 'torrents') {
        const hash = parts[1];
        if (parts.length === 2) {
          if (value === null) {
            delete state.torrents[hash];
          } else {
            state.torrents[hash] = value;
          }
        } else {
          const prop = parts[2];
          if (state.torrents[hash]) {
            state.torrents[hash][prop] = value;
          }
        }
      } else if (parts[0] === 'systemInfo') {
        if (parts.length === 1) {
          state.systemInfo = value;
        } else if (parts[1] === 'diskSpace') {
          if (parts.length === 2) {
            state.systemInfo.diskSpace = value;
          } else {
            state.systemInfo.diskSpace[parts[2]] = value;
          }
        } else {
          state.systemInfo[parts[1]] = value;
        }
      } else if (parts[0] === 'stats') {
        if (parts.length === 1) {
          state.systemInfo.downloadRate = value.downloadSpeed || 0;
          state.systemInfo.uploadRate = value.uploadSpeed || 0;
        } else {
          if (parts[1] === 'downloadSpeed') state.systemInfo.downloadRate = value;
          if (parts[1] === 'uploadSpeed') state.systemInfo.uploadRate = value;
        }
      }
    }
    
    async function fetchTorrents() {
      try {
        const response = await fetch('/api/torrents');
        const torrents = await response.json();
        state.torrents = {};
        torrents.forEach(t => {
          state.torrents[t.hash] = t;
        });
        updateUI();
      } catch (err) {
        console.error('Failed to fetch torrents:', err);
      }
    }
    
    let eventSource = null;
    let isConnected = false;
    
    function connect() {
      // Close existing connection if any
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      
      eventSource = new EventSource('/api/events');
      
      eventSource.addEventListener('init', function(e) {
        try {
          const data = JSON.parse(e.data);
          state.torrents = data.torrents || {};
          if (data.systemInfo) {
            state.systemInfo = data.systemInfo;
          } else if (data.stats) {
            state.systemInfo.downloadRate = data.stats.downloadSpeed || 0;
            state.systemInfo.uploadRate = data.stats.uploadSpeed || 0;
          }
          isConnected = true;
          updateUI();
        } catch (err) {
          console.error('Failed to parse init data:', err);
        }
      });
      
      eventSource.addEventListener('patch', function(e) {
        if (!isConnected) return;
        try {
          const patches = JSON.parse(e.data);
          patches.forEach(p => applyPatch(p.path, p.value));
          updateUI();
        } catch (err) {
          console.error('Failed to parse patch data:', err);
        }
      });
      
      eventSource.onerror = function() {
        isConnected = false;
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        setTimeout(connect, 3000);
      };
      
      // Clean up on page unload
      window.addEventListener('beforeunload', function() {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      });
    }
    
    function setFilter(filter) {
      currentFilter = filter;
      
      document.querySelectorAll('.nav-filter, #nav-all').forEach(el => {
        el.classList.remove('active-nav', 'text-primary');
        const textSpan = el.querySelector('.text-sm');
        if (textSpan) {
          textSpan.classList.remove('text-primary');
          textSpan.classList.add('text-slate-600', 'dark:text-slate-300');
        }
      });
      
      let activeEl;
      if (filter === 'all') {
        activeEl = document.getElementById('nav-all');
      } else {
        activeEl = document.querySelector('[data-filter="' + filter + '"]');
      }
      
      if (activeEl) {
        activeEl.classList.add('active-nav', 'text-primary');
        const textSpan = activeEl.querySelector('.text-sm');
        if (textSpan) {
          textSpan.classList.remove('text-slate-600', 'dark:text-slate-300');
          textSpan.classList.add('text-primary');
        }
      }
      
      updateUI();
    }
    
    // Event listeners
    
    // Torrent row click to open drawer
    const torrentTableBody = document.getElementById('torrent-table-body');
    if (torrentTableBody) {
      torrentTableBody.addEventListener('click', function(e) {
        const row = e.target.closest('tr[data-hash]');
        if (row) {
          openDrawer(row.dataset.hash);
        }
      });
    }
    
    // Drawer backdrop click to close
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', closeDrawer);
    }
    
    // Drawer close button
    const drawerCloseBtn = document.getElementById('drawer-close');
    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener('click', closeDrawer);
    }
    
    const navAll = document.getElementById('nav-all');
    if (navAll) {
      navAll.addEventListener('click', function(e) {
        e.preventDefault();
        setFilter('all');
      });
    }
    
    document.querySelectorAll('.nav-filter').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        const filter = this.dataset.filter;
        setFilter(filter);
      });
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value;
        updateUI();
      });
    }
    
    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', function() {
        const col = this.dataset.sort;
        if (sortColumn === col) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = col;
          sortDirection = ['size', 'progress', 'downloadRate', 'uploadRate'].includes(col) ? 'desc' : 'asc';
        }
        updateSortIcons();
        updateUI();
      });
    });
    
    // Files Sort Listeners
    document.querySelectorAll('thead th[data-key]').forEach(th => {
        th.addEventListener('click', () => {
           const key = th.getAttribute('data-key');
           if (filesSortKey === key) {
               filesSortDesc = !filesSortDesc;
           } else {
               filesSortKey = key;
               filesSortDesc = false;
           }
           filesCurrentPage = 1;
           renderFilesList();
        });
    });

    // Files Filter Listener
    const filesFilterInput = document.getElementById('files-filter-input');
    if (filesFilterInput) {
      filesFilterInput.addEventListener('input', (e) => {
        filesFilterQuery = e.target.value;
        filesCurrentPage = 1;
        renderFilesList();
      });
    }
    
    connect();
  `
}
