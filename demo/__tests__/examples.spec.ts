/// <reference types="vite/client" />
import { describe, it, expect, vi, afterAll } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import ExampleFrame from '../components/ExampleFrame.vue'

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

function vueTemplateToXml(src: string): string {
  // Convert Vue shorthand attributes to XML-safe attribute names.
  // Modifiers like @keyup.enter become v-on-keyup_enter (dots → underscores)
  // because some XML parsers reject dots in attribute names.
  const safe = (s: string) => s.replace(/\./g, '_')
  const xmlBody = src
    .replace(/(\s)@([a-zA-Z][\w.-]*)=/g, (_, sp, n) => `${sp}v-on-${safe(n)}=`)
    .replace(/(\s):([a-zA-Z][\w.-]*)=/g, (_, sp, n) => `${sp}v-bind-${safe(n)}=`)
    .replace(/(\s)#([a-zA-Z][\w.-]*)=/g, (_, sp, n) => `${sp}v-slot-${safe(n)}=`)
    .replace(/(\s)#([a-zA-Z][\w.-]*)(\s|>)/g, (_, sp, n, end) => `${sp}v-slot-${safe(n)}=""${end}`)
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
