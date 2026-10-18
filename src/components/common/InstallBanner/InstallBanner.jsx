import { useState, useSyncExternalStore } from 'react'
import { installStore, isIOS, isStandalone } from '../../../pwa/installPrompt'
import './InstallBanner.css'

const STORAGE_KEY = 'icr:install-dismissed'
const HIDE_FOR_MS = 14 * 24 * 60 * 60 * 1000

const wasRecentlyDismissed = () => {
  try {
    const at = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(at) && at > 0 && Date.now() - at < HIDE_FOR_MS
  } catch {
    return false
  }
}

const ShareIcon = () => (
  <svg
    className="install-share-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Compartilhar"
    role="img"
  >
    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
)

/**
 * Convite discreto para instalar o app.
 *  - Android/Chrome: botão "Instalar" que usa o evento `beforeinstallprompt`.
 *  - iPhone/iPad: instrução "Compartilhar → Adicionar à Tela de Início" (o iOS não permite instalar por código).
 * Some sozinho se o app já está instalado e pode ser dispensado (volta só depois de 14 dias).
 *
 * @param {Object} props
 * @param {boolean} [props.withNav=false] - Sobe o banner para ficar acima da barra de navegação inferior.
 */
export default function InstallBanner({ withNav = false }) {
  const canPrompt = useSyncExternalStore(installStore.subscribe, installStore.canPrompt, () => false)
  const [dismissed, setDismissed] = useState(wasRecentlyDismissed)
  const [installing, setInstalling] = useState(false)

  if (dismissed || isStandalone() || installStore.wasInstalled()) return null

  const ios = isIOS()
  if (!canPrompt && !ios) return null

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      /* armazenamento indisponível: apenas esconde nesta sessão */
    }
    setDismissed(true)
  }

  const handleInstall = async () => {
    setInstalling(true)
    try {
      await installStore.prompt()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <aside className={`install-banner ${withNav ? 'with-nav' : ''}`} aria-label="Instalar aplicativo">
      <img className="install-banner-icon" src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" />
      <div className="install-banner-text">
        <strong>Instale o app da ICR</strong>
        {canPrompt ? (
          <span>Acesso rápido direto da tela inicial do celular.</span>
        ) : (
          <span>
            No Safari, toque em <ShareIcon /> <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.
          </span>
        )}
      </div>
      {canPrompt && (
        <button type="button" className="install-banner-action" onClick={handleInstall} disabled={installing}>
          Instalar
        </button>
      )}
      <button type="button" className="install-banner-close" onClick={dismiss} aria-label="Dispensar convite de instalação">
        ×
      </button>
    </aside>
  )
}
