import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import manifest from "./src/manifest.config";
import { crx } from "@crxjs/vite-plugin";

const DEBUG = false;

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: !DEBUG,
    target: "esnext",
  },
  esbuild: {
    minifyWhitespace: !DEBUG,
    minifyIdentifiers: !DEBUG,
  },
  plugins: [vue(), crx({ manifest })],
});
