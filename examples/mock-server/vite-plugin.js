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
  let serverStarted = false

  return {
    name: 'mock-github-api',

    configureServer(viteServer) {
      if (!enabled) {
        console.log('[Mock GitHub API] Plugin disabled')
        return
      }

      console.log(`[Mock GitHub API] Attempting to start server on port ${port}...`)

      const app = createApp()

      // Set environment variables
      if (verbose) {
        process.env.MOCK_API_VERBOSE = 'true'
      }

      server = app.listen(port, () => {
        serverStarted = true
        console.log(`\n[Mock GitHub API] ✓ Server running on http://localhost:${port}`)
        console.log(`[Mock GitHub API] ✓ Health check: http://localhost:${port}/api/github/health`)
        console.log(`[Mock GitHub API] ✓ Search endpoint: http://localhost:${port}/api/github/search/repositories\n`)
      })

      // Handle server errors
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[Mock GitHub API] ⚠ Port ${port} is already in use. Mock server not started.`)
          console.warn(`[Mock GitHub API] ⚠ You may need to stop other instances or use a different port.`)
        } else {
          console.error('[Mock GitHub API] ✗ Server error:', err)
        }
      })

      // Cleanup on Vite server close
      viteServer.httpServer?.on('close', () => {
        if (server && serverStarted) {
          console.log('[Mock GitHub API] Stopping server...')
          server.close(() => {
            console.log('[Mock GitHub API] ✓ Server stopped')
          })
        }
      })
    },

    closeBundle() {
      // This is called during build, not dev server shutdown
      if (server && serverStarted) {
        server.close(() => {
          console.log('[Mock GitHub API] Server stopped (build complete)')
        })
      }
    }
  }
}

export default mockGitHubApiPlugin
