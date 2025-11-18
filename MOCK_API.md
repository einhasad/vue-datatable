# Mock GitHub API Implementation

This document describes the mock GitHub API server implementation for testing without external dependencies.

## Overview

The mock GitHub API server is a lightweight Node.js/Express application that mimics the GitHub Search API endpoints. It provides:

- **Search functionality** - Search repositories by keywords
- **Sorting** - Sort by stars, forks, updated date, or help-wanted issues
- **Pagination** - Page-based pagination with configurable page size
- **Realistic data** - Generates ~100 mock repositories with realistic metadata
- **GitHub API compatible** - Returns responses in the same format as the real GitHub API

## Architecture

### Directory Structure

```
mock-server/
├── index.js          # Main Express server
├── data.js           # Mock repository data generator
├── search.js         # Search, sort, and pagination logic
├── vite-plugin.js    # Vite plugin for integration
├── config.ts         # Configuration helper for switching between mock/real API
├── package.json      # Dependencies
└── README.md         # Detailed usage documentation
```

### Components

1. **Data Generator (`data.js`)**
   - Generates realistic repository data based on popular open-source projects
   - Includes metadata: id, name, owner, description, stars, forks, language, etc.
   - Randomizes values for realistic variation

2. **Search Logic (`search.js`)**
   - `searchRepositories()` - Filters repositories by query string
   - `sortRepositories()` - Sorts by specified field and order
   - `paginateResults()` - Handles pagination
   - `processSearchRequest()` - Orchestrates search, sort, and pagination

3. **Express Server (`index.js`)**
   - `/api/github/health` - Health check endpoint
   - `/api/github/search/repositories` - Search repositories endpoint
   - CORS enabled for cross-origin requests
   - Configurable delay for simulating network latency

4. **Vite Plugin (`vite-plugin.js`)**
   - Starts mock server with Vite dev server
   - Automatic shutdown when Vite stops
   - Configurable port and verbosity

5. **Configuration Helper (`config.ts`)**
   - `getGitHubApiConfig()` - Returns mock or real API URL based on env vars
   - `getSearchRepositoriesUrl()` - Returns the appropriate endpoint URL

## Usage

### Running Standalone

```bash
# Start server on default port (3001)
npm run mock-api

# Start with auto-reload on file changes
npm run mock-api:dev

# Start with custom port
MOCK_API_PORT=3002 npm run mock-api
```

### Running Tests

The mock server starts automatically when running tests:

```bash
# All tests (mock server auto-starts)
npm test

# Unit tests only
npm run test:unit

# Watch mode
npm run test
```

### Integration with Vite

Add to `vite.config.ts`:

```typescript
import { mockGitHubApiPlugin } from './mock-server/vite-plugin.js'

export default defineConfig({
  plugins: [
    mockGitHubApiPlugin({
      port: 3001,
      enabled: true,
      verbose: false
    })
  ]
})
```

### Using in Application Code

Use the configuration helper to switch between mock and real API:

```typescript
import { getSearchRepositoriesUrl } from './mock-server/config'

// Get appropriate URL based on environment
const apiUrl = getSearchRepositoriesUrl()
// Returns: http://localhost:3001/api/github/search/repositories (if VITE_USE_MOCK_GITHUB_API=true)
// Or: https://api.github.com/search/repositories (if VITE_USE_MOCK_GITHUB_API=false)
```

## API Endpoints

### Health Check

**GET** `/api/github/health`

Returns server status and repository count.

**Response:**
```json
{
  "status": "ok",
  "message": "Mock GitHub API is running",
  "totalRepositories": 100
}
```

### Search Repositories

**GET** `/api/github/search/repositories`

Search and filter repositories with pagination and sorting.

**Query Parameters:**
- `q` (string, optional) - Search query
- `sort` (string, optional) - Sort field: `stars`, `forks`, `updated`, `help-wanted-issues` (default: `stars`)
- `order` (string, optional) - Sort order: `asc`, `desc` (default: `desc`)
- `page` (number, optional) - Page number (default: `1`)
- `per_page` (number, optional) - Items per page (default: `30`, max: `100`)

**Example Request:**
```bash
curl "http://localhost:3001/api/github/search/repositories?q=vue&sort=stars&order=desc&page=1&per_page=10"
```

