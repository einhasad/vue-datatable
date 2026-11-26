<template>
  <div class="ds-example-frame">
    <div class="ds-example-frame__chrome">
      <span
        :id="fileId"
        class="ds-example-frame__file"
      >{{ file }}</span>
      <div
        class="ds-example-frame__tools"
        role="tablist"
        :aria-labelledby="fileId"
      >
        <button
          v-for="tab in tabs"
          :id="tabId(tab)"
          :key="tab"
          ref="tabButtons"
          type="button"
          role="tab"
          class="ds-example-frame__tab"
          :class="{ 'is-active': active === tab }"
          :aria-selected="active === tab"
          :aria-controls="active === tab || tab === 'preview' ? panelId(tab) : undefined"
          @click="active = tab"
          @keydown="onTabKeydown($event, tab)"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <div
      v-show="active === 'preview'"
      :id="panelId('preview')"
      role="tabpanel"
      :aria-labelledby="tabId('preview')"
      class="ds-example-frame__stage ds-example-frame__stage--plain"
    >
      <slot />
    </div>

    <div
      v-if="active === 'template'"
      :id="panelId('template')"
      role="tabpanel"
      :aria-labelledby="tabId('template')"
      tabindex="0"
      class="ds-example-frame__code"
    >
      <div
        v-if="templateHtml"
        v-html="templateHtml"
      />
      <pre v-else><code>{{ templateSource }}</code></pre>
    </div>

    <div
      v-if="active === 'script'"
      :id="panelId('script')"
      role="tabpanel"
      :aria-labelledby="tabId('script')"
      tabindex="0"
      class="ds-example-frame__code"
    >
      <div
        v-if="scriptHtml"
        v-html="scriptHtml"
      />
      <pre v-else><code>{{ scriptSource }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, useId, useTemplateRef, watch } from 'vue'
import { codeToHtml } from 'shiki'

const props = defineProps<{
  file: string
  source: string
}>()

type Tab = 'preview' | 'template' | 'script'
const tabs: Tab[] = ['preview', 'template', 'script']
const active = ref<Tab>('preview')
const tabButtons = useTemplateRef<HTMLButtonElement[]>('tabButtons')

const uid = useId()
const fileId = `${uid}-file`
const tabId = (tab: Tab): string => `${uid}-tab-${tab}`
const panelId = (tab: Tab): string => `${uid}-panel-${tab}`

const tabKeyTargets: Partial<Record<string, (index: number) => number>> = {
  ArrowRight: (index) => (index + 1) % tabs.length,
  ArrowLeft: (index) => (index - 1 + tabs.length) % tabs.length,
  Home: () => 0,
  End: () => tabs.length - 1
}

async function onTabKeydown(event: KeyboardEvent, from: Tab): Promise<void> {
  const target = tabKeyTargets[event.key]
  if (!target) return
  event.preventDefault()
  const next = tabs[target(tabs.indexOf(from))]
  active.value = next
  await nextTick()
  tabButtons.value?.find((button) => button.id === tabId(next))?.focus()
}

const templateSource = computed(() => extractBlock(props.source, 'template'))
const scriptSource = computed(() => extractBlock(props.source, 'script'))

const templateHtml = shallowRef('')
const scriptHtml = shallowRef('')

const theme = 'github-light'

watch(
  templateSource,
  async (code) => {
    templateHtml.value = await codeToHtml(code, { lang: 'vue-html', theme })
  },
  { immediate: true }
)

watch(
  scriptSource,
  async (code) => {
    scriptHtml.value = await codeToHtml(code, { lang: 'typescript', theme })
  },
  { immediate: true }
)

function extractBlock(source: string, tag: 'template' | 'script'): string {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, 'i')
  const openMatch = source.match(openRe)
  if (openMatch?.index === undefined) return ''
  const start = openMatch.index + openMatch[0].length

  const tokenRe = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi')
  tokenRe.lastIndex = start
  let depth = 1
  let m: RegExpExecArray | null
  while ((m = tokenRe.exec(source)) !== null) {
    if (m[0].startsWith('</')) {
      depth--
      if (depth === 0) {
        return source.slice(start, m.index).replace(/^\n+|\n+$/g, '')
      }
    } else {
      depth++
    }
  }
  return source.slice(start).replace(/^\n+|\n+$/g, '')
}
</script>

<style scoped>
.ds-example-frame__tab {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  background: transparent;
  border: 1px solid transparent;
  font: inherit;
  color: var(--ink-2);
  padding: 4px 10px;
  cursor: pointer;
  border-radius: 4px;
  text-transform: capitalize;
}
.ds-example-frame__tab:hover { color: var(--ink); background: var(--surface-sunk); }
.ds-example-frame__tab.is-active {
  color: var(--ink);
  font-weight: 500;
  background: var(--surface);
  border-color: var(--line-2);
}
.ds-example-frame__code {
  overflow: auto;
  max-height: 480px;
  font-size: 12.5px;
  line-height: 1.65;
  background: var(--paper);
}
.ds-example-frame__code :deep(pre.shiki) {
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  background: transparent !important;
  overflow: visible;
  counter-reset: step;
}
.ds-example-frame__code :deep(pre.shiki code) {
  font-family: var(--font-mono);
  display: block;
}
.ds-example-frame__code :deep(pre.shiki .line) {
  display: inline-block;
  width: 100%;
}
.ds-example-frame__code :deep(pre.shiki .line::before) {
  counter-increment: step;
  content: counter(step);
  display: inline-block;
  width: 3em;
  margin-right: 1.25em;
  padding-right: 0.75em;
  text-align: right;
  color: var(--ink-3);
  border-right: 1px solid var(--line);
  user-select: none;
}
.ds-example-frame__code > pre {
  margin: 0;
  padding: 16px;
  font-family: var(--font-mono);
  color: var(--ink-2);
  white-space: pre;
}
</style>
