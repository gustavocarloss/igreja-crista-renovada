import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CalendarioView from './CalendarioView'

const mockNavigate = vi.fn()

// Datas ao meio-dia local para não mudar de dia em nenhum fuso horário.
const mockEventos = [
  { id: 1, nome: 'Evento Um', local: 'Templo', raw_date: new Date(2026, 7, 15, 12).toISOString() },
  { id: 2, nome: 'Evento Dois', local: 'Quadra', raw_date: new Date(2026, 7, 20, 12).toISOString() }
]

vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({ eventos: mockEventos })
}))

describe('Componente CalendarioView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 7, 1, 9))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza o mês atual', () => {
    render(<CalendarioView />)
    expect(screen.getByRole('heading', { name: /agenda mensal/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /agosto 2026/i })).toBeInTheDocument()
  })

  it('marca os dias que têm eventos', () => {
    render(<CalendarioView />)
    expect(screen.getAllByTestId('indicator')).toHaveLength(2)
  })

  it('abre os detalhes ao tocar em um evento da lista', () => {
    render(<CalendarioView />)
    fireEvent.click(screen.getByText('Evento Um').closest('.agenda-mini-card'))
    expect(mockNavigate).toHaveBeenCalledWith('/detalhes/1')
  })
})
