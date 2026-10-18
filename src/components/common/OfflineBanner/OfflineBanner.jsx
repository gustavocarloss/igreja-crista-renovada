import { useOnlineStatus } from '../../../hooks/useOnlineStatus'
import '../ErrorState/ErrorState.css'

/** Faixa fixa no topo avisando que o aparelho está sem internet. */
export default function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="offline-banner" role="status">
      Você está sem internet. Algumas informações podem estar desatualizadas.
    </div>
  )
}
