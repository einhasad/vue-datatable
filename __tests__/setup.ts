/**
 * Test Setup
 *
 * This file is run before all tests. It starts the mock GitHub API server
 * for integration tests and sets up global test environment.
 *
 * The server persists across all test files to avoid port conflicts.
 */

import { beforeAll, afterAll } from 'vitest'
import { createApp } from '../mock-server/index.js'
import type { Server } from 'http'

// Global state to track server across all test files
const globalState = globalThis as any
const SERVER_KEY = '__mockGitHubApiServer__'
const PORT = 3001

// Start mock server before all tests (shared across all workers)
beforeAll(async () => {
  // If server is already running globally, skip
  if (globalState[SERVER_KEY]) {
    return
  }

  return new Promise<void>((resolve) => {
    const app = createApp()

    // Disable verbose logging in tests
    process.env.MOCK_API_VERBOSE = 'false'

    const server = app.listen(PORT, () => {
      console.log(`[Test Setup] Mock GitHub API started on port ${PORT}`)
      globalState[SERVER_KEY] = server
      resolve()
    })

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Test Setup] Port ${PORT} already in use, assuming server is already running`)
        resolve()
      } else {
        console.error('[Test Setup] Failed to start mock server:', err)
        throw err
      }
    })
  })
})

// Keep server running - it will be cleaned up when process exits
// This avoids race conditions between test files
afterAll(() => {
  // Do not stop the server here - let it run for all tests
  // The process will clean it up when exiting
})
