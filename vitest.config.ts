import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
import path from 'path'

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        '@grid-vue/grid': path.resolve(__dirname, './src/index.ts')
      }
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'dist/',
          'doc/',
          'examples/',
          '*.config.ts',
          '*.config.js',
          'src/providers/DSTElasticDataProvider.ts', // Not exported
          '**/*.d.ts',
          '**/__tests__/**',
          '**/*.spec.ts',
          '**/*.test.ts'
        ],
        thresholds: {
          lines: 50,
          functions: 50,
          branches: 50,
          statements: 50
        }
      }
    }
  })
)
