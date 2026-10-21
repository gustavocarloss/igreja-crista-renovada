import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { getEventStatus } from '../../utils/events'
import './CalendarioView.css'

/**
 * Componente de visualização do calendário mensal e programação integrada.
 */
export default function CalendarioView() {
  const { eventos } = useAppContext()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    if (!selectedDay) return undefined
    const onKey = (e) => e.key === 'Escape' && setSelectedDay(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedDay])

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay()

  const month = currentMonth.getMonth()
  const year = currentMonth.getFullYear()
  const days = daysInMonth(month, year)
  const firstDay = firstDayOfMonth(month, year)

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= days; i++) {
    calendarDays.push(i)
  }

  const getEventsForDay = (day) => {
    if (!day) return []
    return eventos.filter(evento => {
      if (!evento.raw_date) return false
      const eventDate = new Date(evento.raw_date)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      )
    })
  }

  const handleDayClick = (day) => {
    const dayEvents = getEventsForDay(day)
    if (dayEvents.length === 1) {
      navigate(`/detalhes/${dayEvents[0].id}`)
    } else if (dayEvents.length > 1) {
      setSelectedDay(day)
    }
  }

  const selectedDayEvents = selectedDay
    ? getEventsForDay(selectedDay).sort((a, b) => new Date(a.raw_date) - new Date(b.raw_date))
    : []

  const monthEvents = eventos
    .filter(e => {
      if (!e.raw_date) return false
      const d = new Date(e.raw_date)
      return d.getMonth() === month && d.getFullYear() === year
    })
    .sort((a, b) => new Date(a.raw_date) - new Date(b.raw_date))

  return (
    <div className="page">
      <div className="top-header-bar">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>
      <header className="page-header">
        <h1>Agenda Mensal</h1>
      </header>

      <div className="calendar-card">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="cal-nav-btn" aria-label="Mês Anterior">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="cal-nav-btn" aria-label="Próximo Mês">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div className="calendar-grid">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
            <div key={`${d}-${idx}`} className="calendar-weekday">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day)
            const hasEvents = dayEvents.length > 0
            const today = new Date();
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            return (
              <div
                key={idx}
                className={`calendar-day ${!day ? 'empty' : ''} ${hasEvents ? 'has-events' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => day && hasEvents && handleDayClick(day)}
                role={day && hasEvents ? "button" : undefined}
                aria-label={day && hasEvents ? `${day} de ${monthNames[month]} com evento` : undefined}
              >
                <span className="day-number">{day}</span>
                {hasEvents && (
                  dayEvents.length > 1 ? (
                    <span className="event-count" data-testid="indicator">{dayEvents.length}</span>
                  ) : (
                    <div className="event-indicator" data-testid="indicator"></div>
                  )
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="proximos-agenda">
        <h3 className="secao-title">Eventos deste mês</h3>
        <div className="mini-cards-list">
          {monthEvents.length > 0 ? (
            monthEvents
              .map(evento => (
                <div key={evento.id} className="agenda-mini-card" onClick={() => navigate(`/detalhes/${evento.id}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/detalhes/${evento.id}`) }}>
                  <div className="mini-date-box">
                    <span className="mini-day">{new Date(evento.raw_date).getDate()}</span>
                    <span className="mini-month">{monthNames[month].substring(0, 3)}</span>
                  </div>
                  <div className="mini-info">
                    <h4>{evento.nome}</h4>
                    <p>{new Date(evento.raw_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {evento.local}</p>
                  </div>
                  <div className="mini-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              ))
          ) : (
            <p className="no-events-month" style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', width: '100%', padding: '16px 0' }}>Sem eventos para o mês</p>
          )}
        </div>
      </div>

      {selectedDay && (
        <div className="day-sheet-overlay" onClick={() => setSelectedDay(null)}>
          <div
            className="day-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="day-sheet-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="day-sheet-header">
              <div>
                <span className="day-sheet-kicker">{selectedDayEvents.length} eventos</span>
                <h3 id="day-sheet-title">{selectedDay} de {monthNames[month]}</h3>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedDay(null)} aria-label="Fechar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="day-sheet-body">
              {selectedDayEvents.map((evento) => {
                const status = getEventStatus(evento.raw_date)
                return (
                  <div key={evento.id} className={`day-event-card ${status === 'past' ? 'past' : ''}`}>
                    <div className="day-event-head">
                      <h4>{evento.nome}</h4>
                      {status === 'past' && <span className="day-badge past">Encerrado</span>}
                      {status === 'live' && evento.aoVivo && <span className="day-badge live">AO VIVO</span>}
                    </div>
                    <p className="day-event-info">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {evento.hora}
                    </p>
                    {evento.local && (
                      <p className="day-event-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {evento.local}
                      </p>
                    )}
                    <button className="day-event-btn" onClick={() => navigate(`/detalhes/${evento.id}`)}>
                      Ver detalhes
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
