// Add Torrent Modal scripts
export const getAddModalScripts = (): string => {
  return `
    // Add Torrent Modal
    const modal = document.getElementById('add-modal');
    const urlInput = document.getElementById('torrent-url');
    const fileInput = document.getElementById('torrent-file');
    const fileContent = document.getElementById('file-content');
    const urlContent = document.getElementById('url-content');
    const fileNameEl = document.getElementById('file-name');
    const errorEl = document.getElementById('add-error');
    const downloadPathInput = document.getElementById('download-path');
    const addLabelInput = document.getElementById('add-label-input');
    const addLabelsContainer = document.getElementById('add-labels-container');
    const autoStartCheckbox = document.getElementById('auto-start');
    
    let selectedFile = null;
    let activeTab = 'file';
    let addLabels = [];
    
    function switchSourceTab(tab) {
      activeTab = tab;
      const fileRadio = document.getElementById('source-file');
      const urlRadio = document.getElementById('source-url');
      
      if (tab === 'file') {
        fileRadio.checked = true;
        fileContent.classList.remove('hidden');
        urlContent.classList.add('hidden');
      } else {
        urlRadio.checked = true;
        urlContent.classList.remove('hidden');
        fileContent.classList.add('hidden');
        urlInput.focus();
      }
    }
    
    document.getElementById('tab-file').addEventListener('click', () => switchSourceTab('file'));
    document.getElementById('tab-url').addEventListener('click', () => switchSourceTab('url'));
    
    function openModal() {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      urlInput.value = '';
      selectedFile = null;
      addLabels = [];
      renderAddLabels();
      fileNameEl.classList.add('hidden');
      fileNameEl.textContent = '';
      errorEl.classList.add('hidden');
      activeTab = 'file';
      document.querySelector('input[name="source_type"][value="file"]').checked = true;
      fileContent.classList.remove('hidden');
      urlContent.classList.add('hidden');
    }
    
    function closeModal() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    
    function renderAddLabels() {
      addLabelsContainer.querySelectorAll('.label-tag').forEach(el => el.remove());
      addLabels.forEach((label, index) => {
        const tag = document.createElement('div');
        tag.className = 'label-tag flex items-center gap-1 bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded';
        tag.innerHTML = '<span>' + label + '</span><button class="hover:text-white" data-index="' + index + '"><span class="material-symbols-outlined text-[14px]">close</span></button>';
        addLabelsContainer.insertBefore(tag, addLabelInput);
      });
    }
    
    addLabelsContainer.addEventListener('click', function(e) {
      const btn = e.target.closest('button[data-index]');
      if (btn) {
        const index = parseInt(btn.dataset.index);
        addLabels.splice(index, 1);
        renderAddLabels();
      }
    });
    
    addLabelInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && this.value.trim()) {
        e.preventDefault();
        const newLabel = this.value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
        if (newLabel && !addLabels.includes(newLabel)) {
          addLabels.push(newLabel);
          renderAddLabels();
        }
        this.value = '';
      }
    });
    
    document.getElementById('path-shortcuts').addEventListener('click', function(e) {
      const shortcut = e.target.closest('[data-path]');
      if (shortcut) {
        downloadPathInput.value = shortcut.dataset.path;
      }
    });
    
    async function submitTorrent() {
      errorEl.classList.add('hidden');
      const submitBtn = document.getElementById('modal-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span> Adding...';
      
      const downloadPath = downloadPathInput.value.trim() || '/downloads';
      const priority = document.querySelector('input[name="priority"]:checked')?.value || '1';
      const autoStart = autoStartCheckbox.checked;
      const labelStr = addLabels.join(',');
      
      try {
        let response;
        
        if (activeTab === 'url') {
          const url = urlInput.value.trim();
          if (!url) {
            throw new Error('Please enter a magnet link or URL');
          }
          
          response = await fetch('/api/torrents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              url,
              downloadPath,
              priority: parseInt(priority),
              autoStart,
              label: labelStr
            })
          });
        } else {
          if (!selectedFile) {
            throw new Error('Please select a torrent file');
          }
          
          const formData = new FormData();
          formData.append('torrent', selectedFile);
          formData.append('downloadPath', downloadPath);
          formData.append('priority', priority);
          formData.append('autoStart', autoStart.toString());
          formData.append('label', labelStr);
          
          response = await fetch('/api/torrents', {
            method: 'POST',
            body: formData
          });
        }
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to add torrent');
        }
        
        showToast('Torrent added successfully!', 'success');
        closeModal();
        
        setTimeout(() => fetchTorrents(), 500);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">bolt</span> Add Torrent';
      }
    }
    
    const sidebarAdd = document.getElementById('sidebar-add');
    if (sidebarAdd) sidebarAdd.addEventListener('click', openModal);
    
    const fabAdd = document.getElementById('fab-add');
    if (fabAdd) fabAdd.addEventListener('click', openModal);
    
    const modalClose = document.getElementById('modal-close');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    const modalCancel = document.getElementById('modal-cancel');
    if (modalCancel) modalCancel.addEventListener('click', closeModal);
    
    const modalSubmit = document.getElementById('modal-submit');
    if (modalSubmit) modalSubmit.addEventListener('click', submitTorrent);
    
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (drawer && !drawer.classList.contains('translate-x-full')) {
          closeDrawer();
          return;
        }
        if (modal && !modal.classList.contains('hidden')) {
          closeModal();
        }
      }
    });
    
    urlInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitTorrent();
    });
    
    fileInput.addEventListener('change', function(e) {
      if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        fileNameEl.textContent = '✓ ' + selectedFile.name;
        fileNameEl.classList.remove('hidden');
      }
    });
    
    fileContent.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('border-primary', 'scale-[1.02]');
    });
    
    fileContent.addEventListener('dragleave', function(e) {
      e.preventDefault();
      this.classList.remove('border-primary', 'scale-[1.02]');
    });
    
    fileContent.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('border-primary', 'scale-[1.02]');
      
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.torrent')) {
          selectedFile = file;
          fileNameEl.textContent = '✓ ' + file.name;
          fileNameEl.classList.remove('hidden');
        } else {
          errorEl.textContent = 'Please select a .torrent file';
          errorEl.classList.remove('hidden');
        }
      }
    });
  `;
}
