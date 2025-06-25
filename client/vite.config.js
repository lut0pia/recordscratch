import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  define: {
    __WEB__: JSON.stringify(true),
  },
  plugins: [
    nodePolyfills(),
    vue(),
  ],
  resolve: {
    alias: Object.fromEntries(
         ['buffer', 'global', 'process'].map((k) => {
          const location = `vite-plugin-node-polyfills/shims/${k}`
          return [location, path.resolve(`node_modules/${location}/dist/index.cjs`)]
        })
      )
  },
})
