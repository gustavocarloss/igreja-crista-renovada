import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary.jsx'
import ErrorState from './components/common/ErrorState/ErrorState.jsx'
import { CONFIG_ERROR } from './config.js'
import { setupServiceWorker } from './pwa/registerSW.js'
import './pwa/installPrompt.js' // captura o beforeinstallprompt antes do React montar

if (CONFIG_ERROR) console.error('[config]', CONFIG_ERROR)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {CONFIG_ERROR ? (
      <ErrorState
        fullScreen
        title="Aplicativo indisponível"
        message="O aplicativo não está configurado corretamente. Avise o administrador."
      />
    ) : (
      <ErrorBoundary>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppProvider>
            <App />
          </AppProvider>
        </BrowserRouter>
      </ErrorBoundary>
    )}
  </StrictMode>
)

setupServiceWorker()
