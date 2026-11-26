import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pkg from '../package.json'

const pagesBase = '/vue-datatable/'
const pagesUrl = `https://einhasad.github.io${pagesBase}`

export default defineConfig(({ command, isPreview }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@einhasad-vue/datatable-vue': resolve(__dirname, '../src'),
      '@': resolve(__dirname, 'src')
    }
  },
  root: resolve(__dirname),
  base: command === 'build' || isPreview ? pagesBase : '/',
  define: {
    'import.meta.env.DEMO_DESCRIPTION': JSON.stringify(pkg.description),
    'import.meta.env.DEMO_SITE_URL': JSON.stringify(pagesUrl)
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  },
  server: {
    port: 3001
  }
}))
