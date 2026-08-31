import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventoDetalhes from './EventoDetalhes'

const mockConfirmarPresenca = vi.fn()
const mockCancelarPresenca = vi.fn()
const mockSetCurrentPage = vi.fn()

const mockSelectedEvent = {
  id: 10,
  nome: 'Culto de Domingo',
  local: 'Templo Central',
  horario: '30/08/2026 às 10:00',
  pastor: 'Pastor André',
  descricao: 'Celebração de Domingo',
  link: 'https://youtube.com/transmissao',
  aoVivo: true
}

const mockPresencas = [
  { meeting_id: 10, user_name: 'Membro 1' },
  { meeting_id: 10, user_name: 'Membro 2' }
]

// Mocking Context
vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    selectedEvent: mockSelectedEvent,
    user: { id: 1, nome: 'João', eventosConfirmados: [10] }, // Já confirmado
    confirmarPresenca: mockConfirmarPresenca,
    cancelarPresenca: mockCancelarPresenca,
    presencas: mockPresencas,
    setCurrentPage: mockSetCurrentPage
  })
}))

// Mocking MapPreview to isolate tests
vi.mock('../common/MapPreview/MapPreview', () => ({
  default: () => <div data-testid="mock-map">Mock Map</div>
}))

describe('Componente EventoDetalhes', () => {
  it('deve renderizar todos os detalhes do evento selecionado', () => {
    render(<EventoDetalhes />)

    expect(screen.getByRole('heading', { name: /detalhes do evento/i })).toBeInTheDocument()
    expect(screen.getByText('Culto de Domingo')).toBeInTheDocument()
    expect(screen.getByText('Pastor André')).toBeInTheDocument()
    expect(screen.getByText('Templo Central')).toBeInTheDocument()
    expect(screen.getByText('Celebração de Domingo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /acessar transmissão online/i })).toHaveAttribute('href', 'https://youtube.com/transmissao')

    // Deve conter as presenças
    expect(screen.getByText('Membro 1')).toBeInTheDocument()
    expect(screen.getByText('Membro 2')).toBeInTheDocument()

    // Map preview deve renderizar
    expect(screen.getByTestId('mock-map')).toBeInTheDocument()
  })

  it('deve chamar setCurrentPage para voltar para home', () => {
    render(<EventoDetalhes />)

    const backButton = screen.getByRole('button', { name: /voltar/i })
    fireEvent.click(backButton)

    expect(mockSetCurrentPage).toHaveBeenCalledWith('home')
  })

  it('deve permitir cancelar a presença quando já confirmado', () => {
    render(<EventoDetalhes />)

    const button = screen.getByRole('button', { name: /presença confirmada/i })
    fireEvent.click(button)

    expect(mockCancelarPresenca).toHaveBeenCalledWith(mockSelectedEvent.id)
  })
})
