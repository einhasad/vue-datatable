# Diagnostic Tools Added for E2E Test Debugging

## Overview

I've added comprehensive diagnostic tools to help identify why e2e tests are timing out when waiting for `localhost:3001` API responses. These tools will show you exactly what's happening during test execution.

## What Was Added

### 1. Playwright Global Setup (`playwright.global-setup.ts`)

**Purpose:** Verifies mock API server is accessible BEFORE any tests run.

**What it does:**
- Waits up to 30 seconds for `localhost:3001/api/github/health` to respond
- Tests the search endpoint to ensure mock data is available
- Fails immediately with clear error message if server isn't accessible

**What you'll see:**
```
================================================================================
[Playwright Global Setup] Starting...
================================================================================
[Playwright Global Setup] Waiting for mock API at http://localhost:3001/api/github/health
[Playwright Global Setup] ✓ Mock API is ready!
[Playwright Global Setup] ✓ Status: ok
[Playwright Global Setup] ✓ Total repositories: 100
[Playwright Global Setup] ✓ Search endpoint working: 100 results
================================================================================
```

**If it fails:**
```
[Playwright Global Setup] ✗ FAILED: Mock API server is not responding!
[Playwright Global Setup] ✗ Expected server at: http://localhost:3001/api/github/health
[Playwright Global Setup] ✗ Make sure the webServer is configured correctly
```

### 2. Enhanced Playwright Config (`playwright.config.ts`)

**Changes:**
- Added `globalSetup` reference
- Changed `stdout: 'pipe'` → `stdout: 'inherit'`
- Changed `stderr: 'pipe'` → `stderr: 'inherit'`

**Why:** Now you can see the mock API server logs during test runs!

**What you'll see:**
```
[Mock GitHub API] Attempting to start server on port 3001...
[Mock GitHub API] ✓ Server running on http://localhost:3001
[Mock GitHub API] ✓ Health check: http://localhost:3001/api/github/health
[Mock GitHub API] ✓ Search endpoint: http://localhost:3001/api/github/search/repositories

[Mock GitHub API] 2025-11-18T... - GET /api/github/search/repositories
[Mock GitHub API] Query params: { "q": "vue", "sort": "stars", ... }
[Mock GitHub API] Response: 100 results, 10 items returned
```

### 3. Test Fixtures (`e2e/fixtures.ts`)

**Purpose:** Captures browser console logs and network traffic.

**What it captures:**
- 📝 Browser console logs (our custom logs only)
- ❌ JavaScript errors and page crashes
- 🌐 Network requests to localhost:3001
- ✅/❌ Network responses with status codes
- Network request failures with error details

**How to use:**
```typescript
// In your test file:
import { test, expect } from './fixtures'  // Instead of '@playwright/test'

test('my test', async ({ pageWithLogs }) => {  // Use pageWithLogs instead of page
  // Your test code...
})
```

**What you'll see in test output:**
```
📝 [Browser Console log] [App.vue] Initializing Grid Vue Examples App
📝 [Browser Console log] [App.vue] Environment variables: VITE_MOCK_GITHUB_API_URL: http://localhost:3001
📝 [Browser Console log] [GitHub Provider] Initializing with URL: http://localhost:3001/api/github/search/repositories
🌐 [Network Request] GET http://localhost:3001/api/github/search/repositories?q=vue&...
✅ [Network Response] 200 http://localhost:3001/api/github/search/repositories?q=vue&...
   └─ Response: 100 results, 10 items
```

### 4. Smoke Test (`e2e/smoke-test.spec.ts`)

**Purpose:** Explicitly tests mock API connectivity and configuration.

**What it tests:**
1. App loads correctly
2. Mock API health endpoint is accessible from browser
3. Environment variables are set correctly in browser
4. Search endpoint returns data
5. HTTP Provider section renders

**How to run:**
```bash
npm run test:e2e:smoke
```

**What you'll see:**
```
================================================================================
[Smoke Test] Verifying mock API accessibility...
================================================================================
[Smoke Test] Navigating to app...
[Smoke Test] Checking if page loaded...
[Smoke Test] Testing mock API health endpoint from browser context...
[Smoke Test] Health check result: { ok: true, status: 200, data: { status: 'ok', ... } }
✅ [Smoke Test] SUCCESS: Mock API is accessible from browser
[Smoke Test] App environment variables: { VITE_MOCK_GITHUB_API_URL: 'http://localhost:3001', MODE: 'development', DEV: true, PROD: false }
================================================================================
[Smoke Test] Complete!
================================================================================
```

**If it fails (example scenarios):**

**Scenario 1: VITE_MOCK_GITHUB_API_URL not set**
```
⚠️  [Smoke Test] WARNING: VITE_MOCK_GITHUB_API_URL is not set!
   The app will fall back to http://localhost:3001
   Check that examples/.env file exists and is loaded
```

**Scenario 2: Mock API not accessible**
```
❌ [Smoke Test] FAILED: Cannot reach mock API from browser!
   This means the browser cannot connect to localhost:3001
   Possible reasons:
   1. Mock server is not running
   2. CORS is blocking the request
   3. Browser security is blocking localhost connections
```

## How to Use These Tools

### Step 1: Run the Smoke Test First

```bash
npm run test:e2e:smoke
```

This will:
- Start the webServer (build + examples dev server + mock API)
- Verify mock API is accessible
- Check environment variables
- Test search endpoint

**Expected output:** All checks should pass with ✅ marks.

### Step 2: Check for These Key Indicators

#### ✅ Mock Server Started
```
[Mock GitHub API] ✓ Server running on http://localhost:3001
```

