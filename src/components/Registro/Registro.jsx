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
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD_LENGTH = 8

export default function Registro({ onRegister, onShowLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    senha: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verse, setVerse] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    setVerse(getRandomVerse())
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const name = formData.name.trim()
    const email = formData.email.trim()
    const senha = formData.senha

    if (name.length < 2) {
      setFormError('Informe seu nome completo.')
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      setFormError('Informe um e-mail válido, como nome@exemplo.com.')
      return
    }
    if (senha.length < MIN_PASSWORD_LENGTH || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
      setFormError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres, com letras e números.`)
      return
    }

    setFormError('')
    setIsSubmitting(true)
    try {
      await onRegister({ name, email, password: senha })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      {isSubmitting && <LoadingSpinner fullScreen={true} message="Criando sua conta..." />}
      <div className="login-card">
        <div className="login-header">
          <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="login-logo" />
          <h1>Nova Conta</h1>
          <p className="verse">{verse}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulário de Registro" noValidate>
          <div className="input-field">
            <label htmlFor="reg-name" className="sr-only">Nome completo</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={80}
              disabled={isSubmitting}
            />
          </div>
          <div className="input-field">
            <label htmlFor="reg-email" className="sr-only">E-mail</label>
            <input
              id="reg-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
          <PasswordField
            id="register-senha"
            autoComplete="new-password"
            placeholder="Senha (mín. 6 caracteres)"
            value={formData.senha}
            onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
            required
            disabled={isSubmitting}
          />
          {formError && <p className="form-error" role="alert">{formError}</p>}
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
