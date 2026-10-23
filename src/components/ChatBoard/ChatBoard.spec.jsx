import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatBoard from './ChatBoard'

const mockFetchMessages = vi.fn()
const mockSendMessage = vi.fn()
const mockDeleteMessage = vi.fn()
const mockConfirmAsync = vi.fn()
const mockShowMessage = vi.fn()
let mockUser

vi.mock('../../services/api', () => ({
  chatService: {
    fetchMessages: (...a) => mockFetchMessages(...a),
    sendMessage: (...a) => mockSendMessage(...a),
    deleteMessage: (...a) => mockDeleteMessage(...a),
    fetchAvatars: vi.fn().mockResolvedValue({})
  }
}))

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({ user: mockUser, showMessage: mockShowMessage, confirmAsync: mockConfirmAsync })
}))

const now = new Date().toISOString()
const messages = [
  { id: 'a', user_id: 1, user_name: 'Ana', text: 'Mensagem da Ana', created_at: now },
  { id: 'b', user_id: 2, user_name: 'Rui', text: 'Mensagem do Rui', created_at: now }
]

describe('Componente ChatBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 1, nome: 'Ana', role: 'user' }
    mockFetchMessages.mockResolvedValue(messages)
  })

  it('mostra as mensagens e o nome de quem enviou', async () => {
    render(<ChatBoard meetingId={10} />)
    expect(await screen.findByText('Mensagem do Rui')).toBeInTheDocument()
    expect(screen.getByText('Rui')).toBeInTheDocument()
  })

  it('membro só pode apagar as próprias mensagens', async () => {
    render(<ChatBoard meetingId={10} />)
    await screen.findByText('Mensagem do Rui')
    expect(screen.getAllByRole('button', { name: /apagar/i })).toHaveLength(1)
  })

  it('admin pode apagar qualquer mensagem', async () => {
    mockUser = { ...mockUser, role: 'admin' }
    render(<ChatBoard meetingId={10} />)
    await screen.findByText('Mensagem do Rui')
    expect(screen.getAllByRole('button', { name: /apagar/i })).toHaveLength(2)
  })

  it('não permite apagar depois de 60 horas, nem para admin (como no WhatsApp)', async () => {
    mockUser = { ...mockUser, role: 'admin' }
    const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
    mockFetchMessages.mockResolvedValue([
      { id: 'velha', user_id: 1, user_name: 'Ana', text: 'Mensagem antiga', created_at: hoursAgo(61) },
      { id: 'recente', user_id: 1, user_name: 'Ana', text: 'Mensagem recente', created_at: hoursAgo(59) }
    ])
    render(<ChatBoard meetingId={10} />)
    await screen.findByText('Mensagem antiga')

    const buttons = screen.getAllByRole('button', { name: /apagar/i })
    expect(buttons).toHaveLength(1)
    expect(buttons[0].closest('.chat-message')).toHaveTextContent('Mensagem recente')
  })

  it('apaga depois de confirmar', async () => {
    mockConfirmAsync.mockResolvedValue(true)
    mockDeleteMessage.mockResolvedValue(true)
    render(<ChatBoard meetingId={10} />)
    await screen.findByText('Mensagem da Ana')

    fireEvent.click(screen.getByRole('button', { name: /apagar/i }))

    await waitFor(() => expect(screen.queryByText('Mensagem da Ana')).not.toBeInTheDocument())
    expect(mockDeleteMessage).toHaveBeenCalledWith('a')
  })

  it('não apaga se o usuário cancelar', async () => {
    mockConfirmAsync.mockResolvedValue(false)
    render(<ChatBoard meetingId={10} />)
    await screen.findByText('Mensagem da Ana')

    fireEvent.click(screen.getByRole('button', { name: /apagar/i }))

    await waitFor(() => expect(mockConfirmAsync).toHaveBeenCalled())
    expect(mockDeleteMessage).not.toHaveBeenCalled()
    expect(screen.getByText('Mensagem da Ana')).toBeInTheDocument()
  })

  it('envia mensagem com o id do usuário logado', async () => {
    mockSendMessage.mockResolvedValue({ data: [{ id: 'c', user_id: 1, user_name: 'Ana', text: 'Olá', created_at: now }] })
    render(<ChatBoard meetingId={10} />)
    await screen.findByText('Mensagem da Ana')

    fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: '  Olá  ' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    await waitFor(() =>
      expect(mockSendMessage).toHaveBeenCalledWith(expect.objectContaining({ meeting_id: 10, user_id: 1, text: 'Olá' }))
    )
    expect(await screen.findByText('Olá')).toBeInTheDocument()
  })
})
