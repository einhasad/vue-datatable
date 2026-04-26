import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@einhasad-vue/datatable-vue': resolve(__dirname, '../src'),
      '@': resolve(__dirname, 'src')
    }
  },
  root: resolve(__dirname),
  base: '/',
  server: {
    port: 3001
  }
})
