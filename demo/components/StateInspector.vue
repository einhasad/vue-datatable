<template>
  <div class="state-inspector">
    <div class="state-inspector__head">
      <div class="state-inspector__title">
        <span>Live state JSON</span>
        <span
          v-if="lifetime"
          class="state-inspector__badge"
        >{{ lifetime }}</span>
      </div>
      <button
        type="button"
        class="state-inspector__reload"
        @click="reload"
      >
        Reload page ↻
      </button>
    </div>
    <pre class="state-inspector__json">{{ json }}</pre>
    <p
      v-if="storageHint"
      class="state-inspector__hint"
    >
      {{ storageHint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StateProvider } from '@einhasad-vue/datatable-vue'

const props = defineProps<{
  stateProvider: StateProvider
  lifetime?: string
  storageHint?: string
}>()

const json = computed(() => JSON.stringify(props.stateProvider.state, null, 2))

function reload(): void {
  window.location.reload()
}
</script>

<style scoped>
.state-inspector {
  margin-top: var(--space-3);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-sunk);
  overflow: hidden;
}

.state-inspector__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 8px 12px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.state-inspector__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-sm);
  font-weight: 500;
  color: var(--ink-2);
}

.state-inspector__badge {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  background: var(--ink);
  color: var(--paper);
}

.state-inspector__reload {
  font: inherit;
  font-size: 12px;
  padding: 4px 10px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink-2);
  border-radius: var(--radius-xs);
  cursor: pointer;
}

.state-inspector__reload:hover {
  border-color: var(--ink);
  color: var(--ink);
}

.state-inspector__json {
  margin: 0;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow: auto;
}

.state-inspector__hint {
  margin: 0;
  padding: 8px 12px;
  border-top: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink-3);
  font-size: 12px;
  font-family: var(--font-mono);
}
</style>
