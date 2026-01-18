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
          primary: '#12a1a1',
          'surface-dark': '#1a1c24',
          'surface-darker': '#13151a',
          'background-dark': '#0f1115',
          'background-light': '#ffffff'
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
          display: ['Space Grotesk', 'Inter', 'sans-serif']
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
  body { font-family: 'Inter', system-ui, sans-serif; }
  .material-symbols-outlined {
    font-size: 20px;
    font-variation-settings: 'FILL' 0, 'wght' 500;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #94a3b8; border: 2px solid #0f1115; background-clip: padding-box; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
  * { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
  .touch-callout-none { -webkit-touch-callout: none !important; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  .safe-top { 
    padding-top: env(safe-area-inset-top, 0px);
    margin-top: 0;
  }
  /* Specific class for adding to existing p-6 (1.5rem) padding */
  .safe-pt-6 { 
    padding-top: calc(1.5rem + env(safe-area-inset-top, 0px)); 
  }
  .safe-h-16 { height: calc(4rem + env(safe-area-inset-top, 0px)); }
`

export const Layout = ({ title, children, scripts = '', styles = '' }: LayoutProps) => {
  return (
    <html lang="en" class="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>{title}</title>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="rTorrent" />
        <link rel="apple-touch-icon" href="/public/apple-touch-icon.png" />
        <link rel="manifest" href="/public/manifest.json" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: tailwindConfig }} />
        <style dangerouslySetInnerHTML={{ __html: baseStyles + styles }} />
        {scripts && <script dangerouslySetInnerHTML={{ __html: scripts }} />}
      </head>
      <body class="bg-background-dark text-slate-100 antialiased overflow-hidden h-[100dvh] flex">
        {children}
      </body>
    </html>
  )
}
