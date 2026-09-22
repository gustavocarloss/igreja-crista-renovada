import { useAppContext } from './context/AppContext'
import Login from './components/Login/Login'
import MessageModal from './components/common/MessageModal/MessageModal'
import Registro from './components/Registro/Registro'
import Programacao from './components/Programacao/Programacao'
import EventoDetalhes from './components/EventoDetalhes/EventoDetalhes'
import CalendarioView from './components/CalendarioView/CalendarioView'
import Biblia from './components/Biblia/Biblia'
import Perfil from './components/Perfil/Perfil'
import AdicionarEvento from './components/AdicionarEvento/AdicionarEvento'
import BottomNav from './components/BottomNav/BottomNav'
import { useState, useEffect } from 'react'
import Splash from './components/Splash/Splash'
import { Routes, Route } from 'react-router-dom'
import './App.css'

/**
 * Componente raiz do aplicativo. Lida apenas com o roteamento principal de telas e modal de avisos.
 */
function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000)
    return () => clearTimeout(timer)
  }, [])
  const {
    user,
    authPage,
    setAuthPage,
    handleLogin,
    handleRegister,
    modalConfig,
    closeModal
  } = useAppContext()

  const content = !user ? (
    authPage === 'login'
      ? <Login onLogin={handleLogin} onShowRegister={() => setAuthPage('register')} />
      : <Registro onRegister={handleRegister} onShowLogin={() => setAuthPage('login')} />
  ) : (
    <>
      <Routes>
        <Route path="/" element={<Programacao />} />
        <Route path="/calendario" element={<CalendarioView />} />
        <Route path="/detalhes" element={<EventoDetalhes />} />
        <Route path="/biblia" element={<Biblia />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/adicionar" element={<AdicionarEvento />} />
        <Route path="*" element={<Programacao />} />
      </Routes>
      <BottomNav />
    </>
  )

  return (
    <div className="app">
      {showSplash ? <Splash /> : content}
      <MessageModal
        isOpen={modalConfig.isOpen}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={closeModal}
      />
    </div>
  )
}

export default App
