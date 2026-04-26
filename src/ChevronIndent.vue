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
    <span class="grid-chevron__icon" aria-hidden="true">▶</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ depth: number; expanded: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>
