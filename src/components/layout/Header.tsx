import type { Child } from 'hono/jsx'
import { Icon } from '../ui'

interface PageHeaderProps {
  title: string
  badge?: string
  children?: Child
}

export const PageHeader = ({ title, badge, children }: PageHeaderProps) => (
  <header class="safe-h-16 border-b border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark flex items-center justify-between px-8 shrink-0 relative z-30 safe-top">
    <div class="flex items-center gap-4">
      <button id="mobile-menu-toggle" class="md:hidden text-slate-500 hover:text-white transition-colors relative z-50 p-2">
        <span class="material-symbols-outlined">menu</span>
      </button>
      <h2 class="text-xl font-bold" id="header-title">{title}</h2>
      {badge && (
        <span class="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-xs font-bold rounded uppercase text-slate-500 tracking-wider">
          {badge}
        </span>
      )}
    </div>
    {children && <div class="flex items-center gap-2">{children}</div>}
  </header>
)

interface MainContentProps {
  children: Child
  class?: string
}

export const MainContent = ({ children, class: className = '' }: MainContentProps) => (
  <main class={`flex-1 flex flex-col min-w-0 overflow-hidden ${className}`}>
    {children}
  </main>
)

interface ContentAreaProps {
  children: Child
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full'
  class?: string
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
}

export const ContentArea = ({ children, maxWidth = 'full', class: className = '' }: ContentAreaProps) => (
  <div class="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-background-dark/50">
    <div class={`mx-auto space-y-8 ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  </div>
)
