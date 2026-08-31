import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Programacao from './Programacao'

const mockSetCurrentPage = vi.fn()
const mockSetSelectedEvent = vi.fn()
const mockSetEditingEvent = vi.fn()
const mockExcluirEvento = vi.fn()

const futureDate1 = new Date()
futureDate1.setDate(futureDate1.getDate() + 1)
const futureDate2 = new Date()
futureDate2.setDate(futureDate2.getDate() + 2)

const mockEventos = [
  {
    id: 1,
    nome: 'Culto Regular',
    local: 'Sede Principal',
    horario: '30/08/2026 às 19:00',
    raw_date: futureDate2.toISOString(),
    aoVivo: false
  },
  {
    id: 2,
    nome: 'Live Especial',
    local: 'Canal Online',
    horario: '29/08/2026 às 20:00',
    raw_date: futureDate1.toISOString(),
    aoVivo: true
  }
]

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    eventos: mockEventos,
    setCurrentPage: mockSetCurrentPage,
    setSelectedEvent: mockSetSelectedEvent,
    setEditingEvent: mockSetEditingEvent,
    excluirEvento: mockExcluirEvento
  })
}))

describe('Componente Programacao', () => {
  it('deve renderizar a lista de eventos futuros ordenada (ao vivo no topo)', () => {
    render(<Programacao />)

    expect(screen.getByRole('heading', { name: /programação/i })).toBeInTheDocument()
    
    // Deve renderizar ambos os eventos
    expect(screen.getByText('Culto Regular')).toBeInTheDocument()
    expect(screen.getByText('Live Especial')).toBeInTheDocument()

    // O de ID 2 (ao vivo) deve aparecer com o badge "AO VIVO"
    expect(screen.getByText('AO VIVO')).toBeInTheDocument()
  })

  it('deve navegar para a página de detalhes ao clicar em Ver detalhes', () => {
    render(<Programacao />)

    const buttons = screen.getAllByRole('button', { name: /ver detalhes/i })
    fireEvent.click(buttons[0]) // Clica no primeiro evento (que é o Live Especial por conta da ordenação)

    expect(mockSetSelectedEvent).toHaveBeenCalledWith(mockEventos[1])
    expect(mockSetCurrentPage).toHaveBeenCalledWith('detalhes')
  })

  it('deve chamar setEditingEvent ao clicar no botão de editar', () => {
    render(<Programacao />)

    const editButtons = screen.getAllByTitle(/editar/i)
    fireEvent.click(editButtons[0])

    expect(mockSetEditingEvent).toHaveBeenCalledWith(mockEventos[1])
    expect(mockSetCurrentPage).toHaveBeenCalledWith('adicionar')
  })

  it('deve chamar excluirEvento ao clicar no botão de excluir', () => {
    render(<Programacao />)

    const deleteButtons = screen.getAllByTitle(/excluir/i)
    fireEvent.click(deleteButtons[0])

    expect(mockExcluirEvento).toHaveBeenCalledWith(mockEventos[1].id)
  })
})
