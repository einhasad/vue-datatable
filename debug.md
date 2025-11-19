# E2E Test Debug Guide

**Status:** 21/23 tests passing
**Failing Tests:** 2

---

## Test 1: "should show total results count"

### Location
`e2e/examples.spec.ts:225`

### Error
```
Error: expect(locator).toBeVisible() failed
Locator: locator('#http-provider').locator('.control-group:has-text("Results:")')
Expected: visible
Timeout: 1000ms
```

### What the Test Does
1. Navigates to `/#http-provider`
2. Waits for API response from mock server
3. Waits for grid data to load (first row visible)
4. Checks if `responseData.total_count > 0`
5. **FAILS HERE:** Expects to see "Results: X repositories" text

### Root Cause Analysis

#### Step 1: Understand the Data Flow
```
Mock API Response (total_count: 11)
  ↓
githubHttpClient() receives response
  ↓
GitHubSearchAdapter.extractPagination(response)
  - Extracts: response.total_count → pagination.totalCount
  ↓
Grid component updates pagination property
  ↓
Vue Watcher triggers (githubGridRef.value?.pagination)
  ↓
githubTotalCount.value = paginationData.totalCount
  ↓
UI re-renders with v-if="githubTotalCount > 0"
  ↓
"Results: X repositories" becomes visible
```

#### Step 2: Identify the Problem
The test has a **race condition**:

```typescript
// Test code (lines 241-247)
await expect(grid.locator('tbody tr').first()).toBeVisible()  // ✓ Grid data loaded

if (responseData.total_count > 0) {
  const resultsText = section.locator('.control-group:has-text("Results:")')
  await expect(resultsText).toBeVisible()  // ✗ FAILS - watcher hasn't fired yet!
}
```

**Problem:** The test checks for the Results text immediately after grid data is visible, but the Vue watcher that updates `githubTotalCount` runs **asynchronously**. The UI hasn't updated yet.

#### Step 3: Verify in Code

**App.vue line 257:**
```vue
<div class="control-group" v-if="githubTotalCount > 0">
  <span>Results: {{ githubTotalCount.toLocaleString() }} repositories</span>
</div>
```

**App.vue lines 1556-1560:**
```typescript
watch(() => githubGridRef.value?.pagination, (paginationData) => {
  if (paginationData) {
    githubTotalCount.value = (paginationData as any).totalCount || 0  // Updates here
  }
}, { deep: true })
```

**Timing Issue:**
1. Grid renders data → tbody tr becomes visible ✓
2. Test immediately checks for Results text ✗
3. **Shortly after**, watcher fires and updates githubTotalCount ✓ (too late!)

---

### Fix Variants

#### **Variant 1: Wait for Watcher to Complete** ⭐ RECOMMENDED
Add a small wait for Vue reactivity to complete:

```typescript
// Wait for grid to have data
await expect(grid.locator('tbody tr').first()).toBeVisible()

// Only check for results count if API returned results
if (responseData.total_count > 0) {
  // Wait for Vue watcher to update githubTotalCount
  const resultsText = section.locator('.control-group:has-text("Results:")')
  await expect(resultsText).toBeVisible({ timeout: 2000 })  // Give watcher time
  await expect(resultsText).toContainText('repositories')
}
```

**Pros:** Simple, addresses root cause
**Cons:** Adds 1-2s to test time

---

#### **Variant 2: Wait for Specific Count to Appear**
More robust - wait for the actual count value:

```typescript
// Wait for grid to have data
await expect(grid.locator('tbody tr').first()).toBeVisible()

if (responseData.total_count > 0) {
  // Wait for specific count to appear
  const expectedCount = responseData.total_count.toLocaleString()
  await expect(section.locator('.control-group')).toContainText(`${expectedCount} repositories`)
}
```

**Pros:** More precise, verifies correct count
**Cons:** Brittle if formatting changes

---

#### **Variant 3: Poll for Element Visibility**
Use Playwright's auto-waiting with retry logic:

```typescript
// Wait for grid to have data
await expect(grid.locator('tbody tr').first()).toBeVisible()

if (responseData.total_count > 0) {
  // Playwright will auto-retry for 1s (default timeout)
  await page.locator('#http-provider .control-group:has-text("repositories")').waitFor({
    state: 'visible',
    timeout: 2000
  })
}
```

**Pros:** Explicit polling, built-in retry
**Cons:** Verbose

---

#### **Variant 4: Check Count After Small Delay**
Quick and dirty - add explicit wait:

```typescript
// Wait for grid to have data
await expect(grid.locator('tbody tr').first()).toBeVisible()

// Give Vue watcher time to fire (not ideal but works)
await page.waitForTimeout(100)

if (responseData.total_count > 0) {
  const resultsText = section.locator('.control-group:has-text("Results:")')
  await expect(resultsText).toBeVisible()
  await expect(resultsText).toContainText('repositories')
}
```

**Pros:** Fast, simple
**Cons:** Uses arbitrary timeout (user specifically said to remove these!)

---

#### **Variant 5: Change Assertion Timeout Only**
Increase timeout just for this assertion:

```typescript
// Wait for grid to have data
await expect(grid.locator('tbody tr').first()).toBeVisible()

if (responseData.total_count > 0) {
  const resultsText = section.locator('.control-group:has-text("Results:")')
  // Increase timeout from 1s to 3s just for this check
  await expect(resultsText).toBeVisible({ timeout: 3000 })
  await expect(resultsText).toContainText('repositories')
}
```

**Pros:** Minimal change, no arbitrary waits
**Cons:** Still adds time to test

---

#### **Variant 6: Fix the Root Cause in App.vue** ⭐ BEST LONG-TERM
Make the watcher synchronous by using `flush: 'sync'`:

```typescript
// App.vue line 1556
watch(() => githubGridRef.value?.pagination, (paginationData) => {
  if (paginationData) {
    githubTotalCount.value = (paginationData as any).totalCount || 0
  }
}, { deep: true, flush: 'sync' })  // ← Add this
```

Then no test changes needed!

**Pros:** Fixes root cause, all tests work
**Cons:** Changes production code, may affect other watchers

---

## Test 2: "should restore state after page refresh"

### Location
`e2e/examples.spec.ts:344`

### Error
```
Test timeout of 30000ms exceeded.
Error: page.waitForResponse: Test timeout of 30000ms exceeded.

Line 378: const reloadResponsePromise = page.waitForResponse(response =>
  response.url().includes('localhost:3001/api/search/repositories') &&
  response.url().includes('q=') &&
  response.url().includes('sort=forks')
)
```

### What the Test Does
1. Navigate to `/#http-provider`
2. Fill search input with "react hooks"
3. Select sort "forks"
4. Click search button
5. Verify URL contains `gh-q=react+hooks` and `gh-sort=forks`
6. **Set up response waiter for reload**
7. **FAILS HERE:** `page.reload()` - no API call happens

### Root Cause Analysis

#### Step 1: Understand URL State Management

**Before reload URL:**
```
http://localhost:3000/vue-datatable/#http-provider?gh-q=react+hooks&gh-sort=forks
```

**After reload:**
The app should:
1. Read `gh-q` and `gh-sort` from URL query params
2. Populate `githubSearchQuery` and `githubSortBy` refs
3. Trigger API call with those values

#### Step 2: Check State Initialization

**App.vue lines 1402-1403:**
```typescript
const githubSearchQuery = ref((route.query['gh-q'] as string) || 'vue table')
const githubSortBy = ref((route.query['gh-sort'] as string) || 'stars')
```

**App.vue lines 1563-1573:**
```typescript
watch(() => route.query, () => {
  const urlQuery = route.query['gh-q'] as string
  const urlSort = route.query['gh-sort'] as string

  if (urlQuery && urlQuery !== githubSearchQuery.value) {
    githubSearchQuery.value = urlQuery
  }
  if (urlSort && urlSort !== githubSortBy.value) {
    githubSortBy.value = urlSort
  }
}, { immediate: true })
```