#### ✅ Environment Variable Set
```
[App.vue] Environment variables:
  - VITE_MOCK_GITHUB_API_URL: http://localhost:3001  ← Should see this!
```

#### ✅ App Using Mock API
```
[GitHub Provider] Initializing with URL: http://localhost:3001/api/github/search/repositories
[GitHub HTTP Client] Using API base URL: http://localhost:3001
```

#### ✅ Requests Going to localhost:3001
```
🌐 [Network Request] GET http://localhost:3001/api/github/search/repositories
✅ [Network Response] 200 http://localhost:3001/api/github/search/repositories
```

### Step 3: If Smoke Test Passes, Run Full E2E Suite

```bash
npm run test:e2e
```

Now with all the logging enabled, you'll see exactly what's happening.

## Troubleshooting Scenarios

### Scenario 1: "Mock server not accessible" in global setup

**What it means:** The mock API server didn't start or isn't responding.

**Check:**
1. Look for "[Mock GitHub API] ✓ Server running" message
2. If not present, the vite plugin might not be executing
3. Check if port 3001 is already in use: `lsof -ti:3001` (macOS/Linux)

**Solution:**
- Make sure `examples/vite.config.ts` includes `mockGitHubApiPlugin`
- Verify plugin is enabled: `enabled: true`
- Try killing any process on port 3001

### Scenario 2: Smoke test passes but regular tests fail

**What it means:** Mock API is working, but something else is wrong with the test setup.

**Check:**
1. Look at browser console logs in test output
2. Check for JavaScript errors
3. Verify network requests are going to localhost:3001

**Solution:**
- Review test expectations - are selectors correct?
- Check timing issues - does data need more time to load?

### Scenario 3: VITE_MOCK_GITHUB_API_URL is undefined

**What it means:** The .env file isn't being loaded by Vite.

**Check:**
1. Does `examples/.env` exist?
2. Does it contain `VITE_MOCK_GITHUB_API_URL=http://localhost:3001`?
3. Did you restart the dev server after creating it?

**Solution:**
```bash
# Verify .env file exists and has correct content
cat examples/.env

# Should show:
# VITE_MOCK_GITHUB_API_URL=http://localhost:3001

# If not, create it:
echo "VITE_MOCK_GITHUB_API_URL=http://localhost:3001" > examples/.env

# Then restart tests
```

Note: Even if undefined, the app falls back to `http://localhost:3001`, so this might not be the issue.

### Scenario 4: Network requests timing out

**What it means:** Browser is trying to connect but getting no response.

**Check test output for:**
```
🌐 [Network Request] GET http://localhost:3001/api/github/search/repositories
❌ [Network Request Failed] GET http://localhost:3001/api/github/search/repositories
   └─ Failure: net::ERR_CONNECTION_REFUSED
```

**Solution:**
- Mock server crashed after starting - check terminal for errors
- Port conflict - another service took over port 3001
- Firewall blocking localhost connections

### Scenario 5: Requests going to api.github.com instead of localhost:3001

**What it means:** App is still configured to use real GitHub API.

**Check for this in logs:**
```
[GitHub HTTP Client] Full request URL: https://api.github.com/search/repositories
```

**Instead of:**
```
[GitHub HTTP Client] Full request URL: http://localhost:3001/api/github/search/repositories
```

**Solution:**
- This would indicate the fallback isn't working
- Check examples/src/App.vue lines 1410-1450
- Verify the logic: `const apiBaseUrl = import.meta.env.VITE_MOCK_GITHUB_API_URL || 'http://localhost:3001'`

## Summary of Commands

```bash
# Run smoke test only (fastest diagnostic)
npm run test:e2e:smoke

# Run all e2e tests with logging
npm run test:e2e

# Run e2e tests in UI mode (great for debugging)
npm run test:e2e:ui

# View test report from last run
npx playwright show-report
```

## Expected Behavior (Success)

When everything is working correctly, you should see this flow:

1. **Global Setup:**
   ```
   [Playwright Global Setup] ✓ Mock API is ready!
   ```

2. **WebServer Starts:**
   ```
   [Mock GitHub API] ✓ Server running on http://localhost:3001
   ```

3. **App Initializes:**
   ```
   [App.vue] Initializing Grid Vue Examples App
   [App.vue] VITE_MOCK_GITHUB_API_URL: http://localhost:3001
   [GitHub Provider] Initializing with URL: http://localhost:3001/...
   ```

4. **Requests Work:**
   ```
   🌐 [Network Request] GET http://localhost:3001/api/github/search/repositories
   ✅ [Network Response] 200 http://localhost:3001/api/github/search/repositories
   [Mock GitHub API] Response: 100 results, 10 items returned
   ```

5. **Tests Pass:**
   ```
   ✓ All tests pass
   ```

## What To Share When Asking For Help

If tests still fail after running the smoke test, share:

1. **Full output of smoke test:**
   ```bash
   npm run test:e2e:smoke 2>&1 | tee smoke-test-output.log
   ```

2. **Check these specific things in the output:**
   - Did global setup pass? (look for "✓ Mock API is ready")
   - Did mock server start? (look for "✓ Server running")
   - What is VITE_MOCK_GITHUB_API_URL set to?
   - Are requests going to localhost:3001 or api.github.com?
   - Any error messages or red ❌ marks?

3. **Screenshots from Playwright report:**
   ```bash
   npx playwright show-report
   ```
   - Click on a failed test
   - Look at Console logs and Network tabs

These logs will show exactly where the problem is!
