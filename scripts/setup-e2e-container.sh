#!/bin/bash
# Setup script for running e2e tests in Proxmox LXC container
# This script installs all dependencies needed for Playwright e2e tests

set -e

echo "========================================="
echo "E2E Test Container Setup for Proxmox LXC"
echo "========================================="

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install basic dependencies first (needed for version detection)
apt-get install -y bc lsb-release curl wget git

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install required system dependencies for Playwright
echo "📦 Installing system dependencies for Playwright browsers..."

# Detect Ubuntu version for package name compatibility
UBUNTU_VERSION=$(lsb_release -rs)
echo "Detected Ubuntu version: $UBUNTU_VERSION"

# Ubuntu 24.04+ uses t64 package names (time64 transition)
if [ "$(echo "$UBUNTU_VERSION >= 24.04" | bc)" -eq 1 ]; then
    echo "Using Ubuntu 24.04+ package names (t64 variants)..."
    LIBASOUND_PKG="libasound2t64"
    LIBATSPI_PKG="libatspi2.0-0t64"
else
    echo "Using Ubuntu 22.04 package names..."
    LIBASOUND_PKG="libasound2"
    LIBATSPI_PKG="libatspi2.0-0"
fi

apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    $LIBASOUND_PKG \
    $LIBATSPI_PKG \
    libwayland-client0 \
    fonts-liberation \
    fonts-noto-color-emoji

# Install additional dependencies
echo "📦 Installing additional dependencies..."
apt-get install -y \
    xvfb \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0

echo "✅ System setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository:"
echo "   git clone https://github.com/einhasad/vue-datatable.git"
echo "   cd vue-datatable"
echo ""
echo "2. Install dependencies:"
echo "   npm install"
echo "   cd examples && npm install && cd .."
echo ""
echo "3. Install Playwright browsers:"
echo "   npx playwright install --with-deps"
echo ""
echo "4. Run e2e tests:"
echo "   npm run test:e2e"
echo ""
echo "Or use the automated script: ./scripts/run-e2e-in-container.sh"
