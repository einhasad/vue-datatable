/**
 * Vite Plugin for Mock GitHub API
 *
 * This plugin starts the mock GitHub API server when Vite starts
 * and stops it when Vite stops. It can be used in development and testing.
 */

import { createApp } from './index.js'

/**
 * Vite plugin to run mock GitHub API server
 */
export function mockGitHubApiPlugin(options = {}) {
  const {
    port = 3001,
    enabled = true,
    verbose = false
  } = options

  let server = null

  return {
    name: 'mock-github-api',

    configureServer(viteServer) {
      if (!enabled) {
        return
      }

      const app = createApp()

      // Set environment variables
      if (verbose) {
        process.env.MOCK_API_VERBOSE = 'true'
      }

      server = app.listen(port, () => {
        if (verbose || process.env.NODE_ENV !== 'test') {
          console.log(`\n[Mock GitHub API] Server running on http://localhost:${port}`)
          console.log(`[Mock GitHub API] Health check: http://localhost:${port}/api/github/health\n`)
        }
      })

      // Handle server errors
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Mock GitHub API] Port ${port} is already in use. Mock server not started.`)
        } else {
          console.error('[Mock GitHub API] Server error:', err)
        }
      })
    },

    closeBundle() {
      if (server) {
        server.close(() => {
          if (verbose || process.env.NODE_ENV !== 'test') {
            console.log('[Mock GitHub API] Server stopped')
          }
        })
      }
    }
  }
}

export default mockGitHubApiPlugin
