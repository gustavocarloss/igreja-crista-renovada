import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Perfil from './Perfil'

const mockNavigate = vi.fn()
const mockShowMessage = vi.fn()
const mockHandleLogout = vi.fn()
const mockSetUser = vi.fn()
const mockVerifyPassword = vi.fn()
const mockUpdateAuthPassword = vi.fn()
const mockUpdateAuthEmail = vi.fn()

const inHours = (h) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString()

const mockUser = {
  id: 1,
  nome: 'Lucas Martins',
  email: 'lucas@igreja.com',
  avatar_url: null,
  eventosConfirmados: [100]
}

const mockEventos = [{ id: 100, nome: 'Encontro de Casais', horario: '31/08/2026 às 20:00', raw_date: inHours(48) }]

vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    user: mockUser,
    setUser: mockSetUser,
    eventos: mockEventos,
    atualizarAvatar: vi.fn(),
    showMessage: mockShowMessage,
    handleLogout: mockHandleLogout
  })
}))

vi.mock('../../services/api', () => ({
  authService: {
    verifyPassword: (...a) => mockVerifyPassword(...a),
    updateAuthPassword: (...a) => mockUpdateAuthPassword(...a),
    updateAuthEmail: (...a) => mockUpdateAuthEmail(...a)
  }
}))

const fill = (placeholder, value) => fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } })

describe('Componente Perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza dados do usuário e a inicial do avatar', () => {
    render(<Perfil />)
    expect(screen.getByRole('heading', { name: /meu perfil/i })).toBeInTheDocument()
    expect(screen.getByText('Lucas Martins')).toBeInTheDocument()
    expect(screen.getByText('lucas@igreja.com')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
  })

  it('lista eventos confirmados e abre os detalhes', () => {
    render(<Perfil />)
    fireEvent.click(screen.getByText('Encontro de Casais'))
    expect(mockNavigate).toHaveBeenCalledWith('/detalhes/100')
  })

  it('logout usa o fluxo central do app', () => {
    render(<Perfil />)
    fireEvent.click(screen.getByRole('button', { name: /finalizar sessão/i }))
    expect(mockHandleLogout).toHaveBeenCalled()
  })

  describe('alterar senha', () => {
    const openForm = () => {
      render(<Perfil />)
      fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }))
    }

    it('recusa senha nova fraca sem chamar o servidor', () => {
      openForm()
      fill('Senha Atual', 'antiga123')
      fill('Nova Senha', '123')
      fill('Repetir Nova Senha', '123')
      fireEvent.click(screen.getByRole('button', { name: /^atualizar$/i }))
      expect(mockShowMessage).toHaveBeenCalledWith(expect.stringMatching(/pelo menos 8/))
      expect(mockVerifyPassword).not.toHaveBeenCalled()
    })

    it('não altera quando a senha atual está errada', async () => {
      mockVerifyPassword.mockRejectedValue(new Error('Invalid login credentials'))
      openForm()
      fill('Senha Atual', 'errada123')
      fill('Nova Senha', 'novaSenha1')
      fill('Repetir Nova Senha', 'novaSenha1')
      fireEvent.click(screen.getByRole('button', { name: /^atualizar$/i }))
      await waitFor(() => expect(mockShowMessage).toHaveBeenCalledWith('A senha atual digitada está incorreta.'))
      expect(mockUpdateAuthPassword).not.toHaveBeenCalled()
    })

    it('altera a senha depois de conferir a atual', async () => {
      mockVerifyPassword.mockResolvedValue(true)
      mockUpdateAuthPassword.mockResolvedValue(true)
      openForm()
      fill('Senha Atual', 'antiga123')
      fill('Nova Senha', 'novaSenha1')
      fill('Repetir Nova Senha', 'novaSenha1')
      fireEvent.click(screen.getByRole('button', { name: /^atualizar$/i }))
      await waitFor(() => expect(mockUpdateAuthPassword).toHaveBeenCalledWith('novaSenha1'))
      expect(mockVerifyPassword).toHaveBeenCalledWith('lucas@igreja.com', 'antiga123')
    })
  })

  describe('alterar e-mail', () => {
    const submitEmail = (atual, novo, repetir = novo) => {
      render(<Perfil />)
      fireEvent.click(screen.getByTitle(/alterar e-mail/i))
      fill('E-mail atual', atual)
      fill('Novo e-mail', novo)
      fill('Confirmar novo e-mail', repetir)
      fireEvent.click(screen.getByRole('button', { name: /^alterar e-mail$/i }))
    }

    it('confere o e-mail atual', () => {
      submitEmail('outro@igreja.com', 'novo@igreja.com')
      expect(mockShowMessage).toHaveBeenCalledWith('O e-mail atual digitado está incorreto.')
      expect(mockUpdateAuthEmail).not.toHaveBeenCalled()
    })

    it('com confirmação pendente, não troca o e-mail exibido', async () => {
      mockUpdateAuthEmail.mockResolvedValue({ pending: true })
      submitEmail('LUCAS@igreja.com', 'novo@igreja.com')
      await waitFor(() => expect(mockUpdateAuthEmail).toHaveBeenCalledWith('novo@igreja.com'))
      expect(mockSetUser).not.toHaveBeenCalled()
      expect(mockShowMessage).toHaveBeenCalledWith(expect.stringMatching(/link de confirmação/), 'success')
    })
  })
})
