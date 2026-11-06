import { useAuth } from '../auth/AuthContext'
import LegalDocumentsSection from '../components/documents/LegalDocumentsSection'
import ProfileAvatar from '../components/profile/ProfileAvatar'
import { displayName, roleLabels } from '../components/profile/profileDisplay'
import ProfileIcon from '../components/profile/ProfileIcon'
import './ProfilePage.css'

function Detail({ label, value, icon }) {
  return <div className="profile-detail"><dt><ProfileIcon name={icon} /><span>{label}</span></dt><dd>{value || 'Non renseigné'}</dd></div>
}

export default function ProfilePage() {
  const { user, isAuthenticated, roles } = useAuth()
  if (!isAuthenticated || !user) return null
  return <div className="profile-page" id="mon-profil">
    <div className="profile-page-heading"><h1>Mon profil</h1><p>Consultez vos informations personnelles et vos documents légaux.</p></div>
    <section aria-label="Informations personnelles" className="profile-card">
      <div className="profile-card-heading">
        <ProfileAvatar user={user} />
        <div className="profile-card-identity"><h2>{displayName(user)}</h2><p>{roles.map((role) => roleLabels[role] || role).join(' · ')}</p><span className={`profile-status ${user.active ? 'profile-status-approved' : 'profile-status-neutral'}`}><i />{user.active ? 'Compte actif' : 'Compte inactif'}</span></div>
        <div className="profile-email"><ProfileIcon name="mail" /><span>{user.email}</span></div>
      </div>
      <div className="profile-details">
        <dl>
          <Detail label="Prénom" value={user.firstName} icon="user" />
          <Detail label="Nom" value={user.lastName} icon="user" />
          {user.phone && <Detail label="Téléphone" value={user.phone} icon="phone" />}
        </dl>
        <dl>
          {user.language && <Detail label="Langue" value={user.language} icon="globe" />}
          <Detail label="Rôles" icon="shield" value={roles.length ? <ul className="profile-roles">{roles.map((role) => <li key={role}>{roleLabels[role] || role}</li>)}</ul> : 'Aucun rôle attribué'} />
          {typeof user.twoFactorEnabled === 'boolean' && <Detail label="Authentification à deux facteurs" icon="shield" value={<span className="profile-status profile-status-neutral">{user.twoFactorEnabled ? 'Activée' : 'Désactivée'}</span>} />}
        </dl>
      </div>
    </section>
    <LegalDocumentsSection key={`${user.id}:${user.email}`} />
  </div>
}
