/**
 * Regras de validação compartilhadas pelos formulários (cadastro, perfil).
 * São só para dar retorno rápido ao usuário — o Supabase Auth aplica as regras de verdade.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const MIN_PASSWORD_LENGTH = 8

export const PASSWORD_RULE_MESSAGE = `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres, com letras e números.`

/** @returns {boolean} */
export const isValidEmail = (email) => EMAIL_REGEX.test(String(email || '').trim())

/** @returns {boolean} */
export const isStrongPassword = (senha) =>
  typeof senha === 'string' && senha.length >= MIN_PASSWORD_LENGTH && /[A-Za-z]/.test(senha) && /\d/.test(senha)
