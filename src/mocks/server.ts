/**
 * MSW Node.js Setup
 * 
 * This file sets up MSW for Node.js environment.
 * Used in Vitest tests.
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
