import { createClient } from '@supabase/supabase-js'

const SUPABASE_BASE_URL = 'https://rhtpvuwketpdugrqgkjb.supabase.co'
const SUPABASE_REST_URL = 'https://rhtpvuwketpdugrqgkjb.supabase.co/rest/v1'
const SUPABASE_KEY = 'sb_publishable__KYRgCYXo50q1HG3xTgZHQ_DCGwv-_C'

export const supabase = createClient(SUPABASE_BASE_URL, SUPABASE_KEY)

export const supabaseHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Prefer': 'return=representation'
}

/**
 * Serviços de Autenticação e Usuário (Agora com Supabase Auth Nativo).
 */
export const authService = {
  async login(email, password) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError) throw new Error(authError.message)
    if (!authData || !authData.user) throw new Error('Invalid login credentials')
      
    const { data: profile, error: profileError } = await supabase
      .from('user')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single()
      
    if (profileError || !profile) {
      throw new Error('Perfil não encontrado no banco de dados.')
    }

    return [profile] // Mantendo a estrutura de array que o app espera
  },

  async register(name, email, password) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (authError) throw new Error(authError.message)
      
    const { data: profile, error: profileError } = await supabase
      .from('user')
      .insert([{ name, email, auth_user_id: authData.user?.id }])
      .select()
      
    if (profileError) throw new Error('Erro ao salvar o perfil no banco.')
    
    return profile
  },

  async updateUser(id, userData) {
    const { data, error } = await supabase
      .from('user')
      .update(userData)
      .eq('id', id)
      .select()
      
    if (error) throw new Error(error.message)
    return data
  },

  async updateAuthPassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
    return true
  },

  async updateAuthEmail(newEmail) {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw new Error(error.message)
    return true
  }
}

/**
 * Serviços de Eventos/Encontros.
 */
export const eventService = {
  async fetchEvents() {
    const res = await fetch(`${SUPABASE_REST_URL}/meeting`, {
      method: 'GET',
      headers: supabaseHeaders
    })
    if (!res.ok) throw new Error('Falha ao carregar eventos')
    return res.json()
  },

  async addEvent(eventRow) {
    const res = await fetch(`${SUPABASE_REST_URL}/meeting`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(eventRow)
    })
    if (!res.ok) throw new Error('Falha ao adicionar evento')
    return res.json()
  },

  async updateEvent(id, eventRow) {
    const res = await fetch(`${SUPABASE_REST_URL}/meeting?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders,
      body: JSON.stringify(eventRow)
    })
    if (!res.ok) throw new Error('Falha ao atualizar evento')
    return res.json()
  },

  async deleteEvent(id) {
    const res = await fetch(`${SUPABASE_REST_URL}/meeting?id=eq.${id}`, {
      method: 'DELETE',
      headers: supabaseHeaders
    })
    if (!res.ok) throw new Error('Falha ao excluir evento')
    return res
  }
}

/**
 * Serviços de Confirmação de Presenças.
 */
export const attendanceService = {
  async fetchAllAttendances() {
    const res = await fetch(`${SUPABASE_REST_URL}/attendance`, {
      method: 'GET',
      headers: supabaseHeaders
    })
    if (!res.ok) throw new Error('Falha ao carregar presenças')
    return res.json()
  },

  async fetchUserAttendances(userId) {
    const res = await fetch(`${SUPABASE_REST_URL}/attendance?user_id=eq.${userId}`, {
      method: 'GET',
      headers: supabaseHeaders
    })
    if (!res.ok) throw new Error('Falha ao buscar presenças do usuário')
    return res.json()
  },

  async confirmPresence(userId, meetingId) {
    const res = await fetch(`${SUPABASE_REST_URL}/attendance`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify({
        user_id: userId,
        meeting_id: meetingId
      })
    })
    return res
  },

  async cancelPresence(userId, meetingId) {
    const res = await fetch(`${SUPABASE_REST_URL}/attendance?user_id=eq.${userId}&meeting_id=eq.${meetingId}`, {
      method: 'DELETE',
      headers: supabaseHeaders
    })
    return res
  }
}

/**
 * Serviços de Chat dos Eventos.
 */
export const chatService = {
  async fetchMessages(meetingId) {
    // Ordem cronológica ascendente para o chat (mais antigos no topo, novos embaixo)
    const res = await fetch(`${SUPABASE_REST_URL}/messages?meeting_id=eq.${meetingId}&order=created_at.asc`, {
      method: 'GET',
      headers: supabaseHeaders
    })
    if (!res.ok) throw new Error('Falha ao buscar mensagens')
    return res.json()
  },

  async sendMessage(messageData) {
    const res = await fetch(`${SUPABASE_REST_URL}/messages`, {
      method: 'POST',
      headers: supabaseHeaders,
      body: JSON.stringify(messageData)
    })
    if (!res.ok) throw new Error('Falha ao enviar mensagem')
    return res
  }
}
