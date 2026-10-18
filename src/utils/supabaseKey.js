/**
 * Descobre o "papel" (role) de uma chave do Supabase SEM precisar chamar a API.
 *
 * - Chaves novas: `sb_publishable_...` (segura p/ front-end) e `sb_secret_...` (NUNCA no front-end).
 * - Chaves legadas (JWT): o payload traz `role: "anon"` ou `role: "service_role"`.
 *
 * Usado tanto pelo app (src/config.js) quanto pelo build (vite.config.js) para impedir
 * que uma chave privilegiada seja publicada por engano.
 *
 * @param {string} key
 * @returns {'anon'|'service_role'|'unknown'}
 */
export function getKeyRole(key) {
  if (!key || typeof key !== 'string') return 'unknown'
  const value = key.trim()

  if (value.startsWith('sb_secret_')) return 'service_role'
  if (value.startsWith('sb_publishable_')) return 'anon'

  const parts = value.split('.')
  if (parts.length === 3) {
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
      const payload = JSON.parse(atob(padded))
      if (payload.role === 'service_role') return 'service_role'
      if (payload.role === 'anon') return 'anon'
    } catch {
      return 'unknown'
    }
  }
  return 'unknown'
}
