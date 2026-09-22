import { useRef, useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { authService } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner'
import './Perfil.css'

/**
 * Componente que exibe o perfil do usuário logado, seus eventos confirmados e logout.
 */
export default function Perfil() {
  const { user, setUser, eventos, setCurrentPage, setPreviousPage, setSelectedEvent, atualizarAvatar, showMessage } = useAppContext()
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

  useEffect(() => {
    // Apenas limpa formulários ao fechar
  }, [user])

  const eventosConfirmados = eventos.filter(evento =>
    user?.eventosConfirmados?.includes(evento.id)
  )

  const handleVerDetalhes = (evento) => {
    setPreviousPage('perfil')
    setSelectedEvent(evento)
    setCurrentPage('detalhes')
  }

  const handleLogout = () => {
    localStorage.removeItem('churchUser')
    window.location.reload()
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem de perfil deve ter no máximo 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        atualizarAvatar(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (editForm.emailAtual !== user.email) {
      showMessage('O e-mail atual digitado está incorreto.')
      return
    }

    if (editForm.novoEmail !== editForm.repetirNovoEmail) {
      showMessage('O novo e-mail e a confirmação não coincidem.')
      return
    }

    setIsSaving(true)
    
    try {
      const dataToUpdate = {
        email: editForm.novoEmail
      }
      
      await authService.updateAuthEmail(editForm.novoEmail)
      await authService.updateUser(user.id, dataToUpdate)
      
      const updatedUser = { ...user, email: editForm.novoEmail }
      setUser(updatedUser)
      localStorage.setItem('churchUser', JSON.stringify(updatedUser))
      
      showMessage('E-mail atualizado com sucesso!', 'success')
      setIsEditing(false)
      setEditForm({ emailAtual: '', novoEmail: '', repetirNovoEmail: '' })
    } catch {
      showMessage('Erro ao atualizar e-mail.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.novaSenha !== passwordForm.repetirSenha) {
      showMessage('A nova senha e a confirmação não coincidem.')
      return
    }
    
    setIsSavingPassword(true)
    try {
      await authService.login(user.email, passwordForm.senhaAtual)
      
      await authService.updateAuthPassword(passwordForm.novaSenha)
      
      showMessage('Senha atualizada com sucesso!', 'success')
      setPasswordForm({ senhaAtual: '', novaSenha: '', repetirSenha: '' })
      setIsChangingPassword(false)
    } catch (err) {
      if (err.message && err.message.includes('Invalid login credentials')) {
        showMessage('A senha atual digitada está incorreta.')
      } else {
        showMessage(err.message || 'Erro ao conectar com o servidor para alterar a senha.')
      }
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
        <p>Gerencie sua conta e presenças</p>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
          
          <div className="user-details">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="edit-profile-form">
                <input 
                  type="email" 
                  value={editForm.emailAtual} 
                  onChange={(e) => setEditForm({...editForm, emailAtual: e.target.value})} 
                  placeholder="E-mail Atual" 
                  required 
                />
                <input 
                  type="email" 
                  value={editForm.novoEmail} 
                  onChange={(e) => setEditForm({...editForm, novoEmail: e.target.value})} 
                  placeholder="Novo E-mail" 
                  required 
                />
                <input 
                  type="email" 
                  value={editForm.repetirNovoEmail} 
                  onChange={(e) => setEditForm({...editForm, repetirNovoEmail: e.target.value})} 
                  placeholder="Confirmar Novo E-mail" 
                  required 
                />
                <div className="edit-form-actions">
                  <button type="submit" disabled={isSaving} className="save-profile-btn">
                    {isSaving ? 'Alterando...' : 'Alterar E-mail'}
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
                  <button className="edit-profile-icon" onClick={() => setIsEditing(true)} title="Alterar E-mail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="perfil-section">
          <h3>Eventos Confirmados</h3>
          <div className="confirmados-list">
            {eventosConfirmados.length > 0 ? (
              eventosConfirmados.map(evento => (
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
              <p className="no-data">Nenhum evento confirmado ainda.</p>
            )}
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
                onChange={(e) => setPasswordForm({...passwordForm, senhaAtual: e.target.value})} 
                placeholder="Senha Atual" 
                required 
              />
              <input 
                type="password" 
                value={passwordForm.novaSenha} 
                onChange={(e) => setPasswordForm({...passwordForm, novaSenha: e.target.value})} 
                placeholder="Nova Senha" 
                required 
              />
              <input 
                type="password" 
                value={passwordForm.repetirSenha} 
                onChange={(e) => setPasswordForm({...passwordForm, repetirSenha: e.target.value})} 
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
    </div>
  )
}
