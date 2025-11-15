#!/bin/bash
set -e

# GitHub Actions Self-Hosted Runner Setup Script
# This script sets up a GitHub Actions self-hosted runner in an Ubuntu LXC container
# for running e2e tests with Playwright

echo "=================================================="
echo "GitHub Actions Self-Hosted Runner Setup"
echo "=================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root"
  exit 1
fi

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required dependencies
echo "Installing dependencies..."
apt-get install -y \
    curl \
    wget \
    git \
    jq \
    tar \
    sudo

# Install Node.js 20 (if not already installed)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Install Playwright system dependencies
echo "Installing Playwright browser dependencies..."
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
    libasound2 \
    libatspi2.0-0 \
    fonts-liberation \
    fonts-noto-color-emoji \
    libxtst6

# Create a user for the GitHub Actions runner
RUNNER_USER="github-runner"
if id "$RUNNER_USER" &>/dev/null; then
    echo "User $RUNNER_USER already exists"
else
    echo "Creating user $RUNNER_USER..."
    useradd -m -s /bin/bash "$RUNNER_USER"
    usermod -aG sudo "$RUNNER_USER"
    echo "$RUNNER_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$RUNNER_USER
fi

# Create runner directory
RUNNER_HOME="/home/$RUNNER_USER/actions-runner"
mkdir -p "$RUNNER_HOME"

# Download the latest GitHub Actions runner
echo "Downloading GitHub Actions runner..."
cd "$RUNNER_HOME"

# Get the latest runner version
LATEST_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/v//')
echo "Latest runner version: $LATEST_VERSION"

# Download and extract
RUNNER_FILE="actions-runner-linux-x64-${LATEST_VERSION}.tar.gz"
curl -o "$RUNNER_FILE" -L "https://github.com/actions/runner/releases/download/v${LATEST_VERSION}/${RUNNER_FILE}"

# Validate hash
echo "Validating download..."
curl -o checksums.txt -L "https://github.com/actions/runner/releases/download/v${LATEST_VERSION}/checksums.txt"
if grep -q "$(sha256sum $RUNNER_FILE | awk '{print $1}')" checksums.txt; then
    echo "✓ Checksum validated"
else
    echo "✗ Checksum validation failed!"
    exit 1
fi

# Extract
echo "Extracting runner..."
tar xzf "$RUNNER_FILE"
rm "$RUNNER_FILE" checksums.txt

# Set ownership
chown -R "$RUNNER_USER:$RUNNER_USER" "$RUNNER_HOME"

echo ""
echo "=================================================="
echo "✓ GitHub Actions runner setup complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Get your runner registration token from GitHub:"
echo "   Repository Settings > Actions > Runners > New self-hosted runner"
echo ""
echo "2. Configure the runner (as $RUNNER_USER):"
echo "   sudo su - $RUNNER_USER"
echo "   cd $RUNNER_HOME"
echo "   ./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN"
echo ""
echo "3. Install the runner as a service:"
echo "   sudo ./svc.sh install $RUNNER_USER"
echo "   sudo ./svc.sh start"
echo ""
echo "4. Check runner status:"
echo "   sudo ./svc.sh status"
echo ""
echo "See scripts/github-runner-instructions.md for detailed instructions"
echo "=================================================="
