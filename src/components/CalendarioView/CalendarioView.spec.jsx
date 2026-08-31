import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CalendarioView from './CalendarioView'

const mockSetSelectedEvent = vi.fn()
const mockSetCurrentPage = vi.fn()

// Configurar eventos mock fixos baseados em agosto de 2026
const mockEventos = [
  {
    id: 1,
    nome: 'Evento Um',
    local: 'Templo',
    raw_date: '2026-08-15T10:00:00.000Z' // 15 de Agosto
  },
  {
    id: 2,
    nome: 'Evento Dois',
    local: 'Quadra',
    raw_date: '2026-08-20T14:00:00.000Z' // 20 de Agosto
  }
]

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    eventos: mockEventos,
    setSelectedEvent: mockSetSelectedEvent,
    setCurrentPage: mockSetCurrentPage
  })
}))

describe('Componente CalendarioView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o cabeçalho do calendário e listagem', () => {
    render(<CalendarioView />)

    expect(screen.getByRole('heading', { name: /agenda mensal/i })).toBeInTheDocument()
    expect(screen.getByText(/Próximos este mês/i)).toBeInTheDocument()
  })

  it('deve renderizar os indicadores nos dias que possuem eventos', () => {
    render(<CalendarioView />)

    // Devem existir indicadores renderizados (no-mínimo 2 indicadores correspondentes aos mockEventos)
    const indicators = screen.getAllByTestId('indicator')
    expect(indicators.length).toBeGreaterThanOrEqual(2)
  })

  it('deve navegar para a página de detalhes ao clicar em um mini-card de evento', () => {
    render(<CalendarioView />)

    const eventCard = screen.getByText('Evento Um')
    fireEvent.click(eventCard.closest('.agenda-mini-card'))

    expect(mockSetSelectedEvent).toHaveBeenCalledWith(mockEventos[0])
    expect(mockSetCurrentPage).toHaveBeenCalledWith('detalhes')
  })
})
