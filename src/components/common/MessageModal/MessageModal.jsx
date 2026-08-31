import './MessageModal.css'

/**
 * Componente de modal compartilhado para exibir mensagens de erro ou sucesso.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Indica se o modal está visível.
 * @param {string} props.message - Texto descritivo exibido no corpo do modal.
 * @param {'error'|'success'} [props.type='error'] - Tipo do modal que define o ícone e título (Ops! ou Sucesso!).
 * @param {Function} props.onClose - Função disparada ao fechar o modal.
 */
export default function MessageModal({ isOpen, message, type = 'error', onClose }) {
  if (!isOpen) return null

  const isError = type === 'error'

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <div className="modal-icon-container">
          {isError ? (
            <svg className="modal-svg error" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ) : (
            <svg className="modal-svg success" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          )}
        </div>
        <h2 id="modal-title">{isError ? 'Ops!' : 'Sucesso!'}</h2>
        <p>{message}</p>
        <button className="modal-close-btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  )
}
