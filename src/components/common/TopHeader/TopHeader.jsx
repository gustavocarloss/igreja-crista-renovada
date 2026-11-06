export default function TopHeader() {
  return (
    <div className="top-header-bar">
      <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
      <span className="header-title">Igreja Cristã Renovada</span>
    </div>
  )
}
