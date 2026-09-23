import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import './Programacao.css'

/**
 * Componente que exibe a listagem de eventos ativos/futuros (Programação).
 */
export default function Programacao() {
  const {
    eventos,
    setSelectedEvent,
    setEditingEvent,
    excluirEvento,
    user
  } = useAppContext()
  const navigate = useNavigate()

  const handleSaibaMais = (evento) => {
    setSelectedEvent(evento)
    navigate('/detalhes')
  }

  const now = new Date()
  const activeEvents = eventos.filter(evento => {
    if (!evento.raw_date) return true
    const eventDate = new Date(evento.raw_date)
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    return eventDate >= fourHoursAgo
  })

  const isHappeningNow = (evento) => {
    if (!evento.raw_date) return false;
    const eventDate = new Date(evento.raw_date);
    const currTime = new Date();
    return eventDate <= currTime && currTime.getTime() - eventDate.getTime() < 4 * 60 * 60 * 1000;
  }

  const sortedEvents = [...activeEvents].sort((a, b) => {
    if (a.aoVivo && !b.aoVivo) return -1
    if (!a.aoVivo && b.aoVivo) return 1
    if (a.raw_date && b.raw_date) {
      return new Date(a.raw_date) - new Date(b.raw_date)
    }
    return 0
  })

  const pastEvents = eventos.filter(evento => {
    if (!evento.raw_date) return false
    const eventDate = new Date(evento.raw_date)
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return eventDate < fourHoursAgo && eventDate >= sevenDaysAgo
  }).sort((a, b) => new Date(b.raw_date) - new Date(a.raw_date))

  return (
    <div className="page">
      <div className="top-header-bar">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>

      <header className="page-header">
        <h1>Programação</h1>
      </header>

      <div className="eventos-list">
        {sortedEvents.length > 0 ? (
          sortedEvents.map(evento => (
            <div key={evento.id} className="evento-card">
              <div className="evento-header">
                <h3>{evento.nome}</h3>
                {evento.aoVivo && isHappeningNow(evento) && <span className="live-badge">AO VIVO</span>}
              </div>
              <div className="evento-info">
                <p className="evento-horario">
                  <span className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </span> {evento.horario}
                </p>
                <p className="evento-local">
                  <span className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </span> {evento.local}
                </p>
              </div>

              <div className="evento-footer">
                <button
                  className="saiba-mais-btn"
                  onClick={() => handleSaibaMais(evento)}
                >
                  Ver detalhes
                </button>
                {user?.role === 'admin' && (
                  <div className="evento-admin-actions">
                    <button
                      className="icon-btn-edit"
                      title="Editar"
                      onClick={() => { setEditingEvent(evento); navigate('/adicionar') }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button
                      className="icon-btn-delete"
                      title="Excluir"
                      onClick={() => excluirEvento(evento.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </span>
            <p>Nenhuma programação no momento</p>
          </div>
        )}
      </div>

      <div className="eventos-anteriores-section">
        <h2 className="section-title">Eventos Anteriores</h2>
        <div className="eventos-list">
          {pastEvents.length > 0 ? (
            pastEvents.map(evento => (
              <div key={evento.id} className="evento-card past-event-card">
                <div className="evento-header">
                  <h3>{evento.nome}</h3>
                  <span className="past-badge">Encerrado</span>
                </div>
                <div className="evento-info">
                  <p className="evento-horario">
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </span> {evento.horario}
                  </p>
                  <p className="evento-local">
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    </span> {evento.local}
                  </p>
                </div>
                <div className="evento-footer">
                  <button
                    className="saiba-mais-btn past"
                    onClick={() => handleSaibaMais(evento)}
                  >
                    Ver detalhes
                  </button>
                  {user?.role === 'admin' && (
                    <div className="evento-admin-actions">
                      <button
                        className="icon-btn-delete"
                        title="Excluir"
                        onClick={() => excluirEvento(evento.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-past-events">Não teve evento na última semana</p>
          )}
        </div>
      </div>
    </div>
  )
}
