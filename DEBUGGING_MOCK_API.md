# Debugging Mock GitHub API Integration

This guide helps diagnose issues with the mock GitHub API integration in the examples and e2e tests.

## Quick Checklist

- [ ] Mock API server is running on port 3001
- [ ] Examples app can connect to localhost:3001
- [ ] Environment variable `VITE_MOCK_GITHUB_API_URL` is set correctly
- [ ] No CORS errors in browser console
- [ ] Examples app is using mock API, not real api.github.com

## Expected Log Output

When everything is working correctly, you should see these logs:

### 1. Vite Plugin Startup Logs

```
[Mock GitHub API] Attempting to start server on port 3001...
[Mock GitHub API] ✓ Server running on http://localhost:3001
[Mock GitHub API] ✓ Health check: http://localhost:3001/api/github/health
[Mock GitHub API] ✓ Search endpoint: http://localhost:3001/api/github/search/repositories
```

**If you see:** `⚠ Port 3001 is already in use`
- **Solution:** Stop other instances of the mock server or change the port in `examples/vite.config.ts`

### 2. App Initialization Logs (Browser Console)

```
================================================================================
[App.vue] Initializing Grid Vue Examples App
[App.vue] Timestamp: 2025-11-18T...
[App.vue] Environment variables:
  - VITE_MOCK_GITHUB_API_URL: http://localhost:3001
  - MODE: development
  - DEV: true
  - PROD: false
  - BASE_URL: /vue-datatable/
[App.vue] Window location: http://localhost:3000/vue-datatable/
================================================================================
```

**If `VITE_MOCK_GITHUB_API_URL` is undefined:**
- **Solution:** Check that `examples/.env` file exists with `VITE_MOCK_GITHUB_API_URL=http://localhost:3001`
- **Solution:** Restart the dev server (Vite only loads .env on startup)

### 3. GitHub Provider Initialization Logs (Browser Console)

```
[GitHub Provider] Initializing with URL: http://localhost:3001/api/github/search/repositories
[GitHub Provider] Environment variables: {...}
```

**If the URL is different:**
- **Check:** The URL should be `http://localhost:3001/api/github/search/repositories`
- **Not:** `https://api.github.com/search/repositories`

### 4. HTTP Client Request Logs (Browser Console)

When the GitHub API example loads or you perform a search:

```
[GitHub HTTP Client] Environment variable VITE_MOCK_GITHUB_API_URL: http://localhost:3001
[GitHub HTTP Client] Using API base URL: http://localhost:3001
[GitHub HTTP Client] Full request URL: http://localhost:3001/api/github/search/repositories?q=vue+table&sort=stars&order=desc&per_page=10&page=1
[GitHub HTTP Client] Search params: { q: 'vue table', sort: 'stars', page: '1' }
```

Followed by:

```
[GitHub HTTP Client] Response status: 200 OK
[GitHub HTTP Client] Response data: { total_count: 100, items_count: 10, incomplete_results: false }
```

**If you see network errors:**
- **Check:** Is the mock API server running? Test manually: `curl http://localhost:3001/api/github/health`
- **Check:** Browser dev tools Network tab for failed requests
- **Check:** CORS errors in console

### 5. Mock API Server Logs (Terminal)

For each request, you should see:

```
[Mock GitHub API] 2025-11-18T... - GET /api/github/search/repositories
[Mock GitHub API] Query params: {
  "q": "vue table",
  "sort": "stars",
  "order": "desc",
  "per_page": "10",
  "page": "1"
}
[Mock GitHub API] Response: 100 results, 10 items returned
```

**If you don't see these logs:**
- **Problem:** Requests aren't reaching the mock server
- **Check:** Network tab in browser - are requests going to localhost:3001 or api.github.com?
- **Check:** Browser console for fetch errors

## Common Issues

### Issue 1: Tests Timeout Waiting for API Response

**Symptom:**
```
Error: page.waitForResponse: Test timeout of 30000ms exceeded.
response.url().includes('localhost:3001/api/github/search/repositories')
```

