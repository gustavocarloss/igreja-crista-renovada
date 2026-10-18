import { registerSW } from 'virtual:pwa-register'

const HOUR = 60 * 60 * 1000

/**
 * Registra o service worker (somente em produção — no `npm run dev` ele fica desligado).
 * `registerType: 'autoUpdate'`: quando há versão nova, ela é baixada e ativada sozinha,
 * então não há manutenção manual de cache. Também verificamos atualização a cada hora e
 * sempre que o app volta para o primeiro plano.
 */
export function setupServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return
      setInterval(() => registration.update().catch(() => {}), HOUR)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {})
      })
    },
    onRegisterError(error) {
      console.error('Falha ao registrar o service worker', error)
    }
  })
}
