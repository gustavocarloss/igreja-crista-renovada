import { useRef, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import { getEventStatus } from '../../utils/events'
import { resizeImageToDataUrl } from '../../utils/image'
import { friendlyError } from '../../utils/errors'
import { isValidEmail, isStrongPassword, PASSWORD_RULE_MESSAGE } from '../../utils/validation'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import './Perfil.css'

const sameEmail = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()

/**
 * Componente que exibe o perfil do usuário logado, seus eventos confirmados e logout.
 */
export default function Perfil() {
  const { user, setUser, eventos, atualizarAvatar, showMessage, handleLogout } = useAppContext()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    emailAtual: '',
    novoEmail: '',
    repetirNovoEmail: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    repetirSenha: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const eventosConfirmados = eventos.filter(evento =>
    user?.eventosConfirmados?.some(id => String(id) === String(evento.id))
  )

  const now = new Date()
  const futureEvents = eventosConfirmados
    .filter(e => getEventStatus(e.raw_date, now) !== 'past')
    .sort((a, b) => new Date(a.raw_date) - new Date(b.raw_date))

  const pastEvents = eventosConfirmados
    .filter(e => e.raw_date && getEventStatus(e.raw_date, now) === 'past')
    .sort((a, b) => new Date(b.raw_date) - new Date(a.raw_date))

  const [showHistory, setShowHistory] = useState(false)

  const handleVerDetalhes = (evento) => {
    navigate(`/detalhes/${evento.id}`)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!file) return
    setIsSaving(true)
    try {
      // Confere o tipo real do arquivo e redesenha em 256x256 JPEG (descarta EXIF e conteúdo escondido).
      await atualizarAvatar(await resizeImageToDataUrl(file))
    } catch (err) {
      showMessage(err.message || 'Não foi possível usar esta imagem.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const novoEmail = editForm.novoEmail.trim()

    if (!sameEmail(editForm.emailAtual, user.email)) {
      showMessage('O e-mail atual digitado está incorreto.')
      return
    }
    if (!isValidEmail(novoEmail)) {
      showMessage('Informe um e-mail válido, como nome@exemplo.com.')
      return
    }
    if (!sameEmail(novoEmail, editForm.repetirNovoEmail)) {
      showMessage('O novo e-mail e a confirmação não coincidem.')
      return
    }
    if (sameEmail(novoEmail, user.email)) {
      showMessage('O novo e-mail precisa ser diferente do atual.')
      return
    }

    setIsSaving(true)
    try {
      // O e-mail de login vive no Supabase Auth. Com a confirmação de e-mail ligada, a troca só vale
      // depois que o usuário clicar no link — até lá o e-mail antigo continua valendo.
      const { pending } = await authService.updateAuthEmail(novoEmail)
      if (pending) {
        showMessage(`Enviamos um link de confirmação para ${novoEmail}. A troca vale depois que você confirmar.`, 'success')
      } else {
        setUser((prev) => (prev ? { ...prev, email: novoEmail } : prev))
        showMessage('E-mail atualizado com sucesso!', 'success')
      }
      setIsEditing(false)
      setEditForm({ emailAtual: '', novoEmail: '', repetirNovoEmail: '' })
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível atualizar o e-mail.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!isStrongPassword(passwordForm.novaSenha)) {
      showMessage(PASSWORD_RULE_MESSAGE)
      return
    }
    if (passwordForm.novaSenha !== passwordForm.repetirSenha) {
      showMessage('A nova senha e a confirmação não coincidem.')
      return
    }

    setIsSavingPassword(true)
    try {
      try {
        await authService.verifyPassword(user.email, passwordForm.senhaAtual)
      } catch (err) {
        const wrongPassword = /invalid login credentials/i.test(err?.message || '')
        showMessage(wrongPassword ? 'A senha atual digitada está incorreta.' : friendlyError(err))
        return
      }

      await authService.updateAuthPassword(passwordForm.novaSenha)

      showMessage('Senha atualizada com sucesso!', 'success')
      setPasswordForm({ senhaAtual: '', novaSenha: '', repetirSenha: '' })
      setIsChangingPassword(false)
    } catch (err) {
      showMessage(friendlyError(err, 'Não foi possível alterar a senha.'))
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className="page">
      {(isSaving || isSavingPassword) && <LoadingSpinner fullScreen={true} message="Atualizando seus dados..." />}
      <div className="top-header-bar">
        <img src={`${import.meta.env.BASE_URL}icr-logo.png`} alt="ICR Logo" className="header-logo" />
        <span className="header-title">Igreja Cristã Renovada</span>
      </div>
      <header className="page-header">
        <h1>Meu Perfil</h1>
      </header>

      <div className="perfil-card">
        <div className="user-profile-header">
          <div className="avatar-wrapper">
            <div
              className="avatar-placeholder"
              onClick={() => fileInputRef.current?.click()}
              title="Clique para alterar foto de perfil"
              style={user.avatar_url ? {
                backgroundImage: `url(${user.avatar_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'transparent',
                cursor: 'pointer'
              } : { cursor: 'pointer' }}
            >
              {!user.avatar_url && (user.nome ? user.nome.charAt(0).toUpperCase() : '?')}
            </div>
            <button className="avatar-edit-badge" onClick={() => fileInputRef.current?.click()} title="Editar Foto">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
            />
          </div>

          <div className="user-details">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="edit-profile-form">
                <input
                  type="email"
                  value={editForm.emailAtual}
                  onChange={(e) => setEditForm({ ...editForm, emailAtual: e.target.value })}
                  placeholder="E-mail atual"
                  required
                />
                <input
                  type="email"
                  value={editForm.novoEmail}
                  onChange={(e) => setEditForm({ ...editForm, novoEmail: e.target.value })}
                  placeholder="Novo e-mail"
                  required
                />
                <input
                  type="email"
                  value={editForm.repetirNovoEmail}
                  onChange={(e) => setEditForm({ ...editForm, repetirNovoEmail: e.target.value })}
                  placeholder="Confirmar novo e-mail"
                  required
                />
                <div className="edit-form-actions">
                  <button type="submit" disabled={isSaving} className="save-profile-btn">
                    {isSaving ? 'Alterando...' : 'Alterar e-mail'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="cancel-profile-btn">
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="user-name-row">
                  <h3>{user.nome}</h3>
                </div>
                <div className="user-email-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ margin: 0 }}>{user.email}</p>
                  <button className="edit-profile-icon" onClick={() => setIsEditing(true)} title="Alterar e-mail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="perfil-section">
          <h3>Eventos Confirmados</h3>
          <div className="confirmados-list">
            {futureEvents.length > 0 ? (
              futureEvents.map(evento => (
                <div
                  key={evento.id}
                  className="confirmado-item clickable-item"
                  onClick={() => handleVerDetalhes(evento)}
                  title="Ver Detalhes do Evento"
                >
                  <div className="confirmado-dot"></div>
                  <div className="confirmado-info">
                    <h4>{evento.nome}</h4>
                    <p>{evento.horario}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Nenhum evento futuro confirmado.</p>
            )}

            <button
              className="view-attendees-btn"
              style={{ marginTop: '16px' }}
              onClick={() => setShowHistory(true)}
            >
              Ver meu histórico completo
            </button>
          </div>
        </div>

        <div className="perfil-section" style={{ marginTop: '24px' }}>
          <h3>Segurança</h3>
          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="alterar-senha-btn-full"
            >
              Alterar Senha
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="edit-profile-form">
              <input
                type="password"
                value={passwordForm.senhaAtual}
                onChange={(e) => setPasswordForm({ ...passwordForm, senhaAtual: e.target.value })}
                placeholder="Senha Atual"
                required
              />
              <input
                type="password"
                value={passwordForm.novaSenha}
                onChange={(e) => setPasswordForm({ ...passwordForm, novaSenha: e.target.value })}
                placeholder="Nova Senha"
                required
              />
              <input
                type="password"
                value={passwordForm.repetirSenha}
                onChange={(e) => setPasswordForm({ ...passwordForm, repetirSenha: e.target.value })}
                placeholder="Repetir Nova Senha"
                required
              />
              <div className="edit-form-actions" style={{ marginTop: '4px' }}>
                <button type="submit" disabled={isSavingPassword || !passwordForm.novaSenha} className="save-profile-btn">
                  {isSavingPassword ? 'Atualizando...' : 'Atualizar'}
                </button>
                <button type="button" onClick={() => setIsChangingPassword(false)} className="cancel-profile-btn">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Finalizar Sessão
        </button>
      </div>

      {showHistory && (
        <div className="attendees-modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="attendees-modal" onClick={e => e.stopPropagation()}>
            <div className="attendees-modal-header">
              <h3>Histórico de Presenças</h3>
              <button className="close-modal-btn" onClick={() => setShowHistory(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="attendees-modal-body">
              {futureEvents.length > 0 && (
                <>
                  <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Eventos Futuros</h4>
                  {futureEvents.map(evento => (
                    <div
                      key={evento.id}
                      className="confirmado-item clickable-item"
                      style={{ marginBottom: '8px' }}
                      onClick={() => { setShowHistory(false); handleVerDetalhes(evento); }}
                    >
                      <div className="confirmado-dot"></div>
                      <div className="confirmado-info">
                        <h4>{evento.nome}</h4>
                        <p>{evento.horario}</p>
                      </div>
                    </div>
                  ))}
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0' }} />
                </>
              )}

              <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Eventos Passados</h4>
              {pastEvents.length > 0 ? (
                pastEvents.map(evento => (
                  <div
                    key={evento.id}
                    className="confirmado-item clickable-item"
                    style={{ marginBottom: '8px', opacity: 0.7 }}
                    onClick={() => { setShowHistory(false); handleVerDetalhes(evento); }}
                  >
                    <div className="confirmado-dot" style={{ background: '#9ca3af' }}></div>
                    <div className="confirmado-info">
                      <h4>{evento.nome}</h4>
                      <p>{evento.horario}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data" style={{ fontSize: '14px', marginTop: '4px' }}>Nenhum evento passado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
