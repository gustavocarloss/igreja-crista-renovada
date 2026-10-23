import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EventoDetalhes from './EventoDetalhes'

const mockNavigate = vi.fn()
const mockConfirmarPresenca = vi.fn().mockResolvedValue(true)
const mockCancelarPresenca = vi.fn().mockResolvedValue(true)
const mockFetchAttendees = vi.fn()

const inHours = (h) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString()

const mockEvento = {
  id: 10,
  nome: 'Culto de Domingo',
  local: 'Templo Central',
  horario: '30/08/2026 às 10:00',
  raw_date: inHours(24),
  pastor: 'Pastor André',
  descricao: 'Celebração de Domingo',
  link: 'https://youtube.com/transmissao',
  aoVivo: true
}

let mockUser

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '10' })
}))

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    eventos: [mockEvento],
    eventosLoaded: true,
    eventosError: null,
    reloadEvents: vi.fn(),
    user: mockUser,
    confirmarPresenca: mockConfirmarPresenca,
    cancelarPresenca: mockCancelarPresenca,
    excluirEvento: vi.fn()
  })
}))

vi.mock('../../services/api', () => ({
  attendanceService: { fetchMeetingAttendees: (...args) => mockFetchAttendees(...args) }
}))

vi.mock('../common/MapPreview/MapPreview', () => ({ default: () => <div data-testid="mock-map" /> }))
vi.mock('../ChatBoard/ChatBoard', () => ({ default: () => <div data-testid="mock-chat" /> }))

describe('Componente EventoDetalhes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 1, nome: 'João', role: 'user', eventosConfirmados: [] }
    mockFetchAttendees.mockResolvedValue([
      { id: 1, user_name: 'Membro 1', avatar_url: null },
      { id: 2, user_name: 'Membro 2', avatar_url: null }
    ])
  })

  it('renderiza os detalhes, o mapa e o chat', async () => {
    render(<EventoDetalhes />)

    expect(screen.getByText('Culto de Domingo')).toBeInTheDocument()
    expect(screen.getByText('Pastor André')).toBeInTheDocument()
    expect(screen.getByText('Templo Central')).toBeInTheDocument()
    expect(screen.getByText('Celebração de Domingo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /acessar transmissão online/i })).toHaveAttribute(
      'href',
      'https://youtube.com/transmissao'
    )
    expect(screen.getByTestId('mock-map')).toBeInTheDocument()
    expect(screen.getByTestId('mock-chat')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/presenças confirmadas \(2\)/i)).toBeInTheDocument())
  })

  it('mostra a lista de confirmados', async () => {
    render(<EventoDetalhes />)
    fireEvent.click(await screen.findByRole('button', { name: /ver lista de confirmados/i }))
    expect(screen.getByText('Membro 1')).toBeInTheDocument()
    expect(screen.getByText('Membro 2')).toBeInTheDocument()
  })

  it('confirma presença', async () => {
    render(<EventoDetalhes />)
    fireEvent.click(screen.getByRole('button', { name: /confirmar presença/i }))
    await waitFor(() => expect(mockConfirmarPresenca).toHaveBeenCalledWith(10))
  })

  it('cancela presença quando já confirmado', async () => {
    mockUser = { ...mockUser, eventosConfirmados: [10] }
    render(<EventoDetalhes />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar presença/i }))
    await waitFor(() => expect(mockCancelarPresenca).toHaveBeenCalledWith(10))
  })

  it('menu de administração só aparece para admin', () => {
    const { unmount } = render(<EventoDetalhes />)
    expect(screen.queryByRole('button', { name: /mais opções/i })).not.toBeInTheDocument()
    unmount()

    mockUser = { ...mockUser, role: 'admin' }
    render(<EventoDetalhes />)
    expect(screen.getByRole('button', { name: /mais opções/i })).toBeInTheDocument()
  })

  it('volta para a home quando não há histórico', () => {
    render(<EventoDetalhes />)
    fireEvent.click(screen.getByRole('button', { name: /voltar/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})
