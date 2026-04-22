/**
 * Test Setup
 */
import { beforeEach } from 'vitest'

// Mock IntersectionObserver for ScrollPagination tests
class MockIntersectionObserver {
  private callback: (entries: IntersectionObserverEntry[]) => void
  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    this.callback = callback
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}
global.IntersectionObserver = MockIntersectionObserver as any

// Clean localStorage between tests
beforeEach(() => {
  localStorage.clear()
})
