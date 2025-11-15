# GitHub Actions Self-Hosted Runner Setup

This guide shows how to set up a GitHub Actions self-hosted runner in a Proxmox LXC container to run e2e tests for the vue-datatable project.

## Why Self-Hosted Runners?

**Benefits:**
- ✅ **Unlimited CI/CD minutes** (GitHub free tier has limits)
- ✅ **Run e2e tests** (not possible on GitHub's free runners)
- ✅ **Faster builds** (no queue time)
- ✅ **Full control** over environment
- ✅ **Custom hardware** (use your Proxmox server)
- ✅ **Persistent caching** (faster npm installs)

**Use Cases:**
- Running Playwright e2e tests with browsers
- Heavy builds that exceed free tier limits
- Tests requiring specific hardware/software
- Private repositories with many workflows

## Prerequisites

1. **Proxmox server** with LXC support
2. **GitHub repository** admin access
3. **Ubuntu 22.04 or 24.04** LXC container

## Step 1: Create LXC Container in Proxmox

### Recommended Container Specs

```conf
CPU: 4 cores (minimum 2)
RAM: 4096 MB (minimum 2048 MB)
Swap: 2048 MB
Disk: 32 GB (minimum 16 GB)
OS: Ubuntu 22.04 or 24.04 LTS
```

### Create Container via Proxmox UI

1. Click **"Create CT"** in Proxmox web interface
2. **General:**
   - CT ID: Auto or choose (e.g., 200)
   - Hostname: `github-runner-e2e`
   - Unprivileged container: ✓
   - Password: Set root password
3. **Template:**
   - Storage: local
   - Template: ubuntu-22.04-standard or ubuntu-24.04-standard
4. **Resources:**
   - Cores: 4
   - Memory: 4096 MB
   - Swap: 2048 MB
5. **Network:**
   - Bridge: vmbr0
   - IPv4: DHCP or Static
6. **DNS:** Use host settings ✓
7. Click **Finish**

### Start and Access Container

```bash
# On Proxmox host
pct start 200
pct enter 200

# OR via SSH (if you set up static IP)
ssh root@192.168.1.100
```

## Step 2: Run Setup Script

Inside the LXC container:

```bash
# Download the repository
git clone https://github.com/einhasad/vue-datatable.git
cd vue-datatable
git checkout claude/deduplicate-examples-tests-01TDi6FQBtiRnxVHQL2XAZDX

# Make setup script executable
chmod +x scripts/setup-github-runner.sh

# Run setup (as root)
./scripts/setup-github-runner.sh
```

This script will:
- Install Node.js 20
- Install Playwright browser dependencies
- Create `github-runner` user
- Download latest GitHub Actions runner
- Set up directory structure

## Step 3: Get Runner Registration Token

1. Go to your GitHub repository: `https://github.com/einhasad/vue-datatable`
2. Navigate to: **Settings** → **Actions** → **Runners**
3. Click **"New self-hosted runner"**
4. Select **Linux** and **x64**
5. Copy the **registration token** (starts with `A...`)

**Important:** The token expires after 1 hour. If it expires, generate a new one.

## Step 4: Configure the Runner

Run these commands inside the container:

```bash
# Switch to github-runner user
sudo su - github-runner

# Navigate to runner directory
cd /home/github-runner/actions-runner

# Configure the runner (replace YOUR_TOKEN with the token from Step 3)
./config.sh \
  --url https://github.com/einhasad/vue-datatable \
  --token YOUR_TOKEN \
  --name "proxmox-e2e-runner" \
  --labels "self-hosted,Linux,X64,e2e,playwright" \
  --work _work
```

**Configuration prompts:**
- Enter the name of runner group: `[press Enter for default]`
- Enter name of work folder: `[press Enter for default]`
- Runner already exists: `Y` (if re-configuring)

## Step 5: Install Runner as a Service

Exit back to root and install the systemd service:

```bash
# Exit github-runner user
exit

# Install service (as root)
cd /home/github-runner/actions-runner
./svc.sh install github-runner

# Start the service
./svc.sh start

# Check status
./svc.sh status
```

**Expected output:**
```
● actions.runner.einhasad-vue-datatable.proxmox-e2e-runner.service - GitHub Actions Runner
     Loaded: loaded
     Active: active (running)
```

## Step 6: Install Project Dependencies

The runner needs Playwright browsers and project dependencies:

```bash
# Switch to github-runner user
sudo su - github-runner

# Clone and set up project
cd ~
git clone https://github.com/einhasad/vue-datatable.git
cd vue-datatable
git checkout claude/deduplicate-examples-tests-01TDi6FQBtiRnxVHQL2XAZDX

# Install dependencies
npm install
cd examples && npm install && cd ..

# Install Playwright browsers (this takes a few minutes)
npx playwright install --with-deps chromium firefox webkit
```

## Step 7: Verify Runner in GitHub

1. Go to: **Settings** → **Actions** → **Runners**
2. You should see your runner: `proxmox-e2e-runner`
3. Status should be: **Idle** (green circle)

## Step 8: Update GitHub Actions Workflow

The workflow in `.github/workflows/test.yml` needs to be updated to use your self-hosted runner for e2e tests.

**Before (e2e tests disabled):**
```yaml
# e2e tests removed - not compatible with free GitHub Actions
```

**After (use self-hosted runner):**
```yaml
e2e-tests:
  name: E2E Tests
  runs-on: [self-hosted, e2e, playwright]
  steps:
    - uses: actions/checkout@v4

    - name: Install dependencies
      run: |
        npm ci
        cd examples && npm ci && cd ..

    - name: Build library
      run: npm run build

    - name: Extract examples
      run: npm run extract:examples

    - name: Run Playwright tests
      run: npx playwright test --config=playwright.config.simple.ts

    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## Runner Management

### View Runner Logs

```bash
# Real-time logs
sudo journalctl -u actions.runner.* -f

# Last 100 lines
sudo journalctl -u actions.runner.* -n 100
```

### Stop/Start/Restart Runner

```bash
cd /home/github-runner/actions-runner

# Stop
sudo ./svc.sh stop

# Start
sudo ./svc.sh start

# Restart
sudo ./svc.sh stop && sudo ./svc.sh start

# Check status
sudo ./svc.sh status
```

### Uninstall Runner

```bash
# Stop and remove service
cd /home/github-runner/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall

# Remove runner from GitHub
./config.sh remove --token YOUR_TOKEN
```

### Update Runner

GitHub Actions runner auto-updates, but if you need to manually update:

```bash
cd /home/github-runner/actions-runner
sudo ./svc.sh stop

# Download latest version
LATEST_VERSION=$(curl -s https://api.github.com/repos/actions/runner/releases/latest | jq -r '.tag_name' | sed 's/v//')
curl -o actions-runner-linux-x64-${LATEST_VERSION}.tar.gz -L \
  https://github.com/actions/runner/releases/download/v${LATEST_VERSION}/actions-runner-linux-x64-${LATEST_VERSION}.tar.gz

# Extract (this will replace files)
tar xzf actions-runner-linux-x64-${LATEST_VERSION}.tar.gz
sudo chown -R github-runner:github-runner .

# Restart
sudo ./svc.sh start
```

## Troubleshooting

### Runner Shows as Offline

**Check service status:**
```bash
sudo systemctl status actions.runner.*
```

**Check logs:**
```bash
sudo journalctl -u actions.runner.* -n 50
```

**Common fixes:**
```bash
# Restart service
cd /home/github-runner/actions-runner
sudo ./svc.sh restart

# Check network connectivity
ping github.com

# Verify token hasn't expired
# If expired, reconfigure with new token
```

### E2E Tests Fail with "Browser not found"

**Solution:**
```bash
sudo su - github-runner
cd ~/vue-datatable
npx playwright install --with-deps chromium firefox webkit
```

### Out of Memory Errors

**Solution: Increase container memory**
```bash
# On Proxmox host
pct set 200 -memory 6144
pct reboot 200
```

### Permission Denied Errors

**Solution:**
```bash
# Fix ownership
sudo chown -R github-runner:github-runner /home/github-runner/actions-runner
sudo chown -R github-runner:github-runner /home/github-runner/vue-datatable
```

### Runner Gets Stuck on Job

**Solution:**
```bash
# Force restart
cd /home/github-runner/actions-runner
sudo ./svc.sh stop
sudo pkill -9 -u github-runner  # Kill any stuck processes
sudo ./svc.sh start
```

## Security Best Practices

1. **Dedicated container:** Use a separate LXC container only for GitHub runners
2. **Firewall:** Only allow outbound HTTPS (443) to GitHub
3. **No secrets in logs:** Ensure sensitive data is masked in workflow logs
4. **Regular updates:** Keep Ubuntu and runner software updated
5. **Monitoring:** Set up alerts for runner downtime
6. **Backup:** Back up container config (but not the _work directory)

## Resource Usage

**Expected resource usage during e2e tests:**
- CPU: 200-400% (2-4 cores utilized)
- RAM: 2-3 GB
- Disk I/O: Moderate (browser cache, screenshots)
- Network: ~100-500 MB (npm packages, browser downloads)

**Idle runner:**
- CPU: <1%
- RAM: ~100 MB
- Disk: ~2 GB

## Cost Savings

**GitHub Actions pricing (as of 2025):**
- Free tier: 2,000 minutes/month for private repos
- Paid: $0.008/minute for Linux runners

**Example savings:**
- E2E test runs: ~5 minutes each
- 100 PR pushes/month: 500 minutes
- Cost with GitHub runners: $4/month
- Cost with self-hosted: $0 (you pay for Proxmox power only)

**Annual savings:** ~$48 + unlimited usage

## Advanced: Multiple Runners

To run multiple runners for parallel jobs:

```bash
# Create additional LXC containers (201, 202, etc.)
# Run setup script in each
# Register each with unique names:
./config.sh --url ... --name "proxmox-e2e-runner-1"
./config.sh --url ... --name "proxmox-e2e-runner-2"
```

**Workflow for parallel execution:**
```yaml
e2e-tests:
  strategy:
    matrix:
      browser: [chromium, firefox, webkit]
  runs-on: [self-hosted, e2e, playwright]
  # Runs 3 jobs in parallel if you have 3 runners
```

## Monitoring Dashboard

**Optional: Set up monitoring with Prometheus/Grafana:**

1. Install prometheus-node-exporter in container
2. Export metrics to Grafana
3. Monitor: CPU, RAM, disk, job success rate, job duration

## References

- [GitHub Docs: Self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [GitHub Docs: Adding self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
- [Proxmox LXC Documentation](https://pve.proxmox.com/wiki/Linux_Container)

## Support

If you encounter issues:

1. Check runner logs: `sudo journalctl -u actions.runner.* -f`
2. Review GitHub Actions job logs in GitHub UI
3. Verify network connectivity to github.com
4. Check container resource usage: `htop`
5. Ensure Playwright browsers are installed

For project-specific issues, see the main README and CLAUDE.md documentation.
