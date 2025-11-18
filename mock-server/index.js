/**
 * Mock GitHub API Server
 *
 * This server provides a mock implementation of the GitHub Search API
 * for testing purposes, eliminating the need to depend on the external
 * GitHub API and avoiding rate limiting issues.
 *
 * Endpoints:
 * - GET /api/github/search/repositories - Search repositories
 *
 * Query Parameters:
 * - q: Search query
 * - sort: Sort field (stars, forks, updated, help-wanted-issues)
 * - order: Sort order (asc, desc)
 * - page: Page number (default: 1)
 * - per_page: Items per page (default: 30, max: 100)
 */

import express from 'express'
import cors from 'cors'
import { generateMockRepositories } from './data.js'
import { processSearchRequest } from './search.js'

// Generate mock data once on server start
const mockRepositories = generateMockRepositories()

/**
 * Create and configure the Express app
 */
function createApp() {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json())

  // Request logging middleware (optional, can be disabled in tests)
  app.use((req, res, next) => {
    if (process.env.MOCK_API_VERBOSE === 'true') {
      console.log(`[Mock GitHub API] ${req.method} ${req.path}`, req.query)
    }
    next()
  })

  // Health check endpoint
  app.get('/api/github/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Mock GitHub API is running',
      totalRepositories: mockRepositories.length
    })
  })

  // Search repositories endpoint
  app.get('/api/github/search/repositories', (req, res) => {
    try {
      const result = processSearchRequest(mockRepositories, req.query)

      // Simulate API delay (can be controlled via env var)
      const delay = parseInt(process.env.MOCK_API_DELAY || '0', 10)

      setTimeout(() => {
        res.json(result)
      }, delay)
    } catch (error) {
      res.status(500).json({
        message: 'Internal server error',
        errors: [{ message: error.message }]
      })
    }
  })

  // Error handling
  app.use((req, res) => {
    res.status(404).json({
      message: 'Not Found',
      documentation_url: 'https://docs.github.com/rest'
    })
  })

  return app
}

/**
 * Start the server
 */
function startServer(port = 3001) {
  const app = createApp()

  const server = app.listen(port, () => {
    console.log(`Mock GitHub API server running on http://localhost:${port}`)
    console.log(`Health check: http://localhost:${port}/api/github/health`)
    console.log(`Search endpoint: http://localhost:${port}/api/github/search/repositories`)
  })

  return server
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.MOCK_API_PORT || 3001
  startServer(port)
}

export { createApp, startServer, mockRepositories }
