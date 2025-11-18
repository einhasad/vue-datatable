import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { mockGitHubApiPlugin } from '../mock-server/vite-plugin.js'

export default defineConfig({
  plugins: [
    vue(),
    // Start mock GitHub API server with examples dev server
    mockGitHubApiPlugin({
      port: 3001,
      enabled: true,
      verbose: false
    })
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
