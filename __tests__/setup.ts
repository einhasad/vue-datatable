/**
 * Test Setup
 *
 * This file is run before all tests. It starts the mock GitHub API server
 * for integration tests and sets up global test environment.
 */

import { beforeAll, afterAll } from 'vitest'
import { createApp } from '../mock-server/index.js'
import type { Server } from 'http'

let mockServer: Server | null = null

// Start mock server before all tests
beforeAll(() => {
  return new Promise<void>((resolve) => {
    const app = createApp()
    const port = 3001

    // Disable verbose logging in tests
    process.env.MOCK_API_VERBOSE = 'false'

    mockServer = app.listen(port, () => {
      console.log(`[Test Setup] Mock GitHub API started on port ${port}`)
      resolve()
    })

    mockServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Test Setup] Port ${port} already in use, assuming server is already running`)
        mockServer = null
        resolve()
      } else {
        console.error('[Test Setup] Failed to start mock server:', err)
        throw err
      }
    })
  })
})

// Stop mock server after all tests
afterAll(() => {
  return new Promise<void>((resolve) => {
    if (mockServer) {
      mockServer.close(() => {
        console.log('[Test Setup] Mock GitHub API stopped')
        resolve()
      })
    } else {
      resolve()
    }
  })
})
