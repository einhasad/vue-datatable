# E2E Test Debug Guide - CORRECTED

**Status:** 21/23 tests passing
**Failing Tests:** 2

---

## 🔴 CRITICAL BUGS FOUND (After Source Code Review)

### Bug #1: Grid.vue doesn't expose `pagination` property
**Impact:** Test 1 fails - "should show total results count"

### Bug #2: httpClient reads wrong URL parameter names
**Impact:** Test 2 fails - "should restore state after page refresh"

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
4. Checks if `responseData.total_count > 0` (returns 11)
5. **FAILS HERE:** Expects to see "Results: 11 repositories" text - NOT VISIBLE

---

### ❌ WRONG Analysis (Initial Theory)

I initially thought this was a **race condition** where:
- Grid data loads → tbody visible ✓
- Test checks for Results text ✗
- **Shortly after**, Vue watcher fires and updates githubTotalCount ✓ (too late!)

**This was INCORRECT.**

---

### ✅ ACTUAL Root Cause

The Vue watcher **NEVER FIRES AT ALL**.

**App.vue line 1556-1560:**
```typescript
watch(() => githubGridRef.value?.pagination, (paginationData) => {
  if (paginationData) {
    githubTotalCount.value = (paginationData as any).totalCount || 0
  }
}, { deep: true })
```

This watcher watches `githubGridRef.value?.pagination`.

**But Grid.vue doesn't expose `pagination`!**

**Grid.vue line 213-220:**
```typescript
defineExpose({
  loadData,
  loadMore,
  refresh,
  setPage,
  items,
  loading
  // ❌ NO pagination property!
})
```

**Why This Breaks:**
1. Grid component has internal `paginationInterface` computed ✓
2. Grid does NOT expose it via `defineExpose` ❌
3. `githubGridRef.value.pagination` is always `undefined` ❌
4. Watcher never fires ❌
5. `githubTotalCount` stays at 0 ❌
6. `v-if="githubTotalCount > 0"` is always false ❌
7. Results text never renders ❌
8. Test fails ❌

---

### The Real Data Flow

```
Mock API Response { total_count: 11 }
  ↓
HttpDataProvider.load() receives response
  ↓
GitHubSearchAdapter.extractPagination(response)
  - Returns: { currentPage: 1, perPage: 10, pageCount: 2, totalCount: 11 }
  ↓
HttpDataProvider.paginationData.value = { ... }
  ↓
Grid.paginationInterface computed updates (internal to Grid)
  ↓
❌ Grid does NOT expose this via defineExpose
  ↓
❌ githubGridRef.value.pagination === undefined
  ↓
❌ Watcher NEVER fires
  ↓
❌ githubTotalCount stays 0
  ↓
❌ v-if="githubTotalCount > 0" is false
  ↓
❌ Results text not rendered
```

---

### ✅ THE FIX

**src/Grid.vue line 213:**
```typescript
// BEFORE
defineExpose({
  loadData,
  loadMore,
  refresh,
  setPage,
  items,
  loading
})

// AFTER - Add pagination
defineExpose({
  loadData,
  loadMore,
  refresh,
  setPage,
  items,
  loading,
  pagination: paginationInterface  // ← ADD THIS LINE
})
```

**Why this works:**
1. Grid exposes `pagination` computed property ✓
2. `githubGridRef.value.pagination` is now defined ✓
3. Watcher fires when pagination updates ✓
4. `githubTotalCount` gets updated to 11 ✓
5. `v-if="githubTotalCount > 0"` becomes true ✓
6. Results text renders ✓
7. Test passes ✅

---

### Alternative Fix (If You Don't Want to Change Grid.vue)

**Option B: Watch provider directly instead of Grid ref**

```typescript
// App.vue - BEFORE
watch(() => githubGridRef.value?.pagination, (paginationData) => {
  if (paginationData) {
    githubTotalCount.value = (paginationData as any).totalCount || 0
  }
}, { deep: true })

// AFTER
watch(() => githubProvider.getPagination(), (paginationData) => {
  if (paginationData) {
    githubTotalCount.value = (paginationData as any).totalCount || 0
  }
}, { deep: true })
```

**Option C: Use @loaded event from Grid**

```vue
<!-- App.vue template -->
<Grid
  ref="githubGridRef"
  :data-provider="githubProvider"
  :columns="githubColumns"
  @loaded="onGithubDataLoaded"
/>
```

```typescript
// App.vue script
function onGithubDataLoaded() {
  const pagination = githubProvider.getPagination()
  if (pagination) {
    githubTotalCount.value = (pagination as any).totalCount || 0
  }
}
```

---

## Test 2: "should restore state after page refresh"

### Location
`e2e/examples.spec.ts:344`

### Error
```
Test timeout of 30000ms exceeded.
Error: page.waitForResponse: Test timeout of 30000ms exceeded.

Line 378-382:
const reloadResponsePromise = page.waitForResponse(response =>
  response.url().includes('localhost:3001/api/search/repositories') &&
  response.url().includes('q=') &&
  response.url().includes('sort=forks')
)
```

