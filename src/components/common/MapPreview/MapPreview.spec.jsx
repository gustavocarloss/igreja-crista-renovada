import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapPreview from './MapPreview'

describe('Componente MapPreview', () => {
  it('não deve renderizar nada quando local for vazio ou nulo', () => {
    const { container } = render(<MapPreview local="" />)
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar o iframe do mapa quando local for fornecido', () => {
    render(<MapPreview local="São Paulo, SP" title="Mapa de Teste" />)

    const iframe = screen.getByTitle('Mapa de Teste')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', expect.stringContaining('S%C3%A3o%20Paulo%2C%20SP'))
  })

  it('deve exibir a dica de mapa quando showHint for true', () => {
    render(<MapPreview local="São Paulo, SP" showHint={true} />)

    expect(screen.getByText(/Verifique se o marcador está no local correto/i)).toBeInTheDocument()
  })

  it('não deve exibir a dica de mapa quando showHint for false', () => {
    render(<MapPreview local="São Paulo, SP" showHint={false} />)

    expect(screen.queryByText(/Verifique se o marcador está no local correto/i)).not.toBeInTheDocument()
  })
})
