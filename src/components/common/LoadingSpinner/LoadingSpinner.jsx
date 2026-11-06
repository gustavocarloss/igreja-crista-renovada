import './LoadingSpinner.css'

export default function LoadingSpinner({ message = "Carregando...", fullScreen = false }) {
  const content = (
    <div className="loading-spinner-container">
      <div className="spinner-ring"></div>
      <p className="spinner-text">{message}</p>
    </div>
  )

  return fullScreen ? <div className="loading-overlay">{content}</div> : content
}