### What the Test Does
1. Navigate to `/#http-provider`
2. Fill search: "react hooks"
3. Select sort: "forks"
4. Click search button
5. Verify URL contains `gh-q=react+hooks` and `gh-sort=forks` ✓
6. Set up response waiter for reload
7. Reload page
8. **FAILS HERE:** Wait for API call - TIMES OUT (no API call happens with expected params)

---

### ❌ WRONG Analysis (Initial Theory)

I initially thought the Grid didn't auto-refresh on reload. **This was INCORRECT.**

Grid.vue DOES auto-load on mount:
```typescript
// Grid.vue line 204-208
onMounted(async () => {
  if (props.autoLoad) {  // Default: true
    await loadData()
  }
})
```

---

### ✅ ACTUAL Root Cause

The httpClient reads **wrong URL parameter names**.

**How StateProvider and HttpDataProvider Actually Work:**

1. **URL after search:**
   ```
   http://localhost:3000/vue-datatable/#http-provider?gh-q=react+hooks&gh-sort=forks
   ```

2. **StateProvider (prefix='gh') reads route.query:**
   ```javascript
   route.query = { 'gh-q': 'react hooks', 'gh-sort': 'forks' }
   ```

3. **QueryParamsStateProvider.getAllFilters() STRIPS PREFIX:**
   ```typescript
   // QueryParamsStateProvider.ts line 79-96
   getAllFilters(): Record<string, string> {
     const filters: Record<string, string> = {}
     const prefixWithDash = `${this.prefix}-`  // 'gh-'

     Object.keys(query).forEach(key => {
       if (key.startsWith(prefixWithDash)) {
         const originalKey = key.substring(prefixWithDash.length)  // Strips 'gh-'!
         filters[originalKey] = value  // Returns { 'q': 'react hooks' }
       }
     })
     return filters
   }
   ```

   Returns: `{ 'q': 'react hooks' }` (NOT 'gh-q'!)

4. **HttpDataProvider.buildUrl() uses stripped params:**
   ```typescript
   // HttpDataProvider.ts line 110-138
   const filters = this.stateProvider.getAllFilters()  // { 'q': 'react hooks' }

   params.append('q', 'react hooks')  // Adds 'q' NOT 'gh-q'!
   params.append('sort', '-forks')    // Adds 'sort' NOT 'gh-sort'!
   ```

   Creates URL:
   ```
   http://localhost:3001/api/search/repositories?q=react+hooks&sort=-forks&page=1&per_page=10
   ```

5. **githubHttpClient receives URL and tries to read params:**
   ```typescript
   // App.vue line 1411-1412 - WRONG!
   const q = urlObj.searchParams.get('gh-q') || githubSearchQuery.value || 'vue table'
   const sort = urlObj.searchParams.get('gh-sort')?.replace('-', '') || githubSortBy.value
   ```

   **BUT the URL has `q` not `gh-q`!**

   - `urlObj.searchParams.get('gh-q')` returns `null` ❌
   - Falls back to `githubSearchQuery.value` (might be 'vue table' or outdated) ❌
   - Makes API call with WRONG query ❌

6. **Test waits for API call with correct params - NEVER HAPPENS:**
   ```typescript
   response.url().includes('q=') &&          // Might pass
   response.url().includes('sort=forks')      // Might pass
   ```

   But the actual API call might have `q=vue+table` instead of `q=react+hooks`!

---

### Why This Happens

**The Architecture:**
- **Route query params:** `gh-q`, `gh-sort` (with prefix)
- **StateProvider internal storage:** Reads from route with prefix
- **StateProvider.getAllFilters():** Returns WITHOUT prefix
- **HttpDataProvider.buildUrl():** Adds params WITHOUT prefix to URL
- **httpClient receives URL:** Params are `q`, `sort` (no prefix)
- **httpClient tries to read:** Looks for `gh-q`, `gh-sort` (with prefix) ❌ MISMATCH!

---

### ✅ THE FIX

**examples/src/App.vue line 1411-1412:**

```typescript
// BEFORE (WRONG)
const q = urlObj.searchParams.get('gh-q') || githubSearchQuery.value || 'vue table'
const sort = urlObj.searchParams.get('gh-sort')?.replace('-', '') || githubSortBy.value

// AFTER (CORRECT)
const q = urlObj.searchParams.get('q') || githubSearchQuery.value || 'vue table'
const sort = urlObj.searchParams.get('sort')?.replace('-', '') || githubSortBy.value
```

**Why this works:**
1. HttpDataProvider adds `q` and `sort` (without prefix) to the request URL ✓
2. httpClient now reads the correct param names ✓
3. On reload: URL has `q=react+hooks` ✓
4. httpClient reads it correctly ✓
5. Makes API call with correct params ✓
6. Test catches the response ✅

---

### The Corrected Data Flow (After Reload)

