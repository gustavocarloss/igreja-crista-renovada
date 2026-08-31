import { useState } from 'react'
import './PasswordField.css'

/**
 * Componente compartilhado de campo de entrada de senha com botão integrado para exibir/ocultar senha.
 *
 * @param {Object} props
 * @param {string} props.value - Valor atual do campo (controlled input).
 * @param {Function} props.onChange - Função de callback disparada no evento onChange do input.
 * @param {string} [props.placeholder='Senha'] - Texto de placeholder do input.
 * @param {string} [props.id='password'] - Identificador do elemento de input para associar com o label.
 * @param {boolean} [props.required=false] - Indica se o campo é obrigatório.
 * @param {boolean} [props.disabled=false] - Indica se o campo está desabilitado.
 * @param {string} [props.label='Senha'] - Texto acessível do label (invisível na tela).
 */
export default function PasswordField({
  value,
  onChange,
  placeholder = 'Senha',
  id = 'password',
  required = false,
  disabled = false,
  label = 'Senha'
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="input-field password-wrapper">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        disabled={disabled}
      >
        {showPassword ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
        )}
      </button>
    </div>
  )
}
