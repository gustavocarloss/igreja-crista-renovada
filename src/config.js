import { getKeyRole } from './utils/supabaseKey'

/**
 * Configuração do Supabase vinda EXCLUSIVAMENTE de variáveis de ambiente (Vite).
 * Tudo que começa com VITE_ é embutido no JavaScript público, então aqui só pode
 * existir a chave anon/publishable. Se alguém colocar a service_role por engano,
 * o app se recusa a iniciar (e o build também falha — ver vite.config.js).
 */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim()
export const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_KEY || '').trim()

function validate() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY não configuradas.'
  }
  if (!/^https:\/\//i.test(SUPABASE_URL) && !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(SUPABASE_URL)) {
    return 'VITE_SUPABASE_URL deve começar com https://'
  }
  if (getKeyRole(SUPABASE_KEY) === 'service_role') {
    return 'Chave secreta (service_role) detectada no front-end. Use apenas a chave anon/publishable.'
  }
  return null
}

/** `null` quando está tudo certo; caso contrário, descrição técnica do problema. */
export const CONFIG_ERROR = validate()
