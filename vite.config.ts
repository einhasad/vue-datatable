import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false,
      outDir: 'dist',
      exclude: ['providers/DSTElasticDataProvider.ts', 'doc/**', 'vite.config.ts', 'node_modules/**']
    }),
    {
      name: 'copy-styles',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'styles.css'),
          resolve(__dirname, 'dist/style.css')
        )
      }
    }
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'DatatableVue',
      fileName: (format) => format === 'es' ? 'datatable-vue.js' : 'datatable-vue.umd.cjs',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['vue', 'vue-router'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        },
        // Preserve original export names
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name || 'assets/[name][extname]'
        }
      }
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Ensure compatibility
    target: 'es2020',
    // Clean output directory before build
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './')
    }
  }
})
