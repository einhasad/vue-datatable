import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import type { Component } from 'vue'

export function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
}

interface MountExampleOptions {
  router?: Router
  attachTo?: HTMLElement | string
  global?: Record<string, unknown>
}

export function mountExample(Example: Component, options: MountExampleOptions = {}) {
  const router = options.router ?? makeRouter()
  const globalOpts = (options.global ?? {}) as { plugins?: unknown[] }
  const plugins = [...(globalOpts.plugins ?? []), router]
  return {
    router,
    wrapper: mount(Example as never, {
      attachTo: options.attachTo,
      global: { ...globalOpts, plugins }
    } as never)
  }
}

interface ObserverEntry {
  callback: IntersectionObserverCallback
  elements: Set<Element>
}

const observerInstances: ObserverEntry[] = []

class TriggerableIntersectionObserver {
  private elements: Set<Element> = new Set()

  constructor(callback: IntersectionObserverCallback) {
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
 * Install a richer IntersectionObserver mock that records observers and
 * exposes `triggerIntersection(element, isIntersecting)` so tests can
 * simulate the sentinel entering / leaving the viewport.
 *
 * Call from the spec file's top-level (not inside `it`) so it's installed
 * before component mount.
 */
export function installIntersectionObserverMock() {
  ;(globalThis as { IntersectionObserver: unknown }).IntersectionObserver =
    TriggerableIntersectionObserver as unknown as typeof IntersectionObserver
}

export function triggerIntersection(element: Element, isIntersecting: boolean) {
  for (const { callback, elements } of observerInstances) {
    if (!elements.has(element)) continue
    callback(
      [
        {
          target: element,
          isIntersecting,
          boundingClientRect: element.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: element.getBoundingClientRect() as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now()
        }
      ],
      {} as IntersectionObserver
    )
  }
}

export function resetObserverInstances() {
  observerInstances.length = 0
}
