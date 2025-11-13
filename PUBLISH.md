# How to Publish datatable-vue

## Prerequisites

Before publishing, ensure you have:
1. ✅ npm account created at [npmjs.com](https://www.npmjs.com)
2. ✅ Package name is available (search at npmjs.com)
3. ✅ All changes committed to git
4. ✅ Build passes locally

## Method 1: Publish Locally (Manual)

This is the quickest way to publish your first version:

### Step 1: Login to npm

```bash
npm login

# You'll be prompted for:
# Username: your-npm-username
# Password: (your password - won't be visible)
# Email: (public) your-email@example.com

# Optional: One-Time Password (if 2FA enabled)
```

**Verify login:**
```bash
npm whoami
# Should output your username
```

### Step 2: Update Package Name (Important!)

Before publishing, replace `yourusername` with your actual GitHub username:

```bash
# In package.json, update:
# "repository": { "url": "git+https://github.com/YOUR_ACTUAL_USERNAME/datatable-vue.git" }
# "bugs": { "url": "https://github.com/YOUR_ACTUAL_USERNAME/datatable-vue/issues" }
# "homepage": "https://github.com/YOUR_ACTUAL_USERNAME/datatable-vue#readme"
```

### Step 3: Build the Package

```bash
# Make sure you're in the lib directory
cd /Users/dimapopov/www/elite-vehicle/elite-vehicle-backend/frontend/lib

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build

# Verify build output
ls -la dist/
```

### Step 4: Test Package Before Publishing

```bash
# Dry run to see what will be published
npm publish --dry-run

# Should show ~28 files, ~61 KB
```

### Step 5: Publish!

```bash
# Publish to npm with provenance
npm publish --provenance --access public

# Expected output:
# + datatable-vue@0.1.0
```

### Step 6: Verify Published Package

```bash
# Check on npm
npm view datatable-vue

# Test installation
cd /tmp
mkdir test-install
cd test-install
npm init -y
npm install datatable-vue

# Should download successfully
```

## Method 2: Publish via GitHub Actions (Automated)

This is the recommended approach for future releases.

### Step 1: Generate npm Token

```bash
# Generate automation token
npm token create --read-only=false

# Copy the token that starts with "npm_"
```

### Step 2: Add Token to GitHub

1. Go to: `https://github.com/YOUR_USERNAME/datatable-vue/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `NPM_TOKEN` (exactly this)
4. Value: Paste your `npm_` token
5. Click "Add secret"

### Step 3: Create GitHub Repository (if not done)

```bash
# Initialize repo and push
git remote add origin https://github.com/YOUR_USERNAME/datatable-vue.git
git branch -M main
git push -u origin main
```

### Step 4: Create Release

```bash
# Tag the version
git tag v0.1.0

# Push tag
git push origin v0.1.0

# Create release on GitHub:
# Go to: https://github.com/YOUR_USERNAME/datatable-vue/releases/new
# - Choose tag: v0.1.0
# - Title: v0.1.0 - Initial Release
# - Click "Publish release"

# GitHub Actions will automatically publish to npm!
```

## Common Errors and Solutions

### Error: "need auth"
**Solution:** Run `npm login` first

```bash
npm login
# Then try publishing again
```

### Error: "package name taken"
**Solution:** The name `datatable-vue` might be taken. Options:

1. **Check if available:**
   ```bash
   npm view datatable-vue
   # If it exists, you'll see package info
   ```

2. **Use scoped package:**
   ```json
   // In package.json
   "name": "@your-username/datatable-vue"
   ```

3. **Choose different name:**
   ```json
   "name": "vue-datatable-grid"
   ```

### Error: "402 Payment Required"
**Solution:** You need to publish as public (free)

```bash
npm publish --access public
```

### Error: "You cannot publish over the previously published versions"
**Solution:** Bump version

```bash
npm version patch  # 0.1.0 → 0.1.1
npm publish --access public
```

### Error: "EPUBLISHCONFLICT"
**Solution:** Package name conflicts with existing package

```bash
# Use scoped name
npm publish --access public --scope=@your-username
```

## Scoped Package Alternative

If the package name is taken, use a scoped package:

```json
// package.json
{
  "name": "@dimapopov/datatable-vue",
  // ... rest of config
}
```

Then publish:
```bash
npm publish --access public
```

Users will install with:
```bash
npm install @dimapopov/datatable-vue
```

## Checklist Before First Publish

- [ ] Logged in to npm (`npm whoami` works)
- [ ] Package name is available or scoped
- [ ] Version is `0.1.0` in package.json
- [ ] Build succeeds (`npm run build`)
- [ ] All git changes committed
- [ ] Repository URLs updated with correct username
- [ ] README is complete
- [ ] LICENSE file exists

## After Publishing

1. **Verify on npm:**
   - Visit: https://www.npmjs.com/package/datatable-vue
   - Should show your package

2. **Test installation:**
   ```bash
   npm install datatable-vue
   ```

3. **Update README badge (optional):**
   ```markdown
   [![npm version](https://badge.fury.io/js/datatable-vue.svg)](https://www.npmjs.com/package/datatable-vue)
   ```

4. **Share:**
   - Tweet about it
   - Post on Reddit r/vuejs
   - Add to awesome-vue lists

## Version Bumping

For future releases:

```bash
# Bug fixes (0.1.0 → 0.1.1)
npm version patch

# New features (0.1.0 → 0.2.0)
npm version minor

# Breaking changes (0.1.0 → 1.0.0)
npm version major

# Then publish
npm publish --access public
```

## Unpublishing (Emergency Only)

⚠️ Only possible within 72 hours:

```bash
npm unpublish datatable-vue@0.1.0 --force
```

After 72 hours, use deprecate:

```bash
npm deprecate datatable-vue@0.1.0 "Reason for deprecation"
```

## Need Help?

- npm documentation: https://docs.npmjs.com/
- npm support: https://www.npmjs.com/support
- GitHub Issues: https://github.com/YOUR_USERNAME/datatable-vue/issues
