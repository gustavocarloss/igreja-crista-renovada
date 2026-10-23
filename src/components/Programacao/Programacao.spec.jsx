import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Programacao from './Programacao'

const mockNavigate = vi.fn()
const mockExcluirEvento = vi.fn()
let mockUser = { role: 'admin' }

const inHours = (h) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString()

const mockEventos = [
  { id: 1, nome: 'Culto Regular', local: 'Sede Principal', horario: 'amanhã', raw_date: inHours(48), aoVivo: false },
  { id: 2, nome: 'Live Especial', local: 'Canal Online', horario: 'agora', raw_date: inHours(-0.5), aoVivo: true },
  { id: 3, nome: 'Culto Antigo', local: 'Sede', horario: 'ontem', raw_date: inHours(-24), aoVivo: false }
]

vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    eventos: mockEventos,
    eventosLoaded: true,
    eventosError: null,
    reloadEvents: vi.fn(),
    excluirEvento: mockExcluirEvento,
    user: mockUser
  })
}))

describe('Componente Programacao', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { role: 'admin' }
  })

  it('lista eventos ativos com o que está ao vivo no topo, e anteriores separados', () => {
    render(<Programacao />)

    expect(screen.getByRole('heading', { name: /^programação$/i })).toBeInTheDocument()
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titles).toEqual(['Live Especial', 'Culto Regular', 'Culto Antigo'])
    expect(screen.getByText('AO VIVO')).toBeInTheDocument()
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
  })

  it('navega para os detalhes do evento', () => {
    render(<Programacao />)
    fireEvent.click(screen.getAllByRole('button', { name: /ver detalhes/i })[0])
    expect(mockNavigate).toHaveBeenCalledWith('/detalhes/2')
  })

  it('admin pode editar e excluir', () => {
    render(<Programacao />)
    fireEvent.click(screen.getAllByTitle(/editar/i)[0])
    expect(mockNavigate).toHaveBeenCalledWith('/editar/2')

    fireEvent.click(screen.getAllByTitle(/excluir/i)[0])
    expect(mockExcluirEvento).toHaveBeenCalledWith(2)
  })

  it('membro comum não vê ações de administrador', () => {
    mockUser = { role: 'user' }
    render(<Programacao />)
    expect(screen.queryByTitle(/editar/i)).not.toBeInTheDocument()
    expect(screen.queryByTitle(/excluir/i)).not.toBeInTheDocument()
  })
})
