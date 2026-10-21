import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { attendanceService } from '../../services/api'
import { getEventStatus } from '../../utils/events'
import MapPreview from '../common/MapPreview/MapPreview'
import ChatBoard from '../ChatBoard/ChatBoard'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import ErrorState from '../common/ErrorState/ErrorState'
import './EventoDetalhes.css'

/**
 * Componente que exibe os detalhes de um evento específico (identificado pelo :id da URL).
 */
export default function EventoDetalhes() {
  const {
    eventos,
    eventosLoaded,
    eventosError,
    reloadEvents,
    user,
    confirmarPresenca,
    cancelarPresenca,
    excluirEvento
  } = useAppContext()

  const { id } = useParams()
  const navigate = useNavigate()

  const [showAttendees, setShowAttendees] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attendees, setAttendees] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Fecha o menu de ações ao tocar/clicar fora dele (ou apertar Esc).
  useEffect(() => {
    if (!menuOpen) return undefined
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const selectedEvent = eventos.find(e => String(e.id) === String(id))
  const eventId = selectedEvent?.id

  const loadAttendees = useCallback(async () => {
    if (eventId === undefined) return
    try {
      setAttendees(await attendanceService.fetchMeetingAttendees(eventId))
    } catch (err) {
      console.error('Erro ao carregar presenças', err)
    }
  }, [eventId])

  useEffect(() => {
    loadAttendees()
  }, [loadAttendees])

  const goBack = () => navigate(window.history.state?.idx > 0 ? -1 : '/')

  if (!selectedEvent) {
    if (!eventosLoaded) {
      return (
        <div className="page">
          {eventosError ? (
            <ErrorState message={eventosError} onRetry={() => reloadEvents()} />
          ) : (
            <LoadingSpinner message="Carregando evento..." />
          )}
        </div>
      )
    }
    return (
      <div className="page">
        <ErrorState
          title="Evento não encontrado"
          message="Este evento não existe mais ou foi removido."
          retryLabel="Ver programação"
          onRetry={() => navigate('/')}
        />
      </div>
    )
  }

  const jaConfirmado = user?.eventosConfirmados?.some(id => String(id) === String(selectedEvent.id)) || false

  const status = getEventStatus(selectedEvent.raw_date)
  const isPastEvent = status === 'past'
  const isHappeningNow = status === 'live'

  const handleConfirmar = async () => {
    setIsLoading(true)
    try {
      await confirmarPresenca(selectedEvent.id)
      await loadAttendees()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelar = async () => {
    setIsLoading(true)
    try {
      await cancelarPresenca(selectedEvent.id)
      await loadAttendees()
    } finally {
      setIsLoading(false)
    }
  }

  const eventAttendees = attendees
  const isAdmin = user?.role === 'admin'

  const handleEditar = () => {
    setMenuOpen(false)
    navigate(`/editar/${selectedEvent.id}`)
  }

  const handleExcluir = async () => {
    setMenuOpen(false)
    const ok = await excluirEvento(selectedEvent.id)
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="page">
      <div className="top-header-bar">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>
      <header className="page-header">
        <button onClick={goBack} className="back-btn" aria-label="Voltar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h1>Detalhes do Evento</h1>
        {isAdmin && (
          <div className="evento-menu" ref={menuRef}>
            <button
              type="button"
              className="evento-menu-btn"
              aria-label="Mais opções"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
            </button>
            {menuOpen && (
              <div className="evento-menu-popover" role="menu">
                <button type="button" role="menuitem" onClick={handleEditar}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Editar evento
                </button>
                <button type="button" role="menuitem" className="danger" onClick={handleExcluir}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                  Excluir evento
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="detalhes-container">
        <div className="detalhes-card">
          <div className="detalhes-header">
            <h2>{selectedEvent.nome}</h2>
            {selectedEvent.aoVivo && isHappeningNow && <span className="live-badge">AO VIVO</span>}
          </div>

          <div className="detalhes-body">
            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </span>
              <div className="detalhe-content">
                <label>Data e Horário</label>
                <p>{selectedEvent.horario}</p>
              </div>
            </div>

            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </span>
              <div className="detalhe-content">
                <label>Responsável / Pastor</label>
                <p>{selectedEvent.pastor}</p>
              </div>
            </div>

            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </span>
              <div className="detalhe-content">
                <label>Localização</label>
                <p>{selectedEvent.local}</p>
              </div>
            </div>

            <MapPreview local={selectedEvent.local} height={180} title="Mapa do Evento" linkToMaps />

            <div className="detalhe-row no-icon">
              <div className="detalhe-content">
                <label>Sobre o Evento</label>
                <p className="descricao-texto">{selectedEvent.descricao}</p>
              </div>
            </div>

            {selectedEvent.link && (
              <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer" className="link-transmissao">
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2" /><polyline points="17 2 12 7 7 2" /></svg>
                </span>
                Acessar Transmissão Online
              </a>
            )}

            <div className="attendees-section">
              <label>Presenças Confirmadas ({eventAttendees.length})</label>
              {eventAttendees.length > 0 ? (
                <button className="view-attendees-btn" onClick={() => setShowAttendees(true)}>
                  Ver lista de confirmados
                </button>
              ) : (
                <p className="no-attendees">Nenhuma presença confirmada ainda.</p>
              )}
            </div>

            <ChatBoard meetingId={selectedEvent.id} isPastEvent={isPastEvent} />
          </div>

          <div className="detalhes-footer">
            {isPastEvent ? (
              <p className="footer-hint" style={{ color: '#ef4444', fontWeight: 'bold' }}>Este evento já foi encerrado.</p>
            ) : jaConfirmado ? (
              <button
                className="cancelar-presenca-btn-full"
                onClick={handleCancelar}
                disabled={isLoading}
              >
                {isLoading ? 'Cancelando...' : 'Cancelar presença'}
              </button>
            ) : (
              <button
                className="confirmar-presenca-btn"
                onClick={handleConfirmar}
                disabled={isLoading}
              >
                {isLoading ? 'Confirmando...' : 'Confirmar presença'}
              </button>
            )}
            {!isPastEvent && <p className="footer-hint"></p>}
          </div>
        </div>
      </div>
      {showAttendees && (
        <div className="attendees-modal-overlay" onClick={() => setShowAttendees(false)}>
          <div className="attendees-modal" onClick={e => e.stopPropagation()}>
            <div className="attendees-modal-header">
              <h3>Lista de Confirmados</h3>
              <button className="close-modal-btn" onClick={() => setShowAttendees(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="attendees-modal-body">
              {eventAttendees.map((att, idx) => (
                <div key={idx} className="modal-attendee-row">
                  <div
                    className="modal-attendee-avatar"
                    style={att.avatar_url ? { backgroundImage: `url(${att.avatar_url})` } : {}}
                  >
                    {!att.avatar_url && (att.user_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <span>{att.user_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
