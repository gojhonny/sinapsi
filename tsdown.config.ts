import { defineConfig } from 'tsdown'

import { sinapsiStylesPlugin } from './tsdown.css.config.ts'

export default defineConfig({
  clean: true,
  copy: {
    from: 'src/factories/index.css',
    rename: 'index.css',
    to: 'dist'
  },
  dts: {
    sourcemap: false
  },
  deps: {
    neverBundle: ['react']
  },
  entry: {
    browser: 'src/browser.client.ts',
    sinapsi: 'src/index.ts',
    'react-types': 'src/react.types.ts'
  },
  failOnWarn: true,
  fixedExtension: false,
  format: ['esm'],
  hash: false,
  minify: false,
  platform: 'neutral',
  plugins: [sinapsiStylesPlugin()],
  sourcemap: false,
  target: 'es2022'
})
