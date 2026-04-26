import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@einhasad-vue/datatable-vue': resolve(__dirname, '../src'),
      '@': resolve(__dirname, 'src')
    }
  },
  root: resolve(__dirname),
  base: command === 'build' ? '/vue-datatable/' : '/',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  },
  server: {
    port: 3001
  }
}))