**Response Format:**
```json
{
  "total_count": 42,
  "incomplete_results": false,
  "items": [
    {
      "id": 1,
      "name": "vue",
      "full_name": "vuejs/vue",
      "owner": {
        "login": "vuejs",
        "id": 12345,
        "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
        "html_url": "https://github.com/vuejs"
      },
      "description": "The Progressive JavaScript Framework",
      "html_url": "https://github.com/vuejs/vue",
      "stargazers_count": 50000,
      "forks_count": 10000,
      "watchers_count": 5000,
      "open_issues_count": 100,
      "language": "TypeScript",
      "license": {
        "key": "mit",
        "name": "MIT",
        "spdx_id": "MIT"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "pushed_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MOCK_API_PORT` | Server port | `3001` |
| `MOCK_API_VERBOSE` | Enable verbose logging | `false` |
| `MOCK_API_DELAY` | Simulate API delay (ms) | `0` |
| `VITE_USE_MOCK_GITHUB_API` | Use mock API in Vite apps | `false` |
| `VITE_MOCK_GITHUB_API_URL` | Mock API base URL | `http://localhost:3001` |
| `NODE_ENV` | When set to `test`, automatically uses mock API | - |

## Testing

### Unit Tests

The mock server has comprehensive unit tests covering:

- Health check endpoint
- Search functionality (single and multiple terms)
- Sorting (by stars, forks, updated, help-wanted-issues)
- Pagination (page size, multiple pages, edge cases)
- Response format validation
- Error handling

**Test Files:**
- `__tests__/mock-server.spec.ts` - Core server functionality (21 tests)
- `__tests__/mock-server-integration.spec.ts` - Integration with HttpDataProvider (5 tests)

**Run Tests:**
```bash
# Run all tests
npm test

# Run only mock server tests
npm test mock-server

# Run with coverage
npm run test:coverage
```

### Test Results

```
✓ __tests__/mock-server.spec.ts (21 tests)
✓ __tests__/mock-server-integration.spec.ts (5 tests)
```

Total: **366 tests** passing (including all existing tests)

Coverage: **82.35%** overall

## Benefits

1. **No External Dependencies** - Tests don't rely on GitHub API availability or network connection
2. **No Rate Limiting** - Unlimited requests during development and testing
3. **Consistent Data** - Predictable test data ensures reliable tests
4. **Fast Execution** - No network latency
5. **Offline Development** - Work without internet connection
6. **CI/CD Friendly** - Reliable tests in GitHub Actions without external API calls
7. **Cost Effective** - No API quota or billing concerns

## Implementation Details

### Search Algorithm

The search matches query terms against:
- Repository name
- Owner login
- Full name (owner/repo)
- Description
- Language
- Topics

**Multi-term Search:**
All terms must match (AND logic). Example: `"vue table"` matches repositories containing both "vue" AND "table".

### Sorting

Supports four sort modes:
1. **stars** - Sort by `stargazers_count`
2. **forks** - Sort by `forks_count`
3. **updated** - Sort by `updated_at` timestamp
4. **help-wanted-issues** - Sort by `open_issues_count` (proxy for help-wanted issues)

Both ascending (`asc`) and descending (`desc`) order supported.

### Pagination

- Default page size: 30 items
- Maximum page size: 100 items (enforced)
- Page numbers start at 1
- Empty results returned for pages beyond available data

### Data Generation

Mock repositories are generated with:
- Realistic names from popular open-source projects
- Random but reasonable statistics (stars, forks, issues)
- Diverse languages (JavaScript, TypeScript, Python, Go, Rust, etc.)
- Various licenses (MIT, Apache-2.0, GPL-3.0, etc.)
- Random timestamps within the past year

## Future Enhancements

Potential improvements:
- Add more endpoints (users, issues, pull requests)
- Support for advanced search syntax
- Configurable data sets
- Response caching
- Rate limiting simulation
- Error scenario simulation

## Troubleshooting

### Port Already in Use

If port 3001 is occupied:

```bash
# Use different port
MOCK_API_PORT=3002 npm run mock-api
```

Or kill the process using port 3001:

```bash
# Find process
lsof -ti:3001

# Kill process
kill $(lsof -ti:3001)
```

### Server Not Starting in Tests

Check the test setup file is configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    setupFiles: ['__tests__/setup.ts']
  }
})
```

### CORS Errors

The mock server has CORS enabled by default. If you still encounter CORS errors:

1. Check the server is running on the expected port
2. Verify the URL in your fetch request
3. Check browser console for detailed error messages

## License

MIT
