import './ErrorState.css'

/**
 * Estado de erro amigável (banco fora do ar, sem internet, falha inesperada...).
 *
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} props.message
 * @param {Function} [props.onRetry] - Quando informado, exibe o botão "Tentar novamente".
 * @param {string} [props.retryLabel]
 * @param {boolean} [props.fullScreen=false]
 */
export default function ErrorState({
  title = 'Não foi possível carregar',
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
  fullScreen = false
}) {
  return (
    <div className={`error-state ${fullScreen ? 'full-screen' : ''}`} role="alert">
      <svg
        className="error-state-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1 1l22 22" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="error-state-retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}
