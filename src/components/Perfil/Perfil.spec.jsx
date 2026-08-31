import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Perfil from './Perfil'

const mockSetCurrentPage = vi.fn()
const mockSetSelectedEvent = vi.fn()

const mockUser = {
  id: 1,
  nome: 'Lucas Martins',
  email: 'lucas@igreja.com',
  eventosConfirmados: [100]
}

const mockEventos = [
  {
    id: 100,
    nome: 'Encontro de Casais',
    horario: '31/08/2026 às 20:00'
  }
]

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    user: mockUser,
    eventos: mockEventos,
    setCurrentPage: mockSetCurrentPage,
    setSelectedEvent: mockSetSelectedEvent
  })
}))

describe('Componente Perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('deve renderizar dados do usuário e iniciais do avatar', () => {
    render(<Perfil />)

    expect(screen.getByRole('heading', { name: /meu perfil/i })).toBeInTheDocument()
    expect(screen.getByText('Lucas Martins')).toBeInTheDocument()
    expect(screen.getByText('lucas@igreja.com')).toBeInTheDocument()
    // Iniciais do Avatar
    expect(screen.getByText('L')).toBeInTheDocument()
  })

  it('deve renderizar a lista de eventos confirmados do usuário', () => {
    render(<Perfil />)

    expect(screen.getByText('Encontro de Casais')).toBeInTheDocument()
    expect(screen.getByText('31/08/2026 às 20:00')).toBeInTheDocument()
  })

  it('deve navegar para a tela de detalhes ao clicar no botão de ver detalhes do evento', () => {
    render(<Perfil />)

    const btnVerDetalhes = screen.getByTitle('Ver Detalhes')
    fireEvent.click(btnVerDetalhes)

    expect(mockSetSelectedEvent).toHaveBeenCalledWith(mockEventos[0])
    expect(mockSetCurrentPage).toHaveBeenCalledWith('detalhes')
  })

  it('deve remover as informações do local storage ao fazer logout', () => {
    // Simular que existia um usuário salvo no localstorage
    localStorage.setItem('churchUser', JSON.stringify(mockUser))

    // Mock do reload para evitar erros no jsdom
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock }
    })

    render(<Perfil />)

    const btnLogout = screen.getByRole('button', { name: /finalizar sessão/i })
    fireEvent.click(btnLogout)

    expect(localStorage.getItem('churchUser')).toBeNull()
    expect(reloadMock).toHaveBeenCalled()
  })
})
