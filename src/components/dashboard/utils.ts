// Dashboard utility functions

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

export const formatBytesShort = (bytes: number): { value: string; unit: string } => {
  if (!bytes || bytes === 0 || !isFinite(bytes)) return { value: '0', unit: 'B' }
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return { value: (bytes / Math.pow(k, i)).toFixed(1), unit: sizes[i] }
}

export const formatSpeed = (bytesPerSec: number): { value: string; unit: string } => {
  if (bytesPerSec === 0) return { value: '0', unit: 'KB/s' }
  const k = 1024
  if (bytesPerSec < k) return { value: bytesPerSec.toFixed(0), unit: 'B/s' }
  if (bytesPerSec < k * k) return { value: (bytesPerSec / k).toFixed(0), unit: 'KB/s' }
  return { value: (bytesPerSec / (k * k)).toFixed(1), unit: 'MB/s' }
}

export const formatETA = (seconds: number): string => {
  if (seconds <= 0 || !isFinite(seconds)) return '--'
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}

export const getStatusBadge = (state: string): string => {
  if (state === 'seeding') {
    return `<span class="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase">Seeding</span>`
  }
  if (state === 'downloading') {
    return `<span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Downloading</span>`
  }
  if (state === 'paused') {
    return `<span class="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded uppercase">Paused</span>`
  }
  if (state === 'stopped') {
    return `<span class="px-2 py-1 bg-slate-500/10 text-slate-400 text-[10px] font-bold rounded uppercase">Stopped</span>`
  }
  return `<span class="px-2 py-1 bg-slate-500/10 text-slate-500 text-[10px] font-bold rounded uppercase">${state}</span>`
}

export const getFileIcon = (name: string): string => {
  const lower = name.toLowerCase()
  if (lower.includes('.iso')) return 'description'
  if (lower.includes('.mkv') || lower.includes('.mp4') || lower.includes('.avi')) return 'video_library'
  if (lower.includes('.zip') || lower.includes('.rar') || lower.includes('.7z')) return 'folder_zip'
  if (lower.includes('.mp3') || lower.includes('.flac') || lower.includes('.wav')) return 'library_music'
  return 'library_music'
}

export const getFileIconColor = (name: string): string => {
  const lower = name.toLowerCase()
  if (lower.includes('.iso')) return 'text-primary'
  if (lower.includes('.mkv') || lower.includes('.mp4') || lower.includes('.avi')) return 'text-emerald-500'
  if (lower.includes('.zip') || lower.includes('.rar') || lower.includes('.7z')) return 'text-orange-500'
  return 'text-purple-500'
}
