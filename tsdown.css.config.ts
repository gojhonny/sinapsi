import { readFile } from 'node:fs/promises'

const SINAPSI_STYLES_ID = 'virtual:sinapsi-styles'
const RESOLVED_SINAPSI_STYLES_ID = `\0${SINAPSI_STYLES_ID}`
const SINAPSI_STYLES_URL = new URL('./src/factories/index.css', import.meta.url)

/**
 * Inlines the shadow-tree stylesheet as a string module. The same plugin object
 * serves tsdown (package builds), Vite (sandbox) and Vitest (colocated suites).
 */
export function sinapsiStylesPlugin() {
  return {
    name: 'sinapsi-styles',
    resolveId(id: string): string | undefined {
      return id === SINAPSI_STYLES_ID ? RESOLVED_SINAPSI_STYLES_ID : undefined
    },
    async load(id: string): Promise<string | undefined> {
      if (id !== RESOLVED_SINAPSI_STYLES_ID) {
        return undefined
      }

      const styles = await readFile(SINAPSI_STYLES_URL, 'utf8')

      return `export default ${JSON.stringify(styles)}`
    }
  }
}
