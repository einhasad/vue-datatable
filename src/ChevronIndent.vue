<template>
  <button
    type="button"
    class="grid-chevron"
    :class="{ 'grid-chevron--expanded': expanded }"
    :style="{ marginLeft: `calc(var(--grid-depth-indent, 1.25rem) * ${depth})` }"
    :aria-expanded="expanded"
    :aria-label="expanded ? 'Collapse row' : 'Expand row'"
    data-qa="grid-chevron"
    @click.stop="emit('toggle')"
  >
    <svg
      class="grid-chevron__icon"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <polyline points="3.5,2 7,5 3.5,8" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{ depth: number; expanded: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>
