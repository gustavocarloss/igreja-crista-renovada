import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Biblia from './Biblia'

describe('Componente Biblia', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a tela de seleção de livros e permitir a busca', () => {
    render(<Biblia />)

    expect(screen.getByRole('heading', { name: /bíblia sagrada/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/buscar livro.../i)).toBeInTheDocument()

    // Livros do Gênesis e Êxodo devem estar na grid
    expect(screen.getByText('Gênesis')).toBeInTheDocument()
    expect(screen.getByText('Êxodo')).toBeInTheDocument()
  })

  it('deve filtrar os livros na busca', () => {
    render(<Biblia />)

    const searchInput = screen.getByPlaceholderText(/buscar livro.../i)
    fireEvent.change(searchInput, { target: { value: 'Êxodo' } })

    expect(screen.queryByText('Gênesis')).not.toBeInTheDocument()
    expect(screen.getByText('Êxodo')).toBeInTheDocument()
  })

  it('deve exibir a lista de capítulos ao selecionar um livro', () => {
    render(<Biblia />)

    const genesisItem = screen.getByText('Gênesis')
    fireEvent.click(genesisItem)

    expect(screen.getByRole('heading', { name: 'Gênesis' })).toBeInTheDocument()
    expect(screen.getByText(/Selecione o capítulo:/i)).toBeInTheDocument()

    // Gênesis tem 50 capítulos, deve renderizar o botão do capítulo 1 ao 50
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument()
  })

  it('deve buscar e renderizar os versículos de um capítulo via API', async () => {
    const mockVersesResponse = {
      verses: [
        { verse: 1, text: 'No princípio, criou Deus os céus e a terra.' }
      ]
    }

    // Mock do fetch global
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockVersesResponse
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<Biblia />)

    // Selecionar Gênesis
    fireEvent.click(screen.getByText('Gênesis'))

    // Selecionar Capítulo 1
    fireEvent.click(screen.getByRole('button', { name: '1' }))

    // Esperar pelo carregamento e validação da busca da API
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled()
      expect(screen.getByText('No princípio, criou Deus os céus e a terra.')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Número do versículo
    })
  })
})