**Possible Causes:**
1. Mock API server not running
2. App still calling real GitHub API (api.github.com) instead of mock
3. Network requests blocked by firewall/security software
4. Port 3001 is in use by another process

**Debug Steps:**
1. Check terminal logs for mock API startup messages
2. Check browser console in Playwright traces for actual URL being called
3. Test manually: `curl http://localhost:3001/api/github/health`
4. Look for "[GitHub HTTP Client] Full request URL" in logs

### Issue 2: VITE_MOCK_GITHUB_API_URL is undefined

**Symptom:**
```
[App.vue] Environment variables:
  - VITE_MOCK_GITHUB_API_URL: undefined
```

**Solution:**
1. Ensure `examples/.env` exists with:
   ```
   VITE_MOCK_GITHUB_API_URL=http://localhost:3001
   ```
2. Restart Vite dev server (Ctrl+C then `npm run dev`)
3. Clear browser cache and reload

### Issue 3: Elements Not Found in E2E Tests

**Symptom:**
```
Error: expect(locator).toBeVisible() failed
Locator: locator('#http-provider').locator('.control-group:has-text("Results:")')
```

**Possible Causes:**
1. Data not loading because API requests are failing
2. JavaScript errors preventing rendering
3. Timing issues - page loading slower than expected

**Debug Steps:**
1. Check browser console in Playwright traces for JavaScript errors
2. Look for mock API request/response logs
3. Verify mock API is returning data: `curl 'http://localhost:3001/api/github/search/repositories?q=vue&page=1&per_page=10'`
4. Check if the response has the expected structure

### Issue 4: Port Already in Use

**Symptom:**
```
[Mock GitHub API] ⚠ Port 3001 is already in use. Mock server not started.
```

**Solutions:**
1. Find and kill the process using port 3001:
   ```bash
   # On macOS/Linux
   lsof -ti:3001 | xargs kill -9

   # On Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```
2. Or change the port in `examples/vite.config.ts` and `examples/.env`

## Manual Testing

To verify the mock API is working:

```bash
# 1. Start the examples dev server
cd examples
npm run dev

# 2. In another terminal, test the health endpoint
curl http://localhost:3001/api/github/health

# Expected output:
# {"status":"ok","message":"Mock GitHub API is running","totalRepositories":100}

# 3. Test the search endpoint
curl 'http://localhost:3001/api/github/search/repositories?q=vue&sort=stars&order=desc&page=1&per_page=5'

# Expected output: JSON with total_count, incomplete_results, and items array
```

## E2E Test Debugging

### Enable Playwright UI Mode

```bash
npm run test:e2e -- --ui
```

This opens Playwright's UI where you can:
- See screenshots and videos of test failures
- Step through tests
- Inspect browser console logs
- View network requests

### View Test Traces

After a test run, view the HTML report:

```bash
npx playwright show-report
```

Click on failed tests to see:
- Screenshots at point of failure
- Browser console logs
- Network requests
- Test timeline

### Enable Playwright Debug Mode

```bash
PWDEBUG=1 npm run test:e2e
```

This opens a headed browser and pauses at each step.

## Additional Debugging

### Enable Verbose Logging

In `examples/vite.config.ts`, change:

```typescript
mockGitHubApiPlugin({
  port: 3001,
  enabled: true,
  verbose: true  // Change to true
})
```

This enables additional HTTP header logging in the mock server.

### Check Network Requests in Browser

1. Open http://localhost:3000/vue-datatable/
2. Open DevTools (F12)
3. Go to Network tab
4. Navigate to the GitHub API example
5. Look for requests to verify:
   - Are they going to `localhost:3001` or `api.github.com`?
   - What's the response status?
   - Any CORS errors?

## Getting Help

If you're still stuck, gather this information:

1. **Terminal logs** - Full output from `npm run dev` in examples/
2. **Browser console logs** - From DevTools Console tab
3. **Network requests** - From DevTools Network tab, especially failed requests
4. **Playwright trace** - From `npx playwright show-report` after failed test run
5. **Environment info**:
   ```bash
   node -v
   npm -v
   cat examples/.env
   ```

Share these logs when asking for help.
