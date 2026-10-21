import { useState, useEffect, useRef, useCallback } from 'react'
import { chatService } from '../../services/api'
import { useAppContext } from '../../context/AppContext'
import { friendlyError } from '../../utils/errors'
import { sanitizeChatImage, isSafeChatImage } from '../../utils/chatImage'
import './ChatBoard.css'

const POLL_INTERVAL_MS = 5000
const MAX_MESSAGE_LENGTH = 500

const mergeMessages = (current, incoming) => {
  const known = new Set(current.map((m) => m.id))
  const fresh = incoming.filter((m) => !known.has(m.id))
  return fresh.length ? [...current, ...fresh] : current
}

/**
 * Chat do evento.
 *
 * Em vez de baixar a conversa inteira a cada poucos segundos, busca apenas as mensagens
 * NOVAS (created_at > última recebida), pausa quando o app está em segundo plano ou sem internet
 * e carrega as fotos de perfil uma única vez por usuário.
 */
export default function ChatBoard({ meetingId, isPastEvent }) {
  const { user, showMessage } = useAppContext()
  const [messages, setMessages] = useState([])
  const [avatars, setAvatars] = useState({})
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)
  const [isPreparingImage, setIsPreparingImage] = useState(false)
  const [viewImage, setViewImage] = useState(null)

  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const stickToBottomRef = useRef(true)
  const lastCreatedAtRef = useRef(null)
  const requestedAvatarsRef = useRef(new Set())

  const loadAvatars = useCallback(async (batch) => {
    const missing = [
      ...new Set(
        batch
          .filter((m) => !m.user_avatar && !requestedAvatarsRef.current.has(m.user_id))
          .map((m) => m.user_id)
      )
    ]
    if (!missing.length) return
    missing.forEach((id) => requestedAvatarsRef.current.add(id))
    try {
      const found = await chatService.fetchAvatars(missing)
      setAvatars((prev) => ({ ...prev, ...found }))
    } catch {
      missing.forEach((id) => requestedAvatarsRef.current.delete(id)) // tenta de novo no próximo ciclo
    }
  }, [])

  const loadMessages = useCallback(async () => {
    try {
      const after = lastCreatedAtRef.current
      const data = await chatService.fetchMessages(meetingId, after ? { after } : {})
      setLoadError(false)
      if (data.length) {
        lastCreatedAtRef.current = data[data.length - 1].created_at
        setMessages((prev) => mergeMessages(prev, data))
        loadAvatars(data)
      }
    } catch (err) {
      console.error('Erro ao carregar mensagens do chat:', err)
      setLoadError(true)
    }
  }, [meetingId, loadAvatars])

  useEffect(() => {
    lastCreatedAtRef.current = null
    requestedAvatarsRef.current = new Set()
    stickToBottomRef.current = true
    setMessages([])
    setAvatars({})

    const tick = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) loadMessages()
    }
    loadMessages()
    const intervalId = setInterval(tick, POLL_INTERVAL_MS)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('online', tick)
    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('online', tick)
    }
  }, [meetingId, loadMessages])

  // Só rola para o fim quando chega mensagem nova E o usuário não está lendo mensagens antigas.
  useEffect(() => {
    const el = containerRef.current
    if (el && stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages.length])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  const handlePickImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!file) return
    setIsPreparingImage(true)
    try {
      setPendingImage(await sanitizeChatImage(file))
    } catch (err) {
      showMessage(err.message || 'Não foi possível usar esta imagem.')
    } finally {
      setIsPreparingImage(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const text = inputText.trim()
    if ((!text && !pendingImage) || !user || isSending) return

    setIsSending(true)
    try {
      const payload = {
        meeting_id: meetingId,
        user_id: user.id,
        user_name: user.nome,
        text: text.slice(0, MAX_MESSAGE_LENGTH)
      }
      if (pendingImage) payload.image_url = pendingImage
      const { data } = await chatService.sendMessage(payload)
      setInputText('')
      setPendingImage(null)
      stickToBottomRef.current = true
      if (data?.length) {
        lastCreatedAtRef.current = data[data.length - 1].created_at
        setMessages((prev) => mergeMessages(prev, data))
      } else {
        await loadMessages()
      }
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível enviar a mensagem.'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="chat-board">
      <div className="chat-header">
        <h3>Chat do Evento</h3>
        {isPastEvent && (
          <span className="chat-offline-badge" style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '4px 8px', borderRadius: '12px' }}>Encerrado</span>
        )}
      </div>

      <div className="chat-messages" ref={containerRef} onScroll={handleScroll}>
        {loadError && messages.length === 0 ? (
          <p className="no-messages">Não foi possível carregar as mensagens agora. Tentaremos novamente automaticamente.</p>
        ) : messages.length === 0 ? (
          <p className="no-messages">Nenhuma mensagem ainda. Seja o primeiro a dizer olá!</p>
        ) : (
          messages.map(msg => {
            const isMine = msg.user_id === user?.id
            const name = msg.user_name || 'Membro'
            const avatar = msg.user_avatar || avatars[msg.user_id]
            return (
              <div key={msg.id} className={`chat-message ${isMine ? 'mine' : 'others'}`}>
                {!isMine && (
                  <div className="chat-avatar">
                    {avatar ? (
                      <img src={avatar} alt={name} />
                    ) : (
                      <span>{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                )}
                <div className="chat-bubble-container">
                  {!isMine && <span className="chat-user-name">{name}</span>}
                  <div className={`chat-bubble ${isSafeChatImage(msg.image_url) ? 'has-image' : ''}`}>
                    {isSafeChatImage(msg.image_url) && (
                      <button type="button" className="chat-image-btn" onClick={() => setViewImage(msg.image_url)} aria-label="Ampliar imagem">
                        <img src={msg.image_url} alt={`Imagem enviada por ${name}`} className="chat-image" loading="lazy" />
                      </button>
                    )}
                    {msg.text && <span>{msg.text}</span>}
                  </div>
                  <span className="chat-time">
                    {new Date(msg.created_at).toLocaleString('pt-BR', {
                      timeZone: 'America/Sao_Paulo',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).replace(',', ' às')}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {pendingImage && (
        <div className="chat-pending-image">
          <img src={pendingImage} alt="Pré-visualização da imagem" />
          <span>Imagem pronta para enviar</span>
          <button type="button" onClick={() => setPendingImage(null)} aria-label="Remover imagem">×</button>
        </div>
      )}

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handlePickImage}
          hidden
        />
        <button
          type="button"
          className="chat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || isPreparingImage || !user}
          aria-label="Enviar foto"
          title="Enviar foto"
        >
          {isPreparingImage ? (
            <span className="chat-attach-spinner" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          )}
        </button>
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending || !user}
          maxLength={MAX_MESSAGE_LENGTH}
          enterKeyHint="send"
          autoComplete="off"
          aria-label="Mensagem"
        />
        <button type="submit" disabled={(!inputText.trim() && !pendingImage) || isSending || !user} className="chat-send-btn" aria-label="Enviar mensagem">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>

      {viewImage && (
        <div className="chat-image-viewer" onClick={() => setViewImage(null)} role="dialog" aria-label="Imagem ampliada">
          <img src={viewImage} alt="Imagem ampliada" />
        </div>
      )}
    </div>
  )
}
