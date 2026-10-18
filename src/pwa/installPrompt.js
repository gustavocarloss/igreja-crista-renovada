/**
 * Captura o evento `beforeinstallprompt` (Android/Chrome/Edge) o mais cedo possível.
 *
 * O navegador dispara esse evento uma única vez, normalmente ANTES do React montar.
 * Por isso o listener é registrado na importação deste módulo (em main.jsx) e os
 * componentes apenas assinam o estado depois.
 */
let deferredPrompt = null
let installed = false
const listeners = new Set()

const notify = () => listeners.forEach((fn) => fn())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault() // impede o mini-infobar padrão; usamos nosso botão
    deferredPrompt = event
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    installed = true
    notify()
  })
}

export const installStore = {
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  canPrompt: () => !!deferredPrompt,
  wasInstalled: () => installed,
  async prompt() {
    if (!deferredPrompt) return 'unavailable'
    const event = deferredPrompt
    deferredPrompt = null // o evento só pode ser usado uma vez
    notify()
    await event.prompt()
    const choice = await event.userChoice
    return choice?.outcome || 'dismissed'
  }
}

/** App já está rodando instalado (standalone)? */
export function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    window.navigator.standalone === true
  )
}

/** iPhone/iPad/iPod (inclui iPadOS que se identifica como Mac com toque). */
export function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return /iphone|ipad|ipod/i.test(ua) || iPadOS
}
