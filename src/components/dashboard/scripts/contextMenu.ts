// Context menu and modal scripts
export const getContextMenuScripts = (): string => {
  return `
    // ============================================
    // Context Menu (Right-click)
    // ============================================
    const ctxMenu = document.getElementById('context-menu');
    let ctxHash = null;
    let ctxTorrent = null;
    
    function showContextMenu(e, hash) {
      e.preventDefault();
      ctxHash = hash;
      ctxTorrent = state.torrents[hash];
      
      if (!ctxTorrent) return;
      
      fetch('/api/torrents/' + hash + '/priority')
        .then(res => res.json())
        .then(data => {
          document.querySelectorAll('.ctx-priority .priority-check').forEach(chk => {
            chk.classList.add('opacity-0');
            chk.classList.remove('opacity-100');
          });
          document.querySelectorAll('.ctx-priority').forEach(btn => {
            btn.classList.remove('bg-slate-100', 'dark:bg-slate-800');
          });
          const currentBtn = document.querySelector('.ctx-priority[data-priority="' + data.priority + '"]');
          if (currentBtn) {
            currentBtn.querySelector('.priority-check').classList.remove('opacity-0');
            currentBtn.querySelector('.priority-check').classList.add('opacity-100');
            currentBtn.classList.add('bg-slate-100', 'dark:bg-slate-800');
          }
        })
        .catch(err => console.error('Failed to get priority:', err));
      
      ctxMenu.style.visibility = 'hidden';
      ctxMenu.style.left = '-9999px';
      ctxMenu.style.top = '-9999px';
      ctxMenu.classList.remove('hidden');
      
      const rect = ctxMenu.getBoundingClientRect();
      const menuWidth = rect.width;
      const menuHeight = rect.height;
      
      let x = e.clientX;
      let y = e.clientY;
      
      if (x + menuWidth > window.innerWidth) {
        x = Math.max(0, x - menuWidth);
      }
      
      if (y + menuHeight > window.innerHeight) {
        y = Math.max(0, y - menuHeight);
      }
      
      ctxMenu.style.left = x + 'px';
      ctxMenu.style.top = y + 'px';
      ctxMenu.style.visibility = 'visible';
    }
    
    function hideContextMenu() {
      ctxMenu.classList.add('hidden');
      const prioritySub = document.getElementById('priority-submenu');
      if (prioritySub) {
        prioritySub.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        prioritySub.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
      }
      ctxHash = null;
      ctxTorrent = null;
    }
    
    document.addEventListener('click', function(e) {
      if (!ctxMenu.contains(e.target)) {
        hideContextMenu();
      }
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') hideContextMenu();
    });
    
    document.getElementById('torrent-table-body').addEventListener('contextmenu', function(e) {
      const row = e.target.closest('tr[data-hash]');
      if (row) {
        showContextMenu(e, row.dataset.hash);
      }
    });
    
    async function ctxAction(action, payload = {}) {
      if (!ctxHash) return;
      
      const hash = ctxHash;
      const torrent = state.torrents[hash];
      if (!torrent) return;
      
      const previousState = { ...torrent };
      
      switch (action) {
        case 'start':
          torrent.status = 'downloading';
          torrent.isActive = 1;
          break;
        case 'pause':
          torrent.status = 'paused';
          torrent.isActive = 0;
          break;
        case 'stop':
          torrent.status = 'stopped';
          torrent.isActive = 0;
          break;
        case 'recheck':
          torrent.status = 'checking';
          break;
        case 'reannounce':
          break;
      }
      
      updateUI();
      hideContextMenu();
      
      try {
        let url = '/api/torrents/' + hash;
        let method = 'POST';
        let body = null;
        
        switch (action) {
          case 'start':
            url += '/start';
            break;
          case 'pause':
            url += '/pause';
            break;
          case 'stop':
            url += '/stop';
            break;
          case 'recheck':
            url += '/recheck';
            break;
          case 'reannounce':
            url += '/reannounce';
            break;
          case 'label':
            url += '/label';
            body = JSON.stringify({ label: payload.label });
            break;
          case 'remove':
            method = 'DELETE';
            if (payload.deleteFiles) url += '?deleteFiles=true';
            break;
        }
        
        const opts = { method };
        if (body) {
          opts.headers = { 'Content-Type': 'application/json' };
          opts.body = body;
        }
        
        const res = await fetch(url, opts);
        const result = await res.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Action failed');
        }
        
        const actionNames = {
          start: 'Started',
          pause: 'Paused', 
          stop: 'Stopped',
          recheck: 'Hash check started',
          reannounce: 'Reannounced'
        };
        showToast(actionNames[action] || 'Done', 'success');
        
      } catch (err) {
        console.error('Action failed:', err);
        if (state.torrents[hash]) {
          Object.assign(state.torrents[hash], previousState);
          updateUI();
        }
        showToast('Error: ' + err.message, 'error');
      }
    }
    
    document.getElementById('ctx-start').addEventListener('click', () => ctxAction('start'));
    document.getElementById('ctx-pause').addEventListener('click', () => ctxAction('pause'));
    document.getElementById('ctx-stop').addEventListener('click', () => ctxAction('stop'));
    document.getElementById('ctx-recheck').addEventListener('click', () => ctxAction('recheck'));
    document.getElementById('ctx-reannounce').addEventListener('click', () => ctxAction('reannounce'));
    
    // Priority submenu
    const priorityBtn = document.getElementById('ctx-priority-btn');
    const prioritySubmenu = document.getElementById('priority-submenu');
    let priorityTimeout = null;
    
    function showPrioritySubmenu() {
      const btnRect = priorityBtn.getBoundingClientRect();
      
      let x = btnRect.right + 8;
      let y = btnRect.top - 20;
      
      if (x + 180 > window.innerWidth) {
        x = btnRect.left - 188;
        prioritySubmenu.style.transformOrigin = 'top right';
      } else {
        prioritySubmenu.style.transformOrigin = 'top left';
      }
      
      if (y + 250 > window.innerHeight) {
        y = window.innerHeight - 260;
      }
      
      prioritySubmenu.style.left = x + 'px';
      prioritySubmenu.style.top = y + 'px';
      
      prioritySubmenu.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
      prioritySubmenu.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
    }
    
    function hidePrioritySubmenu() {
      prioritySubmenu.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
      prioritySubmenu.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
    }
    
    priorityBtn.addEventListener('mouseenter', function() {
      clearTimeout(priorityTimeout);
      showPrioritySubmenu();
    });
    
    priorityBtn.addEventListener('mouseleave', function(e) {
      priorityTimeout = setTimeout(hidePrioritySubmenu, 150);
    });
    
    prioritySubmenu.addEventListener('mouseenter', function() {
      clearTimeout(priorityTimeout);
    });
    
    prioritySubmenu.addEventListener('mouseleave', function() {
      priorityTimeout = setTimeout(hidePrioritySubmenu, 150);
    });
    
    document.querySelectorAll('.ctx-priority').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!ctxHash) return;
        
        const priority = parseInt(this.dataset.priority);
        const hash = ctxHash;
        
        hideContextMenu();
        hidePrioritySubmenu();
        
        try {
          const res = await fetch('/api/torrents/' + hash + '/priority', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority })
          });
          const result = await res.json();
          
          if (result.success) {
            const priorityNames = { 0: 'Off', 1: 'Low', 2: 'Normal', 3: 'High' };
            showToast('Priority set to ' + priorityNames[priority], 'success');
          } else {
            throw new Error(result.error || 'Failed to set priority');
          }
        } catch (err) {
          console.error('Failed to set priority:', err);
          showToast('Error: ' + err.message, 'error');
        }
      });
    });

    document.getElementById('ctx-copy-hash').addEventListener('click', function() {
      if (ctxHash) {
        navigator.clipboard.writeText(ctxHash);
        showToast('Hash copied!', 'success');
        hideContextMenu();
      }
    });
    
    document.getElementById('ctx-copy-magnet').addEventListener('click', function() {
      if (ctxTorrent) {
        const magnet = 'magnet:?xt=urn:btih:' + ctxHash + '&dn=' + encodeURIComponent(ctxTorrent.name);
        navigator.clipboard.writeText(magnet);
        showToast('Magnet link copied!', 'success');
        hideContextMenu();
      }
    });
    
    // Label Modal
    const labelModal = document.getElementById('label-modal');
    const labelInput = document.getElementById('label-input');
    let labelHash = null;
    let labelTorrent = null;
    
    document.getElementById('ctx-set-label').addEventListener('click', function() {
      labelHash = ctxHash;
      labelTorrent = ctxTorrent;
      const currentLabel = labelTorrent?.label || '';
      
      hideContextMenu();
      
      labelInput.value = currentLabel;
      labelModal.classList.remove('hidden');
      labelModal.classList.add('flex');
      setTimeout(() => labelInput.focus(), 100);
    });
    
    function closeLabelModal() {
      labelModal.classList.add('hidden');
      labelModal.classList.remove('flex');
      labelHash = null;
      labelTorrent = null;
    }
    
    document.getElementById('label-modal-close').addEventListener('click', closeLabelModal);
    document.getElementById('label-cancel').addEventListener('click', closeLabelModal);
    labelModal.addEventListener('click', function(e) {
      if (e.target === labelModal) closeLabelModal();
    });
    
    document.getElementById('label-submit').addEventListener('click', async function() {
      if (!labelHash) return;
      
      const hash = labelHash;
      const newLabel = labelInput.value;
      
      if (state.torrents[hash]) {
        state.torrents[hash].label = newLabel;
        updateUI();
      }
      closeLabelModal();
      
      try {
        const res = await fetch('/api/torrents/' + hash + '/label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: newLabel })
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error);
        showToast('Label updated!', 'success');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
    
    labelInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('label-submit').click();
    });
    
    // Delete Modal
    const deleteModal = document.getElementById('delete-modal');
    const deleteMsg = document.getElementById('delete-msg');
    const deleteWarn = document.getElementById('delete-warn');
    let deleteHash = null;
    let deleteFiles = false;
    let hashToDelete = null;
    let hashToLabel = null;
    
    function openDeleteModal(withData) {
      deleteHash = ctxHash;
      deleteFiles = withData;
      deleteMsg.textContent = 'Are you sure you want to remove "' + (ctxTorrent?.name || 'this torrent') + '"?';
      deleteWarn.classList.toggle('hidden', !withData);
      deleteModal.classList.remove('hidden');
      deleteModal.classList.add('flex');
      hideContextMenu();
    }
    
    function closeDeleteModal() {
      deleteModal.classList.add('hidden');
      deleteModal.classList.remove('flex');
      deleteHash = null;
    }
    
    document.getElementById('ctx-remove').addEventListener('click', () => openDeleteModal(false));
    document.getElementById('ctx-remove-data').addEventListener('click', () => openDeleteModal(true));
    
    document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
    document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
    deleteModal.addEventListener('click', function(e) {
      if (e.target === deleteModal) closeDeleteModal();
    });
    
    document.getElementById('delete-submit').addEventListener('click', async function() {
      if (!deleteHash) return;
      
      const hashToDelete = deleteHash;
      const removedTorrent = state.torrents[hashToDelete];
      const torrentName = removedTorrent?.name || 'Unknown';
      const shouldDeleteFiles = deleteFiles;
      
      closeDeleteModal();
      
      if (removedTorrent) {
        delete state.torrents[hashToDelete];
        updateUI();
      }
      
      try {
        const url = '/api/torrents/' + hashToDelete + (shouldDeleteFiles ? '?deleteFiles=true' : '');
        const res = await fetch(url, { method: 'DELETE' });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Failed to remove');
        showToast('Removed "' + torrentName.substring(0, 30) + (torrentName.length > 30 ? '...' : '') + '"', 'success');
      } catch (err) {
        if (removedTorrent) {
          state.torrents[hashToDelete] = removedTorrent;
          updateUI();
        }
        showToast('Error: ' + err.message, 'error');
      }
    });
  `;
}
