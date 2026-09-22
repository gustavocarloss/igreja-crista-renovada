import { useAppContext } from '../../context/AppContext'
import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

/**
 * Componente da barra de navegação inferior do aplicativo.
 */
export default function BottomNav() {
  const { setEditingEvent, user } = useAppContext()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavClick = (item) => {
    if (item.id === 'adicionar') {
      setEditingEvent(null)
    }
    navigate(item.path)
  }

  const navItems = [
    {
      id: 'home',
      label: 'Início',
      path: '/',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    },
    {
      id: 'calendario',
      label: 'Agenda',
      path: '/calendario',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    {
      id: 'biblia',
      label: 'Bíblia',
      path: '/biblia',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><line x1="12" y1="7" x2="12" y2="15" /><line x1="9" y1="10" x2="15" y2="10" /></svg>
    },
    {
      id: 'adicionar',
      label: 'Adicionar',
      path: '/adicionar',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
      adminOnly: true
    },
    {
      id: 'perfil',
      label: 'Perfil',
      path: '/perfil',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    }
  ]

  const visibleNavItems = navItems.filter(item => !item.adminOnly || user?.role === 'admin')

  return (
    <nav className="bottom-nav" aria-label="Navegação Principal">
      {visibleNavItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => handleNavClick(item)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
