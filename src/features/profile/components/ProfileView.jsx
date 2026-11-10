import { useAuth } from '@/features/auth'
import { useI18n } from '@/hooks/useI18n'
import LegalDocumentsSection from '@/features/profile/components/LegalDocumentsSection'
import ProfileAvatar from '@/features/profile/components/ProfileAvatar'
import { displayName, roleLabels } from '@/features/profile/utils/profileDisplay'
import ProfileIcon from '@/features/profile/components/ProfileIcon'
import GoogleAccountLinkSection from '@/features/profile/components/GoogleAccountLinkSection'
import './ProfilePage.css'

function Detail({ label, value, icon }) {
  return (
    <div className="profile-detail">
      <dt>
        <ProfileIcon name={icon} />
        <span>{label}</span>
      </dt>
      <dd>{value || 'Non renseigné'}</dd>
    </div>
  )
}

export function ProfileView() {
  const { user, isAuthenticated, roles } = useAuth()
  const { t } = useI18n()
  if (!isAuthenticated || !user) return null

  return (
    <div className="profile-page" id="mon-profil">
      <div className="profile-page-heading">
        <h1>{t('profile.title', 'Mon profil')}</h1>
        <p>{t('profile.subtitle', 'Consultez vos informations personnelles et vos documents légaux.')}</p>
      </div>
      <section aria-label={t('profile.personalInfo', 'Informations personnelles')} className="profile-card">
        <div className="profile-card-heading">
          <ProfileAvatar user={user} />
          <div className="profile-card-identity">
            <h2>{displayName(user)}</h2>
            <p>{roles.map((role) => t(`roles.${role}`, roleLabels[role] || role)).join(' · ')}</p>
            <span
              className={`profile-status ${user.active ? 'profile-status-approved' : 'profile-status-neutral'}`}
            >
              <i />
              {user.active ? t('profile.accountActive', 'Compte actif') : t('profile.accountInactive', 'Compte inactif')}
            </span>
          </div>
          <div className="profile-email">
            <ProfileIcon name="mail" />
            <span>{user.email}</span>
          </div>
        </div>
        <div className="profile-details">
          <dl>
            <Detail label={t('profile.firstName', 'Prénom')} value={user.firstName} icon="user" />
            <Detail label={t('profile.lastName', 'Nom')} value={user.lastName} icon="user" />
            {user.phone && <Detail label={t('profile.phone', 'Téléphone')} value={user.phone} icon="phone" />}
          </dl>
          <dl>
            {user.language && <Detail label={t('profile.language', 'Langue')} value={user.language} icon="globe" />}
            <Detail
              label={t('profile.roles', 'Rôles')}
              icon="shield"
              value={
                roles.length ? (
                  <ul className="profile-roles">
                    {roles.map((role) => (
                      <li key={role}>{roleLabels[role] || role}</li>
                    ))}
                  </ul>
                ) : (
                  t('profile.noRoles', 'Aucun rôle attribué')
                )
              }
            />
            {typeof user.twoFactorEnabled === 'boolean' && (
              <Detail
                label={t('profile.twoFactor', 'Authentification à deux facteurs')}
                icon="shield"
                value={
                  <span className="profile-status profile-status-neutral">
                    {user.twoFactorEnabled ? t('profile.enabled', 'Activée') : t('profile.disabled', 'Désactivée')}
                  </span>
                }
              />
            )}
          </dl>
        </div>
      </section>
      <GoogleAccountLinkSection />
      <LegalDocumentsSection key={`${user.id}:${user.email}`} />
    </div>
  )
}

export const ProfilePage = ProfileView
export default ProfileView
