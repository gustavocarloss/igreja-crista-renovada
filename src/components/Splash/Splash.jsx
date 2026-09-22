import './Splash.css'

export default function Splash() {
  return (
    <div className="splash-container">
      <div className="splash-content">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="Igreja Cristã Renovada" className="splash-logo" />
        <h1 className="splash-title">Igreja Cristã Renovada</h1>
      </div>
    </div>
  )
}