#### Step 3: Identify the Problem

**Problem 1: HttpDataProvider URL Construction**

The provider is initialized with this config:
```typescript
const githubProvider = new HttpDataProvider({
  url: githubProviderUrl,  // http://localhost:3001/api/search/repositories
  // ...
  httpClient: githubHttpClient,
  stateProvider: new QueryParamsStateProvider({
    router,
    prefix: 'gh'
  })
})
```

**When does the provider make an API call?**
- Initial load: Yes (default query: "vue table")
- User search: Yes (via handleGithubSearch → grid.refresh())
- **Page reload: MAYBE NOT**

**Problem 2: Grid Not Auto-Refreshing on Reload**

The Grid component doesn't automatically refresh on page reload. The HttpDataProvider needs to be told to load data.

**Current flow on reload:**
1. Page reloads
2. Vue app re-initializes
3. `githubSearchQuery` and `githubSortBy` initialize from URL ✓
4. `githubProvider` is created ✓
5. **Grid component mounted... but does it trigger load?** ❓

#### Step 4: Check Grid Component Behavior

The Grid component should trigger an initial load when mounted. But on a **reload**, the state is restored from URL, but the Grid might not know to fetch new data.

**Possible issues:**
- Grid doesn't auto-load on mount with HttpDataProvider
- StateProvider reads URL params but doesn't trigger data fetch
- Router navigation after reload doesn't trigger the Grid to refresh

---

### Fix Variants

#### **Variant 1: Remove URL Parameter Check** ⭐ QUICK FIX
The test matcher is too strict:

```typescript
// BEFORE (line 378-382)
const reloadResponsePromise = page.waitForResponse(response =>
  response.url().includes('localhost:3001/api/search/repositories') &&
  response.url().includes('q=') &&
  response.url().includes('sort=forks')
)

// AFTER
const reloadResponsePromise = page.waitForResponse(response =>
  response.url().includes('localhost:3001/api/search/repositories')
  // Don't check query params - just verify API is called
)
```

**Then after waiting, verify the response has correct params:**
```typescript
await reloadResponsePromise
const reloadedUrl = await reloadResponsePromise.url()
expect(reloadedUrl).toContain('q=')
expect(reloadedUrl).toContain('sort=forks')
```

**Pros:** Simple fix
**Cons:** Doesn't solve if API isn't called at all

---

#### **Variant 2: Make Response Waiter Optional**
Don't fail if no API call happens (might be cached):

```typescript
// Set up response waiter with longer timeout
const reloadResponsePromise = page.waitForResponse(
  response => response.url().includes('localhost:3001/api/search/repositories'),
  { timeout: 5000 }
).catch(() => null)  // Don't fail if no response

await page.reload()

const response = await reloadResponsePromise
if (response) {
  console.log('[Test] API called after reload:', response.url())
} else {
  console.log('[Test] No API call after reload (might be using cached data)')
}

// Verify the grid still has correct data
const grid = section.locator('[data-qa="grid"]')
await expect(grid.locator('tbody tr').first()).toBeVisible()
```

**Pros:** Handles both cached and fresh data
**Cons:** Less strict verification

---

#### **Variant 3: Verify State Instead of API Call**
Check that the search input and sort dropdown still have correct values:

```typescript
// Reload the page
await page.reload()

// Wait for page to be ready
await page.waitForLoadState('networkidle')

// Verify state was restored from URL
await expect(searchInput).toHaveValue('react hooks')
await expect(sortSelect).toHaveValue('forks')

// Verify URL still has parameters
expect(page.url()).toContain('gh-q=react+hooks')
expect(page.url()).toContain('gh-sort=forks')

// Verify grid has data (doesn't matter if from cache or fresh API call)
const grid = section.locator('[data-qa="grid"]')
await expect(grid.locator('tbody tr').first()).toBeVisible()
```

