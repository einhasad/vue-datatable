import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  // GitHub Pages deployment with base path
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/vue-datatable/' : '/',
    head: {
      title: 'Grid Vue - Examples',
      meta: [
        { name: 'description', content: 'A flexible, configurable grid component library for Vue 3' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/vue-datatable/vite.svg' }
      ]
    }
  },

  // CSS
  css: [
    '~/assets/css/main.css'
  ],

  // Auto-import components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  // Nitro server configuration for mock API
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },

  // Vite configuration
  vite: {
    resolve: {
      alias: {
        '@grid-vue/grid/style.css': resolve(__dirname, '../dist/style.css'),
        '@grid-vue/grid': resolve(__dirname, '../dist/grid.js'),
      }
    },
    server: {
      fs: {
        // Allow serving files from the parent directory (for the grid library)
        allow: ['..']
      }
    }
  }
})
