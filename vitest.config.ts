import { fileURLToPath, URL } from 'node:url';

import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    Vue(),
    Components({
      dirs: ['src/components'],
      dts: 'src/typings/components.d.ts',
      deep: true,
      extensions: ['vue'],
    }),
  ],
  define: {
    BUILD_TIME: JSON.stringify('test'),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.spec.ts', 'src/test/**', 'src/typings/**'],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 42,
        lines: 50,
      },
    },
  },
});
