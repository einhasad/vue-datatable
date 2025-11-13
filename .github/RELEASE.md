# Release Process

This document describes how to release a new version of datatable-vue.

## Prerequisites

1. **npm account** - Create at [npmjs.com](https://www.npmjs.com)
2. **npm token** - Generate at https://www.npmjs.com/settings/yourusername/tokens
3. **GitHub repository** - Push your code to GitHub
4. **GitHub secret** - Add `NPM_TOKEN` to repository secrets

## Setting Up NPM_TOKEN

1. Go to https://www.npmjs.com/settings/yourusername/tokens
2. Click "Generate New Token" → "Automation"
3. Copy the token
4. Go to your GitHub repository → Settings → Secrets and variables → Actions
5. Click "New repository secret"
6. Name: `NPM_TOKEN`
7. Value: Paste your token
8. Click "Add secret"

## Release Methods

### Method 1: Automated Release (Recommended)

1. **Update version in package.json**
   ```bash
   npm version patch  # 0.1.0 → 0.1.1
   npm version minor  # 0.1.1 → 0.2.0
   npm version major  # 0.2.0 → 1.0.0
   ```

2. **Push tag to GitHub**
   ```bash
   git push origin main --tags
   ```

3. **Create GitHub Release**
   - Go to Releases → Draft a new release
   - Choose the tag you just pushed
   - Add release notes
   - Click "Publish release"

4. **Automatic publishing**
   - GitHub Actions will automatically:
     ✓ Build the package
     ✓ Run tests
     ✓ Verify version
     ✓ Publish to npm
     ✓ Update release notes

### Method 2: Manual Workflow Dispatch

1. Go to Actions → Publish to npm → Run workflow
2. Enter the version to publish
3. Click "Run workflow"

## Version Numbering (Semantic Versioning)

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Pre-release Checklist

Before creating a release, ensure:

- [ ] All tests pass locally (`npm run build`)
- [ ] CHANGELOG updated (if you maintain one)
- [ ] README updated with new features
- [ ] Version bumped in package.json
- [ ] All changes committed and pushed
- [ ] Branch is up to date with main

## Publishing Flow

```
Developer               GitHub Actions              npm
    |                          |                      |
    |---[1] Push tag---------->|                      |
    |                          |                      |
    |<--[2] Pre-release check--|                      |
    |                          |                      |
    |---[3] Create release---->|                      |
    |                          |                      |
    |                          |---[4] Build----------|
    |                          |                      |
    |                          |---[5] Test-----------|
    |                          |                      |
    |                          |---[6] Publish------->|
    |                          |                      |
    |<--[7] Success-----------|<--[8] Published------|
```

## Troubleshooting

### "Version already exists"
- The version in package.json already exists on npm
- Bump the version: `npm version patch`

### "NPM_TOKEN not found"
- Go to GitHub Settings → Secrets
- Add NPM_TOKEN secret

### "Build failed"
- Check the Actions tab for error logs
- Fix the issue and push again

### "Permission denied"
- Ensure NPM_TOKEN is an "Automation" token
- Check token hasn't expired

## Testing Before Release

Test the package locally before publishing:

```bash
# Build
npm run build

# Pack and inspect
npm pack
tar -xzf datatable-vue-*.tgz
ls -la package/

# Test in another project
npm install /path/to/datatable-vue-*.tgz
```

## Post-Release

After successful release:

1. **Verify on npm**: https://www.npmjs.com/package/datatable-vue
2. **Test installation**: `npm install datatable-vue`
3. **Update documentation** if needed
4. **Announce** on social media, blog, etc.

## Emergency Unpublish

⚠️ Only use within 72 hours of publishing:

```bash
npm unpublish datatable-vue@<version> --force
```

After 72 hours, deprecate instead:

```bash
npm deprecate datatable-vue@<version> "Reason for deprecation"
```
