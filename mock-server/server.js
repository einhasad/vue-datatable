#!/usr/bin/env node

/**
 * Standalone Mock API Server
 * Used by Playwright webServer to run the mock API during tests
 */

import { startServer } from './index.js'

const port = process.env.MOCK_API_PORT || 3001

console.log('[Mock API Server] Starting on port', port)

let server

try {
  server = startServer(port)

  // Verify server is listening
  server.on('listening', () => {
    console.log('[Mock API Server] ✓ Successfully started and listening')
    console.log('[Mock API Server] ✓ Health check available at http://localhost:' + port + '/api/health')
  })

  server.on('error', (error) => {
    console.error('[Mock API Server] ✗ Server error:', error)
    if (error.code === 'EADDRINUSE') {
      console.error('[Mock API Server] ✗ Port', port, 'is already in use')
      console.error('[Mock API Server] ✗ Try: lsof -ti:' + port + ' | xargs kill -9')
    }
    process.exit(1)
  })
} catch (error) {
  console.error('[Mock API Server] ✗ Failed to start:', error)
  process.exit(1)
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Mock API Server] Received SIGTERM, shutting down...')
  if (server) {
    server.close(() => {
      console.log('[Mock API Server] Server closed')
      process.exit(0)
    })
  }
})

process.on('SIGINT', () => {
  console.log('[Mock API Server] Received SIGINT, shutting down...')
  if (server) {
    server.close(() => {
      console.log('[Mock API Server] Server closed')
      process.exit(0)
    })
  }
})

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Mock API Server] ✗ Uncaught exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Mock API Server] ✗ Unhandled rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
