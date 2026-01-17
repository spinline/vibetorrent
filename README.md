# rTorrent Web UI

Modern web interface for rTorrent using Hono framework with TypeScript.

![Dashboard Preview](docs/preview.png)

## Features

- 🚀 **Fast & Lightweight** - Built with Hono.js and Bun runtime
- 🎨 **Modern UI** - Beautiful dark theme with Tailwind CSS
- 📊 **Real-time Stats** - Live download/upload speeds and disk usage
- 🔄 **Auto Refresh** - Automatic updates every 3 seconds
- ➕ **Easy Management** - Add, pause, resume, and remove torrents
- 🐳 **Docker Support** - Easy setup with Docker Compose

## Tech Stack

- **Backend**: Hono.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **rTorrent Communication**: XML-RPC

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) runtime installed
- [Docker](https://www.docker.com/) (for rTorrent)

### 1. Start rTorrent Container

```bash
docker-compose up -d
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Start Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/src
  /routes      - API routes
  /services    - rTorrent XML-RPC service  
  /views       - JSX templates
  /public      - Static assets
/docker        - Docker volumes
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get system statistics |
| GET | `/api/torrents` | List all torrents |
| POST | `/api/torrents` | Add a new torrent |
| POST | `/api/torrents/:hash/pause` | Pause a torrent |
| POST | `/api/torrents/:hash/resume` | Resume a torrent |
| DELETE | `/api/torrents/:hash` | Remove a torrent |

## Development

```bash
# Start with hot reload
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## License

MIT
