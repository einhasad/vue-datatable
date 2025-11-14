<template>
  <component
    :is="options.is"
    v-bind="options.props"
  >
    <span
      v-if="options.content"
      v-html="options.content"
    />
    <template v-if="options.children">
      <DynamicComponent
        v-for="(child, index) in options.children"
        :key="(child.props as any)?.key || index"
        :options="child"
      />
    </template>
  </component>
</template>

<script setup lang="ts">
import type { ComponentOptions } from './types'

defineProps<{
  options: ComponentOptions
}>()
</script>
