import type { Child } from 'hono/jsx'

interface LayoutProps {
  title: string
  children: Child
  scripts?: string
  styles?: string
}

// Shared Tailwind configuration
export const tailwindConfig = `
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "primary": "#12a1a1",
          "background-light": "#ffffff",
          "background-dark": "#17191c",
          "surface-dark": "#24272B",
        },
        fontFamily: {
          "display": ["Space Grotesk", "sans-serif"],
          "sans": ["Noto Sans", "sans-serif"]
        },
        borderRadius: {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
        },
      },
    },
  }
`

// Shared base styles
export const baseStyles = `
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .material-symbols-filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .active-nav {
    background-color: rgba(18, 161, 161, 0.15);
    border-left: 3px solid #12a1a1;
    color: #12a1a1 !important;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #17191c; }
  ::-webkit-scrollbar-thumb { background: #34383d; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #4a4f56; }
`

export const Layout = ({ title, children, scripts = '', styles = '' }: LayoutProps) => {
  return (
    <html lang="en" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: tailwindConfig }} />
        <style dangerouslySetInnerHTML={{ __html: baseStyles + styles }} />
        {scripts && <script dangerouslySetInnerHTML={{ __html: scripts }} />}
      </head>
      <body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex">
        {children}
      </body>
    </html>
  )
}
