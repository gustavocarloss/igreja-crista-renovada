import { createClient } from '@supabase/supabase-js'

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_REST_URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

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
      
    if (profileError) {
      console.error('Database Error:', profileError)
      throw new Error(`Erro no banco: ${profileError.message}`)
    }
    
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
    const { data, error } = await supabase.from('meeting').select('*')
    if (error) throw new Error('Falha ao carregar eventos')
    return data
  },

  async addEvent(eventRow) {
    const { data, error } = await supabase.from('meeting').insert([eventRow]).select()
    if (error) throw new Error(error.message)
    return data
  },

  async updateEvent(id, eventRow) {
    const { data, error } = await supabase.from('meeting').update(eventRow).eq('id', id).select()
    if (error) throw new Error(error.message)
    return data
  },

  async deleteEvent(id) {
    const { error } = await supabase.from('meeting').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return true
  }
}

/**
 * Serviços de Confirmação de Presenças.
 */
export const attendanceService = {
  async fetchAllAttendances() {
    const { data, error } = await supabase.from('attendance').select('*')
    if (error) throw new Error('Falha ao carregar presenças')
    return data
  },

  async fetchUserAttendances(userId) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
    if (error) throw new Error('Falha ao buscar presenças do usuário')
    return data
  },

  async confirmPresence(userId, meetingId) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ user_id: userId, meeting_id: meetingId }])
      .select()
    if (error) {
      console.error('Supabase confirmPresence error:', error)
      throw new Error(error.message)
    }
    return { ok: true, data }
  },

  async cancelPresence(userId, meetingId) {
    const { data, error } = await supabase
      .from('attendance')
      .delete()
      .eq('user_id', userId)
      .eq('meeting_id', meetingId)
    if (error) {
      console.error('Supabase cancelPresence error:', error)
      throw new Error(error.message)
    }
    return { ok: true, data }
  }
}

/**
 * Serviços de Chat dos Eventos.
 */
export const chatService = {
  async fetchMessages(meetingId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })
    if (error) throw new Error('Falha ao buscar mensagens')
    return data
  },

  async sendMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
    if (error) throw new Error('Falha ao enviar mensagem')
    return { ok: true, data }
  }
}
