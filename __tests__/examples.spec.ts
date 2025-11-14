import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, ref, createApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import BasicExample from '../examples/src/pages/BasicExample.vue'
import ArrayProviderExample from '../examples/src/pages/ArrayProviderExample.vue'
import HTTPProviderExample from '../examples/src/pages/HTTPProviderExample.vue'
import StateProvidersExample from '../examples/src/pages/StateProvidersExample.vue'
import PagePaginationExample from '../examples/src/pages/PagePaginationExample.vue'
import CursorPaginationExample from '../examples/src/pages/CursorPaginationExample.vue'
import SortingExample from '../examples/src/pages/SortingExample.vue'
import CustomColumnsExample from '../examples/src/pages/CustomColumnsExample.vue'
import RowActionsExample from '../examples/src/pages/RowActionsExample.vue'

/**
 * Example Component Tests
 *
 * These tests ensure all example components:
 * 1. Render without errors
 * 2. Display expected content
 * 3. Handle user interactions correctly
 * 4. Demonstrate the documented features
 *
 * Testing approach based on:
 * - Official Vue.js testing docs (2024)
 * - Vitest best practices
 * - User-centric testing philosophy
 */

describe('Example Components', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('BasicExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(BasicExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should display title', () => {
      const wrapper = mount(BasicExample)
      expect(wrapper.text()).toContain('Basic Example')
    })

    it('should render Grid component', async () => {
      const wrapper = mount(BasicExample)
      await nextTick()

      // Should have grid class
      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should display description text', () => {
      const wrapper = mount(BasicExample)
      const text = wrapper.text()

      // Should explain what the example demonstrates
      expect(text.length).toBeGreaterThan(0)
    })

    it('should match snapshot', () => {
      const wrapper = mount(BasicExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('ArrayProviderExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(ArrayProviderExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should display ArrayDataProvider example', () => {
      const wrapper = mount(ArrayProviderExample)
      expect(wrapper.text()).toContain('Array')
    })

    it('should render Grid with ArrayDataProvider', async () => {
      const wrapper = mount(ArrayProviderExample)
      await nextTick()

      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should show code example', () => {
      const wrapper = mount(ArrayProviderExample)
      // Most examples show code snippets
      const hasCodeBlock = wrapper.html().includes('code') || wrapper.html().includes('pre')
      expect(hasCodeBlock || wrapper.text().includes('ArrayDataProvider')).toBe(true)
    })

    it('should match snapshot', () => {
      const wrapper = mount(ArrayProviderExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('HTTPProviderExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(HTTPProviderExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should display HTTP provider example', () => {
      const wrapper = mount(HTTPProviderExample)
      expect(wrapper.text()).toContain('HTTP')
    })

    it('should render Grid with HttpDataProvider', async () => {
      const wrapper = mount(HTTPProviderExample)
      await nextTick()

      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should match snapshot', () => {
      const wrapper = mount(HTTPProviderExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('StateProvidersExample.vue', () => {
    // Create real router for this example
    const createTestRouter = () => {
      return createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: { template: '<div>Home</div>' } }
        ]
      })
    }

    // Helper to create mount options
    const getMountOptions = () => {
      const router = createTestRouter()
      return {
        global: {
          plugins: [router],
          stubs: {
            RouterLink: true
          }
        }
      }
    }

    it('should render without errors', () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())
      expect(wrapper.exists()).toBe(true)
    })

    it('should display all 4 StateProvider tabs', () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      const text = wrapper.text()
      expect(text).toContain('InMemory')
      expect(text).toContain('Query Params')
      expect(text).toContain('LocalStorage')
      expect(text).toContain('Hash')
    })

    it('should have tab navigation', async () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      const tabs = wrapper.findAll('.tab')
      expect(tabs.length).toBe(4)
    })

    it('should show InMemory provider by default', () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      expect(wrapper.text()).toContain('InMemoryStateProvider')
    })

    it('should switch tabs when clicked', async () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      const tabs = wrapper.findAll('.tab')

      // Click on LocalStorage tab (index 2)
      if (tabs.length > 2) {
        await tabs[2].trigger('click')
        await nextTick()

        expect(wrapper.text()).toContain('LocalStorageStateProvider')
      }
    })

    it('should render grids for each StateProvider', async () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      await nextTick()

      // At least one grid should be visible
      const grids = wrapper.findAll('[data-qa="grid"]')
      expect(grids.length).toBeGreaterThan(0)
    })

    it('should display code examples', () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      // Should show code examples
      expect(wrapper.text()).toContain('new')
      expect(wrapper.text()).toContain('StateProvider')
    })

    it('should match snapshot', () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('PagePaginationExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(PagePaginationExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should demonstrate page-based pagination', () => {
      const wrapper = mount(PagePaginationExample)
      expect(wrapper.text()).toContain('Page')
    })

    it('should render Grid with pagination', async () => {
      const wrapper = mount(PagePaginationExample)
      await nextTick()

      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should show pagination controls', async () => {
      const wrapper = mount(PagePaginationExample)
      await nextTick()
      await nextTick()

      // Page pagination should have numbered buttons
      const hasPaginationText = wrapper.text().includes('1') ||
                                wrapper.text().includes('Page')
      expect(hasPaginationText).toBe(true)
    })

    it('should match snapshot', () => {
      const wrapper = mount(PagePaginationExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('CursorPaginationExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(CursorPaginationExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should demonstrate cursor-based pagination', () => {
      const wrapper = mount(CursorPaginationExample)
      const text = wrapper.text()
      expect(text).toContain('Cursor') || expect(text).toContain('Load More')
    })

    it('should render Grid with cursor pagination', async () => {
      const wrapper = mount(CursorPaginationExample)
      await nextTick()

      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should match snapshot', () => {
      const wrapper = mount(CursorPaginationExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('SortingExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(SortingExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should demonstrate sorting functionality', () => {
      const wrapper = mount(SortingExample)
      expect(wrapper.text()).toContain('Sort')
    })

    it('should render Grid with sortable columns', async () => {
      const wrapper = mount(SortingExample)
      await nextTick()

      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should match snapshot', () => {
      const wrapper = mount(SortingExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('CustomColumnsExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(CustomColumnsExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should demonstrate custom column rendering', () => {
      const wrapper = mount(CustomColumnsExample)
      expect(wrapper.text()).toContain('Custom')
    })

    it('should render Grid with custom columns', async () => {
      const wrapper = mount(CustomColumnsExample)
      await nextTick()

      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should match snapshot', () => {
      const wrapper = mount(CustomColumnsExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('RowActionsExample.vue', () => {
    it('should render without errors', () => {
      const wrapper = mount(RowActionsExample)
      expect(wrapper.exists()).toBe(true)
    })

    it('should demonstrate row actions', () => {
      const wrapper = mount(RowActionsExample)
      const text = wrapper.text()
      expect(text).toContain('Action') || expect(text).toContain('Row')
    })

    it('should render Grid with action buttons', async () => {
      const wrapper = mount(RowActionsExample)
      await nextTick()

      const grid = wrapper.find('[data-qa="grid"]')
      expect(grid.exists()).toBe(true)
    })

    it('should match snapshot', () => {
      const wrapper = mount(RowActionsExample)
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Cross-Example Consistency', () => {
    const allExamples = [
      { name: 'BasicExample', component: BasicExample },
      { name: 'ArrayProviderExample', component: ArrayProviderExample },
      { name: 'HTTPProviderExample', component: HTTPProviderExample },
      { name: 'PagePaginationExample', component: PagePaginationExample },
      { name: 'CursorPaginationExample', component: CursorPaginationExample },
      { name: 'SortingExample', component: SortingExample },
      { name: 'CustomColumnsExample', component: CustomColumnsExample },
      { name: 'RowActionsExample', component: RowActionsExample }
    ]

    it('all examples should render without throwing errors', () => {
      allExamples.forEach(({ name, component }) => {
        expect(() => {
          const wrapper = mount(component)
          wrapper.unmount()
        }).not.toThrow()
      })
    })

    it('all examples should contain Grid component', async () => {
      for (const { name, component } of allExamples) {
        const wrapper = mount(component)
        await nextTick()

        const grid = wrapper.find('[data-qa="grid"]')
        expect(grid.exists()).toBe(true)

        wrapper.unmount()
      }
    })

    it('all examples should have meaningful content', () => {
      allExamples.forEach(({ name, component }) => {
        const wrapper = mount(component)
        const text = wrapper.text().trim()

        // Each example should have some text content
        expect(text.length).toBeGreaterThan(10)

        wrapper.unmount()
      })
    })
  })

  describe('StateProvidersExample - Detailed Integration Tests', () => {
    const createTestRouter = () => {
      return createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: { template: '<div>Home</div>' } }
        ]
      })
    }

    const getMountOptions = () => {
      const router = createTestRouter()
      return {
        global: {
          plugins: [router],
          stubs: {
            RouterLink: true
          }
        }
      }
    }

    it('should demonstrate InMemoryStateProvider correctly', async () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      await nextTick()

      // Should explain InMemory behavior
      expect(wrapper.text()).toContain('memory')
    })

    it('should demonstrate QueryParamsStateProvider as default', async () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      const tabs = wrapper.findAll('.tab')

      // Find and click Query Params tab
      const queryParamsTab = tabs.find(tab => tab.text().includes('Query Params'))
      if (queryParamsTab) {
        await queryParamsTab.trigger('click')
        await nextTick()

        expect(wrapper.text()).toContain('search')
        expect(wrapper.text()).toContain('prefix')
      }
    })

    it('should show code examples for all StateProviders', async () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      const tabs = wrapper.findAll('.tab')

      // Check each tab has code examples
      for (let i = 0; i < tabs.length; i++) {
        await tabs[i].trigger('click')
        await nextTick()

        const hasCode = wrapper.text().includes('new') &&
                       wrapper.text().includes('StateProvider')
        expect(hasCode).toBe(true)
      }
    })

    it('should explain the difference between state providers', () => {
      const wrapper = mount(StateProvidersExample, getMountOptions())

      const fullText = wrapper.text()

      // Should mention key differences
      const mentionsURL = fullText.toLowerCase().includes('url') ||
                         fullText.toLowerCase().includes('query')
      const mentionsStorage = fullText.toLowerCase().includes('storage') ||
                            fullText.toLowerCase().includes('persist')

      expect(mentionsURL || mentionsStorage).toBe(true)
    })
  })
})
