import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@einhasad-vue/datatable-vue': resolve(__dirname, '../src'),
      '@': resolve(__dirname, 'src')
    }
  },
  base: process.env.NODE_ENV === 'production' ? '/vue-datatable/' : '/',
  server: {
    port: 3000
  }
})
