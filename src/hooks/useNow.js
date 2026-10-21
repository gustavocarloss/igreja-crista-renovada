import { useEffect, useState } from 'react'

/**
 * Data/hora atual que se atualiza sozinha (padrão: a cada 30s).
 * Usado para que eventos que acabaram de passar saiam da tela sem precisar recarregar.
 */
export default function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    const onVisible = () => document.visibilityState === 'visible' && setNow(new Date())
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])
  return now
}
