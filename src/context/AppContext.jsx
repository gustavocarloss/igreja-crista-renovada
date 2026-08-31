/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, useEffect } from 'react'
import { authService, eventService, attendanceService, supabaseHeaders } from '../services/api'
import { extractLocalDateAndTime } from '../utils/date'

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider')
  }
  return context
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [authPage, setAuthPage] = useState('login')
  const [currentPage, setCurrentPage] = useState('home')
  const [previousPage, setPreviousPage] = useState('home')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventos, setEventos] = useState([])
  const [presencas, setPresencas] = useState([])
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: '',
    type: 'error'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  const showMessage = (message, type = 'error') => {
    setModalConfig({ isOpen: true, message, type })
  }

  const closeModal = () => {
    setModalConfig({ ...modalConfig, isOpen: false })
  }

  const fetchAttendeesList = async () => {
    try {
      const [attData, userData] = await Promise.all([
        attendanceService.fetchAllAttendances(),
        fetch('https://rhtpvuwketpdugrqgkjb.supabase.co/rest/v1/user', {
          headers: supabaseHeaders
        }).then(r => r.json())
      ])

      const mapped = attData.map(att => {
        const u = userData.find(userRow => userRow.id === att.user_id)
        return {
          id: att.id,
          meeting_id: att.meeting_id,
          user_name: u ? u.name : 'Membro',
          avatar_url: u ? u.avatar_url : null
        }
      })
      setPresencas(mapped)
    } catch (err) {
      console.error('Erro ao carregar presenças', err)
    }
  }

  // Auto-login do usuário persistido
  useEffect(() => {
    const expiresAt = localStorage.getItem('churchUserExpires')
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      // Sessão expirou
      localStorage.removeItem('churchUser')
      localStorage.removeItem('churchUserExpires')
      localStorage.removeItem('churchUserToken')
      return
    }

    const savedUser = localStorage.getItem('churchUser')
    if (savedUser) {
      // Renova a expiração caso tenha sido feito login temporário (inactivity timeout)
      if (expiresAt) {
        localStorage.setItem('churchUserExpires', (Date.now() + 30 * 60 * 1000).toString())
      }

      const parsedUser = JSON.parse(savedUser)
      setUser(parsedUser)
      
      const fetchAttendances = async () => {
        try {
          const attData = await attendanceService.fetchUserAttendances(parsedUser.id)
          const confirmedIds = attData.map(att => att.meeting_id)
          const updatedUser = { ...parsedUser, eventosConfirmados: confirmedIds }
          setUser(updatedUser)
          localStorage.setItem('churchUser', JSON.stringify(updatedUser))
        } catch (err) {
          console.error('Erro ao buscar presenças', err)
        }
      }
      fetchAttendances()
    }
    
    const savedToken = localStorage.getItem('churchUserToken')
    if (savedToken) setToken(savedToken)
  }, [])

  // Carregar eventos e presenças na inicialização
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.fetchEvents()
        const mappedEvents = data.map(row => {
          const { data: dateStr, hora: timeStr } = extractLocalDateAndTime(row.meeting_date)
          return {
            id: row.id,
            nome: row.meeting_name,
            link: row.meeting_link,
            local: row.meeting_location,
            raw_date: row.meeting_date,
            horario: row.meeting_date ? 
              new Date(row.meeting_date).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              }).replace(',', ' às') : '',
            pastor: row.meeting_priest,
            descricao: row.meeting_description,
            aoVivo: !!row.meeting_link,
            data: dateStr,
            hora: timeStr
          }
        })
        setEventos(mappedEvents)
      } catch (err) {
        console.error('Erro ao carregar eventos', err)
        setEventos([])
      }
    }
    fetchEvents()
    fetchAttendeesList()
  }, [])

  const handleLogin = async ({ email, senha }, rememberMe) => {
    try {
      const data = await authService.login(email, senha)

      const dbUser = data[0]
      let confirmedIds = []
      try {
        const attData = await attendanceService.fetchUserAttendances(dbUser.id)
        confirmedIds = attData.map(att => att.meeting_id)
      } catch (err) {
        console.error('Erro ao buscar presenças no login', err)
      }

      const newUser = {
        id: dbUser.id,
        nome: dbUser.name,
        email: dbUser.email,
        role: dbUser.role || 'user',
        avatar_url: dbUser.avatar_url || null,
        eventosConfirmados: confirmedIds
      }

      setUser(newUser)
      localStorage.setItem('churchUser', JSON.stringify(newUser))
      
      if (!rememberMe) {
        const expiresAt = Date.now() + 30 * 60 * 1000
        localStorage.setItem('churchUserExpires', expiresAt.toString())
      } else {
        localStorage.removeItem('churchUserExpires')
      }

      fetchAttendeesList()
      setToken('sb_publishable__KYRgCYXo50q1HG3xTgZHQ_DCGwv-_C') // You might want to update this to the real auth token eventually
    } catch (err) {
      if (
        (err.message && err.message.includes('Invalid login')) || 
        (err.message && err.message.includes('reading \'id\'')) ||
        (err.message && err.message.includes('JSON object requested'))
      ) {
        showMessage('E-mail ou senha inválidos.')
      } else {
        showMessage('E-mail ou senha inválidos.') // Fallback for any other unexpected auth errors to be safe and elegant
      }
    }
  }

  const handleRegister = async ({ name, email, password }) => {
    try {
      await authService.register(name, email, password)
      showMessage('Cadastro realizado com sucesso! Faça login para continuar.', 'success')
      setAuthPage('login')
    } catch (err) {
      showMessage(err.message || 'Erro ao realizar cadastro. Tente novamente.')
    }
  }

  const confirmarPresenca = async (eventoId) => {
    try {
      const res = await attendanceService.confirmPresence(user.id, eventoId)
      if (!res.ok) {
        showMessage('Falha ao confirmar presença no banco de dados.')
        return
      }
      const updatedUser = {
        ...user,
        eventosConfirmados: [...user.eventosConfirmados, eventoId]
      }
      setUser(updatedUser)
      localStorage.setItem('churchUser', JSON.stringify(updatedUser))
      fetchAttendeesList()
      showMessage('Presença confirmada com sucesso!', 'success')
    } catch {
      showMessage('Erro de conexão ao confirmar presença.')
    }
  }

  const cancelarPresenca = async (eventoId) => {
    try {
      const res = await attendanceService.cancelPresence(user.id, eventoId)
      if (!res.ok) {
        showMessage('Falha ao cancelar presença no banco de dados.')
        return
      }
      const updatedUser = {
        ...user,
        eventosConfirmados: user.eventosConfirmados.filter(id => id !== eventoId)
      }
      setUser(updatedUser)
      localStorage.setItem('churchUser', JSON.stringify(updatedUser))
      fetchAttendeesList()
      showMessage('Presença cancelada com sucesso!', 'success')
    } catch {
      showMessage('Erro de conexão ao cancelar presença.')
    }
  }

  const atualizarAvatar = async (base64Image) => {
    try {
      await authService.updateUser(user.id, { avatar_url: base64Image })
      const updatedUser = { ...user, avatar_url: base64Image }
      setUser(updatedUser)
      localStorage.setItem('churchUser', JSON.stringify(updatedUser))
      showMessage('Foto de perfil atualizada com sucesso!', 'success')
    } catch {
      showMessage('Erro ao atualizar foto de perfil no servidor.')
    }
  }

  const adicionarEvento = async (novoEvento) => {
    try {
      const localDateTime = new Date(`${novoEvento.data}T${novoEvento.hora}:00`)
      const rowToSave = {
        meeting_name: novoEvento.nome,
        meeting_link: novoEvento.link,
        meeting_location: novoEvento.local,
        meeting_date: localDateTime.toISOString(),
        meeting_priest: novoEvento.pastor,
        meeting_description: novoEvento.descricao
      }

      const data = await eventService.addEvent(rowToSave)
      const savedRow = data[0]
      const { data: dateStr, hora: timeStr } = extractLocalDateAndTime(savedRow.meeting_date)
      const mappedNewEvent = {
        id: savedRow.id,
        nome: savedRow.meeting_name,
        link: savedRow.meeting_link,
        local: savedRow.meeting_location,
        raw_date: savedRow.meeting_date,
        horario: savedRow.meeting_date ? 
          new Date(savedRow.meeting_date).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }).replace(',', ' às') : '',
        pastor: savedRow.meeting_priest,
        descricao: savedRow.meeting_description,
        aoVivo: !!savedRow.meeting_link,
        data: dateStr,
        hora: timeStr
      }

      setEventos([...eventos, mappedNewEvent])
      showMessage('Evento adicionado com sucesso!', 'success')
    } catch {
      showMessage('Erro ao adicionar evento.')
    }
  }

  const atualizarEvento = async (eventoAtualizado) => {
    try {
      const localDateTime = new Date(`${eventoAtualizado.data}T${eventoAtualizado.hora}:00`)
      const rowToUpdate = {
        meeting_name: eventoAtualizado.nome,
        meeting_link: eventoAtualizado.link,
        meeting_location: eventoAtualizado.local,
        meeting_date: localDateTime.toISOString(),
        meeting_priest: eventoAtualizado.pastor,
        meeting_description: eventoAtualizado.descricao
      }

      const data = await eventService.updateEvent(eventoAtualizado.id, rowToUpdate)
      const updatedRow = data[0]
      const { data: dateStr, hora: timeStr } = extractLocalDateAndTime(updatedRow.meeting_date)
      const mappedUpdatedEvent = {
        id: updatedRow.id,
        nome: updatedRow.meeting_name,
        link: updatedRow.meeting_link,
        local: updatedRow.meeting_location,
        raw_date: updatedRow.meeting_date,
        horario: updatedRow.meeting_date ? 
          new Date(updatedRow.meeting_date).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }).replace(',', ' às') : '',
        pastor: updatedRow.meeting_priest,
        descricao: updatedRow.meeting_description,
        aoVivo: !!updatedRow.meeting_link,
        data: dateStr,
        hora: timeStr
      }

      setEventos(eventos.map(e => e.id === mappedUpdatedEvent.id ? mappedUpdatedEvent : e))
      showMessage('Evento atualizado com sucesso!', 'success')
    } catch {
      showMessage('Erro ao atualizar evento.')
    }
  }

  const excluirEvento = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return
    try {
      await eventService.deleteEvent(id)
      setEventos(eventos.filter(e => e.id !== id))
      showMessage('Evento excluído com sucesso!', 'success')
    } catch {
      showMessage('Erro ao excluir evento.')
    }
  }

  const contextValue = {
    user,
    setUser,
    token,
    authPage,
    setAuthPage,
    currentPage,
    setCurrentPage,
    previousPage,
    setPreviousPage,
    selectedEvent,
    setSelectedEvent,
    editingEvent,
    setEditingEvent,
    eventos,
    confirmarPresenca,
    cancelarPresenca,
    presencas,
    adicionarEvento,
    atualizarEvento,
    excluirEvento,
    atualizarAvatar,
    handleLogin,
    handleRegister,
    modalConfig,
    closeModal,
    showMessage
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}
