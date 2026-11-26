import { describe, it, expect, vi, afterEach } from 'vitest'
import { shallowMount, type VueWrapper } from '@vue/test-utils'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import App from '../App.vue'
import pkg from '../../package.json'

const gridSource = readFileSync(resolve(__dirname, '../../src/Grid.vue'), 'utf8')
const typesSource = readFileSync(resolve(__dirname, '../../src/types.ts'), 'utf8')

function blockBetween(source: string, opener: string, closer: string): string {
  const start = source.indexOf(opener)
  expect(start, `${opener} not found`).toBeGreaterThan(-1)
  const end = source.indexOf(closer, start + opener.length)
  expect(end, `${closer} not found after ${opener}`).toBeGreaterThan(start)
  return source.slice(start + opener.length, end)
}

function memberNames(block: string, indent: string): string[] {
  const names = [...block.matchAll(new RegExp(`^${indent}(\\w+)\\??:`, 'gm'))].map(match => match[1])
  expect(names.length).toBeGreaterThan(0)
  return names.sort()
}

const gridProps = memberNames(blockBetween(gridSource, 'defineProps<{', '}>()'), '\\s*')
const gridEmits = memberNames(blockBetween(gridSource, 'defineEmits<{', '}>()'), '\\s*')
const gridSlots = memberNames(blockBetween(gridSource, 'defineSlots<{', '}>()'), '\\s*')
const columnFields = memberNames(blockBetween(typesSource, 'export interface Column<T = any> {', '\n}'), ' {2}')

let wrapper: VueWrapper | null = null

function mountApp(): VueWrapper {
  wrapper = shallowMount(App, { attachTo: document.body })
  return wrapper
}

function documentedNames(app: VueWrapper, tableLabel: string, prefix = ''): string[] {
  const region = app.find(`[role="region"][aria-label="${tableLabel}"]`)
  expect(region.exists(), `${tableLabel} table missing`).toBe(true)
  return region
    .findAll('tbody tr td:first-child code')
    .map(code => code.text())
    .map(text => {
      expect(text.startsWith(prefix), `${text} should start with ${prefix}`).toBe(true)
      return text.slice(prefix.length)
    })
    .sort()
}

