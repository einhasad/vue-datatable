import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: __dirname,
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['src/__tests__/setup.ts'],
      include: ['**/*.spec.ts', '**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**']
    }
  })
)
