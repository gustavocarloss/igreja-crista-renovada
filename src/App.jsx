import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useAppContext } from './context/AppContext'
import Login from './components/Login/Login'
import Registro from './components/Registro/Registro'
import Programacao from './components/Programacao/Programacao'
import BottomNav from './components/BottomNav/BottomNav'
import Splash from './components/Splash/Splash'
import MessageModal from './components/common/MessageModal/MessageModal'
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner'
import ErrorState from './components/common/ErrorState/ErrorState'
import InstallBanner from './components/common/InstallBanner/InstallBanner'
import OfflineBanner from './components/common/OfflineBanner/OfflineBanner'
import RedefinirSenha from './components/RedefinirSenha/RedefinirSenha'
import useBackHandler, { exitApp, goBack, trackNavigation } from './hooks/useBackHandler'
import './App.css'

// Telas secundárias carregam sob demanda: o primeiro acesso (celular, 4G) baixa menos código.
const CalendarioView = lazy(() => import('./components/CalendarioView/CalendarioView'))
const EventoDetalhes = lazy(() => import('./components/EventoDetalhes/EventoDetalhes'))
const Biblia = lazy(() => import('./components/Biblia/Biblia'))
const Perfil = lazy(() => import('./components/Perfil/Perfil'))
const AdicionarEvento = lazy(() => import('./components/AdicionarEvento/AdicionarEvento'))

const MIN_SPLASH_MS = 900

/** Telas da barra de navegação: nelas o "voltar" do celular pergunta se quer sair do app. */
const MAIN_PATHS = ['/', '/calendario', '/biblia', '/perfil', '/adicionar']

/** Rota exclusiva de administradores (a proteção real dos dados é feita pelo RLS no Supabase). */
function AdminRoute({ children }) {
  const { user } = useAppContext()
  return user?.role === 'admin' ? children : <Navigate to="/" replace />
}

/**
 * Componente raiz do aplicativo. Lida com o roteamento principal de telas e modal de avisos.
 */
function App() {
  const [minSplashDone, setMinSplashDone] = useState(false)
  const location = useLocation()
  const {
    user,
    authReady,
    authError,
    authPage,
    setAuthPage,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    passwordRecovery,
    salvarNovaSenha,
    modalConfig,
    closeModal,
    confirmAsync
  } = useAppContext()

  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const previousPathRef = useRef(location.pathname)

  useEffect(() => {
    // Só navegações "para frente" empilham; o goBack() usa replace e não deve empilhar de novo.
    if (navigationType === 'PUSH') {
      trackNavigation(location.pathname, previousPathRef.current, MAIN_PATHS.includes(location.pathname))
    }
    previousPathRef.current = location.pathname
  }, [location.pathname, navigationType])

  // Handler "raiz": tela filha volta para a anterior; tela principal (e login) pergunta se quer sair.
  useBackHandler(true, async () => {
    if (!user) {
      if (authPage === 'register') return setAuthPage('login')
    } else if (!MAIN_PATHS.includes(location.pathname)) {
      return goBack(navigate)
    }
    if (await confirmAsync('Deseja sair do aplicativo?', { confirmLabel: 'Sim', cancelLabel: 'Não' })) exitApp()
  })

  // Com um aviso aberto, o voltar só fecha o aviso (equivale a "Não"/"Entendido").
  useBackHandler(modalConfig.isOpen, closeModal)

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashDone(true), MIN_SPLASH_MS)
    return () => clearTimeout(timer)
  }, [])

  // Cada navegação começa no topo da tela (comportamento esperado em app mobile).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  let content
  if (!user && authError) {
    content = (
      <ErrorState
        fullScreen
        title="Sem conexão com o servidor"
        message={authError}
        onRetry={() => window.location.reload()}
      />
    )
  } else if (user && passwordRecovery) {
    content = <RedefinirSenha onSubmit={salvarNovaSenha} />
  } else if (!user) {
    content = (
      <>
        {authPage === 'login' ? (
          <Login
            onLogin={handleLogin}
            onShowRegister={() => setAuthPage('register')}
            onForgotPassword={handleForgotPassword}
          />
        ) : (
          <Registro onRegister={handleRegister} onShowLogin={() => setAuthPage('login')} />
        )}
        <InstallBanner />
      </>
    )
  } else {
    content = (
      <>
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
          <Routes>
            <Route path="/" element={<Programacao />} />
            <Route path="/calendario" element={<CalendarioView />} />
            <Route path="/detalhes/:id" element={<EventoDetalhes />} />
            <Route path="/biblia" element={<Biblia />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/adicionar" element={<AdminRoute><AdicionarEvento /></AdminRoute>} />
            <Route path="/editar/:id" element={<AdminRoute><AdicionarEvento /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <BottomNav />
        {location.pathname === '/' && <InstallBanner withNav />}
      </>
    )
  }

  return (
    <div className="app">
      <OfflineBanner />
      {minSplashDone && authReady ? content : <Splash />}
      <MessageModal
        isOpen={modalConfig.isOpen}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        confirmLabel={modalConfig.confirmLabel}
        cancelLabel={modalConfig.cancelLabel}
      />
    </div>
  )
}

export default App
