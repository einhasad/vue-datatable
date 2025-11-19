<template>
  <div class="code-example">
    <div v-if="loading" class="loading">Loading example...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <pre v-else class="code-block"><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  examplePath: string
}

const props = defineProps<Props>()

const code = ref<string>('')
const loading = ref<boolean>(true)
const error = ref<string>('')

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''

    // Import the file as raw text using Vite's ?raw suffix
    const modules = import.meta.glob('/examples/code/**/*.{vue,ts,tsx,js,jsx}', {
      query: '?raw',
      import: 'default'
    })

    // Normalize the path
    const normalizedPath = props.examplePath.startsWith('/')
      ? props.examplePath
      : `/${props.examplePath}`

    // Try to find the module
    const moduleKey = Object.keys(modules).find(key => key === normalizedPath)

    if (!moduleKey) {
      error.value = `Example file not found: ${props.examplePath}`
      console.error('Available modules:', Object.keys(modules))
      console.error('Looking for:', normalizedPath)
      return
    }

    const module = await modules[moduleKey]()
    code.value = module as string
  } catch (err) {
    error.value = `Failed to load example: ${err instanceof Error ? err.message : String(err)}`
    console.error('Error loading example:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.code-example {
  margin-top: 1.5rem;
}

.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.375rem;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.code-block code {
  color: #e2e8f0;
}

.loading {
  padding: 1rem;
  text-align: center;
  color: #718096;
  font-style: italic;
}

.error {
  padding: 1rem;
  background: #fed7d7;
  border-left: 4px solid #fc8181;
  border-radius: 0.25rem;
  color: #742a2a;
  font-size: 0.9rem;
}
</style>
