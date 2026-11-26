/// <reference types="vite/client" />
import { describe, it, expect, vi, afterAll } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import ExampleFrame from '../components/ExampleFrame.vue'
import { readFileSync } from 'node:fs'

let expectCount = 0
afterAll(() => {
  console.log(`[demo-examples] total expect() calls: ${expectCount}`)
})

vi.mock('shiki', () => ({
  codeToHtml: vi.fn(async (code: string) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre class="shiki"><code>${escaped}</code></pre>`
  })
}))

const examples = import.meta.glob('../components/*Example.vue', { eager: true })
const sources = import.meta.glob('../components/*Example.vue', { eager: true, query: '?raw', import: 'default' })

const TABS = ['preview', 'template', 'script'] as const

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  })
}

type Frame = ReturnType<VueWrapper['findAll']>[number]

function expectNoUnresolvedTag(wrapper: VueWrapper, label: string) {
  expectCount++
  expect(wrapper.html(), `${label}: unresolved <ExampleFrame> tag in DOM`).not.toContain('<exampleframe')
}

function getCodePane(frame: Frame, label: string): Frame {
  const code = frame.find('.ds-example-frame__code')
  expectCount++
  expect(code.exists(), `${label}: .ds-example-frame__code should be visible`).toBe(true)
  return code
}

function expectTemplateShowsGrid(frame: Frame, label: string) {
  const code = getCodePane(frame, label)
  expectCount++
  expect(code.text(), `${label}: code pane should show "<Grid" on template tab`).toContain('<Grid')
}

function expectScriptShowsLibImport(frame: Frame, label: string) {
  const code = getCodePane(frame, label)
  expectCount++
  expect(code.text(), `${label}: code pane should show "@einhasad-vue/datatable-vue" on script tab`).toContain('@einhasad-vue/datatable-vue')
}

function expectCodePaneHidesExampleFrameWrapper(frame: Frame, label: string) {
  const code = getCodePane(frame, label)
  expectCount++
  expect(code.text(), `${label}: code pane should NOT display the <ExampleFrame> wrapper`).not.toContain('<ExampleFrame')
}

const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const START_TAG = /<([a-zA-Z][\w.-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g
const ATTRIBUTE = /([^\s"'>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g
const DIRECTIVE_PREFIXES: Record<string, string> = { '@': 'v-on-', ':': 'v-bind-', '#': 'v-slot-' }

function xmlAttributeName(name: string): string {
  const prefix = DIRECTIVE_PREFIXES[name[0]]
  const expanded = prefix ? prefix + name.slice(1) : name
  return expanded.replace(/[^\w-]/g, '_')
}

function xmlAttributeValue(value: string | undefined): string {
  if (value === undefined) return '""'
  if (value.startsWith('"') || value.startsWith("'")) return value
  return `"${value}"`
}

function vueTemplateToXml(src: string): string {
  const xmlBody = src.replace(START_TAG, (_, tag: string, attrs: string, selfClose: string) => {
    const xmlAttrs = [...attrs.matchAll(ATTRIBUTE)]
      .map(([, name, value]) => ` ${xmlAttributeName(name)}=${xmlAttributeValue(value)}`)
      .join('')
    const close = selfClose || VOID_ELEMENTS.has(tag.toLowerCase()) ? '/' : ''
    return `<${tag}${xmlAttrs}${close}>`
  })
  return `<root>\n${xmlBody}\n</root>`
}

function getXmlError(src: string): string | null {
  const parser = new DOMParser()
  const doc = parser.parseFromString(vueTemplateToXml(src), 'text/xml')
  const err = doc.querySelector('parsererror')
  return err ? err.textContent : null
}

function expectTemplateIsValidXml(frame: Frame, label: string) {
  const code = getCodePane(frame, label)
  const raw = code.element.textContent ?? ''
  const err = getXmlError(raw)
  expectCount++
  expect(err, `${label}: template should be well-formed XML — ${err ?? ''}`).toBeNull()
}

describe('demo examples render correctly across tabs', () => {
  for (const [path, mod] of Object.entries(examples)) {
    const fileName = path.split('/').pop()!
    const source = sources[path] as string

    it(fileName, async () => {
      const Example = (mod as { default: unknown }).default
      const Wrapper = defineComponent({
        components: { ExampleFrame, Example: Example as never },
        setup() {
          return () => h(ExampleFrame, { file: fileName, source }, { default: () => h(Example as never) })
        }
      })

      const router = makeRouter()
      const wrapper = mount(Wrapper, {
        global: { plugins: [router] }
      })
      await router.isReady()
      await flushPromises()

      expectNoUnresolvedTag(wrapper, `${fileName} initial`)

      const frames = wrapper.findAll('.ds-example-frame')
      expectCount++
      expect(frames.length, `${fileName}: at least one ExampleFrame should render`).toBeGreaterThan(0)

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i]
        const buttons = frame.findAll('.ds-example-frame__tab')
        expectCount++
        expect(buttons.length, `${fileName} frame[${i}]: 3 tab buttons`).toBe(TABS.length)

        for (let t = 0; t < TABS.length; t++) {
          const tab = TABS[t]
          await buttons[t].trigger('click')
          await flushPromises()
          expectNoUnresolvedTag(wrapper, `${fileName} frame[${i}] after click "${tab}"`)
          if (tab === 'template') {
            expectTemplateShowsGrid(frame, `${fileName} frame[${i}]`)
            expectCodePaneHidesExampleFrameWrapper(frame, `${fileName} frame[${i}] template`)
            expectTemplateIsValidXml(frame, `${fileName} frame[${i}] template`)
          } else if (tab === 'script') {
            expectScriptShowsLibImport(frame, `${fileName} frame[${i}]`)
            expectCodePaneHidesExampleFrameWrapper(frame, `${fileName} frame[${i}] script`)
          }
        }
      }
    })
  }
})

describe('template well-formedness check', () => {
  it.each([
    ['bare boolean props and directives', '<Grid show-summary :columns="columns" @row-click.stop>\n  <template #header>\n    <span v-if="a > b">x</span>\n    <span v-else>y</span>\n  </template>\n</Grid>'],
    ['void elements without a closing slash', '<div>\n  <label for="q">Q</label>\n  <input id="q" v-model="q" disabled>\n  <br>\n  <img src="x.png" alt="">\n</div>'],
    ['self-closed components and quoted arrows', `<Grid :on-row-click="(row) => select(row)" v-model:page='page' />`]
  ])('accepts %s', (_, template) => {
    expect(getXmlError(template)).toBeNull()
  })

  it.each([
    ['an unclosed div', '<div class="a">\n  <span>x</span>\n'],
    ['mismatched tags', '<div>\n  <span>x</div>\n</span>'],
    ['a stray closing tag', '<div>x</div>\n</section>'],
    ['a closing tag for a void element', '<input id="q"></input>']
  ])('rejects %s', (_, template) => {
    expect(getXmlError(template)).not.toBeNull()
  })
})

describe('ExampleFrame tabs accessibility', () => {
  const source = '<template>\n  <Grid />\n</template>\n<script setup lang="ts">\nimport { Grid } from \'@einhasad-vue/datatable-vue\'\n</script>'

  function mountFrame(): VueWrapper {
    return mount(ExampleFrame, {
      props: { file: 'Demo.vue', source },
      slots: { default: '<p>preview body</p>' },
      attachTo: document.body
    })
  }

  function selectedTabs(wrapper: VueWrapper): string[] {
    return wrapper.findAll('[role="tab"]')
      .filter((tab) => tab.attributes('aria-selected') === 'true')
      .map((tab) => tab.text())
  }

  it('exposes a named tablist whose tabs report selection and control existing panels', async () => {
    const wrapper = mountFrame()
    const tablist = wrapper.get('[role="tablist"]')
    const labelId = tablist.attributes('aria-labelledby')
    expect(labelId).toBeTruthy()
    expect(wrapper.get(`[id="${labelId}"]`).text()).toBe('Demo.vue')

    const tabs = tablist.findAll('[role="tab"]')
    expect(tabs.map((tab) => tab.text())).toEqual(['preview', 'template', 'script'])
    expect(selectedTabs(wrapper)).toEqual(['preview'])

    await tabs[2].trigger('click')
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['script'])

    for (const tab of tabs) {
      const controls = tab.attributes('aria-controls')
      if (!controls) continue
      const panel = wrapper.get(`[id="${controls}"]`)
      expect(panel.attributes('role')).toBe('tabpanel')
      expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
    }
    expect(wrapper.get('[role="tab"][aria-selected="true"]').attributes('aria-controls')).toBeTruthy()
    expect(wrapper.get('.ds-example-frame__code').attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })

  it('keeps every tab in the tab order', () => {
    const wrapper = mountFrame()
    for (const tab of wrapper.findAll('[role="tab"]')) {
      expect(tab.attributes('tabindex')).toBeUndefined()
    }
    wrapper.unmount()
  })

  it('moves selection and focus with arrow, Home and End keys', async () => {
    const wrapper = mountFrame()
    const tab = (name: string): Frame => wrapper.findAll('[role="tab"]').find((t) => t.text() === name)!

    await tab('preview').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['template'])
    expect(document.activeElement).toBe(tab('template').element)

    await tab('template').trigger('keydown', { key: 'End' })
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['script'])

    await tab('script').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['preview'])

    await tab('preview').trigger('keydown', { key: 'ArrowLeft' })
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['script'])

    await tab('script').trigger('keydown', { key: 'Home' })
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['preview'])
    expect(document.activeElement).toBe(tab('preview').element)

    await tab('template').trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['script'])
    expect(document.activeElement).toBe(tab('script').element)

    await tab('script').trigger('keydown', { key: 'Home' })
    await flushPromises()

    await tab('preview').trigger('keydown', { key: 'a' })
    await flushPromises()
    expect(selectedTabs(wrapper)).toEqual(['preview'])
    wrapper.unmount()
  })

  it('gives every frame on a page unique ids', () => {
    const Page = defineComponent({
      setup() {
        return () => h('div', [
          h(ExampleFrame, { file: 'A.vue', source }),
          h(ExampleFrame, { file: 'B.vue', source })
        ])
      }
    })
    const wrapper = mount(Page)
    const ids = wrapper.findAll('[id]').map((el) => el.attributes('id'))
    expect(ids.length).toBeGreaterThan(2)
    expect(new Set(ids).size).toBe(ids.length)
    wrapper.unmount()
  })
})

describe('demo stylesheet accessibility guards', () => {
  const readDemoFile = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8')
  const designSystemCss = readDemoFile('../design-system.css')
  const demoCss = readDemoFile('../style.css')
  const exampleFrameSource = readDemoFile('../components/ExampleFrame.vue')
  const rootBlock = designSystemCss.match(/:root\s*{([^}]*)}/)![1]
  const tokens = Object.fromEntries(
    [...rootBlock.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
  )

  function resolve(value: string): string {
    const ref = value.match(/^var\((--[\w-]+)\)$/)
    return ref ? resolve(tokens[ref[1]]) : value
  }

  function luminance(hex: string): number {
    const channels = hex.replace('#', '').match(/../g)!.map((c) => parseInt(c, 16) / 255)
    const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  function contrast(fg: string, bg: string): number {
    const [a, b] = [luminance(resolve(fg)), luminance(resolve(bg))].sort((x, y) => y - x)
    return (a + 0.05) / (b + 0.05)
  }

  function ruleBody(css: string, selector: string): string {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = css.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*{([^}]*)}`))
    expect(match, `rule ${selector}`).not.toBeNull()
    return match![1]
  }

  it.each([
    ['--focus-ring-color', '--paper', 3],
    ['--focus-ring-color', '--surface', 3],
    ['--danger-ink', '--danger-soft', 4.5],
    ['--success-ink', '--success-soft', 4.5],
    ['--success-ink', '--surface', 4.5],
    ['--ink-2', '--paper', 4.5],
    ['--ink-3', '--paper', 4.5],
    ['--ink-3', '--surface-sunk', 4.5]
  ])('%s on %s reaches %s:1', (fg, bg, min) => {
    const color = (v: string): string => (v.startsWith('--') ? `var(${v})` : v)
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(min)
  })

  it('gives the danger button readable white text', () => {
    const body = ruleBody(designSystemCss, '.ds-btn--danger')
    const background = body.match(/background:\s*(#[0-9a-fA-F]{6})/)![1]
    expect(body).toMatch(/color:\s*#fff\b/i)
    expect(contrast('#FFFFFF', background)).toBeGreaterThanOrEqual(4.5)
  })

  it('never removes the focus outline', () => {
    for (const css of [designSystemCss, demoCss, exampleFrameSource]) {
      expect(css).not.toMatch(/outline:\s*(none|0)\b/)
    }
    expect(ruleBody(designSystemCss, '.ds-app :focus-visible')).toMatch(/outline:\s*2px solid var\(--focus-ring-color\)/)
    expect(ruleBody(demoCss, '.grid .grid-search-input:focus-visible')).toMatch(/outline:\s*2px solid/)
  })

  it('uses readable colours for frame tabs, required badges and tip titles', () => {
    expect(exampleFrameSource).not.toContain('--ink-1')
    expect(exampleFrameSource).not.toMatch(/rgba\(0, 0, 0, 0\.28\)/)
    expect(ruleBody(designSystemCss, '.ds-api-required')).toContain('var(--danger-ink)')
    expect(ruleBody(designSystemCss, '.ds-callout--tip .ds-callout__title')).toContain('var(--success-ink)')
  })

  it('keeps frame tabs and the install copy button at least 24px tall', () => {
    expect(exampleFrameSource).toMatch(/min-height:\s*28px/)
    expect(ruleBody(designSystemCss, '.ds-install__copy')).toMatch(/min-height:\s*24px/)
  })

  it('lets wide content scroll instead of clipping it', () => {
    expect(ruleBody(designSystemCss, '.ds-api-table-wrap')).toMatch(/overflow-x:\s*auto/)
    expect(ruleBody(designSystemCss, '.ds-example-frame')).not.toMatch(/overflow:\s*hidden/)
    expect(ruleBody(designSystemCss, '.ds-example-frame__chrome')).toMatch(/flex-wrap:\s*wrap/)
    expect(ruleBody(designSystemCss, '.ds-example-frame__stage')).toMatch(/overflow-x:\s*auto/)
    expect(designSystemCss).toMatch(/\.ds-prose p code[^{]*{\s*overflow-wrap:\s*anywhere/)
  })

  it('offers a menu drawer for the sidebar below 960px', () => {
    const mobile = designSystemCss.split('@media (max-width: 960px)')[1].split('@media')[0]
    expect(mobile).toMatch(/\.ds-header__menu\s*{\s*display:\s*inline-flex/)
    expect(mobile).toMatch(/\.ds-sidebar\.is-open\s*{[^}]*display:\s*block/)
    expect(mobile).toMatch(/\.ds-sidebar\.is-open\s*{[^}]*position:\s*fixed/)
    expect(ruleBody(designSystemCss, '.ds-header__menu')).toMatch(/display:\s*none/)
  })

  it('honours prefers-reduced-motion', () => {
    const reduced = designSystemCss.split('@media (prefers-reduced-motion: reduce)')[1]
    expect(reduced).toBeDefined()
    expect(reduced).toMatch(/scroll-behavior:\s*auto/)
    expect(reduced).toMatch(/transition-duration:\s*0\.01ms/)
    expect(reduced).toMatch(/animation-iteration-count:\s*1/)
  })
})
