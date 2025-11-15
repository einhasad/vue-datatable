# Running E2E Tests in Proxmox LXC Container

This guide shows how to set up a Proxmox LXC container to run Playwright e2e tests.

## Step 1: Create LXC Container in Proxmox

1. **Create Ubuntu LXC Container:**
   - Go to Proxmox web interface
   - Click "Create CT"
   - Template: Ubuntu 22.04 or 24.04
   - Resources:
     - CPU: 2 cores minimum
     - Memory: 2GB minimum (4GB recommended)
     - Disk: 10GB minimum
   - Network: Bridge to your network
   - Start the container

2. **Access the container:**
   ```bash
   pct enter <container-id>
   # or via SSH
   ssh root@<container-ip>
   ```

## Step 2: Initial Container Setup

Run the setup script:

```bash
# Download and run setup script
wget https://raw.githubusercontent.com/einhasad/vue-datatable/claude/deduplicate-examples-tests-01TDi6FQBtiRnxVHQL2XAZDX/scripts/setup-e2e-container.sh
chmod +x setup-e2e-container.sh
./setup-e2e-container.sh
```

Or manually:

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Git
apt-get install -y git

# Install Playwright dependencies (this is the key part!)
apt-get install -y \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libdbus-1-3 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libpango-1.0-0 libcairo2 libasound2 \
    libatspi2.0-0 libwayland-client0 fonts-liberation \
    fonts-noto-color-emoji xvfb libgtk-3-0 libgdk-pixbuf2.0-0
```

## Step 3: Clone and Setup Project

```bash
# Clone repository
git clone https://github.com/einhasad/vue-datatable.git
cd vue-datatable

# Checkout the branch
git checkout claude/deduplicate-examples-tests-01TDi6FQBtiRnxVHQL2XAZDX

# Install dependencies
npm install
cd examples && npm install && cd ..

# Install Playwright browsers
npx playwright install --with-deps chromium firefox webkit
```

## Step 4: Run E2E Tests

### Option A: Use the automated script

```bash
./scripts/run-e2e-in-container.sh
```

### Option B: Manual commands

```bash
# Build library
npm run build

# Extract examples
npm run extract:examples

# Start dev server in background
cd examples
npm run dev &
DEV_PID=$!
cd ..

# Wait for server
sleep 10

# Run tests
npx playwright test --config=playwright.config.simple.ts

# Stop dev server
kill $DEV_PID
```

### Option C: Run specific browsers

```bash
# Chromium only (fastest)
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit

# All browsers
npx playwright test
```

## Step 5: View Test Reports

```bash
# View HTML report
npx playwright show-report

# Or access via web browser
# The report will be served at http://<container-ip>:9323
```

## Optional: Set Up Scheduled Tests

Create a cron job to run tests automatically:

```bash
crontab -e
```

Add this line to run tests daily at 2 AM:

```
0 2 * * * cd /root/vue-datatable && ./scripts/run-e2e-in-container.sh > /var/log/e2e-tests.log 2>&1
```

## Optional: Set Up Test Results Web Server

Install nginx to serve test reports:

```bash
apt-get install -y nginx

# Create symlink to reports
ln -s /root/vue-datatable/playwright-report /var/www/html/e2e-report

# Access at http://<container-ip>/e2e-report
```

## Troubleshooting

### Issue: Browser crashes

**Solution:** Increase container memory to 4GB

```bash
# In Proxmox host
pct set <container-id> -memory 4096
pct reboot <container-id>
```

### Issue: Dev server won't start

**Solution:** Check if port 3000 is available

```bash
netstat -tulpn | grep 3000
# Kill any process using port 3000
kill <pid>
```

### Issue: Tests timeout

**Solution:** Increase timeout in playwright.config.ts

```typescript
timeout: 60 * 1000  // Increase to 60 seconds
```

## Performance Tips

1. **Use Chromium only** for faster tests:
   ```bash
   npx playwright test --project=chromium
   ```

2. **Run tests in parallel:**
   ```bash
   npx playwright test --workers=2
   ```

3. **Skip unnecessary tests:**
   ```bash
   npx playwright test --grep "Basic Example"
   ```

## Container Resource Requirements

**Minimum (Chromium only):**
- CPU: 2 cores
- RAM: 2GB
- Disk: 10GB

**Recommended (All browsers):**
- CPU: 4 cores
- RAM: 4GB
- Disk: 20GB

**Optimal (Parallel tests):**
- CPU: 8 cores
- RAM: 8GB
- Disk: 20GB

## Example Container Configuration

In Proxmox, you can set these options:

```
# /etc/pve/lxc/<container-id>.conf
arch: amd64
cores: 4
hostname: e2e-tests
memory: 4096
net0: name=eth0,bridge=vmbr0,firewall=1,gw=192.168.1.1,hwaddr=XX:XX:XX:XX:XX:XX,ip=192.168.1.100/24,type=veth
ostype: ubuntu
rootfs: local-lvm:vm-<id>-disk-0,size=20G
swap: 2048
```

## Monitoring

View test logs in real-time:

```bash
tail -f /var/log/e2e-tests.log
```

Check container resources:

```bash
htop
```

## Next Steps

1. ✅ Container is set up
2. ✅ Tests are running
3. 🔄 Set up scheduled runs (optional)
4. 📊 Set up report hosting (optional)
5. 🔔 Set up notifications on failures (optional)

For notifications, you can use webhook services or email alerts from your cron job.
