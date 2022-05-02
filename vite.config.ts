import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: 'simple-image-editor',
  alias: [
    {
      find: '@/',
      replacement: `./src/`,
    },
  ],
  plugins: [vue()],
  server: {
    host: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false,
        additionalData: `@use "./src/assets/sass/prepends.scss" as pre;`,
      },
    },
  },
});
