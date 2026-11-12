import { useAuth } from '@/features/auth'
import LegalDocumentsSection from '@/features/profile/components/LegalDocumentsSection'
import ProfileAvatar from '@/features/profile/components/ProfileAvatar'
import { displayName, roleLabels } from '@/features/profile/utils/profileDisplay'
import ProfileIcon from '@/features/profile/components/ProfileIcon'
import './ProfilePage.css'

function Detail({ label, value, icon }) {
  return <div className="profile-detail"><dt><ProfileIcon name={icon} /><span>{label}</span></dt><dd>{value || 'Non renseigné'}</dd></div>
}

export function ProfileView() {
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
    {roles.some((r) => r === 'ROLE_STUDENT' || r === 'ROLE_PARENT') && (
      <section aria-label="IA pédagogique et consentement" className="profile-card mt-6">
        <div className="profile-card-heading">
          <div className="profile-card-identity">
            <h2>IA pédagogique & Protection des données</h2>
            <p>Gestion du consentement parental et des analyses d’apprentissage</p>
          </div>
        </div>
        <div className="profile-details">
          <dl>
            <Detail
              label="Protection des données IA"
              value={
                <span className="profile-status profile-status-approved">
                  <i />Encadrement éthique actif
                </span>
              }
              icon="shield"
            />
            <Detail
              label="Consentement parental requis"
              value="Obligatoire pour les analyses prédictives et stratégies personnalisées"
              icon="shield"
            />
          </dl>
          <dl>
            <Detail
              label="Droits d'accès"
              value={roles.includes('ROLE_PARENT') ? 'Signature et révocation du consentement' : 'Consultation des analyses publiées'}
              icon="user"
            />
            <Detail
              label="Traçabilité"
              value="Journal d'audit horodaté et immuable"
              icon="file"
            />
          </dl>
        </div>
      </section>
    )}
    <LegalDocumentsSection key={`${user.id}:${user.email}`} />
  </div>
}

export const ProfilePage = ProfileView
export default ProfileView
