import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Shield, Activity, FileText, Bell, Settings } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useI18n } from '@/hooks/useI18n'
import ProfileAvatar from './ProfileAvatar'
import { TwoFactorSection } from './TwoFactorSection'
import { ActiveSessionsSection } from './ActiveSessionsSection'
import LegalDocumentsSection from './LegalDocumentsSection'
import { GoogleAccountLinkSection } from './GoogleAccountLinkSection'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

const CURRENT_YEAR = new Date().getFullYear()

const TABS = [
  { id: 'overview', label: 'Aperçu', icon: User },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'sessions', label: 'Sessions', icon: Activity },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Préférences', icon: Settings },
]

export function AccountView() {
  const { user, isAuthenticated, roles, updateSessionUser } = useAuth()
  const { t, language, dir } = useI18n()
  const [activeTab, setActiveTab] = useState('overview')

  if (!isAuthenticated || !user) return null

  const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <section aria-label={t('profile.personalInfo', 'Informations personnelles')} className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <ProfileAvatar user={user} editable={true} />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-zinc-900 truncate">{displayName}</h2>
                  <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {roles.map((role) => (
                      <span key={role} className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium capitalize text-zinc-600">
                        {role.replace('ROLE_', '').toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 border-t border-zinc-100 pt-6">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs font-semibold text-zinc-500">{t('profile.firstName', 'Prénom')}</dt>
                    <dd className="text-sm font-medium text-zinc-900 mt-0.5">{user.firstName || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-zinc-500">{t('profile.lastName', 'Nom')}</dt>
                    <dd className="text-sm font-medium text-zinc-900 mt-0.5">{user.lastName || '—'}</dd>
                  </div>
                  {user.phone && (
                    <div>
                      <dt className="text-xs font-semibold text-zinc-500">{t('profile.phone', 'Téléphone')}</dt>
                      <dd className="text-sm font-medium text-zinc-900 mt-0.5">{user.phone}</dd>
                    </div>
                  )}
                </dl>
                <dl className="space-y-3">
                  {user.language && (
                    <div>
                      <dt className="text-xs font-semibold text-zinc-500">{t('profile.language', 'Langue')}</dt>
                      <dd className="text-sm font-medium text-zinc-900 mt-0.5">{user.language}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-semibold text-zinc-500">{t('profile.roles', 'Rôles')}</dt>
                    <dd className="mt-0.5">
                      <ul className="space-y-1">
                        {roles.map((role) => (
                          <li key={role} className="text-sm text-zinc-900 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {role.replace('ROLE_', '').toLowerCase()}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  {typeof user.twoFactorEnabled === 'boolean' && (
                    <div>
                      <dt className="text-xs font-semibold text-zinc-500">{t('profile.twoFactor', 'Authentification à deux facteurs')}</dt>
                      <dd className="mt-0.5">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                          user.twoFactorEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}>
                          {user.twoFactorEnabled ? t('profile.enabled', 'Activée') : t('profile.disabled', 'Désactivée')}
                        </span>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </section>

            {roles.some((r) => r === 'ROLE_STUDENT' || r === 'ROLE_PARENT') && (
              <section aria-label="IA pédagogique et consentement" className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900">IA pédagogique & Protection des données</h3>
                <p className="text-xs text-zinc-500">Gestion du consentement parental et des analyses d'apprentissage</p>
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <dt className="text-xs font-semibold text-zinc-500">Protection des données IA</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Encadrement éthique actif
                    </dd>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <dt className="text-xs font-semibold text-zinc-500">Consentement parental requis</dt>
                    <dd className="mt-1 text-zinc-700">Obligatoire pour les analyses prédictives</dd>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <dt className="text-xs font-semibold text-zinc-500">Droits d'accès</dt>
                    <dd className="mt-1 text-zinc-700">{roles.includes('ROLE_PARENT') ? 'Signature et révocation du consentement' : 'Consultation des analyses publiées'}</dd>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                    <dt className="text-xs font-semibold text-zinc-500">Traçabilité</dt>
                    <dd className="mt-1 text-zinc-700">Journal d'audit horodaté et immuable</dd>
                  </div>
                </dl>
              </section>
            )}

            <GoogleAccountLinkSection />
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TwoFactorSection />
            <GoogleAccountLinkSection />
          </div>
        )

      case 'sessions':
        return (
          <div className="animate-in fade-in duration-200">
            <ActiveSessionsSection />
          </div>
        )

      case 'documents':
        return (
          <div className="animate-in fade-in duration-200">
            <LegalDocumentsSection key={`${user.id}:${user.email}`} />
          </div>
        )

      case 'notifications':
        return (
          <div className="animate-in fade-in duration-200">
            <section className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Préférences de notification</h3>
              <p className="text-xs text-zinc-500 mb-6">Configurez comment vous souhaitez recevoir les notifications.</p>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <dt className="text-sm font-medium text-zinc-900">Notifications par e-mail</dt>
                    <dd className="text-xs text-zinc-500">Recevoir les alertes importantes par e-mail</dd>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <dt className="text-sm font-medium text-zinc-900">Notifications push</dt>
                    <dd className="text-xs text-zinc-500">Recevoir les notifications en temps réel</dd>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <dt className="text-sm font-medium text-zinc-900">Notifications SMS</dt>
                    <dd className="text-xs text-zinc-500">Recevoir les alertes critiques par SMS</dd>
                  </div>
                  <input type="checkbox" className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
                </label>
              </div>
            </section>
          </div>
        )

      case 'preferences':
        return (
          <div className="animate-in fade-in duration-200">
            <section className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-zinc-900">Préférences d'affichage</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Langue de l'interface</label>
                  <select className="w-full max-w-xs h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none">
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Thème</label>
                  <select className="w-full max-w-xs h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none">
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="system">Système</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Densité d'affichage</label>
                  <select className="w-full max-w-xs h-10 px-3 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 focus:outline-none">
                    <option value="compact">Compact (ERPNext)</option>
                    <option value="comfortable">Confortable</option>
                  </select>
                </div>
              </div>
            </section>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div dir={dir} lang={language} data-contract="profile-tabs" className="min-h-screen flex flex-col bg-white select-none">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-2.5">
          <Link to="/dashboard" className="inline-flex h-9 w-9 items-center justify-center rounded-tight border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer" title={t('common.dashboard', 'Tableau de bord')}>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-[#1d4ed8] text-white flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" fill="currentColor" fillOpacity="0.25" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-zinc-900">EduTrack</span>
        </div>
        <LanguageSwitcher size="xs" />
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="w-full max-w-4xl">
          {/* Tab Navigation */}
          <nav aria-label="Onglets du compte" className="mb-6">
            <div className="flex flex-wrap gap-1 rounded-xl bg-zinc-50 border border-zinc-200 p-1">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer
                      ${isActive
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                      }
                    `}
                    aria-selected={isActive}
                    role="tab"
                    aria-controls={`panel-${tab.id}`}
                    id={`tab-${tab.id}`}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t(`account.tab.${tab.id}`, tab.label)}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Tab Panels */}
          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
            {renderTabContent()}
          </div>
        </div>
      </main>

      <footer className="w-full max-w-6xl mx-auto text-center py-4 px-4 text-xs text-zinc-400">
        © {CURRENT_YEAR} EduTrack Platform · Tous droits réservés.
      </footer>
    </div>
  )
}

export default AccountView