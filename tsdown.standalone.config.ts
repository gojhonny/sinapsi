import { defineConfig } from 'tsdown'

import { sinapsiStylesPlugin } from './tsdown.css.config.ts'

/** Self-contained browser bundle for CDN usage: motion and zod are inlined. */
export default defineConfig({
  clean: false,
  deps: {
    alwaysBundle: ['motion', 'zod']
  },
  dts: false,
  entry: {
    'standalone/sinapsi': 'src/browser.client.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: true,
  platform: 'browser',
  plugins: [sinapsiStylesPlugin()],
  sourcemap: false,
  target: 'es2022'
})
