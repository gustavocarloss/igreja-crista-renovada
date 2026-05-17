import { useState, createContext, useContext, useEffect } from 'react'

const SUPABASE_URL = 'https://rhtpvuwketpdugrqgkjb.supabase.co/rest/v1'
const SUPABASE_KEY = 'sb_publishable__KYRgCYXo50q1HG3xTgZHQ_DCGwv-_C'

const supabaseHeaders = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Prefer': 'return=representation'
}

import './App.css'

// Context Global
const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider')
  }
  return context
}

// Componente de Login
const Login = ({ onLogin, onShowRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.email && formData.senha) {
      onLogin(formData)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/icr-logo.png" alt="ICR Logo" className="login-logo" />
          <h1>Igreja Cristã Renovada</h1>
          <p className="verse">"Tomando o pão, deu graças, partiu-o e o deu aos discípulos" — Lucas 22:19</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="login-btn">Entrar</button>
        </form>

        <div className="auth-switch">
          <span>Ainda não faz parte?</span>
          <button className="secondary-btn" onClick={onShowRegister}>Criar conta</button>
        </div>
      </div>
    </div>
  )
}

// Componente de Modal de Mensagem
const MessageModal = ({ isOpen, message, type, onClose }) => {
  if (!isOpen) return null

  const isError = type === 'error'

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon-container">
          {isError ? (
            <svg className="modal-svg error" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ) : (
            <svg className="modal-svg success" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          )}
        </div>
        <h2>{isError ? 'Ops!' : 'Sucesso!'}</h2>
        <p>{message}</p>
        <button className="modal-close-btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  )
}

// Componente de Registro
const Registro = ({ onRegister, onShowLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.email && formData.senha) {
      onRegister({ name: formData.name, email: formData.email, password: formData.senha })
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/icr-logo.png" alt="ICR Logo" className="login-logo" />
          <h1>Nova Conta</h1>
          <p className="verse">"Vinde a mim, todos os que estais cansados e oprimidos" — Mateus 11:28</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            required
          />
          <button type="submit" className="login-btn">Cadastrar</button>
        </form>

        <div className="auth-switch">
          <span>Já tem uma conta?</span>
          <button className="secondary-btn" onClick={onShowLogin}>Fazer Login</button>
        </div>
      </div>
    </div>
  )
}

