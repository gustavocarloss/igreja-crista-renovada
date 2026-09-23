import { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import './CalendarioView.css'

/**
 * Componente de visualização do calendário mensal e programação integrada.
 */
export default function CalendarioView() {
  const { eventos, setSelectedEvent } = useAppContext()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())

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
      setSelectedEvent(dayEvents[0])
      navigate('/detalhes')
    } else if (dayEvents.length > 1) {
      navigate('/')
    }
  }

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
            return (
              <div
                key={idx}
                className={`calendar-day ${!day ? 'empty' : ''} ${hasEvents ? 'has-events' : ''}`}
                onClick={() => day && hasEvents && handleDayClick(day)}
                role={day && hasEvents ? "button" : undefined}
                aria-label={day && hasEvents ? `${day} de ${monthNames[month]} com evento` : undefined}
              >
                <span className="day-number">{day}</span>
                {hasEvents && <div className="event-indicator" data-testid="indicator"></div>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="proximos-agenda">
        <h3 className="secao-title">Eventos deste mês</h3>
        <div className="mini-cards-list">
          {eventos.filter(e => {
            if (!e.raw_date) return false
            const d = new Date(e.raw_date)
            return d.getMonth() === month && d.getFullYear() === year
          })
            .sort((a, b) => new Date(a.raw_date) - new Date(b.raw_date))
            .map(evento => (
              <div key={evento.id} className="agenda-mini-card" onClick={() => { setSelectedEvent(evento); navigate('/detalhes') }} role="button">
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
            ))}
        </div>
      </div>
    </div>
  )
}
