import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
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
