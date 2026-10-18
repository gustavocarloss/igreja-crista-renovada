import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import MapPreview from '../common/MapPreview/MapPreview'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import ErrorState from '../common/ErrorState/ErrorState'
import './AdicionarEvento.css'

const EMPTY_EVENT = {
  nome: '',
  link: '',
  local: '',
  data: '',
  hora: '',
  descricao: '',
  pastor: ''
}

/**
 * Componente de administração para adicionar (/adicionar) ou editar (/editar/:id) eventos.
 */
export default function AdicionarEvento() {
  const {
    eventos,
    eventosLoaded,
    eventosError,
    reloadEvents,
    adicionarEvento,
    atualizarEvento,
    showMessage
  } = useAppContext()
  const navigate = useNavigate()
  const { id } = useParams()

  const isEditing = Boolean(id)
  const editingEvent = isEditing ? eventos.find(e => String(e.id) === String(id)) : null

  const [novoEvento, setNovoEvento] = useState(EMPTY_EVENT)
  const [isSaving, setIsSaving] = useState(false)
  const [filledFor, setFilledFor] = useState(null)

  // Preenche o formulário uma única vez com os dados do evento em edição
  useEffect(() => {
    if (editingEvent && filledFor !== editingEvent.id) {
      setNovoEvento({
        nome: editingEvent.nome || '',
        link: editingEvent.link || '',
        local: editingEvent.local || '',
        data: editingEvent.data || '',
        hora: editingEvent.hora || '',
        descricao: editingEvent.descricao || '',
        pastor: editingEvent.pastor || ''
      })
      setFilledFor(editingEvent.id)
    }
  }, [editingEvent, filledFor])

  const getTodayString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
  }

  const minDate = getTodayString()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSaving) return

    const nome = novoEvento.nome.trim()
    const local = novoEvento.local.trim()
    if (!nome || !local || !novoEvento.data || !novoEvento.hora) {
      showMessage('Preencha o nome, o local, a data e o horário do evento.')
      return
    }

    // A regra "data futura" vale só para eventos novos; ao editar é permitido corrigir eventos já iniciados.
    if (!isEditing) {
      const [y, m, d] = novoEvento.data.split('-')
      const [h, min] = novoEvento.hora.split(':')
      const eventDateTime = new Date(y, m - 1, d, h, min)
      if (eventDateTime < new Date()) {
        showMessage('A data e hora do evento devem ser futuras!')
        return
      }
    }

    const payload = { ...novoEvento, nome, local }

    setIsSaving(true)
    const ok = isEditing
      ? await atualizarEvento({ ...editingEvent, ...payload })
      : await adicionarEvento(payload)
    setIsSaving(false)

    if (ok) navigate('/')
  }

  if (isEditing && !editingEvent) {
    return (
      <div className="page">
        {!eventosLoaded ? (
          eventosError ? (
            <ErrorState message={eventosError} onRetry={() => reloadEvents()} />
          ) : (
            <LoadingSpinner message="Carregando evento..." />
          )
        ) : (
          <ErrorState
            title="Evento não encontrado"
            message="Este evento não existe mais ou foi removido."
            retryLabel="Ver programação"
            onRetry={() => navigate('/')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="top-header-bar">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>
      <header className="page-header">
        <h1>{editingEvent ? 'Editar Evento' : 'Adicionar Evento'}</h1>
      </header>

      <form onSubmit={handleSubmit} className="evento-form" aria-label="Formulário de Evento">
        <input
          type="text"
          placeholder="Nome do evento"
          value={novoEvento.nome}
          onChange={(e) => setNovoEvento({ ...novoEvento, nome: e.target.value })}
          required
          aria-label="Nome do evento"
        />

        <input
          type="url"
          placeholder="Link (opcional - para transmissão ao vivo)"
          value={novoEvento.link}
          onChange={(e) => setNovoEvento({ ...novoEvento, link: e.target.value })}
          aria-label="Link de transmissão"
        />

        <div className="input-group">
          <label htmlFor="event-local">Local do Evento</label>
          <div className="location-input-row">
            <input
              id="event-local"
              type="text"
              placeholder="Ex: Rua das Flores, 123, São Paulo"
              value={novoEvento.local}
              onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })}
              required
            />
          </div>
          {novoEvento.local.length > 5 && (
            <MapPreview local={novoEvento.local} height={150} title="Mapa de Localização" showHint={true} />
          )}
        </div>

        <div className="datetime-row">
          <div className="input-group">
            <label htmlFor="event-date">Data do Evento</label>
            <input
              id="event-date"
              type="date"
              value={novoEvento.data}
              min={isEditing ? undefined : minDate}
              onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="event-time">Horário</label>
            <input
              id="event-time"
              type="time"
              value={novoEvento.hora}
              onChange={(e) => setNovoEvento({ ...novoEvento, hora: e.target.value })}
              required
            />
          </div>
        </div>

        <input
          type="text"
          placeholder="Pastor responsável"
          value={novoEvento.pastor}
          onChange={(e) => setNovoEvento({ ...novoEvento, pastor: e.target.value })}
          aria-label="Pastor responsável"
        />

        <textarea
          placeholder="Breve descrição do evento"
          value={novoEvento.descricao}
          onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
          rows="3"
          aria-label="Descrição do evento"
        />

        <button type="submit" className="adicionar-btn" disabled={isSaving}>
          {isSaving ? 'Salvando...' : editingEvent ? 'Salvar Alterações' : 'Adicionar Evento'}
        </button>
      </form>
    </div>
  )
}
