import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

import { graphzStylesPlugin } from './tsdown.css.config.ts'

function resolveProjectPath(relativePath: string): string {
  return fileURLToPath(new URL(relativePath, import.meta.url))
}

/** Single alias map shared by the demo server and Vitest; mirrors tsconfig paths. */
export const projectAliases = {
  '@configuration': resolveProjectPath('./src/graphz.config.json'),
  '@core': resolveProjectPath('./src/core'),
  '@domain': resolveProjectPath('./src/domain'),
  '@factories': resolveProjectPath('./src/factories'),
  '@graphz': resolveProjectPath('./src/index.ts'),
  '@services': resolveProjectPath('./src/services')
}

export default defineConfig({
  plugins: [graphzStylesPlugin()],
  resolve: {
    alias: projectAliases
  }
})