// Componente de Programação
const Programacao = () => {
  const { eventos, setCurrentPage, setSelectedEvent, setEditingEvent, excluirEvento } = useAppContext()

  const handleSaibaMais = (evento) => {
    setSelectedEvent(evento)
    setCurrentPage('detalhes')
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Programação</h1>
        <p>Acompanhe nossos próximos eventos</p>
      </header>
      
      <div className="eventos-list">
        {eventos.length > 0 ? (
          eventos.map(evento => (
            <div key={evento.id} className="evento-card">
              <div className="evento-header">
                <h3>{evento.nome}</h3>
                {evento.aoVivo && <span className="live-badge">AO VIVO</span>}
              </div>
              <div className="evento-info">
                <p className="evento-horario">
                  <span className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </span> {evento.horario}
                </p>
                <p className="evento-local">
                  <span className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
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
                <div className="evento-admin-actions">
                  <button
                    className="icon-btn-edit"
                    title="Editar"
                    onClick={() => { setEditingEvent(evento); setCurrentPage('adicionar') }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    className="icon-btn-delete"
                    title="Excluir"
                    onClick={() => excluirEvento(evento.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <p>Nenhuma programação no momento</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente de Detalhes do Evento
const EventoDetalhes = () => {
  const { selectedEvent, user, confirmarPresenca, setCurrentPage } = useAppContext()

  if (!selectedEvent) return null

  const jaConfirmado = user.eventosConfirmados.includes(selectedEvent.id)

  const handleConfirmar = () => {
    confirmarPresenca(selectedEvent.id)
  }

  return (
    <div className="page">
      <header className="page-header">
        <button onClick={() => setCurrentPage('home')} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Voltar
        </button>
        <h1>Detalhes do Evento</h1>
      </header>

      <div className="detalhes-container">
        <div className="detalhes-card">
          <div className="detalhes-header">
            <h2>{selectedEvent.nome}</h2>
            {selectedEvent.aoVivo && <span className="live-badge">AO VIVO</span>}
          </div>

          <div className="detalhes-body">
            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
              <div className="detalhe-content">
                <label>Data e Horário</label>
                <p>{selectedEvent.horario}</p>
              </div>
            </div>

            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <div className="detalhe-content">
                <label>Responsável / Pastor</label>
                <p>{selectedEvent.pastor}</p>
              </div>
            </div>

            <div className="detalhe-row">
              <span className="detalhe-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </span>
              <div className="detalhe-content">
                <label>Localização</label>
                <p>{selectedEvent.local}</p>
              </div>
            </div>

            <div className="map-preview-static">
              <iframe
                title="Mapa do Evento"
                width="100%"
                height="180"
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedEvent.local)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
            </div>

            <div className="detalhe-row no-icon">
              <div className="detalhe-content">
                <label>Sobre o Evento</label>
                <p className="descricao-texto">{selectedEvent.descricao}</p>
              </div>
            </div>

            {selectedEvent.link && (
              <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer" className="link-transmissao">
                <span className="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
                </span>
                Acessar Transmissão Online
              </a>
            )}
          </div>

          <div className="detalhes-footer">
            <button
              className={`confirmar-presenca-btn ${jaConfirmado ? 'confirmado' : ''}`}
              onClick={handleConfirmar}
              disabled={jaConfirmado}
            >
              {jaConfirmado ? (
                <>
                  <span className="check-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span> Presença Confirmada
                </>
              ) : (
                'Confirmar minha Presença'
              )}
            </button>
            <p className="footer-hint">Confirme para ajudar na organização do evento</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Calendário / Agenda
const CalendarioView = () => {
  const { eventos, setSelectedEvent, setCurrentPage } = useAppContext()
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
      setCurrentPage('detalhes')
    } else if (dayEvents.length > 1) {
      setCurrentPage('home')
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Agenda Mensal</h1>
        <p>Acompanhe nossa programação</p>
      </header>

      <div className="calendar-card">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="cal-nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="cal-nav-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6 6-6"/></svg>
          </button>
        </div>

        <div className="calendar-grid">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day)
            const hasEvents = dayEvents.length > 0
            return (
              <div 
                key={idx} 
                className={`calendar-day ${!day ? 'empty' : ''} ${hasEvents ? 'has-events' : ''}`}
                onClick={() => day && hasEvents && handleDayClick(day)}
              >
                <span className="day-number">{day}</span>
                {hasEvents && <div className="event-indicator"></div>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="proximos-agenda">
        <h3 className="secao-title">Próximos este mês</h3>
        <div className="mini-cards-list">
          {eventos.filter(e => {
            if (!e.raw_date) return false
            const d = new Date(e.raw_date)
            return d.getMonth() === month && d.getFullYear() === year
          })
          .sort((a, b) => new Date(a.raw_date) - new Date(b.raw_date))
          .map(evento => (
            <div key={evento.id} className="agenda-mini-card" onClick={() => { setSelectedEvent(evento); setCurrentPage('detalhes') }}>
              <div className="mini-date-box">
                <span className="mini-day">{new Date(evento.raw_date).getDate()}</span>
                <span className="mini-month">{monthNames[month].substring(0,3)}</span>
              </div>
              <div className="mini-info">
                <h4>{evento.nome}</h4>
                <p>{new Date(evento.raw_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {evento.local}</p>
              </div>
              <div className="mini-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Lista estática de livros para evitar dependência do endpoint /books que está instável
const LIVROS_BIBLIA = [
  { id: 'genesis', name: 'Gênesis', en: 'Genesis', chapters: 50 },
  { id: 'exodus', name: 'Êxodo', en: 'Exodus', chapters: 40 },
  { id: 'leviticus', name: 'Levítico', en: 'Leviticus', chapters: 27 },
  { id: 'numbers', name: 'Números', en: 'Numbers', chapters: 36 },
  { id: 'deuteronomy', name: 'Deuteronômio', en: 'Deuteronomy', chapters: 34 },
  { id: 'joshua', name: 'Josué', en: 'Joshua', chapters: 24 },
  { id: 'judges', name: 'Juízes', en: 'Judges', chapters: 21 },
  { id: 'ruth', name: 'Rute', en: 'Ruth', chapters: 4 },
  { id: '1samuel', name: '1 Samuel', en: '1 Samuel', chapters: 31 },
  { id: '2samuel', name: '2 Samuel', en: '2 Samuel', chapters: 24 },
  { id: '1kings', name: '1 Reis', en: '1 Kings', chapters: 22 },
  { id: '2kings', name: '2 Reis', en: '2 Kings', chapters: 25 },
  { id: '1chronicles', name: '1 Crônicas', en: '1 Chronicles', chapters: 29 },
  { id: '2chronicles', name: '2 Crônicas', en: '2 Chronicles', chapters: 36 },
  { id: 'ezra', name: 'Esdras', en: 'Ezra', chapters: 10 },
  { id: 'nehemiah', name: 'Neemias', en: 'Nehemiah', chapters: 13 },
  { id: 'esther', name: 'Ester', en: 'Esther', chapters: 10 },
  { id: 'job', name: 'Jó', en: 'Job', chapters: 42 },
  { id: 'psalms', name: 'Salmos', en: 'Psalms', chapters: 150 },
  { id: 'proverbs', name: 'Provérbios', en: 'Proverbs', chapters: 31 },
  { id: 'ecclesiastes', name: 'Eclesiastes', en: 'Ecclesiastes', chapters: 12 },
  { id: 'songofsolomon', name: 'Cânticos', en: 'Song of Solomon', chapters: 8 },
  { id: 'isaiah', name: 'Isaías', en: 'Isaiah', chapters: 66 },
  { id: 'jeremiah', name: 'Jeremias', en: 'Jeremiah', chapters: 52 },
  { id: 'lamentations', name: 'Lamentações', en: 'Lamentations', chapters: 5 },
  { id: 'ezekiel', name: 'Ezequiel', en: 'Ezekiel', chapters: 48 },
  { id: 'daniel', name: 'Daniel', en: 'Daniel', chapters: 12 },
  { id: 'hosea', name: 'Oséias', en: 'Hosea', chapters: 14 },
  { id: 'joel', name: 'Joel', en: 'Joel', chapters: 3 },
  { id: 'amos', name: 'Amós', en: 'Amos', chapters: 9 },
  { id: 'obadiah', name: 'Obadias', en: 'Obadiah', chapters: 1 },
  { id: 'jonah', name: 'Jonas', en: 'Jonah', chapters: 4 },
  { id: 'micah', name: 'Miquéias', en: 'Micah', chapters: 7 },
  { id: 'nahum', name: 'Naum', en: 'Nahum', chapters: 3 },
  { id: 'habakkuk', name: 'Habacuque', en: 'Habakkuk', chapters: 3 },
  { id: 'zephaniah', name: 'Sofonias', en: 'Zephaniah', chapters: 3 },
  { id: 'haggai', name: 'Ageu', en: 'Haggai', chapters: 2 },
  { id: 'zechariah', name: 'Zacarias', en: 'Zechariah', chapters: 14 },
  { id: 'malachi', name: 'Malaquias', en: 'Malachi', chapters: 4 },
  { id: 'matthew', name: 'Mateus', en: 'Matthew', chapters: 28 },
  { id: 'mark', name: 'Marcos', en: 'Mark', chapters: 16 },
  { id: 'luke', name: 'Lucas', en: 'Luke', chapters: 24 },
  { id: 'john', name: 'João', en: 'John', chapters: 21 },
  { id: 'acts', name: 'Atos', en: 'Acts', chapters: 28 },
  { id: 'romans', name: 'Romanos', en: 'Romans', chapters: 16 },
  { id: '1corinthians', name: '1 Coríntios', en: '1 Corinthians', chapters: 16 },
  { id: '2corinthians', name: '2 Coríntios', en: '2 Corinthians', chapters: 13 },
  { id: 'galatians', name: 'Gálatas', en: 'Galatians', chapters: 6 },
  { id: 'ephesians', name: 'Efésios', en: 'Ephesians', chapters: 6 },
  { id: 'philippians', name: 'Filipenses', en: 'Philippians', chapters: 4 },
  { id: 'colossians', name: 'Colossenses', en: 'Colossians', chapters: 4 },
  { id: '1thessalonians', name: '1 Tessalonicenses', en: '1 Thessalonians', chapters: 5 },
  { id: '2thessalonians', name: '2 Tessalonicenses', en: '2 Thessalonians', chapters: 3 },
  { id: '1timothy', name: '1 Timóteo', en: '1 Timothy', chapters: 6 },
  { id: '2timothy', name: '2 Timóteo', en: '2 Timothy', chapters: 4 },
  { id: 'titus', name: 'Tito', en: 'Titus', chapters: 3 },
  { id: 'philemon', name: 'Filemom', en: 'Philemon', chapters: 1 },
  { id: 'hebrews', name: 'Hebreus', en: 'Hebrews', chapters: 13 },
  { id: 'james', name: 'Tiago', en: 'James', chapters: 5 },
  { id: '1peter', name: '1 Pedro', en: '1 Peter', chapters: 5 },
  { id: '2peter', name: '2 Pedro', en: '2 Peter', chapters: 3 },
  { id: '1john', name: '1 João', en: '1 John', chapters: 5 },
  { id: '2john', name: '2 João', en: '2 John', chapters: 1 },
  { id: '3john', name: '3 João', en: '3 John', chapters: 1 },
  { id: 'jude', name: 'Judas', en: 'Jude', chapters: 1 },
  { id: 'revelation', name: 'Apocalipse', en: 'Revelation', chapters: 22 }
]

// Componente da Bíblia
const Biblia = () => {
  const [livros] = useState(LIVROS_BIBLIA)
  const [livroSelecionado, setLivroSelecionado] = useState(null)
  const [capituloSelecionado, setCapituloSelecionado] = useState(null)
  const [versiculos, setVersiculos] = useState([])
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState('')

  const handleLivroClick = (livro) => {
    setLivroSelecionado(livro)
    setCapituloSelecionado(null)
    setVersiculos([])
    setBusca('')
  }

  const handleCapituloClick = async (capitulo) => {
    setLoading(true)
    try {
      // Normalizando o nome do livro para remover acentos (ex: Gênesis -> Genesis, 1 João -> 1 Joao)
      const nomeLivroParaApi = livroSelecionado.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      
      // Usando a API alternativa e super estável (bible-api.com) com a tradução 'almeida'
      const res = await fetch(`https://bible-api.com/${nomeLivroParaApi}+${capitulo}?translation=almeida`)
      if (res.ok) {
        const data = await res.json()
        setVersiculos(data.verses)
        setCapituloSelecionado(capitulo)
      } else {
        alert('Erro ao carregar versículos. Tente novamente mais tarde.')
      }
    } catch (error) {
      console.error('Erro ao buscar versículos:', error)
      alert('Erro de conexão ao buscar Bíblia.')
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    if (capituloSelecionado) {
      setCapituloSelecionado(null)
      setVersiculos([])
    } else if (livroSelecionado) {
      setLivroSelecionado(null)
    }
  }

  const resultadosBusca = busca ?
    livros.filter(livro =>
      livro.name.toLowerCase().includes(busca.toLowerCase())
    ) : livros

  // RENDERIZAÇÃO: NÍVEL 3 (LEITURA DE VERSÍCULOS)
  if (livroSelecionado && capituloSelecionado) {
    const isFirstChapter = capituloSelecionado === 1
    const isLastChapter = capituloSelecionado === livroSelecionado.chapters

    return (
      <div className="page leitura-page">
        <header className="biblia-header-nav">
          <button onClick={handleVoltar} className="back-btn-biblia">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar
          </button>
          
          <div className="leitura-header-center">
            <h2>{livroSelecionado.name} {capituloSelecionado}</h2>
            <div className="capitulo-nav-controls">
              <button 
                onClick={() => handleCapituloClick(capituloSelecionado - 1)} 
                disabled={isFirstChapter}
                className="nav-arrow-btn"
                title="Capítulo Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button 
                onClick={() => handleCapituloClick(capituloSelecionado + 1)} 
                disabled={isLastChapter}
                className="nav-arrow-btn"
                title="Próximo Capítulo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6 6-6"/></svg>
              </button>
            </div>
          </div>
        </header>
        
        <div className="leitura-container">
          {loading ? (
            <div className="loading-state">Carregando leitura...</div>
          ) : (
            <div className="versiculos-list">
              {versiculos.map(v => (
                <div key={v.verse} className="versiculo-item">
                  <sup className="v-num">{v.verse}</sup>
                  <span className="v-text">{v.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // RENDERIZAÇÃO: NÍVEL 2 (ESCOLHA DE CAPÍTULOS)
  if (livroSelecionado && !capituloSelecionado) {
    const caps = Array.from({ length: livroSelecionado.chapters }, (_, i) => i + 1)
    
    return (
      <div className="page">
        <header className="biblia-header-nav">
          <button onClick={handleVoltar} className="back-btn-biblia">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Voltar
          </button>
          <h2>{livroSelecionado.name}</h2>
        </header>
        
        <div className="capitulos-secao">
          <p className="instrucao">Selecione o capítulo:</p>
          <div className="capitulos-grid">
            {caps.map(cap => (
              <button 
                key={cap} 
                className="capitulo-btn"
                onClick={() => handleCapituloClick(cap)}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // RENDERIZAÇÃO: NÍVEL 1 (ESCOLHA DE LIVROS)
  return (
    <div className="page">
      <header className="page-header">
        <h1>Bíblia Sagrada</h1>
        <p>João Ferreira de Almeida (ARA)</p>
      </header>

      <div className="busca-container">
        <input
          type="text"
          placeholder="Buscar livro..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      <div className="livros-secao">
        <div className="livros-grid">
          {resultadosBusca.map(livro => (
            <div 
              key={livro.id} 
              className="livro-item"
              onClick={() => handleLivroClick(livro)}
            >
              {livro.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente do Perfil
const Perfil = () => {
  const { user, eventos, setCurrentPage, setSelectedEvent } = useAppContext()

  const eventosConfirmados = eventos.filter(evento =>
    user.eventosConfirmados.includes(evento.id)
  )

  const handleVerDetalhes = (evento) => {
    setSelectedEvent(evento)
    setCurrentPage('detalhes')
  }

  const handleLogout = () => {
    localStorage.removeItem('churchUser')
    window.location.reload()
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie sua conta e presenças</p>
      </header>

      <div className="perfil-card">
        <div className="user-profile-header">
          <div className="avatar-placeholder">
            {user.nome.charAt(0)}
          </div>
          <div className="user-details">
            <h3>{user.nome}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="perfil-section">
          <h3>Eventos Confirmados</h3>
          <div className="confirmados-list">
            {eventosConfirmados.length > 0 ? (
              eventosConfirmados.map(evento => (
                <div key={evento.id} className="confirmado-item">
                  <div className="confirmado-dot"></div>
                  <div className="confirmado-info">
                    <h4>{evento.nome}</h4>
                    <p>{evento.horario}</p>
                  </div>
                  <button 
                    className="ver-evento-btn"
                    title="Ver Detalhes"
                    onClick={() => handleVerDetalhes(evento)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              ))
            ) : (
              <p className="no-data">Nenhum evento confirmado ainda.</p>
            )}
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Finalizar Sessão
        </button>
      </div>
    </div>
  )
}

// Componente para Adicionar Evento
const AdicionarEvento = () => {
  const { adicionarEvento, atualizarEvento, setCurrentPage, editingEvent, setEditingEvent } = useAppContext()
  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    link: '',
    local: '',
    data: '',
    hora: '',
    descricao: '',
    pastor: ''
  })

  useEffect(() => {
    if (editingEvent) {
      // Tentar separar horario em data e hora se possível, ou apenas resetar
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (novoEvento.nome && novoEvento.local && novoEvento.data && novoEvento.hora) {
      // Formatando o horário para exibição: "DD/MM/AAAA às HH:mm"
      const [year, month, day] = novoEvento.data.split('-')
      const horarioFormatado = `${day}/${month}/${year} às ${novoEvento.hora}`
      
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
      <header className="page-header">
        <button onClick={() => setCurrentPage('home')} className="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Voltar
        </button>
        <h1>Adicionar Evento</h1>
      </header>

      <form onSubmit={handleSubmit} className="evento-form">
        <input
          type="text"
          placeholder="Nome do evento"
          value={novoEvento.nome}
          onChange={(e) => setNovoEvento({ ...novoEvento, nome: e.target.value })}
          required
        />

        <input
          type="url"
          placeholder="Link (opcional - para transmissão ao vivo)"
          value={novoEvento.link}
          onChange={(e) => setNovoEvento({ ...novoEvento, link: e.target.value })}
        />

        <div className="input-group">
          <label>Local do Evento</label>
          <div className="location-input-row">
            <input
              type="text"
              placeholder="Ex: Rua das Flores, 123, São Paulo"
              value={novoEvento.local}
              onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })}
              required
            />
          </div>
          {novoEvento.local.length > 5 && (
            <div className="map-preview-container">
              <iframe
                title="Mapa de Localização"
                width="100%"
                height="150"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(novoEvento.local)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              ></iframe>
              <p className="map-hint">Verifique se o marcador está no local correto</p>
            </div>
          )}
        </div>

        <div className="datetime-row">
          <div className="input-group">
            <label>Data do Evento</label>
            <input
              type="date"
              value={novoEvento.data}
              onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })}
              required
            />
          </div>
          <div className="input-group">
            <label>Horário</label>
            <input
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
        />

        <textarea
          placeholder="Breve descrição do evento"
          value={novoEvento.descricao}
          onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })}
          rows="3"
        />

        <button type="submit" className="adicionar-btn">
          Adicionar Evento
        </button>
      </form>
    </div>
  )
}

// Navegação Inferior
const BottomNav = () => {
  const { currentPage, setCurrentPage } = useAppContext()

  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    },
    {
      id: 'calendario',
      label: 'Agenda',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    {
      id: 'biblia',
      label: 'Bíblia',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    },
    {
      id: 'adicionar',
      label: 'Adicionar',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    }
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => setCurrentPage(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

// Componente Principal
function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authPage, setAuthPage] = useState('login')
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventos, setEventos] = useState([])
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: '',
    type: 'error'
  })

  const showMessage = (message, type = 'error') => {
    setModalConfig({ isOpen: true, message, type })
  }

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false })
  }

  // Verificar se há usuário logado
  useEffect(() => {
    const savedUser = localStorage.getItem('churchUser')
    const savedToken = localStorage.getItem('churchToken')
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      
      // Buscar presenças atualizadas do banco ao recarregar a página
      const fetchAttendances = async () => {
        try {
          const res = await fetch(`${SUPABASE_URL}/attendance?user_id=eq.${parsedUser.id}`, {
            headers: supabaseHeaders
          })
          if (res.ok) {
            const data = await res.json()
            const confirmedIds = data.map(att => att.meeting_id)
            const updatedUser = { ...parsedUser, eventosConfirmados: confirmedIds }
            setUser(updatedUser)
            localStorage.setItem('churchUser', JSON.stringify(updatedUser))
          }
        } catch (err) {
          console.error('Erro ao buscar presenças', err)
        }
      }
      fetchAttendances()
    }
    
    if (savedToken) setToken(savedToken)
  }, [])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/meeting`, {
          headers: supabaseHeaders
        })
        if (!res.ok) throw new Error('Falha ao carregar eventos')
        const data = await res.json()
        
        // Mapeando colunas da tabela 'meeting' para o estado interno do App
        const mappedEvents = data.map(row => ({
          id: row.id,
          nome: row.meeting_name,
          link: row.meeting_link,
          local: row.meeting_location,
          raw_date: row.meeting_date, // Guardando a data bruta para o calendário
          horario: row.meeting_date ? 
            new Date(row.meeting_date).toLocaleString('pt-BR', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            }).replace(',', ' às') : '',
          pastor: row.meeting_priest,
          descricao: row.meeting_description,
          aoVivo: !!row.meeting_link
        }))
        
        setEventos(mappedEvents)
      } catch (err) {
        console.error('Erro ao carregar eventos', err)
        setEventos([])
      }
    }
    fetchEvents()
  }, [])

  const handleLogin = async ({ email, senha }) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/user?email=eq.${email}&password=eq.${senha}`, {
        method: 'GET',
        headers: supabaseHeaders
      })

      const data = await res.json()

      if (!res.ok || data.length === 0) {
        showMessage('Falha no login. Verifique suas credenciais.')
        return
      }

      const dbUser = data[0]
      
      // Buscar presenças do usuário no banco
      let confirmedIds = []
      try {
        const attRes = await fetch(`${SUPABASE_URL}/attendance?user_id=eq.${dbUser.id}`, {
          headers: supabaseHeaders
        })
        if (attRes.ok) {
          const attData = await attRes.json()
          confirmedIds = attData.map(att => att.meeting_id)
        }
      } catch (err) {
        console.error('Erro ao buscar presenças no login', err)
      }

      const newUser = {
        id: dbUser.id,
        nome: dbUser.name,
        email: dbUser.email,
        eventosConfirmados: confirmedIds
      }

      setUser(newUser)
      localStorage.setItem('churchUser', JSON.stringify(newUser))
      // Supabase REST com apikey não usa token de sessão da mesma forma, mas mantemos o estado
      setToken(SUPABASE_KEY)
    } catch (err) {
      showMessage('Erro de conexão ao fazer login. Verifique sua internet.')
    }
  }

  const handleRegister = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/user`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({ name, email, password })
      })

      if (!res.ok) {
        const data = await res.json()
        showMessage(data.message || 'Falha no cadastro. Verifique os dados informados.')
        return
      }

      showMessage('Cadastro realizado com sucesso! Faça login para continuar.', 'success')
      setAuthPage('login')
    } catch (err) {
      showMessage('Erro ao realizar cadastro. Tente novamente.')
    }
  }

  const confirmarPresenca = async (eventoId) => {
    try {
      // Salvar a presença no banco de dados
      const res = await fetch(`${SUPABASE_URL}/attendance`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          user_id: user.id,
          meeting_id: eventoId
        })
      })

      if (!res.ok) {
        showMessage('Falha ao confirmar presença no banco de dados.')
        return
      }

      // Atualizar o estado local
      const updatedUser = {
        ...user,
        eventosConfirmados: [...user.eventosConfirmados, eventoId]
      }
      setUser(updatedUser)
      localStorage.setItem('churchUser', JSON.stringify(updatedUser))
      showMessage('Presença confirmada com sucesso!', 'success')
    } catch (err) {
      showMessage('Erro de conexão ao confirmar presença.')
    }
  }

  const adicionarEvento = async (novoEvento) => {
    try {
      // Criando um objeto de data local para lidar com o fuso horário corretamente
      const localDateTime = new Date(`${novoEvento.data}T${novoEvento.hora}:00`)
      
      const rowToSave = {
        meeting_name: novoEvento.nome,
        meeting_link: novoEvento.link,
        meeting_location: novoEvento.local,
        meeting_date: localDateTime.toISOString(), // Envia como ISO (UTC) com a compensação correta
        meeting_priest: novoEvento.pastor,
        meeting_description: novoEvento.descricao
      }

      const res = await fetch(`${SUPABASE_URL}/meeting`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(rowToSave)
      })
      if (!res.ok) {
        showMessage('Falha ao adicionar evento.')
        return
      }
      const data = await res.json()
      
      const savedRow = data[0]
      const mappedNewEvent = {
        id: savedRow.id,
        nome: savedRow.meeting_name,
        link: savedRow.meeting_link,
        local: savedRow.meeting_location,
        horario: savedRow.meeting_date ? 
          new Date(savedRow.meeting_date).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }).replace(',', ' às') : '',
        pastor: savedRow.meeting_priest,
        descricao: savedRow.meeting_description,
        aoVivo: !!savedRow.meeting_link
      }

      setEventos([...eventos, mappedNewEvent])
      showMessage('Evento adicionado com sucesso!', 'success')
    } catch (err) {
      showMessage('Erro ao adicionar evento.')
    }
  }

  const atualizarEvento = async (eventoAtualizado) => {
    try {
      // Criando um objeto de data local para lidar com o fuso horário
      const localDateTime = new Date(`${eventoAtualizado.data}T${eventoAtualizado.hora}:00`)

      const rowToUpdate = {
        meeting_name: eventoAtualizado.nome,
        meeting_link: eventoAtualizado.link,
        meeting_location: eventoAtualizado.local,
        meeting_date: localDateTime.toISOString(),
        meeting_priest: eventoAtualizado.pastor,
        meeting_description: eventoAtualizado.descricao
      }

      const res = await fetch(`${SUPABASE_URL}/meeting?id=eq.${eventoAtualizado.id}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify(rowToUpdate)
      })
      if (!res.ok) {
        showMessage('Falha ao atualizar evento.')
        return
      }
      const data = await res.json()
      const updatedRow = data[0]
      
      const mappedUpdatedEvent = {
        id: updatedRow.id,
        nome: updatedRow.meeting_name,
        link: updatedRow.meeting_link,
        local: updatedRow.meeting_location,
        horario: updatedRow.meeting_date ? 
          new Date(updatedRow.meeting_date).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }).replace(',', ' às') : '',
        pastor: updatedRow.meeting_priest,
        descricao: updatedRow.meeting_description,
        aoVivo: !!updatedRow.meeting_link
      }

      setEventos(eventos.map(e => e.id === mappedUpdatedEvent.id ? mappedUpdatedEvent : e))
      showMessage('Evento atualizado com sucesso!', 'success')
    } catch (err) {
      showMessage('Erro ao atualizar evento.')
    }
  }

  const excluirEvento = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return

    try {
      const res = await fetch(`${SUPABASE_URL}/meeting?id=eq.${id}`, {
        method: 'DELETE',
        headers: supabaseHeaders
      })
      if (!res.ok) {
        showMessage('Falha ao excluir evento.')
        return
      }
      setEventos(eventos.filter(e => e.id !== id))
      showMessage('Evento excluído com sucesso!', 'success')
    } catch (err) {
      showMessage('Erro ao excluir evento.')
    }
  }

  const contextValue = {
    user,
    token,
    currentPage,
    setCurrentPage,
    selectedEvent,
    setSelectedEvent,
    editingEvent,
    setEditingEvent,
    eventos,
    confirmarPresenca,
    adicionarEvento,
    atualizarEvento,
    excluirEvento
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Programacao />
      case 'calendario':
        return <CalendarioView />
      case 'detalhes':
        return <EventoDetalhes />
      case 'biblia':
        return <Biblia />
      case 'perfil':
        return <Perfil />
      case 'adicionar':
        return <AdicionarEvento />
      default:
        return <Programacao />
    }
  }

  const content = !user ? (
    authPage === 'login'
      ? <Login onLogin={handleLogin} onShowRegister={() => setAuthPage('register')} />
      : <Registro onRegister={handleRegister} onShowLogin={() => setAuthPage('login')} />
  ) : (
    <>
      {renderPage()}
      <BottomNav />
    </>
  )

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        {content}
        <MessageModal
          isOpen={modalConfig.isOpen}
          message={modalConfig.message}
          type={modalConfig.type}
          onClose={closeModal}
        />
      </div>
    </AppContext.Provider>
  )
}

export default App
