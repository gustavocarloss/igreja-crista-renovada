/**
 * Tradução de erros técnicos (Supabase, rede, etc.) para mensagens amigáveis em português.
 * Nenhuma mensagem de erro "crua" do servidor deve chegar ao usuário final.
 */

const NETWORK_RE = /failed to fetch|networkerror|network request failed|load failed|fetch failed|err_internet|err_network|tempo esgotado|timeout|timed out|aborterror|the operation was aborted/i

export const MESSAGES = {
  network: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
  serverDown: 'Nosso servidor está indisponível no momento. Tente novamente em alguns minutos.',
  permission: 'Você não tem permissão para realizar esta ação.',
  sessionExpired: 'Sua sessão expirou. Entre novamente.',
  generic: 'Algo deu errado. Tente novamente.'
}

/** Erro de conectividade (sem internet, DNS, timeout...). */
export function isNetworkError(err) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true
  if (!err) return false
  const message = String(err.message || err)
  return (
    err.name === 'AuthRetryableFetchError' ||
    err.name === 'AbortError' ||
    err.code === 'TIMEOUT' ||
    err.status === 0 ||
    NETWORK_RE.test(message)
  )
}

/** Banco/servidor fora do ar (5xx, projeto Supabase pausado...). */
export function isServerDownError(err) {
  if (!err) return false
  const status = Number(err.status)
  const message = String(err.message || '')
  return (
    (status >= 500 && status < 600) ||
    /service unavailable|bad gateway|gateway time-?out|upstream|pgrst00[0-3]|project is paused|<html/i.test(message)
  )
}

/** Qualquer falha em que vale a pena oferecer "tentar novamente". */
export function isConnectivityProblem(err) {
  return isNetworkError(err) || isServerDownError(err)
}

/**
 * Converte um erro em texto amigável.
 * @param {unknown} err
 * @param {string} [fallback] Mensagem usada quando não há tradução específica.
 */
export function friendlyError(err, fallback = MESSAGES.generic) {
  if (isNetworkError(err)) return MESSAGES.network
  if (isServerDownError(err)) return MESSAGES.serverDown

  const message = String(err?.message || '').toLowerCase()
  const code = String(err?.code || '')

  if (/invalid login credentials/.test(message)) return 'E-mail ou senha inválidos.'
  if (/email not confirmed/.test(message)) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
  if (/user already registered|already been registered|already exists/.test(message)) {
    return 'Este e-mail já está cadastrado. Tente entrar.'
  }
  if (/rate limit|too many requests|over_email_send_rate_limit|security purposes/.test(message) || err?.status === 429) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.'
  }
  if (/password should be at least|weak password|password is too weak/.test(message)) {
    return 'Senha muito fraca. Use pelo menos 8 caracteres, misturando letras e números.'
  }
  if (/different from the old password|same password/.test(message)) {
    return 'A nova senha precisa ser diferente da atual.'
  }
  if (/signups? not allowed|signup is disabled/.test(message)) return 'Novos cadastros estão desativados no momento.'
  if (/unable to validate email|invalid email|valid email/.test(message)) return 'Informe um e-mail válido.'
  if (/jwt expired|invalid jwt|refresh token|not authenticated|session missing|auth session missing/.test(message)) {
    return MESSAGES.sessionExpired
  }
  if (code === '42501' || /row-level security|permission denied|not allowed/.test(message)) return MESSAGES.permission
  if (code === '23505' || /duplicate key/.test(message)) return 'Este registro já existe.'

  return fallback
}
