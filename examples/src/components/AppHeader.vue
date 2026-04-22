<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <h1>Grid Vue</h1>
        <p class="tagline">A flexible, configurable grid component library for Vue 3</p>
      </div>
      <div class="theme-controls">
        <select v-model="themeFamily" class="theme-select">
          <option value="classic">Classic</option>
          <option value="material">Material</option>
        </select>
        <div class="theme-mode">
          <label class="theme-radio" :class="{ active: themeMode === 'light' }">
            <input type="radio" value="light" v-model="themeMode" />
            Light
          </label>
          <label class="theme-radio" :class="{ active: themeMode === 'auto' }">
            <input type="radio" value="auto" v-model="themeMode" />
            Auto
          </label>
          <label class="theme-radio" :class="{ active: themeMode === 'dark' }">
            <input type="radio" value="dark" v-model="themeMode" />
            Dark
          </label>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const themeFamily = ref<'classic' | 'material'>('classic')
const themeMode = ref<'light' | 'dark' | 'auto'>('auto')

const osDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
let mediaQuery: MediaQueryList | null = null
const onMediaChange = (e: MediaQueryListEvent) => {
  osDark.value = e.matches
}

const resolvedDark = computed(() => {
  if (themeMode.value === 'dark') return true
  if (themeMode.value === 'light') return false
  return osDark.value
})

const themeFamilyClass = computed(() => `grid-theme-${themeFamily.value}`)

watch([themeFamilyClass, themeMode, resolvedDark], () => {
  const el = document.documentElement
  el.classList.remove('grid-theme-classic', 'grid-theme-material', 'dark')
  el.classList.add(themeFamilyClass.value)
  if (resolvedDark.value) el.classList.add('dark')
  el.style.colorScheme = themeMode.value === 'dark' ? 'dark'
    : themeMode.value === 'light' ? 'light'
    : 'light dark'
}, { immediate: true })

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  osDark.value = mediaQuery.matches
  mediaQuery.addEventListener('change', onMediaChange)
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', onMediaChange)
})
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.tagline {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
  color: white;
}

.theme-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-select {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.theme-select option {
  background: #333;
  color: white;
}

.theme-mode {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.theme-radio {
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
  transition: background 0.2s;
}

.theme-radio input {
  display: none;
}

.theme-radio.active {
  background: rgba(255, 255, 255, 0.25);
}

.theme-radio:not(.active):hover {
  background: rgba(255, 255, 255, 0.1);
}

</style>

<style scoped>
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
