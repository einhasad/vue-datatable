/**
 * MSW Browser Setup
 * 
 * This file sets up MSW for the browser environment.
 * Used in the demo application.
 */

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
