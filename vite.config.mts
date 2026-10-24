import { fileURLToPath, URL } from 'node:url';

import Vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import Fonts from 'unplugin-fonts/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

const buildTime = new Date().toISOString();

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serviceBaseURL = env.VITE_SERVICE_BASE_URL || '/api';

  return {
    plugins: [
      Vue({
        template: { transformAssetUrls },
      }),
      Vuetify({
        autoImport: true,
        styles: {
          configFile: 'src/styles/settings.scss',
        },
      }),
      Fonts({
        fontsource: {
          families: [
            {
              name: 'Roboto Mono',
              weights: [400, 700],
            },
            {
              name: 'Roboto',
              weights: [100, 300, 400, 500, 700, 900],
              styles: ['normal', 'italic'],
            },
          ],
        },
      }),
      Components({
        dirs: ['src/components'],
        dts: 'src/typings/components.d.ts',
        deep: true,
        extensions: ['vue'],
      }),
      UnoCSS(),
      {
        name: 'html-build-time',
        transformIndexHtml(html) {
          return html.replace('%BUILD_TIME%', buildTime);
        },
      },
    ],
    define: {
      'process.env': {},
      BUILD_TIME: JSON.stringify(buildTime),
      __VUE_PROD_DEVTOOLS__: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      port: 3000,
      proxy:
        env.VITE_HTTP_PROXY === 'Y' && env.VITE_PROXY_TARGET
          ? {
              [serviceBaseURL]: {
                target: env.VITE_PROXY_TARGET,
                changeOrigin: true,
                rewrite: (path) => path.replace(serviceBaseURL, ''),
              },
            }
          : undefined,
    },
    build: {
      sourcemap: env.VITE_SOURCE_MAP === 'Y',
    },
  };
});
