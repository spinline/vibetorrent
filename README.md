# rTorrent Web UI (Go Edition)

Modern, high-performance web interface for rTorrent built with Go and the GOTH stack.

![Dashboard Preview](docs/preview.png)

## Features

- 🚀 **Blazing Fast** - Single binary with embedded assets
- 🎨 **Modern UI** - Beautiful dark theme with responsive design
- 📊 **Real-time Stats** - Live download/upload speeds and disk usage
- 🔄 **Auto Refresh** - Automatic updates with HTMX
- ➕ **Easy Management** - Add, pause, resume, and remove torrents
- 🐳 **Docker Support** - Easy setup with Docker Compose
- 📱 **PWA Ready** - Install as a progressive web app

## Tech Stack (GOTH)

- **Go** - High-performance backend
- **Templ** - Type-safe HTML templating
- **HTMX** - Dynamic interactions without JavaScript frameworks
- **Alpine.js** - Lightweight reactivity for UI components
- **Tailwind CSS** - Modern styling

## Quick Start

### Prerequisites

- [Go 1.21+](https://golang.org/dl/)
- [Templ CLI](https://templ.guide/): `go install github.com/a-h/templ/cmd/templ@latest`
- [Docker](https://www.docker.com/) (for rTorrent)

### 1. Start rTorrent Container

```bash
docker-compose up -d
```

### 2. Generate Templates & Build

```bash
# Generate Go code from .templ files
templ generate

# Build the binary
go build -o rtorrent-webui cmd/server/main.go
```

### 3. Run the Application

```bash
./rtorrent-webui
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Project Structure

```
/cmd/server       - Application entry point
/internal         - Internal packages
  /rtorrent       - rTorrent XML-RPC client
/views            - Templ templates
  /layout         - Base layouts
  /components     - UI components
/public           - Static assets (PWA manifest, icons)
/docker           - Docker volumes for rTorrent
```

## Development

```bash
# Watch and regenerate templates on change
templ generate --watch

# In another terminal, run with auto-reload
go run cmd/server/main.go

# Or use air for hot reload
air
```

## Building for Production

```bash
# Generate templates
templ generate

# Build optimized binary
go build -ldflags="-s -w" -o rtorrent-webui cmd/server/main.go

# Run
./rtorrent-webui
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build
```

## Features Highlight

- **Optimistic UI**: Delete actions hide torrents immediately before server response
- **Embedded Assets**: All JS/CSS/Templates embedded in single binary using `//go:embed`
- **Type Safety**: Templ provides compile-time template checking
- **PWA Support**: Includes manifest and iOS meta tags for home-screen installation
- **Context Menus**: Right-click torrents for quick actions
- **Modals**: Set labels, manage torrents with beautiful modals
- **Responsive Design**: Works great on desktop, tablet, and mobile

## MIPS Deployment

### Building for MIPS

The application can be cross-compiled for MIPS devices (routers, NAS, etc.):

```bash
# Build for MIPS (little-endian)
./build-mips.sh
```

This creates a statically-linked binary `rtorrent-webui-mips` (~8.4 MB) that runs on MIPS devices.

### Configuration

The application supports both **Unix sockets** and **TCP connections**:

#### Unix Socket (Recommended for local rTorrent)
```bash
export RTORRENT_SOCKET=unix:///opt/var/rpc.socket
export PORT=8080
./rtorrent-webui-mips
```

#### TCP Connection
```bash
export RTORRENT_HOST=localhost
export RTORRENT_PORT=8000
export PORT=8080
./rtorrent-webui-mips
```

### Deployment to MIPS Device

```bash
# Deploy to your device (requires SSH access)
./deploy-mips.sh user@192.168.1.100
```

This script will:
1. Build the MIPS binary
2. Upload to your device
3. Install systemd service
4. Start the web UI automatically

### Manual Installation

```bash
# 1. Build
./build-mips.sh

# 2. Copy to device
scp rtorrent-webui-mips user@device:/usr/local/bin/rtorrent-webui

# 3. SSH to device and run
ssh user@device
chmod +x /usr/local/bin/rtorrent-webui
RTORRENT_SOCKET=unix:///opt/var/rpc.socket /usr/local/bin/rtorrent-webui
```

### Systemd Service

For auto-start on boot, the deployment script installs a systemd service:

```bash
# Check status
systemctl status rtorrent-webui

# View logs
journalctl -u rtorrent-webui -f

# Restart
systemctl restart rtorrent-webui
```

## License

MIT
