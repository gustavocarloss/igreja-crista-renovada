import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Registro from './Registro'

describe('Componente Registro', () => {
  it('deve renderizar todos os elementos do formulário de cadastro', () => {
    render(<Registro onRegister={() => {}} onShowLogin={() => {}} />)

    expect(screen.getByRole('heading', { name: /nova conta/i })).toBeInTheDocument()
    expect(screen.getByAltText('ICR Logo')).toBeInTheDocument()
    expect(screen.getByText(/"Vinde a mim, todos os que estais cansados e oprimidos"/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fazer login/i })).toBeInTheDocument()
  })

  it('deve chamar a prop onRegister com as credenciais corretas ao submeter o formulário', async () => {
    const handleRegister = vi.fn().mockResolvedValue()
    render(<Registro onRegister={handleRegister} onShowLogin={() => {}} />)

    const inputName = screen.getByLabelText(/nome completo/i)
    const inputEmail = screen.getByLabelText(/^e-mail$/i)
    const inputSenha = screen.getByLabelText(/^senha$/i)
    const botaoCadastrar = screen.getByRole('button', { name: /cadastrar/i })

    fireEvent.change(inputName, { target: { value: 'João Silva' } })
    fireEvent.change(inputEmail, { target: { value: 'joao@igreja.com' } })
    fireEvent.change(inputSenha, { target: { value: 'senha1234' } })

    fireEvent.click(botaoCadastrar)

    expect(handleRegister).toHaveBeenCalledWith({
      name: 'João Silva',
      email: 'joao@igreja.com',
      password: 'senha1234'
    })

    // Deve desabilitar inputs durante o envio
    expect(botaoCadastrar).toBeDisabled()
    expect(inputName).toBeDisabled()
    expect(inputEmail).toBeDisabled()
    expect(inputSenha).toBeDisabled()

    // Aguarda conclusão do envio
    await waitFor(() => {
      expect(botaoCadastrar).not.toBeDisabled()
    })
  })

  it('deve chamar a prop onShowLogin ao clicar no botão de fazer login', () => {
    const handleShowLogin = vi.fn()
    render(<Registro onRegister={() => {}} onShowLogin={handleShowLogin} />)

    const botaoLogin = screen.getByRole('button', { name: /fazer login/i })
    fireEvent.click(botaoLogin)

    expect(handleShowLogin).toHaveBeenCalled()
  })
})
