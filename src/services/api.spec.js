import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * O cliente do Supabase é substituído por um "query builder" falso que registra cada chamada
 * (tabela, método e argumentos) e devolve a resposta configurada no teste.
 */
const calls = []
let nextResult = { data: [], error: null }
const queue = []
const auth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn()
}

function builder(table) {
  const chain = {}
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'gt', 'in', 'order', 'limit']) {
    chain[method] = (...args) => {
      calls.push({ table, method, args })
      return chain
    }
  }
  // Cada consulta consome a próxima resposta da fila (ou `nextResult`, se a fila estiver vazia).
  const take = () => Promise.resolve(queue.length ? queue.shift() : nextResult)
  chain.maybeSingle = take
  chain.single = take
  chain.then = (resolve, reject) => take().then(resolve, reject)
  return chain
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: (table) => builder(table), auth })
}))

vi.mock('../config', () => ({
  SUPABASE_URL: 'https://exemplo.supabase.co',
  SUPABASE_KEY: 'sb_publishable_teste',
  CONFIG_ERROR: null
}))

const { authService, eventService, attendanceService, chatService } = await import('./api')

const callsFor = (method) => calls.filter((c) => c.method === method)

describe('Serviços de API (Supabase)', () => {
  beforeEach(() => {
    calls.length = 0
    queue.length = 0
    nextResult = { data: [], error: null }
    vi.clearAllMocks()
  })

  describe('authService', () => {
    it('login autentica pelo Supabase Auth e carrega o perfil', async () => {
      auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'auth-1', email: 'a@b.com' } }, error: null })
      nextResult = { data: { id: 1, name: 'Ana', role: 'user', avatar_url: null }, error: null }

      const { profile } = await authService.login('a@b.com', 'senha123')

      expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.com', password: 'senha123' })
      expect(profile.name).toBe('Ana')
      // Nunca busca todas as colunas (ex.: e-mail de outros usuários)
      expect(callsFor('select')[0].args[0]).not.toBe('*')
    })

    it('login propaga o erro do Auth', async () => {
      auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Invalid login credentials', status: 400 } })
      await expect(authService.login('a@b.com', 'errada')).rejects.toThrow('Invalid login credentials')
    })

    it('register detecta e-mail já cadastrado (usuário sem identities)', async () => {
      auth.signUp.mockResolvedValue({ data: { user: { id: 'x', identities: [] }, session: null }, error: null })
      await expect(authService.register('Ana', 'a@b.com', 'senha123')).rejects.toThrow('User already registered')
    })

    it('register sem sessão (confirmação de e-mail) não cria perfil ainda', async () => {
      auth.signUp.mockResolvedValue({ data: { user: { id: 'x', identities: [{}] }, session: null }, error: null })
      const result = await authService.register('Ana', 'a@b.com', 'senha123')
      expect(result).toEqual({ session: null, profile: null })
      expect(callsFor('insert')).toHaveLength(0)
    })

    it('register com sessão cria o perfil sem enviar role', async () => {
      auth.signUp.mockResolvedValue({
        data: { user: { id: 'auth-9', email: 'a@b.com', identities: [{}] }, session: { access_token: 't' } },
        error: null
      })
      nextResult = { data: { id: 9, name: 'Ana', role: 'user' }, error: null }

      await authService.register('Ana', 'a@b.com', 'senha123')

      const [row] = callsFor('insert')[0].args[0]
      expect(row).toEqual({ name: 'Ana', email: 'a@b.com', auth_user_id: 'auth-9' })
      expect(row).not.toHaveProperty('role')
    })

    it('updateUser só envia campos editáveis (nunca role/email)', async () => {
      nextResult = { data: [{ id: 1 }], error: null }

      await authService.updateUser(1, { avatar_url: 'data:image/jpeg;base64,AAAA', role: 'admin', email: 'x@y.com' })

      expect(callsFor('update')[0].args[0]).toEqual({ avatar_url: 'data:image/jpeg;base64,AAAA' })
    })

    it('updateUser recusa quando não há campo editável', async () => {
      await expect(authService.updateUser(1, { role: 'admin' })).rejects.toThrow()
      expect(callsFor('update')).toHaveLength(0)
    })

    it('updateUser trata "nenhuma linha alterada" como falta de permissão', async () => {
      nextResult = { data: [], error: null }
      await expect(authService.updateUser(1, { name: 'Novo' })).rejects.toMatchObject({ code: '42501' })
    })
  })

  describe('eventService', () => {
    it('fetchEvents ordena por data', async () => {
      nextResult = { data: [{ id: 10, meeting_name: 'Culto' }], error: null }
      const data = await eventService.fetchEvents()
      expect(data[0].meeting_name).toBe('Culto')
      expect(callsFor('order')[0].args[0]).toBe('meeting_date')
    })

    it('updateEvent filtra pelo id', async () => {
      nextResult = { data: [{ id: 12 }], error: null }
      await eventService.updateEvent(12, { meeting_name: 'Editado' })
      expect(callsFor('eq')[0].args).toEqual(['id', 12])
    })

    it('deleteEvent sem linhas removidas = sem permissão (RLS)', async () => {
      nextResult = { data: [], error: null }
      await expect(eventService.deleteEvent(13)).rejects.toMatchObject({ code: '42501' })
    })

    it('erro do banco vira ApiError com código', async () => {
      nextResult = { data: null, error: { message: 'new row violates row-level security policy', code: '42501' } }
      await expect(eventService.addEvent({})).rejects.toMatchObject({ name: 'ApiError', code: '42501' })
    })
  })

  describe('attendanceService', () => {
    it('confirmPresence trata duplicidade (23505) como sucesso', async () => {
      nextResult = { data: null, error: { message: 'duplicate key', code: '23505' } }
      await expect(attendanceService.confirmPresence(1, 100)).resolves.toMatchObject({ ok: true })
    })

    it('cancelPresence filtra por usuário e evento', async () => {
      await attendanceService.cancelPresence(2, 200)
      expect(callsFor('eq').map((c) => c.args)).toEqual([['user_id', 2], ['meeting_id', 200]])
    })

    it('fetchMeetingAttendees descarta avatares inseguros', async () => {
      queue.push(
        { data: [{ id: 1, user_id: 5, meeting_id: 9 }], error: null },
        { data: [{ id: 5, name: 'Rui', avatar_url: 'https://rastreador.exemplo/pixel.png' }], error: null }
      )
      const [attendee] = await attendanceService.fetchMeetingAttendees(9)
      expect(attendee.user_name).toBe('Rui')
      expect(attendee.avatar_url).toBeNull()
    })
  })

  describe('chatService', () => {
    it('fetchAvatars só devolve data URLs de imagem', async () => {
      nextResult = {
        data: [
          { id: 1, avatar_url: 'data:image/jpeg;base64,QUJD' },
          { id: 2, avatar_url: 'data:image/svg+xml;base64,PHN2Zz4=' }
        ],
        error: null
      }
      const avatars = await chatService.fetchAvatars([1, 2])
      expect(avatars).toEqual({ 1: 'data:image/jpeg;base64,QUJD', 2: null })
    })

    it('fetchMessages sem cursor devolve em ordem cronológica', async () => {
      nextResult = { data: [{ id: 2 }, { id: 1 }], error: null }
      const rows = await chatService.fetchMessages(7)
      expect(rows.map((r) => r.id)).toEqual([1, 2])
    })
  })
})
