import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  define: {
    __WEB__: JSON.stringify(true),
  },
  plugins: [
    vue(),
    nodePolyfills(),
  ],
})
