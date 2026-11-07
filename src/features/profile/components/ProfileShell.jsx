import ProfileAvatar from './ProfileAvatar'
import { displayName, roleLabels } from "@/features/profile/utils/profileDisplay"
import ProfileIcon from './ProfileIcon'

function navigateTo(to) {
  return (event) => {
    event.preventDefault()
    window.history.pushState(null, '', to)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

export default function ProfileShell({ user, logout, children }) {
  return <div className="profile-shell">
    <aside className="profile-sidebar">
      <div className="profile-brand"><ProfileIcon name="cap" /><span>School Management</span></div>
      <nav aria-label="Navigation du compte" className="profile-navigation">
        <a href="#mon-profil" aria-current="page" className="profile-nav-active" onClick={navigateTo('/')}> <ProfileIcon name="profile" /><span>Mon profil</span></a>
        <a href="#mes-documents"><ProfileIcon name="file" /><span>Mes documents</span></a>
        <a href="/observations" onClick={navigateTo('/observations')}> <ProfileIcon name="edit" /><span>Observations pédagogiques</span></a>
        <a href="/analyses" onClick={navigateTo('/analyses')}> <ProfileIcon name="file" /><span>Analyses pédagogiques</span></a>
        <a href="/strategies" onClick={navigateTo('/strategies')}> <ProfileIcon name="edit" /><span>Stratégies d’apprentissage</span></a>
        <a href="/consents" onClick={navigateTo('/consents')}> <ProfileIcon name="shield" /><span>Consentements IA</span></a>
      </nav>
      <div className="profile-security"><span className="profile-security-icon"><ProfileIcon name="shield" /></span><div><strong>Accès sécurisé</strong><p>Espace réservé aux utilisateurs autorisés.</p></div></div>
    </aside>
    <div className="profile-workspace">
      <header className="profile-topbar">
        <div className="profile-topbar-identity"><ProfileAvatar user={user} small /><div><strong>{displayName(user)}</strong><p>{user.roles.map((role) => roleLabels[role] || role).join(' · ')}</p></div></div>
        <button type="button" className="profile-logout" onClick={() => { void logout() }}><ProfileIcon name="logout" /><span>Se déconnecter</span></button>
      </header>
      {children}
    </div>
  </div>
}
