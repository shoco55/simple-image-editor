import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "./src/assets/sass/prepends.scss" as pre;`,
      },
    },
  },
});
