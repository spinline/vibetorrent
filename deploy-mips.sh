#!/bin/bash
# Deploy rTorrent Web UI to MIPS device
# Usage: ./deploy-mips.sh user@mips-device

set -e

TARGET=$1
if [ -z "$TARGET" ]; then
    echo "❌ Error: No target specified"
    echo "Usage: $0 user@mips-device"
    echo "Example: $0 root@192.168.1.100"
    exit 1
fi

echo "🚀 Deploying rTorrent Web UI to $TARGET"
echo ""

# Build first
echo "📦 Building for MIPS..."
ARCH=${2:-mipsle}
./build-mips.sh $ARCH
echo ""

# Upload binary
echo "📤 Uploading binary ($ARCH)..."
scp -o StrictHostKeyChecking=no rtorrent-webui-$ARCH $TARGET:/tmp/rtorrent-webui-mips
echo ""

# Upload systemd service file
echo "📤 Uploading systemd service..."
scp -o StrictHostKeyChecking=no rtorrent-webui.service $TARGET:/tmp/
echo ""

# Install and configure
echo "⚙️  Installing on remote device..."
ssh -o StrictHostKeyChecking=no $TARGET 'bash -s' << 'ENDSSH'
    # Move binary
    sudo mv /tmp/rtorrent-webui-mips /usr/local/bin/rtorrent-webui
    sudo chmod +x /usr/local/bin/rtorrent-webui
    
    # Install systemd service
    sudo mv /tmp/rtorrent-webui.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable rtorrent-webui
    sudo systemctl restart rtorrent-webui
    
    echo "✅ Installation complete!"
    echo ""
    echo "📊 Service status:"
    sudo systemctl status rtorrent-webui --no-pager
ENDSSH

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Access the web UI at: http://$TARGET:8080"
