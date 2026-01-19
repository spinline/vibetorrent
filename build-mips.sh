#!/bin/bash
set -e

echo "🔨 Building rTorrent Web UI for MIPS..."

# Detect architecture or use argument
ARCH=${1:-mipsle}

if [ "$ARCH" != "mips" ] && [ "$ARCH" != "mipsle" ]; then
    echo "❌ Invalid architecture. Use: mips (big-endian) or mipsle (little-endian)"
    echo "Usage: $0 [mips|mipsle]"
    exit 1
fi

echo "📝 Target architecture: $ARCH"
echo "📝 Generating templ files..."
templ generate

# Build for MIPS
echo "🏗️  Cross-compiling for $ARCH..."
CGO_ENABLED=0 GOOS=linux GOARCH=$ARCH go build \
  -ldflags="-s -w" \
  -o rtorrent-webui-$ARCH \
  cmd/server/main.go

echo "✅ Build complete!"
echo ""
echo "📦 Binary info:"
ls -lh rtorrent-webui-$ARCH
file rtorrent-webui-$ARCH
echo ""
echo "🚀 Ready to deploy to your MIPS device!"
