import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from './Login'

describe('Componente Login', () => {
  it('deve renderizar todos os elementos do formulário de login', () => {
    render(<Login onLogin={() => {}} onShowRegister={() => {}} />)

    expect(screen.getByRole('heading', { name: /igreja cristã renovada/i })).toBeInTheDocument()
    expect(screen.getByAltText('ICR Logo')).toBeInTheDocument()
    expect(screen.getByText(/"Tomando o pão, deu graças, partiu-o e o deu aos discípulos"/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
  })

  it('deve alternar a visibilidade da senha ao clicar no botão de exibir/ocultar senha', () => {
    render(<Login onLogin={() => {}} onShowRegister={() => {}} />)

    const inputSenha = screen.getByLabelText(/^senha$/i)
    const botaoToggle = screen.getByLabelText(/mostrar senha/i)

    // Inicialmente deve ser do tipo "password"
    expect(inputSenha).toHaveAttribute('type', 'password')

    // Clicando uma vez para exibir
    fireEvent.click(botaoToggle)
    expect(inputSenha).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText(/ocultar senha/i)).toBeInTheDocument()

    // Clicando novamente para ocultar
    fireEvent.click(screen.getByLabelText(/ocultar senha/i))
    expect(inputSenha).toHaveAttribute('type', 'password')
  })

  it('deve chamar a prop onLogin com as credenciais preenchidas ao submeter o formulário', async () => {
    const handleLogin = vi.fn().mockResolvedValue()
    render(<Login onLogin={handleLogin} onShowRegister={() => {}} />)

    const inputEmail = screen.getByLabelText(/^e-mail$/i)
    const inputSenha = screen.getByLabelText(/^senha$/i)
    const botaoEntrar = screen.getByRole('button', { name: /entrar/i })

    fireEvent.change(inputEmail, { target: { value: 'test@igreja.com' } })
    fireEvent.change(inputSenha, { target: { value: 'senha123' } })

    fireEvent.click(botaoEntrar)

    expect(handleLogin).toHaveBeenCalledWith({
      email: 'test@igreja.com',
      senha: 'senha123'
    })

    // Deve desabilitar inputs durante a submissão
    expect(botaoEntrar).toBeDisabled()
    expect(inputEmail).toBeDisabled()
    expect(inputSenha).toBeDisabled()

    // Aguarda o término da submissão para reabilitar os inputs
    await waitFor(() => {
      expect(botaoEntrar).not.toBeDisabled()
    })
  })

  it('deve chamar a prop onShowRegister ao clicar no botão de criar conta', () => {
    const handleShowRegister = vi.fn()
    render(<Login onLogin={() => {}} onShowRegister={handleShowRegister} />)

    const botaoCriarConta = screen.getByRole('button', { name: /criar conta/i })
    fireEvent.click(botaoCriarConta)

    expect(handleShowRegister).toHaveBeenCalled()
  })
})
