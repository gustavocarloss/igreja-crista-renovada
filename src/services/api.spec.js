import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService, eventService, attendanceService } from './api'

describe('Serviços de API - Supabase REST Requests', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  describe('authService', () => {
    it('login deve disparar GET com filtros corretos de e-mail e senha', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1, name: 'Gusta' }]
      })

      const data = await authService.login('test@test.com', '1234')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user?email=eq.test@test.com&password=eq.1234'),
        expect.objectContaining({ method: 'GET' })
      )
      expect(data[0].name).toBe('Gusta')
    })

    it('register deve disparar POST com corpo correto', async () => {
      fetch.mockResolvedValueOnce({ ok: true })

      await authService.register('Novo Usuário', 'email@test.com', 'pwd')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Novo Usuário', email: 'email@test.com', password: 'pwd' })
        })
      )
    })
  })

  describe('eventService', () => {
    it('fetchEvents deve buscar a listagem de encontros', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 10, meeting_name: 'Culto' }]
      })

      const data = await eventService.fetchEvents()
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/meeting'),
        expect.objectContaining({ method: 'GET' })
      )
      expect(data[0].meeting_name).toBe('Culto')
    })

    it('addEvent deve salvar novo encontro', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 11 }]
      })

      const payload = { meeting_name: 'Novo Culto' }
      await eventService.addEvent(payload)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/meeting'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload)
        })
      )
    })

    it('updateEvent deve disparar PATCH filtrado pelo id', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 12 }]
      })

      const payload = { meeting_name: 'Culto Editado' }
      await eventService.updateEvent(12, payload)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/meeting?id=eq.12'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
      )
    })

    it('deleteEvent deve disparar DELETE filtrado pelo id', async () => {
      fetch.mockResolvedValueOnce({ ok: true })

      await eventService.deleteEvent(13)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/meeting?id=eq.13'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })

  describe('attendanceService', () => {
    it('confirmPresence deve disparar POST no endpoint de presenças', async () => {
      fetch.mockResolvedValueOnce({ ok: true })

      await attendanceService.confirmPresence(1, 100)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/attendance'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ user_id: 1, meeting_id: 100 })
        })
      )
    })

    it('cancelPresence deve disparar DELETE filtrando usuário e evento', async () => {
      fetch.mockResolvedValueOnce({ ok: true })

      await attendanceService.cancelPresence(2, 200)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/attendance?user_id=eq.2&meeting_id=eq.200'),
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })
})
