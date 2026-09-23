import './Splash.css'

export default function Splash() {
  return (
    <div className="splash-container">
      <div className="splash-content">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="Igreja Cristã Renovada" className="splash-logo" />
      </div>
    </div>
  )
}
