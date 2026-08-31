import { useState, useEffect } from 'react'
import PasswordField from '../common/PasswordField/PasswordField'
import { getRandomVerse } from '../../utils/verses'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import './Registro.css'

/**
 * Componente de Cadastro de novos usuários.
 *
 * @param {Object} props
 * @param {Function} props.onRegister - Função disparada ao submeter o formulário de cadastro com nome, email e senha.
 * @param {Function} props.onShowLogin - Função para redirecionar o usuário para a tela de login.
 */
export default function Registro({ onRegister, onShowLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verse, setVerse] = useState('')

  useEffect(() => {
    setVerse(getRandomVerse())
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.name && formData.email && formData.senha) {
      setIsSubmitting(true)
      try {
        await onRegister({
          name: formData.name,
          email: formData.email,
          password: formData.senha
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="login-container">
      {isSubmitting && <LoadingSpinner fullScreen={true} message="Criando sua conta..." />}
      <div className="login-card">
        <div className="login-header">
          <img src="/icr-logo.png" alt="ICR Logo" className="login-logo" />
          <h1>Nova Conta</h1>
          <p className="verse">{verse}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulário de Registro">
          <div className="input-field">
            <label htmlFor="reg-name" className="sr-only">Nome completo</label>
            <input
              id="reg-name"
              type="text"
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="input-field">
            <label htmlFor="reg-email" className="sr-only">E-mail</label>
            <input
              id="reg-email"
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
          <PasswordField
            id="register-senha"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Já tem uma conta?</span>
          <button className="secondary-btn" onClick={onShowLogin} disabled={isSubmitting}>Fazer Login</button>
        </div>
      </div>
    </div>
  )
}
