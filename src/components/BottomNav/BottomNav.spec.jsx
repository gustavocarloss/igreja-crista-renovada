import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BottomNav from './BottomNav'

// Setup dos mocks antes do componente
const mockSetCurrentPage = vi.fn()

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    currentPage: 'home',
    setCurrentPage: mockSetCurrentPage
  })
}))

describe('Componente BottomNav', () => {
  it('deve renderizar todos os botões de navegação', () => {
    render(<BottomNav />)

    expect(screen.getByRole('button', { name: /início/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agenda/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bíblia/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /perfil/i })).toBeInTheDocument()
  })

  it('deve marcar o botão correto como ativo com base no estado do contexto', () => {
    render(<BottomNav />)

    const homeButton = screen.getByRole('button', { name: /início/i })
    expect(homeButton).toHaveClass('active')

    const agendaButton = screen.getByRole('button', { name: /agenda/i })
    expect(agendaButton).not.toHaveClass('active')
  })

  it('deve chamar a prop setCurrentPage com o id correto ao clicar em um botão', () => {
    render(<BottomNav />)

    const agendaButton = screen.getByRole('button', { name: /agenda/i })
    fireEvent.click(agendaButton)

    expect(mockSetCurrentPage).toHaveBeenCalledWith('calendario')
  })
})
