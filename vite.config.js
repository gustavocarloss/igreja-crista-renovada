/// <reference types="vitest" />
import fs from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { getKeyRole } from './src/utils/supabaseKey.js'

const BRAND_COLOR = '#183672'

/**
 * Lê os headers de segurança do vercel.json para servir o mesmo CSP no `vite preview`.
 * Assim dá para testar localmente exatamente o que vai para produção.
 */
function readVercelHeaders() {
  try {
    const cfg = JSON.parse(fs.readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
    const entry = (cfg.headers || []).find((h) => h.source === '/(.*)')
    return Object.fromEntries((entry?.headers || []).map((h) => [h.key, h.value]))
  } catch {
    return {}
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Trava de segurança: não gera build de produção com chave privilegiada ou sem configuração.
  if (command === 'build' && mode === 'production') {
    if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_KEY) {
      throw new Error(
        '[build] Defina VITE_SUPABASE_URL e VITE_SUPABASE_KEY nas variáveis de ambiente antes de fazer o build.'
      )
    }
    if (getKeyRole(env.VITE_SUPABASE_KEY) === 'service_role') {
      throw new Error(
        '[build] VITE_SUPABASE_KEY contém uma chave service_role/secret. Use SOMENTE a chave anon/publishable no front-end.'
      )
    }
  }

  return {
    base: '/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: false, // o registro é feito em src/pwa/registerSW.js
        includeAssets: ['icr-logo.png', 'apple-touch-icon.png', 'favicon-16.png', 'favicon-32.png'],
        manifest: {
          id: '/',
          name: 'Igreja Cristã Renovada',
          short_name: 'ICR',
          description: 'Programação, agenda, Bíblia e comunidade da Igreja Cristã Renovada.',
          lang: 'pt-BR',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: BRAND_COLOR,
          background_color: BRAND_COLOR,
          categories: ['lifestyle', 'social'],
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest,woff2}'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          // Fallback offline: qualquer navegação sem internet recebe o "app shell" (index.html em cache),
          // e o próprio app mostra o aviso "sem conexão".
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /\.[a-z0-9]+$/i],
          runtimeCaching: [
            {
              // Dados do Supabase (auth, banco) NUNCA são cacheados: sempre rede.
              urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co'),
              handler: 'NetworkOnly',
            },
            {
              // Folhas de estilo do Google Fonts
              urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'google-fonts-styles' },
            },
            {
              // Arquivos de fonte (imutáveis)
              urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-files',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Capítulos da Bíblia lidos ficam disponíveis offline
              urlPattern: ({ url }) => url.origin === 'https://bolls.life' && url.pathname.startsWith('/get-chapter/'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'bible-chapters',
                expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 180 },
                cacheableResponse: { statuses: [200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    preview: {
      headers: readVercelHeaders(),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js',
    },
  }
})
