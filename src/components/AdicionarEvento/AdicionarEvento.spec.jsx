import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdicionarEvento from './AdicionarEvento'

const mockNavigate = vi.fn()
const mockAdicionarEvento = vi.fn()
const mockAtualizarEvento = vi.fn()
const mockShowMessage = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({})
}))

vi.mock('../../context/AppContext', () => ({
  useAppContext: () => ({
    eventos: [],
    eventosLoaded: true,
    eventosError: null,
    reloadEvents: vi.fn(),
    adicionarEvento: mockAdicionarEvento,
    atualizarEvento: mockAtualizarEvento,
    showMessage: mockShowMessage,
    confirmAsync: vi.fn().mockResolvedValue(true)
  })
}))

vi.mock('../common/MapPreview/MapPreview', () => ({ default: () => <div data-testid="mock-map" /> }))

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const fillForm = ({ nome = 'Culto de Jovens', local = 'Auditório Principal', data = tomorrow(), hora = '18:00', link } = {}) => {
  fireEvent.change(screen.getByPlaceholderText(/nome do evento/i), { target: { value: nome } })
  fireEvent.change(screen.getByLabelText(/local do evento/i), { target: { value: local } })
  fireEvent.change(screen.getByLabelText(/data do evento/i), { target: { value: data } })
  fireEvent.change(screen.getByLabelText(/horário/i), { target: { value: hora } })
  if (link !== undefined) fireEvent.change(screen.getByLabelText(/link de transmissão/i), { target: { value: link } })
}

describe('Componente AdicionarEvento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ features: [] }) }))
  })

  it('renderiza o formulário vazio', () => {
    render(<AdicionarEvento />)
    expect(screen.getByRole('heading', { name: /adicionar evento/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/nome do evento/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /^adicionar evento$/i })).toBeInTheDocument()
  })

  it('bloqueia data/hora no passado', () => {
    render(<AdicionarEvento />)
    fillForm({ data: '2020-01-01' })
    fireEvent.submit(screen.getByRole('form'))
    expect(mockShowMessage).toHaveBeenCalledWith('A data e hora do evento devem ser futuras!')
    expect(mockAdicionarEvento).not.toHaveBeenCalled()
  })

  it('bloqueia link de transmissão que não seja http(s)', () => {
    render(<AdicionarEvento />)
    fillForm({ link: 'javascript:alert(1)' })
    fireEvent.submit(screen.getByRole('form'))
    expect(mockShowMessage).toHaveBeenCalledWith(expect.stringMatching(/https:\/\//))
    expect(mockAdicionarEvento).not.toHaveBeenCalled()
  })

  it('salva e volta para a home', async () => {
    mockAdicionarEvento.mockResolvedValue(true)
    render(<AdicionarEvento />)
    fillForm({ link: 'https://youtube.com/live/x' })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
    expect(mockAdicionarEvento).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Culto de Jovens', local: 'Auditório Principal', hora: '18:00' })
    )
  })
})
