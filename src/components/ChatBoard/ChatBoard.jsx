import { useState, useEffect, useRef } from 'react'
import { chatService } from '../../services/api'
import { useAppContext } from '../../context/AppContext'
import './ChatBoard.css'

export default function ChatBoard({ meetingId, isPastEvent }) {
  const { user } = useAppContext()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)

  const loadMessages = async () => {
    try {
      const data = await chatService.fetchMessages(meetingId)
      setMessages(data)
    } catch (err) {
      console.error('Erro ao carregar mensagens do chat:', err)
    }
  }

  useEffect(() => {
    loadMessages()
    // Polling a cada 3 segundos para simular tempo real
    const intervalId = setInterval(loadMessages, 3000)
    return () => clearInterval(intervalId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId])

  useEffect(() => {
    // Rola o container do chat para o final de forma isolada, sem arrastar a janela
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !user) return

    setIsSending(true)
    const newMessage = {
      meeting_id: meetingId,
      user_id: user.id,
      user_name: user.nome,
      user_avatar: user.avatar_url || null,
      text: inputText.trim()
    }

    try {
      await chatService.sendMessage(newMessage)
      setInputText('')
      await loadMessages()
    } catch {
      alert('Não foi possível enviar a mensagem.')
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
      
      <div className="chat-messages" ref={containerRef}>
        {messages.length === 0 ? (
          <p className="no-messages">Nenhuma mensagem ainda. Seja o primeiro a dizer olá!</p>
        ) : (
          messages.map(msg => {
            const isMine = msg.user_id === user?.id
            return (
              <div key={msg.id} className={`chat-message ${isMine ? 'mine' : 'others'}`}>
                {!isMine && (
                  <div className="chat-avatar">
                    {msg.user_avatar ? (
                      <img src={msg.user_avatar} alt={msg.user_name} />
                    ) : (
                      <span>{msg.user_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                )}
                <div className="chat-bubble-container">
                  {!isMine && <span className="chat-user-name">{msg.user_name}</span>}
                  <div className="chat-bubble">
                    {msg.text}
                  </div>
                  <span className="chat-time">
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={isPastEvent ? "Este evento já encerrou." : "Digite sua mensagem..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending || !user || isPastEvent}
        />
        <button type="submit" disabled={!inputText.trim() || isSending || !user || isPastEvent} className="chat-send-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  )
}
