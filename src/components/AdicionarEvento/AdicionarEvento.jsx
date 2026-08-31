import { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import MapPreview from '../common/MapPreview/MapPreview'
import './AdicionarEvento.css'

/**
 * Componente de administração para adicionar ou editar eventos.
 */
export default function AdicionarEvento() {
  const {
    adicionarEvento,
    atualizarEvento,
    setCurrentPage,
    editingEvent,
    setEditingEvent,
    showMessage
  } = useAppContext()

  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    link: '',
    local: '',
    data: '',
    hora: '',
    descricao: '',
    pastor: ''
  })

  // Limpar formulário ao montar o componente se não estiver editando
  useEffect(() => {
    if (!editingEvent) {
      setNovoEvento({
        nome: '',
        link: '',
        local: '',
        data: '',
        hora: '',
        descricao: '',
        pastor: ''
      })
    }
  }, [editingEvent])

  useEffect(() => {
    if (editingEvent) {
      setNovoEvento({
        nome: editingEvent.nome || '',
        link: editingEvent.link || '',
        local: editingEvent.local || '',
        data: editingEvent.data || '',
        hora: editingEvent.hora || '',
        descricao: editingEvent.descricao || '',
        pastor: editingEvent.pastor || ''
      })
    }
  }, [editingEvent])

  const getTodayString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime;
  }

  const minDate = getTodayString()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (novoEvento.nome && novoEvento.local && novoEvento.data && novoEvento.hora) {
      // Validar se data/hora é futura
      const now = new Date()
      const [y, m, d] = novoEvento.data.split('-')
      const [h, min] = novoEvento.hora.split(':')
      const eventDateTime = new Date(y, m - 1, d, h, min)

      if (eventDateTime < now) {
        showMessage('A data e hora do evento devem ser futuras!')
        return
      }

      // Formatando o horário para exibição: "DD/MM/AAAA às HH:mm"
      const horarioFormatado = `${d}/${m}/${y} às ${novoEvento.hora}`

      const eventoParaSalvar = {
        ...novoEvento,
        horario: horarioFormatado,
        aoVivo: !!novoEvento.link
      }

      if (editingEvent) {
        atualizarEvento({ ...editingEvent, ...eventoParaSalvar })
      } else {
        adicionarEvento(eventoParaSalvar)
      }
      setEditingEvent(null)
      setCurrentPage('home')
      setNovoEvento({
        nome: '',
        link: '',
        local: '',
        data: '',
        hora: '',
        descricao: '',
        pastor: ''
      })
    }
  }

  return (
    <div className="page">
      <div className="top-header-bar">
        <img src="/icr-logo.png" alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>
      <header className="page-header">
        <button onClick={() => { setEditingEvent(null); setCurrentPage('home'); }} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Voltar
        </button>
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
              min={minDate}
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

        <button type="submit" className="adicionar-btn">
          {editingEvent ? 'Salvar Alterações' : 'Adicionar Evento'}
        </button>
      </form>
    </div>
  )
}
