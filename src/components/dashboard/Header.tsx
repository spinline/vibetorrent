export const DashboardHeader = () => {
  return (
    <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark flex items-center justify-between px-8 shrink-0">
      <div class="flex items-center gap-6">
        <button id="mobile-menu-toggle" class="md:hidden text-slate-500 hover:text-white transition-colors relative z-50 p-2">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="relative w-64 hidden md:block">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            type="text"
            id="search-input"
            class="w-full bg-slate-100 dark:bg-surface-dark border-none rounded-lg pl-10 pr-4 py-1.5 text-sm focus:ring-1 focus:ring-primary transition-all"
            placeholder="Filter torrents..."
          />
        </div>
        <div class="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
        <nav class="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a class="hover:text-primary transition-colors cursor-pointer" href="#">Stats</a>
          <a class="hover:text-primary transition-colors cursor-pointer" href="#">Peers</a>
          <a class="hover:text-primary transition-colors cursor-pointer" href="#">File Manager</a>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <button class="relative p-2 hover:bg-slate-100 dark:hover:bg-surface-dark rounded-lg text-slate-500 transition-colors">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-background-dark rounded-full"></span>
        </button>
      </div>
    </header>
  )
}
