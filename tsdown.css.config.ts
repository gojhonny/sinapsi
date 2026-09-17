import { readFile } from 'node:fs/promises'

const GRAPHZ_STYLES_ID = 'virtual:graphz-styles'
const RESOLVED_GRAPHZ_STYLES_ID = `\0${GRAPHZ_STYLES_ID}`
const GRAPHZ_STYLES_URL = new URL('./src/factories/index.css', import.meta.url)

/**
 * Inlines the shadow-tree stylesheet as a string module. The same plugin object
 * serves tsdown (package builds), Vite (demo) and Vitest (colocated suites).
 */
export function graphzStylesPlugin() {
  return {
    name: 'graphz-styles',
    resolveId(id: string): string | undefined {
      return id === GRAPHZ_STYLES_ID ? RESOLVED_GRAPHZ_STYLES_ID : undefined
    },
    async load(id: string): Promise<string | undefined> {
      if (id !== RESOLVED_GRAPHZ_STYLES_ID) {
        return undefined
      }

      const styles = await readFile(GRAPHZ_STYLES_URL, 'utf8')

      return `export default ${JSON.stringify(styles)}`
    }
  }
}
