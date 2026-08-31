import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MessageModal from './MessageModal'

describe('Componente MessageModal', () => {
  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(
      <MessageModal isOpen={false} message="Teste" onClose={() => {}} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar o modal com layout de erro por padrão', () => {
    render(
      <MessageModal isOpen={true} message="Mensagem de Erro" onClose={() => {}} />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /ops!/i })).toBeInTheDocument()
    expect(screen.getByText('Mensagem de Erro')).toBeInTheDocument()
    // Deve conter o SVG de erro (pela classe error)
    const svgElement = screen.getByRole('dialog').querySelector('.modal-svg')
    expect(svgElement).toHaveClass('error')
  })

  it('deve renderizar o modal com layout de sucesso quando o type for success', () => {
    render(
      <MessageModal isOpen={true} message="Mensagem de Sucesso" type="success" onClose={() => {}} />
    )

    expect(screen.getByRole('heading', { name: /sucesso!/i })).toBeInTheDocument()
    expect(screen.getByText('Mensagem de Sucesso')).toBeInTheDocument()
    // Deve conter o SVG de sucesso (pela classe success)
    const svgElement = screen.getByRole('dialog').querySelector('.modal-svg')
    expect(svgElement).toHaveClass('success')
  })

  it('deve disparar a prop onClose ao clicar no botão Entendido', () => {
    const handleClose = vi.fn()
    render(
      <MessageModal isOpen={true} message="Mensagem" onClose={handleClose} />
    )

    const button = screen.getByRole('button', { name: /entendido/i })
    fireEvent.click(button)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