**Pros:** Tests actual user-visible behavior
**Cons:** Doesn't verify API was called

---

#### **Variant 4: Debug What URL is Actually Requested**
Add logging to see what's happening:

```typescript
// Set up listener for ALL requests
page.on('request', request => {
  if (request.url().includes('search/repositories')) {
    console.log('[Test] API Request:', request.url())
  }
})

// Set up response waiter
const reloadResponsePromise = page.waitForResponse(
  response => response.url().includes('localhost:3001/api/search/repositories'),
  { timeout: 10000 }
)

console.log('[Test] Reloading page...')
await page.reload()

console.log('[Test] Waiting for API response...')
const response = await reloadResponsePromise
console.log('[Test] Got response:', response.url())
```

**Pros:** Helps diagnose the actual issue
**Cons:** Debug code, not a fix

---

#### **Variant 5: Trigger Refresh After Reload** ⭐ RELIABLE
Explicitly trigger grid refresh after reload:

```typescript
// Reload the page
await page.reload()

// Wait for page to load
await page.waitForLoadState('networkidle')

// Trigger search to force API call
const reloadResponsePromise = page.waitForResponse(response =>
  response.url().includes('localhost:3001/api/search/repositories')
)

// Click the search button to trigger refresh
await section.locator('button.btn-primary').click()

await reloadResponsePromise

// Verify data loaded
const grid = section.locator('[data-qa="grid"]')
await expect(grid.locator('tbody tr').first()).toBeVisible()
```

**Pros:** Guarantees API call happens
**Cons:** Changes test behavior (not testing auto-restore anymore)

---

#### **Variant 6: Fix App.vue to Auto-Refresh on Reload** ⭐ BEST
Make the Grid auto-refresh when URL params are present on mount:

```typescript
// App.vue - add after githubProvider definition
onMounted(() => {
  // If URL has search params, trigger initial load
  if (route.query['gh-q'] || route.query['gh-sort']) {
    nextTick(() => {
      if (githubGridRef.value) {
        githubGridRef.value.refresh()
      }
    })
  }
})
```

**Pros:** Fixes root cause, better UX
**Cons:** Changes production code

---

#### **Variant 7: Use Different URL Format**
The issue might be URL encoding. Try:

```typescript
// Instead of checking 'q=' check for actual value
const reloadResponsePromise = page.waitForResponse(response => {
  const url = response.url()
  return url.includes('localhost:3001/api/search/repositories') &&
    (url.includes('react') || url.includes('hooks'))  // More flexible
})
```

**Pros:** More lenient matching
**Cons:** Less precise

---

## Summary of Recommendations

### Test 1: "should show total results count"
**Best Fix:** Variant 1 or Variant 6
- **Quick:** Increase timeout to 2s for that specific assertion
- **Proper:** Make watcher synchronous with `flush: 'sync'`

### Test 2: "should restore state after page refresh"
**Best Fix:** Variant 1 or Variant 6
- **Quick:** Remove strict URL param checking, just verify API is called
- **Proper:** Add onMounted hook to trigger refresh when URL params present

---

## Testing the Fixes

```bash
# Test just the failing tests
npm run test:e2e -- --grep "should show total results count"
npm run test:e2e -- --grep "should restore state after page refresh"

# Run all tests
npm run test:e2e
```

---

## Additional Debugging Commands

```bash
# Run with debug output
DEBUG=pw:api npm run test:e2e -- --grep "should show"

# Run headed to watch browser
npm run test:e2e -- --headed --grep "should show"

# Generate trace for debugging
npm run test:e2e -- --trace on --grep "should show"
```

---

## Notes

- Default expect timeout is 1000ms (1 second) per playwright.config.ts
- Mock API returns total_count correctly
- Vue watchers run asynchronously by default
- Page reloads reset all JavaScript state but preserve URL
