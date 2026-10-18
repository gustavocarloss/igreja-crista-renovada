import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_KEY, CONFIG_ERROR } from '../config'

const REQUEST_TIMEOUT_MS = 15000

/**
 * fetch com tempo limite. Sem isso, um banco fora do ar (ou pausado) deixa o app
 * "carregando" para sempre. Com o timeout, o usuário recebe uma mensagem clara.
 */
async function fetchWithTimeout(input, init = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const outerSignal = init.signal
  if (outerSignal) {
    if (outerSignal.aborted) controller.abort()
    else outerSignal.addEventListener('abort', () => controller.abort(), { once: true })
  }
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } catch (err) {
    if (err?.name === 'AbortError' && !outerSignal?.aborted) {
      const timeoutError = new Error('Tempo esgotado ao falar com o servidor')
      timeoutError.code = 'TIMEOUT'
      throw timeoutError
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// Somente a chave anon/publishable chega aqui (validada em src/config.js e no build).
// Se a configuração estiver inválida usamos valores "mortos" só para não quebrar a importação;
// o app mostra a tela de erro de configuração antes de qualquer chamada.
export const supabase = createClient(
  CONFIG_ERROR ? 'https://config-invalida.localhost' : SUPABASE_URL,
  CONFIG_ERROR ? 'config-invalida' : SUPABASE_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    global: { fetch: fetchWithTimeout }
  }
)

/** Erro padronizado das chamadas ao banco (preserva code/status para tradução amigável). */
export class ApiError extends Error {
  constructor(message, { code, status } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

const unwrap = ({ data, error }) => {
  if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
  return data
}

/**
 * Serviços de Autenticação e Usuário (Supabase Auth).
 */
export const authService = {
  /**
   * Busca o perfil do usuário autenticado. Se a conta existir no Auth mas o perfil não
   * (ex.: o cadastro caiu no meio do caminho), o perfil é criado automaticamente.
   */
  async getProfile(authUser) {
    const existing = unwrap(
      await supabase.from('user').select('*').eq('auth_user_id', authUser.id).maybeSingle()
    )
    if (existing) return existing

    const fallbackName =
      authUser.user_metadata?.name || (authUser.email ? authUser.email.split('@')[0] : 'Membro')
    const created = unwrap(
      await supabase
        .from('user')
        .insert([{ name: fallbackName, email: authUser.email, auth_user_id: authUser.id }])
        .select()
        .single()
    )
    return created
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
    if (!data?.user) throw new ApiError('Invalid login credentials')

    const profile = await this.getProfile(data.user)
    return { authUser: data.user, profile }
  },

  /** Confere se a senha informada está correta sem alterar a sessão do app. */
  async verifyPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
    return true
  },

  async register(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
    if (!data?.user) throw new ApiError('Não foi possível criar a conta.')

    // Quando o e-mail já existe e a confirmação por e-mail está ligada, o Supabase devolve
    // um usuário "falso" sem identities (proteção contra enumeração de contas).
    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new ApiError('User already registered')
    }

    // Sem sessão = confirmação de e-mail obrigatória; o perfil é criado no primeiro login.
    if (!data.session) return { session: null, profile: null }

    const profile = unwrap(
      await supabase
        .from('user')
        .insert([{ name, email, auth_user_id: data.user.id }])
        .select()
        .single()
    )
    return { session: data.session, profile }
  },

  async updateUser(id, userData) {
    const rows = unwrap(await supabase.from('user').update(userData).eq('id', id).select())
    if (!rows.length) throw new ApiError('permission denied', { code: '42501' })
    return rows
  },

  async updateAuthPassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
    return true
  },

  /** @returns {Promise<{ pending: boolean }>} pending=true quando falta confirmar no novo e-mail. */
  async updateAuthEmail(newEmail) {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
    return { pending: !!data?.user?.new_email }
  },

  /** Encerra a sessão neste aparelho (funciona mesmo sem internet). */
  async signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
  }
}

/**
 * Serviços de Eventos/Encontros.
 */
export const eventService = {
  async fetchEvents() {
    return unwrap(await supabase.from('meeting').select('*').order('meeting_date', { ascending: true }))
  },

  async addEvent(eventRow) {
    return unwrap(await supabase.from('meeting').insert([eventRow]).select())
  },

  async updateEvent(id, eventRow) {
    return unwrap(await supabase.from('meeting').update(eventRow).eq('id', id).select())
  },

  async deleteEvent(id) {
    const rows = unwrap(await supabase.from('meeting').delete().eq('id', id).select())
    if (!rows.length) throw new ApiError('permission denied', { code: '42501' })
    return true
  }
}

/**
 * Serviços de Confirmação de Presenças.
 */
export const attendanceService = {
  async fetchUserAttendances(userId) {
    return unwrap(await supabase.from('attendance').select('*').eq('user_id', userId))
  },

  /**
   * Lista quem confirmou presença em um evento (nome e avatar).
   * Só busca os usuários que realmente confirmaram — nunca a tabela inteira.
   */
  async fetchMeetingAttendees(meetingId) {
    const rows = unwrap(await supabase.from('attendance').select('id, user_id, meeting_id').eq('meeting_id', meetingId))
    if (!rows.length) return []

    const ids = [...new Set(rows.map((r) => r.user_id))]
    const users = unwrap(await supabase.from('user').select('id, name, avatar_url').in('id', ids))
    const byId = new Map(users.map((u) => [u.id, u]))

    return rows.map((row) => {
      const u = byId.get(row.user_id)
      return {
        id: row.id,
        meeting_id: row.meeting_id,
        user_id: row.user_id,
        user_name: u?.name || 'Membro',
        avatar_url: u?.avatar_url || null
      }
    })
  },

  async confirmPresence(userId, meetingId) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ user_id: userId, meeting_id: meetingId }])
      .select()
    // 23505 = já confirmado (duplo clique, outra aba): tratamos como sucesso.
    if (error && error.code !== '23505') {
      throw new ApiError(error.message, { code: error.code, status: error.status })
    }
    return { ok: true, data }
  },

  async cancelPresence(userId, meetingId) {
    const { data, error } = await supabase
      .from('attendance')
      .delete()
      .eq('user_id', userId)
      .eq('meeting_id', meetingId)
    if (error) throw new ApiError(error.message, { code: error.code, status: error.status })
    return { ok: true, data }
  }
}

/**
 * Serviços de Chat dos Eventos.
 */
export const chatService = {
  /**
   * Sem `after`: devolve as últimas `limit` mensagens (em ordem cronológica).
   * Com `after` (created_at da última mensagem conhecida): devolve só as novas.
   */
  async fetchMessages(meetingId, { after = null, limit = 100 } = {}) {
    if (after) {
      return unwrap(
        await supabase
          .from('messages')
          .select('*')
          .eq('meeting_id', meetingId)
          .gt('created_at', after)
          .order('created_at', { ascending: true })
          .limit(limit)
      )
    }
    const rows = unwrap(
      await supabase
        .from('messages')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false })
        .limit(limit)
    )
    return rows.reverse()
  },

  async sendMessage(messageData) {
    const data = unwrap(await supabase.from('messages').insert([messageData]).select())
    return { ok: true, data }
  },

  /** Avatares de vários usuários de uma vez (para não repetir a foto em cada mensagem). */
  async fetchAvatars(userIds) {
    if (!userIds.length) return {}
    const users = unwrap(await supabase.from('user').select('id, avatar_url').in('id', userIds))
    return Object.fromEntries(users.map((u) => [u.id, u.avatar_url || null]))
  }
}
