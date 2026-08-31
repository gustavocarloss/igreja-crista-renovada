import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AdicionarEvento from './AdicionarEvento'

const mockAdicionarEvento = vi.fn()
const mockAtualizarEvento = vi.fn()
const mockSetCurrentPage = vi.fn()
const mockSetEditingEvent = vi.fn()
const mockShowMessage = vi.fn()

let mockEditingEvent = null

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    adicionarEvento: mockAdicionarEvento,
    atualizarEvento: mockAtualizarEvento,
    setCurrentPage: mockSetCurrentPage,
    editingEvent: mockEditingEvent,
    setEditingEvent: mockSetEditingEvent,
    showMessage: mockShowMessage
  })
}))

// Mock MapPreview
vi.mock('../common/MapPreview/MapPreview', () => ({
  default: () => <div data-testid="mock-map">Mock Map</div>
}))

describe('Componente AdicionarEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEditingEvent = null
  })

  it('deve renderizar campos de formulário vazios por padrão', () => {
    render(<AdicionarEvento />)

    expect(screen.getByRole('heading', { name: /adicionar evento/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/nome do evento/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/pastor responsável/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /^adicionar evento$/i })).toBeInTheDocument()
  })

  it('deve bloquear a submissão se a data/hora for no passado', () => {
    render(<AdicionarEvento />)

    const inputNome = screen.getByPlaceholderText(/nome do evento/i)
    const inputLocal = screen.getByLabelText(/local do evento/i)
    const inputData = screen.getByLabelText(/data do evento/i)
    const inputHora = screen.getByLabelText(/horário/i)

    fireEvent.change(inputNome, { target: { value: 'Culto Passado' } })
    fireEvent.change(inputLocal, { target: { value: 'Rua das Flores, 100' } })
    fireEvent.change(inputData, { target: { value: '2020-01-01' } }) // Passado
    fireEvent.change(inputHora, { target: { value: '10:00' } })

    fireEvent.submit(screen.getByRole('form'))

    expect(mockShowMessage).toHaveBeenCalledWith('A data e hora do evento devem ser futuras!')
    expect(mockAdicionarEvento).not.toHaveBeenCalled()
  })

  it('deve submeter e chamar adicionarEvento com data/hora futura', () => {
    render(<AdicionarEvento />)

    const inputNome = screen.getByPlaceholderText(/nome do evento/i)
    const inputLocal = screen.getByLabelText(/local do evento/i)
    const inputData = screen.getByLabelText(/data do evento/i)
    const inputHora = screen.getByLabelText(/horário/i)

    // Configurando data futura
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    fireEvent.change(inputNome, { target: { value: 'Culto de Jovens' } })
    fireEvent.change(inputLocal, { target: { value: 'Auditório Principal' } })
    fireEvent.change(inputData, { target: { value: tomorrowStr } })
    fireEvent.change(inputHora, { target: { value: '18:00' } })

    fireEvent.click(screen.getByRole('button', { name: /^adicionar evento$/i }))

    expect(mockAdicionarEvento).toHaveBeenCalled()
    expect(mockSetCurrentPage).toHaveBeenCalledWith('home')
  })
})
