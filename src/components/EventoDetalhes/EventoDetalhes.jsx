import { useAppContext } from '../../context/AppContext'
import MapPreview from '../common/MapPreview/MapPreview'
import ChatBoard from '../ChatBoard/ChatBoard'
import './EventoDetalhes.css'

/**
 * Componente que exibe os detalhes de um evento específico selecionado.
 */
export default function EventoDetalhes() {
  const {
    selectedEvent,
    user,
    confirmarPresenca,
    cancelarPresenca,
    presencas,
    setCurrentPage,
    previousPage
  } = useAppContext()

  if (!selectedEvent) return null

  const jaConfirmado = user?.eventosConfirmados?.includes(selectedEvent.id) || false

  const isPastEvent = (() => {
    if (!selectedEvent.raw_date || !selectedEvent.hora) return false
    const now = new Date()
    const [y, m, d] = selectedEvent.raw_date.split('-')
    const [h, min] = selectedEvent.hora.split(':')
    const eventDateTime = new Date(y, m - 1, d, h, min)
    return eventDateTime < now
  })()

  const isHappeningNow = (() => {
    if (!selectedEvent.raw_date) return false;
    const eventDate = new Date(selectedEvent.raw_date);
    const currTime = new Date();
    return eventDate <= currTime && currTime.getTime() - eventDate.getTime() < 4 * 60 * 60 * 1000;
  })();

  const handleConfirmar = () => {
    confirmarPresenca(selectedEvent.id)
  }

  const eventAttendees = presencas
    .filter(p => p.meeting_id === selectedEvent.id)

  return (
    <div className="page">
      <header className="page-header">
        <button onClick={() => setCurrentPage(previousPage || 'home')} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Voltar
        </button>
        <h1>Detalhes do Evento</h1>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <div className="detalhe-content">
                <label>Data e Horário</label>
                <p>{selectedEvent.horario}</p>
              </div>
            </div>

            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <div className="detalhe-content">
                <label>Responsável / Pastor</label>
                <p>{selectedEvent.pastor}</p>
              </div>
            </div>

            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div className="detalhe-content">
                <label>Localização</label>
                <p>{selectedEvent.local}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.local)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="maps-link"
                >
                  Abrir no Google Maps
                </a>
              </div>
            </div>

            <MapPreview local={selectedEvent.local} height={180} title="Mapa do Evento" />

            <div className="detalhe-row no-icon">
              <div className="detalhe-content">
                <label>Sobre o Evento</label>
                <p className="descricao-texto">{selectedEvent.descricao}</p>
              </div>
            </div>

            {selectedEvent.link && (
              <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer" className="link-transmissao">
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                </span>
                Acessar Transmissão Online
              </a>
            )}

            <div className="attendees-section">
              <label>Presenças Confirmadas ({eventAttendees.length})</label>
              {eventAttendees.length > 0 ? (
                <div className="attendees-list">
                  {eventAttendees.map((att, idx) => (
                    <div key={idx} className="attendee-badge">
                      <div 
                        className="attendee-avatar-mini"
                        style={att.avatar_url ? { backgroundImage: `url(${att.avatar_url})` } : {}}
                      >
                        {!att.avatar_url && att.user_name.charAt(0).toUpperCase()}
                      </div>
                      <span>{att.user_name}</span>
                    </div>
                  ))}
                </div>
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
                onClick={() => cancelarPresenca(selectedEvent.id)}
              >
                Cancelar Presença
              </button>
            ) : (
              <button
                className="confirmar-presenca-btn"
                onClick={handleConfirmar}
              >
                Confirmar minha Presença
              </button>
            )}
            {!isPastEvent && <p className="footer-hint">Confirme para ajudar na organização do evento</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