```
Page reloads with URL: ?gh-q=react+hooks&gh-sort=forks
  ↓
Vue app re-initializes
  ↓
githubSearchQuery.value = route.query['gh-q'] = 'react hooks' ✓
githubSortBy.value = route.query['gh-sort'] = 'forks' ✓
  ↓
StateProvider reads route.query: { 'gh-q': 'react hooks', 'gh-sort': 'forks' } ✓
  ↓
Grid mounts → onMounted → loadData() ✓
  ↓
HttpDataProvider.load() → buildUrl() ✓
  ↓
StateProvider.getAllFilters() returns { 'q': 'react hooks' } (strips prefix) ✓
  ↓
buildUrl() creates: ?q=react+hooks&sort=-forks&page=1&per_page=10 ✓
  ↓
httpClient receives URL with params 'q' and 'sort' (no prefix) ✓
  ↓
✅ httpClient reads urlObj.searchParams.get('q') = 'react hooks' ✓
✅ httpClient reads urlObj.searchParams.get('sort') = '-forks' ✓
  ↓
Makes API call: ?q=react+hooks&sort=forks&order=desc&per_page=10&page=1 ✓
  ↓
Test catches response ✅
```

---

## Summary: What Was Wrong vs What's Actually Wrong

### Test 1

| What I Said Initially | What's Actually True |
|----------------------|---------------------|
| ❌ "Race condition - watcher fires too late" | ✅ Watcher NEVER fires - Grid doesn't expose pagination |
| ❌ "Need to wait longer for Vue reactivity" | ✅ Need to expose the property so watcher can run |
| ❌ "Add timeout or delay" | ✅ Fix Grid.vue defineExpose |

### Test 2

| What I Said Initially | What's Actually True |
|----------------------|---------------------|
| ❌ "Grid might not auto-load on reload" | ✅ Grid DOES auto-load (verified in source) |
| ❌ "StateProvider might not read URL correctly" | ✅ StateProvider works perfectly |
| ❌ "Need to trigger manual refresh" | ✅ httpClient reads wrong param names |

---

## The Actual Fixes (Both Tests)

### Fix #1: Grid.vue - Expose pagination

**File:** `src/Grid.vue`
**Line:** 213

```typescript
defineExpose({
  loadData,
  loadMore,
  refresh,
  setPage,
  items,
  loading,
  pagination: paginationInterface  // ← ADD THIS
})
```

### Fix #2: App.vue - Read correct URL params

**File:** `examples/src/App.vue`
**Lines:** 1411-1412

```typescript
// Change from:
const q = urlObj.searchParams.get('gh-q') || githubSearchQuery.value || 'vue table'
const sort = urlObj.searchParams.get('gh-sort')?.replace('-', '') || githubSortBy.value

// To:
const q = urlObj.searchParams.get('q') || githubSearchQuery.value || 'vue table'
const sort = urlObj.searchParams.get('sort')?.replace('-', '') || githubSortBy.value
```

---

## Testing the Fixes

```bash
# Apply both fixes above

# Rebuild library
npm run build

# Test individual failures
npm run test:e2e -- --grep "should show total results count"
npm run test:e2e -- --grep "should restore state after page refresh"

# Expected: 2/2 PASS ✅

# Run all tests
npm run test:e2e

# Expected: 23/23 PASS ✅
```

---

## Lessons Learned

### ❌ What NOT To Do

1. **Don't theorize without reading source code**
   - I spent time creating "race condition" theories
   - Reality: The property doesn't exist at all

2. **Don't assume components expose everything**
   - I assumed Grid exposed `pagination`
   - Reality: Check defineExpose to see what's actually exposed

3. **Don't assume URL params match across layers**
   - I assumed httpClient would get same params as route.query
   - Reality: StateProvider strips prefixes before building URLs

4. **Don't suggest arbitrary delays**
   - I suggested adding timeouts and waits
   - Reality: These mask bugs, don't fix them

### ✅ What TO Do

1. **Read the actual source code first**
   - Grid.vue defineExpose shows what's exposed
   - QueryParamsStateProvider.getAllFilters shows prefix stripping
   - HttpDataProvider.buildUrl shows final URL construction

2. **Trace the complete data flow**
   - Route query → StateProvider → HttpDataProvider → httpClient
   - Each layer transforms the data differently

3. **Verify assumptions with code**
   - Does Grid auto-load? Check onMounted
   - Does watcher fire? Check if watched value exists
   - Do params match? Check what each layer expects

4. **Fix root causes, not symptoms**
   - Don't add delays - expose the property
   - Don't change test expectations - fix the param names

---

## Additional Notes

- Default expect timeout is 1000ms (1s) per playwright.config.ts
- Mock API returns `total_count` correctly (verified in mock-server/search.js)
- Grid component has `autoLoad: true` by default
- StateProvider prefix system works as designed (strips prefix for HTTP calls)
- Vue watchers run asynchronously BUT only if the watched value exists

---

## Debugging Commands

```bash
# Run with debug output
DEBUG=pw:api npm run test:e2e -- --grep "should show"

# Run headed (watch browser)
npm run test:e2e -- --headed --grep "should show"

# Generate trace
npm run test:e2e -- --trace on --grep "should show"

# Check what Grid exposes (in browser console)
console.log(Object.keys(gridRef.value))
// Should include 'pagination' after fix

# Check URL params httpClient receives
console.log(urlObj.searchParams.toString())
// Should show 'q=' and 'sort=' (not 'gh-q=' and 'gh-sort=')
```
