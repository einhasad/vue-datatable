import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import type { Component } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

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

export function mountExample(
  Example: Component,
  options: MountExampleOptions = {}
): { router: Router, wrapper: VueWrapper } {
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

  observe(element: Element): void {
    this.elements.add(element)
  }

  unobserve(element: Element): void {
    this.elements.delete(element)
  }

  disconnect(): void {
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
export function installIntersectionObserverMock(): void {
  ;(globalThis as { IntersectionObserver: unknown }).IntersectionObserver =
    TriggerableIntersectionObserver as unknown as typeof IntersectionObserver
}

export function triggerIntersection(element: Element, isIntersecting: boolean): void {
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

export function resetObserverInstances(): void {
  observerInstances.length = 0
}

function parseColor(color: string): [number, number, number] {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim())
  if (hex) {
    return [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16)) as [number, number, number]
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color.trim())
  if (rgb) {
    return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
  }
  if (color.trim().toLowerCase() === 'white') {
    return [255, 255, 255]
  }
  throw new Error(`Unsupported colour: ${color}`)
}

function relativeLuminance(color: string): number {
  const [r, g, b] = parseColor(color).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
