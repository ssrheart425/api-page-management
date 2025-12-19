import { fileURLToPath, URL } from 'node:url'
import { defineConfig, UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(
  ({ mode }: { mode: string }): UserConfig => ({
    base: mode === 'production' ? '/admin/' : '/',
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
)
