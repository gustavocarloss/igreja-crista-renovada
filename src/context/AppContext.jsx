/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, authService, eventService, attendanceService } from '../services/api'
import { mapEventRow, eventToRow } from '../utils/events'
import { friendlyError, isConnectivityProblem } from '../utils/errors'

const AppContext = createContext()

/** Se o app ficar em segundo plano por mais que isso, atualizamos os eventos ao voltar. */
const STALE_AFTER_MS = 2 * 60 * 1000

/** "Lembrar de mim": '0' em localStorage = encerrar a sessão quando o navegador/app for fechado. */
const REMEMBER_KEY = 'icr-remember-me'
const SESSION_ALIVE_KEY = 'icr-session-alive'

const shouldDropSession = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) === '0' && !sessionStorage.getItem(SESSION_ALIVE_KEY)
  } catch {
    return false
  }
}

const saveRememberChoice = (remember) => {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
    sessionStorage.setItem(SESSION_ALIVE_KEY, '1')
  } catch {
    // armazenamento indisponível (modo privado): segue com o padrão do Supabase
  }
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider')
  }
  return context
}

export function AppProvider({ children }) {
  const navigate = useNavigate()

  // --- Autenticação ---
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authPage, setAuthPage] = useState('login')

  // --- Dados ---
  const [eventos, setEventos] = useState([])
  const [eventosLoaded, setEventosLoaded] = useState(false)
  const [eventosLoading, setEventosLoading] = useState(false)
  const [eventosError, setEventosError] = useState(null)

  // --- Modal global de mensagens ---
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    message: '',
    type: 'error',
    onConfirm: null,
    onCancel: null
  })

  const loadedAuthIdRef = useRef(null) // id do usuário do Auth cujo perfil já está carregado
  const profilePromisesRef = useRef(new Map()) // evita buscar o mesmo perfil 2x em paralelo
  const registeringRef = useRef(false) // durante o cadastro, quem carrega o perfil é o handleRegister
  const lastEventsLoadRef = useRef(0)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  // ---------- Modal ----------
  const showMessage = useCallback((message, type = 'error') => {
    setModalConfig({ isOpen: true, message, type, onConfirm: null, onCancel: null })
  }, [])

  const closeModal = () => {
    if (modalConfig.onCancel) modalConfig.onCancel()
    setModalConfig((prev) => ({ ...prev, isOpen: false }))
  }

  const confirmAsync = (message, { confirmLabel, cancelLabel } = {}) => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        message,
        type: 'confirm',
        confirmLabel,
        cancelLabel,
        onConfirm: () => {
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        }
      })
    })
  }

  // ---------- Perfil / sessão ----------
  const loadProfile = useCallback(async (authUser) => {
    const profile = await authService.getProfile(authUser)

    let confirmedIds = []
    try {
      const attendances = await attendanceService.fetchUserAttendances(profile.id)
      confirmedIds = attendances.map((att) => att.meeting_id)
    } catch (err) {
      // Não bloqueia o login: apenas não mostra os "confirmados" até a próxima atualização.
      console.error('Erro ao buscar presenças do usuário', err)
    }

    const nextUser = {
      id: profile.id,
      nome: profile.name,
      // O e-mail do Auth é a fonte da verdade (é o que vale para entrar no app).
      email: authUser.email || profile.email,
      role: profile.role || 'user',
      avatar_url: profile.avatar_url || null,
      eventosConfirmados: confirmedIds
    }
    loadedAuthIdRef.current = authUser.id
    setUser(nextUser)
    setAuthError(null)
    return nextUser
  }, [])

  const ensureProfile = useCallback(
    (authUser) => {
      const pending = profilePromisesRef.current
      if (!pending.has(authUser.id)) {
        const promise = loadProfile(authUser).finally(() => pending.delete(authUser.id))
        pending.set(authUser.id, promise)
      }
      return pending.get(authUser.id)
    },
    [loadProfile]
  )

  useEffect(() => {
    let active = true

    const handleSession = (session) => {
      if (!active) return
      if (!session) {
        loadedAuthIdRef.current = null
        setUser(null)
        setAuthReady(true)
        return
      }
      if (registeringRef.current) return
      if (loadedAuthIdRef.current === session.user.id) {
        setAuthReady(true)
        return
      }
      ensureProfile(session.user)
        .catch((err) => {
          console.error('Erro ao carregar perfil', err)
          if (!active) return
          if (isConnectivityProblem(err)) {
            // Banco fora do ar / sem internet: NÃO mandamos o usuário para o login, mostramos "tentar de novo".
            setAuthError(friendlyError(err))
          } else {
            showMessage(friendlyError(err, 'Não foi possível carregar o seu perfil. Entre novamente.'))
            authService.signOut().catch(() => {})
          }
        })
        .finally(() => active && setAuthReady(true))
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'PASSWORD_RECOVERY') return
      if (event === 'INITIAL_SESSION') return // tratado pelo restore() abaixo
      // Não fazemos chamadas ao Supabase dentro do callback (evita deadlock); adiamos um tick.
      setTimeout(() => handleSession(session), 0)
    })

    const restore = async () => {
      if (shouldDropSession()) {
        // Usuário não marcou "Lembrar de mim" e o navegador foi fechado: começa deslogado.
        await authService.signOut().catch(() => {})
        return { data: { session: null } }
      }
      return supabase.auth.getSession()
    }

    restore()
      .then(({ data: { session } }) => handleSession(session))
      .catch((err) => {
        console.error('Erro ao recuperar sessão', err)
        if (!active) return
        if (isConnectivityProblem(err)) setAuthError(friendlyError(err))
        setAuthReady(true)
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [ensureProfile, showMessage])

  // ---------- Eventos ----------
  const loadEvents = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setEventosLoading(true)
    try {
      const rows = await eventService.fetchEvents()
      setEventos(rows.map(mapEventRow))
      setEventosLoaded(true)
      setEventosError(null)
      lastEventsLoadRef.current = Date.now()
    } catch (err) {
      console.error('Erro ao carregar eventos', err)
      // Em atualização silenciosa mantemos a lista antiga; só avisamos quando não há nada para mostrar.
      if (!silent) setEventosError(friendlyError(err, 'Não foi possível carregar os eventos.'))
    } finally {
      setEventosLoading(false)
    }
  }, [])

  const userId = user?.id
  useEffect(() => {
    if (userId) {
      loadEvents()
    } else {
      setEventos([])
      setEventosLoaded(false)
      setEventosError(null)
    }
  }, [userId, loadEvents])

  // Atualiza sozinho ao voltar para o app (ou quando a internet volta), sem precisar "puxar para atualizar".
  useEffect(() => {
    if (!userId) return undefined
    const refreshIfStale = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastEventsLoadRef.current > STALE_AFTER_MS) loadEvents({ silent: true })
    }
    document.addEventListener('visibilitychange', refreshIfStale)
    window.addEventListener('online', refreshIfStale)
    return () => {
      document.removeEventListener('visibilitychange', refreshIfStale)
      window.removeEventListener('online', refreshIfStale)
    }
  }, [userId, loadEvents])

  // ---------- Ações de autenticação ----------
  const handleLogin = async ({ email, senha }, rememberMe = true) => {
    try {
      const { authUser } = await authService.login(email.trim(), senha)
      saveRememberChoice(rememberMe)
      await ensureProfile(authUser)
      navigate('/')
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível entrar. Tente novamente.'))
    }
  }

  const handleRegister = async ({ name, email, password }) => {
    registeringRef.current = true
    try {
      const { session, profile } = await authService.register(name.trim(), email.trim(), password)
      if (session && profile) {
        await loadProfile(session.user)
        navigate('/')
        showMessage('Conta criada com sucesso! Seja bem-vindo(a).', 'success')
      } else {
        showMessage(
          'Cadastro realizado! Enviamos um link de confirmação para o seu e-mail. Confirme para poder entrar.',
          'success'
        )
        setAuthPage('login')
      }
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível concluir o cadastro. Tente novamente.'))
    } finally {
      registeringRef.current = false
    }
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
    } catch (err) {
      console.error('Erro ao encerrar sessão', err)
    }
    loadedAuthIdRef.current = null
    setUser(null)
    setAuthPage('login')
    navigate('/')
  }

  // ---------- Presença ----------
  const confirmarPresenca = async (eventoId) => {
    try {
      await attendanceService.confirmPresence(user.id, eventoId)
      setUser((prev) =>
        prev && !prev.eventosConfirmados.some((id) => String(id) === String(eventoId))
          ? { ...prev, eventosConfirmados: [...prev.eventosConfirmados, eventoId] }
          : prev
      )
      showMessage('Presença confirmada com sucesso!', 'success')
      return true
    } catch (err) {
      console.error(err)
      showMessage(friendlyError(err, 'Não foi possível confirmar sua presença. Tente novamente.'))
      return false
    }
  }

  const cancelarPresenca = async (eventoId) => {
    try {
      await attendanceService.cancelPresence(user.id, eventoId)
      setUser((prev) =>
        prev
          ? {
              ...prev,
              eventosConfirmados: prev.eventosConfirmados.filter((id) => String(id) !== String(eventoId))
            }
          : prev
      )
      showMessage('Presença cancelada com sucesso!', 'success')
      return true
    } catch (err) {
      console.error(err)
      showMessage(friendlyError(err, 'Não foi possível cancelar sua presença. Tente novamente.'))
      return false
    }
  }

  // ---------- Perfil ----------
  const atualizarAvatar = async (dataUrl) => {
    try {
      await authService.updateUser(user.id, { avatar_url: dataUrl })
      setUser((prev) => (prev ? { ...prev, avatar_url: dataUrl } : prev))
      showMessage('Foto de perfil atualizada com sucesso!', 'success')
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível atualizar a foto de perfil.'))
    }
  }

  // ---------- Eventos (admin) ----------
  const adicionarEvento = async (novoEvento) => {
    try {
      const data = await eventService.addEvent(eventToRow(novoEvento))
      if (!data?.[0]) throw new Error('permission denied')
      setEventos((prev) => [...prev, mapEventRow(data[0])])
      showMessage('Evento adicionado com sucesso!', 'success')
      return true
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível adicionar o evento.'))
      return false
    }
  }

  const atualizarEvento = async (eventoAtualizado) => {
    try {
      const data = await eventService.updateEvent(eventoAtualizado.id, eventToRow(eventoAtualizado))
      if (!data?.[0]) throw new Error('permission denied')
      const mapped = mapEventRow(data[0])
      setEventos((prev) => prev.map((e) => (e.id === mapped.id ? mapped : e)))
      showMessage('Evento atualizado com sucesso!', 'success')
      return true
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível atualizar o evento.'))
      return false
    }
  }

  const excluirEvento = async (id) => {
    const confirmed = await confirmAsync('Tem certeza que deseja excluir este evento?')
    if (!confirmed) return false
    try {
      await eventService.deleteEvent(id)
      setEventos((prev) => prev.filter((e) => e.id !== id))
      showMessage('Evento excluído com sucesso!', 'success')
      return true
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível excluir o evento.'))
      return false
    }
  }

  const contextValue = {
    user,
    setUser,
    authReady,
    authError,
    authPage,
    setAuthPage,
    eventos,
    eventosLoaded,
    eventosLoading,
    eventosError,
    reloadEvents: loadEvents,
    confirmarPresenca,
    cancelarPresenca,
    adicionarEvento,
    atualizarEvento,
    excluirEvento,
    atualizarAvatar,
    handleLogin,
    handleRegister,
    handleLogout,
    modalConfig,
    closeModal,
    showMessage,
    confirmAsync
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}
