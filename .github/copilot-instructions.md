# rTorrent Web UI - Copilot Instructions

## Project Overview
Modern web interface for rTorrent using Hono framework with TypeScript.

## Tech Stack
- **Backend**: Hono.js (lightweight web framework)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **rTorrent Communication**: XML-RPC

## Project Structure
```
/src
  /routes      - API routes and page handlers
  /services    - rTorrent XML-RPC service
  /views       - HTML templates
  /public      - Static assets (CSS, JS)
/docker        - Docker configuration for rTorrent
```

## Development Commands
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `docker-compose up -d` - Start rTorrent container

## Code Style
- Use TypeScript strict mode
- Prefer async/await over callbacks
- Use Hono's JSX for server-side rendering
