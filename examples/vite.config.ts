import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    // Mock GitHub API server runs separately in Playwright webServer array
  ],
  resolve: {
    alias: {
      '@grid-vue/grid': resolve(__dirname, '../src'),
      '@': resolve(__dirname, 'src')
    }
  },
  base: '/vue-datatable/',
  server: {
    port: 3000
  }
})
