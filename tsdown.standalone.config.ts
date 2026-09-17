import { defineConfig } from 'tsdown'

import { graphzStylesPlugin } from './tsdown.css.config.ts'

/** Self-contained browser bundle for CDN usage: motion and zod are inlined. */
export default defineConfig({
  clean: false,
  deps: {
    alwaysBundle: ['motion', 'zod']
  },
  dts: false,
  entry: {
    'standalone/graphz': 'src/browser.client.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: true,
  platform: 'browser',
  plugins: [graphzStylesPlugin()],
  sourcemap: false,
  target: 'es2022'
})
