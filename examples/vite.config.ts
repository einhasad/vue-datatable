import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@grid-vue/grid': resolve(__dirname, '../index.ts'),
      '@': resolve(__dirname, 'src')
    }
  },
  base: '/vue-datatable/',
  server: {
    port: 3000
  }
})
