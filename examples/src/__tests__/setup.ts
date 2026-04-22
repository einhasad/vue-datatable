import { config } from '@vue/test-utils'
import { createRouter, createWebHistory, Router } from 'vue-router'
import { server } from '../mocks/server'

/**
 * Minimal IntersectionObserver mock that mimics real browser behavior.
 *
 * In a real browser, IntersectionObserver with no `root` watches the viewport.
 * Elements inside scroll containers are NOT intersecting until scrolled into view.
 * By default, nothing fires — tests must explicitly scroll to trigger intersections.
 *
 * To simulate scroll-to-bottom in tests:
 *   (globalThis as any).__triggerIntersection(sentinelElement, true)
 */

interface ObserverEntry {
  callback: IntersectionObserverCallback
  elements: Set<Element>
}

const observerInstances: ObserverEntry[] = []

;(globalThis as any).IntersectionObserver = class {
  private callback: IntersectionObserverCallback
  private elements: Set<Element> = new Set()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    observerInstances.push({ callback, elements: this.elements })
  }

  observe(element: Element) {
    this.elements.add(element)
  }

  unobserve(element: Element) {
    this.elements.delete(element)
  }

  disconnect() {
    this.elements.clear()
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

/**
 * Trigger intersection for a specific element across all observers.
 * This simulates the browser detecting the element entering the viewport.
 */
;(globalThis as any).__triggerIntersection = (element: Element, isIntersecting: boolean) => {
  for (const { callback, elements } of observerInstances) {
    if (!elements.has(element)) continue
    callback(
      [{
        target: element,
        isIntersecting,
        boundingClientRect: element.getBoundingClientRect(),
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: element.getBoundingClientRect() as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now()
      }],
      {} as IntersectionObserver
    )
  }
}

// Clear observer tracking between tests
afterEach(() => {
  observerInstances.length = 0
})

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Close server after all tests
afterAll(() => server.close())

// Create a simple router mock
export const router: Router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } }
  ]
})

// Push to config
config.global.plugins = [router]
