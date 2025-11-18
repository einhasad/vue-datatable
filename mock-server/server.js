#!/usr/bin/env node

/**
 * Standalone mock GitHub API server
 * Used by Playwright webServer to run the mock API during tests
 */

import { startServer } from './index.js'

const port = process.env.MOCK_API_PORT || 3001
const server = startServer(port)

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Mock API] Received SIGTERM, shutting down...')
  server.close(() => {
    console.log('[Mock API] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Mock API] Received SIGINT, shutting down...')
  server.close(() => {
    console.log('[Mock API] Server closed')
    process.exit(0)
  })
})
