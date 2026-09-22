import { useState, useEffect } from 'react'
import PasswordField from '../common/PasswordField/PasswordField'
import { getRandomVerse } from '../../utils/verses'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import './Login.css'

/**
 * Componente de Login para autenticação dos usuários.
 *
 * @param {Object} props
 * @param {Function} props.onLogin - Função disparada ao submeter o formulário de login com email e senha.
 * @param {Function} props.onShowRegister - Função para redirecionar o usuário para a tela de registro de nova conta.
 */
export default function Login({ onLogin, onShowRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [verse, setVerse] = useState('')

  useEffect(() => {
    setVerse(getRandomVerse())
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.email && formData.senha) {
      setIsSubmitting(true)
      try {
        await onLogin(formData, rememberMe)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="login-container">
      {isSubmitting && <LoadingSpinner fullScreen={true} message="Autenticando..." />}
      <div className="login-card">
        <div className="login-header">
          <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="login-logo" />
          <h1>Igreja Cristã Renovada</h1>
          <p className="verse">{verse}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulário de Login">
          <div className="input-field">
            <label htmlFor="login-email" className="sr-only">E-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
          <PasswordField
            id="login-senha"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <div className="remember-me-container">
            <input 
              type="checkbox" 
              id="remember-me" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
              disabled={isSubmitting}
            />
            <label htmlFor="remember-me">Lembrar de mim</label>
          </div>
          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Ainda não faz parte?</span>
          <button className="secondary-btn" onClick={onShowRegister} disabled={isSubmitting}>Criar conta</button>
        </div>
      </div>
    </div>
  )
}
