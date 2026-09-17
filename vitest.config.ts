import { fileURLToPath } from 'node:url'

import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'virtual:sinapsi-styles': fileURLToPath(new URL('./test/fixtures/sinapsi-styles.ts', import.meta.url))
      }
    },
    test: {
      clearMocks: true,
      coverage: {
        exclude: [
          'src/**/*.test.ts',
          'src/browser.client.ts',
          'src/core/styles.types.d.ts',
          'src/react.types.ts'
        ],
        include: ['src/**/*.ts'],
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html']
      },
      environment: 'happy-dom',
      include: ['src/**/*.test.ts'],
      restoreMocks: true,
      setupFiles: ['./test/setup.ts']
    }
  })
)