function stubReducedMotion(reduce: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion: reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {}
  }))
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('demo App page', () => {
  describe('version and links', () => {
    it('shows the package.json version in the header and hero', () => {
      const app = mountApp()

      expect(app.find('.ds-header__version').text()).toBe(`v${pkg.version}`)
      expect(app.find('.ds-hero__eyebrow-tag').text()).toBe(`v${pkg.version}`)
    })

    it('shows the Vue peer range from package.json', () => {
      const app = mountApp()

      expect(app.find('.ds-hero__eyebrow').text()).toContain(`Vue ${pkg.peerDependencies.vue}`)
    })

    it('shows the current year and no hard-coded update date', () => {
      const app = mountApp()

      expect(app.find('.ds-footer__legal').text()).toContain(`© ${new Date().getFullYear()} `)
      expect(app.text()).not.toContain('Last updated')
    })

    it('points brand and Docs links to the deployed docs root, never the domain root', () => {
      vi.stubEnv('BASE_URL', '/vue-datatable/')
      const app = mountApp()

      const hrefs = app.findAll('a').map(a => a.attributes('href'))
      expect(hrefs).not.toContain('/')
      expect(app.find('.ds-header .ds-header__brand').attributes('href')).toBe('/vue-datatable/')
      expect(app.find('.ds-header__nav a[aria-current="page"]').attributes('href')).toBe('/vue-datatable/')
      expect(app.find('.ds-footer .ds-header__brand').attributes('href')).toBe('/vue-datatable/')
    })

    it('has no link to the disabled GitHub Discussions', () => {
      const app = mountApp()

      expect(app.findAll('a').map(a => a.attributes('href'))).not.toContain(
        'https://github.com/einhasad/vue-datatable/discussions'
      )
    })

    it('every sidebar link targets a section rendered on the page', () => {
      const app = mountApp()

      const links = app.findAll('.ds-sidebar__link')
      expect(links.length).toBeGreaterThan(0)
      for (const link of links) {
        const id = link.attributes('href')?.slice(1) ?? ''
        expect(app.find(`[id="${id}"]`).exists(), `#${id} missing`).toBe(true)
      }
    })
  })

  describe('API reference matches src/Grid.vue and src/types.ts', () => {
    it('lists every Grid prop and nothing else', () => {
      expect(documentedNames(mountApp(), 'Grid props')).toEqual(gridProps)
    })

    it('lists every Grid slot and nothing else', () => {
      expect(documentedNames(mountApp(), 'Grid slots', '#')).toEqual(gridSlots)
    })

    it('lists every Grid event and nothing else', () => {
      expect(documentedNames(mountApp(), 'Grid events', '@')).toEqual(gridEmits)
    })

    it('lists every Column field and nothing else', () => {
      expect(documentedNames(mountApp(), 'Column fields')).toEqual(columnFields)
    })

    it('documents the #toolbar slot scope as { loading }', () => {
      const app = mountApp()

      const row = app
        .find('[aria-label="Grid slots"]')
        .findAll('tbody tr')
        .find(tr => tr.find('td code').text() === '#toolbar')
      expect(row?.findAll('td')[1].text()).toBe('{ loading }')
    })

    it('describes @loaded as Grid-initiated loads only', () => {
      const app = mountApp()

      const row = app
        .find('[aria-label="Grid events"]')
        .findAll('tbody tr')
        .find(tr => tr.find('td code').text() === '@loaded')
      expect(row?.text()).toContain('Grid-initiated load')
      expect(row?.text()).not.toContain('every successful')
    })

    it('makes every scrollable API table a keyboard-focusable named region', () => {
      const app = mountApp()

      const wraps = app.findAll('.ds-api-table-wrap')
      expect(wraps.length).toBe(4)
      for (const wrap of wraps) {
        expect(wrap.attributes('tabindex')).toBe('0')
        expect(wrap.attributes('role')).toBe('region')
        expect(wrap.attributes('aria-label')).toBeTruthy()
      }
    })
  })

  describe('content', () => {
    it('names no non-existent HTTP provider and no private projects', () => {
      const text = mountApp().text()

      expect(text).not.toMatch(/HTTP Provider/)
      expect(text).not.toMatch(/or HTTP\b|HTTP, or custom/)
      expect(text).not.toContain('admin-panel')
      expect(text).not.toContain('elite-vehicle')
    })

    it('presents the callback example as CallbackDataProvider', () => {
      const app = mountApp()

      const section = app.find('#callback-provider')
      expect(section.find('h2').text()).toBe('Callback Provider')
      expect(section.text()).toContain('CallbackDataProvider')
      expect(section.text()).not.toContain('ArrayDataProvider')
    })

    it('does not promise history entries from the QueryParams provider', () => {
      const text = mountApp().find('#state-queryparams').text()

      expect(text).not.toContain('Browser back/forward navigation restores the previous state')
      expect(text).toContain('router.replace')
    })

    it('documents plain-text rendering and the innerHTML opt-in', () => {
      const text = mountApp().find('#api').text()

      expect(text).toContain('plain text')
      expect(text).toContain('innerHTML')
    })
  })

  describe('layout and navigation', () => {
    it('uses the two-column layout without an empty TOC column', () => {
      expect(mountApp().find('.ds-layout').classes()).toContain('ds-layout--no-toc')
    })

    it('menu button toggles the sidebar drawer', async () => {
      const app = mountApp()
      const button = app.find('.ds-header__inner > button.ds-header__menu')

      expect(app.find('.ds-header__inner').element.firstElementChild).toBe(button.element)
      expect(button.attributes('type')).toBe('button')
      expect(button.attributes('aria-controls')).toBe('ds-sidebar')
      expect(button.attributes('aria-label')).toBe('Sections')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(app.find('aside#ds-sidebar').classes()).not.toContain('is-open')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('true')
      expect(app.find('#ds-sidebar').classes()).toContain('is-open')

      await button.trigger('click')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(app.find('#ds-sidebar').classes()).not.toContain('is-open')
    })

    it('closes the drawer when a section link is clicked', async () => {
      stubReducedMotion(false)
      vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})
      const app = mountApp()

      await app.find('.ds-header__menu').trigger('click')
      await app.find('.ds-sidebar__link[href="#api"]').trigger('click')

      expect(app.find('#ds-sidebar').classes()).not.toContain('is-open')
      expect(app.find('.ds-header__menu').attributes('aria-expanded')).toBe('false')
    })

    it('closes the drawer on Escape and returns focus to the menu button', async () => {
      const app = mountApp()

      await app.find('.ds-header__menu').trigger('click')
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      await app.vm.$nextTick()

      expect(app.find('#ds-sidebar').classes()).not.toContain('is-open')
      expect(document.activeElement).toBe(app.find('.ds-header__menu').element)
    })

    it('scrolls smoothly by default', async () => {
      stubReducedMotion(false)
      const scroll = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})
      const app = mountApp()

      await app.find('.ds-sidebar__link[href="#sorting"]').trigger('click')

      expect(scroll).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
      expect(app.find('.ds-sidebar__link[href="#sorting"]').attributes('aria-current')).toBe('location')
    })

    it('scrolls without animation when the user prefers reduced motion', async () => {
      stubReducedMotion(true)
      const scroll = vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(() => {})
      const app = mountApp()

      await app.find('.ds-sidebar__link[href="#sorting"]').trigger('click')

      expect(scroll).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    })
  })
})
