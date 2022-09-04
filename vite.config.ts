import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import manifest from './src/manifest.config'
import { crx } from '@crxjs/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // minify: false,
    target: 'esnext'
  },
  // esbuild: {
  //   minifyWhitespace: false,
  //   minifyIdentifiers: false,
  // },
  plugins: [vue(), crx({ manifest })]
})
