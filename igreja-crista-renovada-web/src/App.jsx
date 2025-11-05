import { useState, createContext, useContext, useEffect } from 'react'

const API_URL = '/api'
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
        <img src="/icr-logo.png" alt="Igreja Cristã Renovada" className="login-logo" />
        <h1>Igreja Cristã Renovada</h1>
        <p className="verse">"Tomando o pão, deu graças, partiu-o e o deu aos discípulos" - Lucas 22:19</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={formData.senha}
            onChange={(e) => setFormData({...formData, senha: e.target.value})}
            required
          />
          <button type="submit" className="login-btn">Entrar</button>
        </form>

        <div className="auth-switch">
          <span>Não possui uma conta?</span>
          <button className="secondary-btn" onClick={onShowRegister}>Cadastrar-se</button>
        </div>
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
        <img src="/icr-logo.png" alt="Igreja Cristã Renovada" className="login-logo" />
        <h1>Crie sua conta</h1>
        <p className="verse">"Vinde a mim, todos os que estais cansados e oprimidos" - Mateus 11:28</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
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
          <span>Já possui uma conta?</span>
          <button className="secondary-btn" onClick={onShowLogin}>Entrar</button>
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
        <p>Igreja Cristã Renovada</p>
      </header>
      
      <div className="eventos-list">
        {eventos.map(evento => (
          <div key={evento.id} className="evento-card">
            <div className="evento-header">
              <h3>{evento.nome}</h3>
              {evento.aoVivo && <span className="live-badge">🔴 AO VIVO</span>}
            </div>
            <p className="evento-horario">{evento.horario}</p>
            <p className="evento-local">{evento.local}</p>
            <button 
              className="saiba-mais-btn"
              onClick={() => handleSaibaMais(evento)}
            >
              Saiba Mais
            </button>
            <div className="evento-actions">
              <button
                className="editar-btn"
                onClick={() => { setEditingEvent(evento); setCurrentPage('adicionar') }}
              >Editar</button>
              <button
                className="excluir-btn"
                onClick={() => excluirEvento(evento.id)}
              >Excluir</button>
            </div>
          </div>
        ))}
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
        <button onClick={() => setCurrentPage('home')} className="back-btn">← Voltar</button>
        <h1>{selectedEvent.nome}</h1>
      </header>
      
      <div className="evento-detalhes">
        <div className="detail-item">
          <strong>Horário:</strong> {selectedEvent.horario}
        </div>
        <div className="detail-item">
          <strong>Pastor:</strong> {selectedEvent.pastor}
        </div>
        <div className="detail-item">
          <strong>Local:</strong> {selectedEvent.local}
        </div>
        <div className="detail-item">
          <strong>Descrição:</strong> {selectedEvent.descricao}
        </div>
        
        {selectedEvent.link && (
          <div className="detail-item">
            <strong>Link:</strong> 
            <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer">
              Assistir Online
            </a>
          </div>
        )}

        <div className="confirmacao-buttons">
          <button 
            className={`confirmar-btn ${jaConfirmado ? 'confirmado' : ''}`}
            onClick={handleConfirmar}
            disabled={jaConfirmado}
          >
            {jaConfirmado ? '✓ Presença Confirmada' : 'Confirmar Presença'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente da Bíblia
const Biblia = () => {
  const [busca, setBusca] = useState('')
  const [versiculoDoDia] = useState({
    texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
    referencia: "João 3:16"
  })

  const livrosBiblia = [
    'Gênesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronômio',
    'Josué', 'Juízes', 'Rute', '1 Samuel', '2 Samuel',
    'Mateus', 'Marcos', 'Lucas', 'João', 'Atos'
  ]

  const resultadosBusca = busca ? 
    livrosBiblia.filter(livro => 
      livro.toLowerCase().includes(busca.toLowerCase())
    ) : []

  return (
    <div className="page">
      <header className="page-header">
        <h1>Bíblia Sagrada</h1>
      </header>
      
      <div className="versiculo-dia">
        <h3>Versículo do Dia</h3>
        <p className="versiculo-texto">"{versiculoDoDia.texto}"</p>
        <p className="versiculo-ref">{versiculoDoDia.referencia}</p>
      </div>

      <div className="busca-container">
        <input
          type="text"
          placeholder="Buscar livros, capítulos ou versículos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="busca-input"
        />
      </div>

      <div className="livros-container">
        {busca ? (
          <div className="resultados-busca">
            <h3>Resultados da Busca:</h3>
            {resultadosBusca.map(livro => (
              <div key={livro} className="livro-item">
                {livro}
              </div>
            ))}
          </div>
        ) : (
          <div className="livros-grid">
            <h3>Livros da Bíblia</h3>
            {livrosBiblia.map(livro => (
              <div key={livro} className="livro-item">
                {livro}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente do Perfil
const Perfil = () => {
  const { user, eventos, setCurrentPage } = useAppContext()

  const eventosConfirmados = eventos.filter(evento => 
    user.eventosConfirmados.includes(evento.id)
  )

  const handleLogout = () => {
    localStorage.removeItem('churchUser')
    window.location.reload()
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Meu Perfil</h1>
      </header>
      
      <div className="perfil-info">
        <div className="user-info">
          <h3>{user.nome}</h3>
          <p>@{user.username}</p>
          <p>{user.email}</p>
        </div>

        <div className="eventos-confirmados">
          <h3>Eventos Confirmados ({eventosConfirmados.length})</h3>
          {eventosConfirmados.length > 0 ? (
            eventosConfirmados.map(evento => (
              <div key={evento.id} className="evento-confirmado">
                <h4>{evento.nome}</h4>
                <p>{evento.horario} - {evento.local}</p>
              </div>
            ))
          ) : (
            <p>Nenhum evento confirmado ainda.</p>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Sair
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
    horario: '',
    descricao: '',
    pastor: 'Pastor João Silva'
  })

  useEffect(() => {
    if (editingEvent) {
      setNovoEvento({
        nome: editingEvent.nome || '',
        link: editingEvent.link || '',
        local: editingEvent.local || '',
        horario: editingEvent.horario || '',
        descricao: editingEvent.descricao || '',
        pastor: editingEvent.pastor || 'Pastor João Silva'
      })
    }
  }, [editingEvent])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (novoEvento.nome && novoEvento.local && novoEvento.horario) {
      if (editingEvent) {
        atualizarEvento({ ...editingEvent, ...novoEvento, aoVivo: !!novoEvento.link })
      } else {
        adicionarEvento({ ...novoEvento, aoVivo: !!novoEvento.link })
      }
      setEditingEvent(null)
      setCurrentPage('home')
      setNovoEvento({
        nome: '',
        link: '',
        local: '',
        horario: '',
        descricao: '',
        pastor: 'Pastor João Silva'
      })
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <button onClick={() => setCurrentPage('home')} className="back-btn">← Voltar</button>
        <h1>Adicionar Evento</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="evento-form">
        <input
          type="text"
          placeholder="Nome do evento"
          value={novoEvento.nome}
          onChange={(e) => setNovoEvento({...novoEvento, nome: e.target.value})}
          required
        />
        
        <input
          type="url"
          placeholder="Link (opcional - para transmissão ao vivo)"
          value={novoEvento.link}
          onChange={(e) => setNovoEvento({...novoEvento, link: e.target.value})}
        />
        
        <input
          type="text"
          placeholder="Local"
          value={novoEvento.local}
          onChange={(e) => setNovoEvento({...novoEvento, local: e.target.value})}
          required
        />
        
        <input
          type="text"
          placeholder="Horário (ex: Domingo 19h)"
          value={novoEvento.horario}
          onChange={(e) => setNovoEvento({...novoEvento, horario: e.target.value})}
          required
        />
        
        <input
          type="text"
          placeholder="Pastor responsável"
          value={novoEvento.pastor}
          onChange={(e) => setNovoEvento({...novoEvento, pastor: e.target.value})}
        />
        
        <textarea
          placeholder="Breve descrição do evento"
          value={novoEvento.descricao}
          onChange={(e) => setNovoEvento({...novoEvento, descricao: e.target.value})}
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
    { id: 'home', label: 'Início', icon: '🏠' },
    { id: 'biblia', label: 'Bíblia', icon: '📖' },
    { id: 'perfil', label: 'Perfil', icon: '👤' },
    { id: 'adicionar', label: 'Adicionar', icon: '➕' }
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

  // Verificar se há usuário logado
  useEffect(() => {
    const savedUser = localStorage.getItem('churchUser')
    const savedToken = localStorage.getItem('churchToken')
    if (savedUser) setUser(JSON.parse(savedUser))
    if (savedToken) setToken(savedToken)
  }, [])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/events`)
        const data = await res.json()
        setEventos(data)
      } catch (err) {
        console.error('Erro ao carregar eventos', err)
      }
    }
    fetchEvents()
  }, [])

  const handleLogin = async ({ email, senha }) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha })
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.msg || 'Falha no login')
        return
      }
      const data = await res.json()
      setToken(data.token)
      localStorage.setItem('churchToken', data.token)
      const newUser = { ...data.user, eventosConfirmados: [] }
      setUser(newUser)
      localStorage.setItem('churchUser', JSON.stringify(newUser))
    } catch (err) {
      alert('Erro ao fazer login')
    }
  }

  const handleRegister = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.msg || 'Falha no cadastro')
        return
      }
      alert('Cadastro realizado com sucesso! Faça login para continuar.')
      setAuthPage('login')
    } catch (err) {
      alert('Erro ao realizar cadastro')
    }
  }

  const confirmarPresenca = async (eventoId) => {
    try {
      const res = await fetch(`${API_URL}/events/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: eventoId })
      })
      if (!res.ok) {
        alert('Falha ao confirmar presença')
        return
      }
      const updatedUser = {
        ...user,
        eventosConfirmados: [...user.eventosConfirmados, eventoId]
      }
      setUser(updatedUser)
      localStorage.setItem('churchUser', JSON.stringify(updatedUser))
    } catch (err) {
      alert('Erro ao confirmar presença')
    }
  }

  const adicionarEvento = async (novoEvento) => {
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(novoEvento)
      })
      if (!res.ok) {
        alert('Falha ao adicionar evento')
        return
      }
      const { event } = await res.json()
      setEventos([...eventos, event])
    } catch (err) {
      alert('Erro ao adicionar evento')
    }
  }

  const atualizarEvento = async (eventoAtualizado) => {
    try {
      const res = await fetch(`${API_URL}/events/${eventoAtualizado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventoAtualizado)
      })
      if (!res.ok) {
        alert('Falha ao atualizar evento')
        return
      }
      const { event } = await res.json()
      setEventos(eventos.map(e => e.id === event.id ? event : e))
    } catch (err) {
      alert('Erro ao atualizar evento')
    }
  }

  const excluirEvento = async (id) => {
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        alert('Falha ao excluir evento')
        return
      }
      setEventos(eventos.filter(e => e.id !== id))
    } catch (err) {
      alert('Erro ao excluir evento')
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

  if (!user) {
    return authPage === 'login'
      ? <Login onLogin={handleLogin} onShowRegister={() => setAuthPage('register')} />
      : <Registro onRegister={handleRegister} onShowLogin={() => setAuthPage('login')} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Programacao />
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

  return (
    <AppContext.Provider value={contextValue}>
      <div className="app">
        {renderPage()}
        <BottomNav />
      </div>
    </AppContext.Provider>
  )
}

export default App
