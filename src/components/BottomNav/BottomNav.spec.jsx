import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BottomNav from './BottomNav'

const mockNavigate = vi.fn()
let mockUser = { role: 'user' }

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate
}))

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({ user: mockUser })
}))

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>
  )

describe('Componente BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { role: 'user' }
  })

  it('mostra os botões de membro e esconde "Adicionar"', () => {
    renderAt('/')
    for (const name of [/início/i, /agenda/i, /bíblia/i, /perfil/i]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: /adicionar/i })).not.toBeInTheDocument()
  })

  it('mostra "Adicionar" para administradores', () => {
    mockUser = { role: 'admin' }
    renderAt('/')
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument()
  })

  it('marca a aba da rota atual como ativa', () => {
    renderAt('/calendario')
    expect(screen.getByRole('button', { name: /agenda/i })).toHaveClass('active')
    expect(screen.getByRole('button', { name: /início/i })).not.toHaveClass('active')
  })

  it('navega ao clicar', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: /agenda/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/calendario')
  })
})
