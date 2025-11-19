# Mock GitHub API Server

A lightweight mock implementation of the GitHub Search API for testing and development purposes.

## Features

- **Search**: Search repositories by query with support for multiple terms
- **Sorting**: Sort results by stars, forks, updated date, or help-wanted issues
- **Pagination**: Page-based pagination with configurable page size
- **Realistic Data**: Generates realistic-looking repository data
- **GitHub API Compatible**: Returns responses in the same format as the real GitHub API

## Installation

The mock server dependencies are included in the main project's `devDependencies`:

```bash
npm install
```

## Usage

### Starting the Server

```bash
# Start standalone server on port 3001
node mock-server/index.js

# Or with custom port
MOCK_API_PORT=3002 node mock-server/index.js
```

### Endpoints

#### Health Check
```
GET /api/github/health
```

Response:
```json
{
  "status": "ok",
  "message": "Mock GitHub API is running",
  "totalRepositories": 100
}
```

#### Search Repositories
```
GET /api/github/search/repositories
```

Query Parameters:
- `q` - Search query (searches in name, owner, description, language)
- `sort` - Sort field: `stars`, `forks`, `updated`, `help-wanted-issues` (default: `stars`)
- `order` - Sort order: `asc`, `desc` (default: `desc`)
- `page` - Page number (default: `1`)
- `per_page` - Items per page (default: `30`, max: `100`)

Example:
```bash
curl "http://localhost:3001/api/github/search/repositories?q=vue&sort=stars&per_page=10"
```

Response format (GitHub API compatible):
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
        "avatar_url": "https://avatars.githubusercontent.com/u/...",
        ...
      },
      "description": "The Progressive JavaScript Framework",
      "stargazers_count": 50000,
      "forks_count": 10000,
      "language": "TypeScript",
      "updated_at": "2025-01-15T10:30:00Z",
      ...
    }
  ]
}
```

## Integration with Tests

The mock server is automatically started when running tests via the setup file:

```typescript
// In vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['__tests__/setup.ts']
  }
})
```

## Integration with Vite

You can integrate the mock server with your Vite dev server using the plugin:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { mockGitHubApiPlugin } from './mock-server/vite-plugin.js'

export default defineConfig({
  plugins: [
    mockGitHubApiPlugin({
      port: 3001,
      enabled: process.env.NODE_ENV === 'development',
      verbose: true
    })
  ]
})
```

## Using Mock API in Examples

Set environment variables to use the mock API instead of the real GitHub API:

```bash
# .env.local
VITE_USE_MOCK_GITHUB_API=true
VITE_MOCK_GITHUB_API_URL=http://localhost:3001
```

Then in your code:

```typescript
import { getSearchRepositoriesUrl } from './mock-server/config'

const url = getSearchRepositoriesUrl()
// Returns: http://localhost:3001/api/github/search/repositories (if mock enabled)
// Or: https://api.github.com/search/repositories (if mock disabled)
```

## Environment Variables

- `MOCK_API_PORT` - Server port (default: `3001`)
- `MOCK_API_VERBOSE` - Enable verbose logging (default: `false`)
- `MOCK_API_DELAY` - Simulate API delay in milliseconds (default: `0`)
- `VITE_USE_MOCK_GITHUB_API` - Use mock API in Vite apps (default: `false`)
- `VITE_MOCK_GITHUB_API_URL` - Mock API URL (default: `http://localhost:3001`)

## Running Tests

```bash
# Run all tests (mock server starts automatically)
npm test

# Run only mock server tests
npm test mock-server
```

## Architecture

### Files

- **`index.js`** - Main Express server
- **`data.js`** - Mock data generation
- **`search.js`** - Search, sort, and pagination logic
- **`vite-plugin.js`** - Vite plugin integration
- **`config.ts`** - Configuration helper for switching between mock/real API
- **`package.json`** - Dependencies

### Data Generation

The mock server generates ~100 realistic repositories based on popular open-source projects. Each repository includes:
- Metadata (id, name, owner, description)
- Statistics (stars, forks, watchers, issues)
- Timestamps (created, updated, pushed)
- Additional fields (language, license, topics)

## Benefits

1. **No External Dependencies**: Tests don't rely on GitHub API availability
2. **No Rate Limiting**: Unlimited requests during development and testing
3. **Consistent Data**: Predictable test data for reliable tests
4. **Fast**: No network latency
5. **Offline Development**: Work without internet connection
6. **CI/CD Friendly**: Reliable tests in GitHub Actions

## License

MIT
