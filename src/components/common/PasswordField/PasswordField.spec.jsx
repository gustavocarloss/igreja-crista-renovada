import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PasswordField from './PasswordField'

describe('Componente PasswordField', () => {
  it('deve renderizar o input de senha com tipo password por padrão', () => {
    render(<PasswordField value="" onChange={() => {}} id="my-password" label="Minha Senha" />)

    const input = screen.getByLabelText('Minha Senha')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument()
  })

  it('deve alternar a visibilidade da senha ao clicar no botão', () => {
    render(<PasswordField value="" onChange={() => {}} id="my-password" label="Minha Senha" />)

    const input = screen.getByLabelText('Minha Senha')
    const button = screen.getByRole('button', { name: /mostrar senha/i })

    // Tipo deve ser password no início
    expect(input).toHaveAttribute('type', 'password')

    // Primeiro clique: mostra a senha
    fireEvent.click(button)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument()

    // Segundo clique: oculta a senha
    fireEvent.click(screen.getByRole('button', { name: /ocultar senha/i }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('deve chamar a prop onChange ao digitar no input', () => {
    const handleChange = vi.fn()
    render(<PasswordField value="" onChange={handleChange} id="my-password" label="Minha Senha" />)

    const input = screen.getByLabelText('Minha Senha')
    fireEvent.change(input, { target: { value: 'minhasenha123' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('deve desabilitar o input e o botão quando disabled for true', () => {
    render(<PasswordField value="" onChange={() => {}} id="my-password" label="Minha Senha" disabled={true} />)

    const input = screen.getByLabelText('Minha Senha')
    const button = screen.getByRole('button', { name: /mostrar senha/i })

    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })
})
