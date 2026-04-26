import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: false,
      outDir: 'dist',
      exclude: [
        'doc/**',
        'vite.config.ts',
        'node_modules/**',
        'src/mocks/**',
      ]
    }),
    {
      name: 'copy-styles',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'src/grid-default-styles.css'),
          resolve(__dirname, 'dist/grid-default-styles.css')
        )
        const themesDir = resolve(__dirname, 'dist/themes')
        mkdirSync(themesDir, { recursive: true })
        copyFileSync(
          resolve(__dirname, 'src/themes/classic.css'),
          resolve(themesDir, 'classic.css')
        )
        copyFileSync(
          resolve(__dirname, 'src/themes/material.css'),
          resolve(themesDir, 'material.css')
        )
      }
    }
  ],
  publicDir: false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Grid',
      fileName: (format) => format === 'es' ? 'grid.js' : 'grid.umd.cjs',
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
      '@': resolve(__dirname, './src')
    }
  }
})
