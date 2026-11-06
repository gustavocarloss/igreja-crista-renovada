import { useState } from 'react'
import PasswordField from '../common/PasswordField/PasswordField'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import { isStrongPassword, MIN_PASSWORD_LENGTH, PASSWORD_RULE_MESSAGE } from '../../utils/validation'
import '../Registro/Registro.css'

/** Tela aberta pelo link de "esqueci minha senha": o usuário já está logado e só define a senha nova. */
export default function RedefinirSenha({ onSubmit }) {
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isStrongPassword(senha)) return setFormError(PASSWORD_RULE_MESSAGE)
    if (senha !== confirmarSenha) return setFormError('As senhas não são iguais. Digite a mesma senha nos dois campos.')
    setFormError('')
    setIsSubmitting(true)
    try {
      await onSubmit(senha)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      {isSubmitting && <LoadingSpinner fullScreen message="Salvando nova senha..." />}
      <div className="login-card">
        <div className="login-header">
          <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="login-logo" />
          <h1>Nova senha</h1>
        </div>
        <form onSubmit={handleSubmit} className="auth-form" aria-label="Formulário de nova senha" noValidate>
          <PasswordField
            id="nova-senha"
            label="Nova senha"
            autoComplete="new-password"
            placeholder={`Nova senha (mín. ${MIN_PASSWORD_LENGTH} caracteres)`}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <PasswordField
            id="nova-senha-confirmar"
            label="Confirmar nova senha"
            autoComplete="new-password"
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            disabled={isSubmitting}
          />
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button type="submit" className="login-btn" disabled={isSubmitting}>
            Salvar nova senha
          </button>
        </form>
      </div>
    </div>
  )
}
