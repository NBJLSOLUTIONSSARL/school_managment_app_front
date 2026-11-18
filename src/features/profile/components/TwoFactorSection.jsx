import { useState, useContext } from 'react'
import { ShieldCheck, ShieldAlert, Copy, Check, Loader2, AlertCircle } from 'lucide-react'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { ToastContext } from '@/context/toastContext'
import { useI18n } from '@/hooks/useI18n'
import { setupTwoFactor, enableTwoFactor, disableTwoFactor } from '@/features/auth/api/authApi'

export function TwoFactorSection() {
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const updateSessionUser = authContext?.updateSessionUser
  const toastContext = useContext(ToastContext)
  const success = toastContext?.success || (() => {})
  const toastError = toastContext?.error || (() => {})
  const { t } = useI18n()

  const [isSetupOpen, setIsSetupOpen] = useState(false)
  const [isDisableOpen, setIsDisableOpen] = useState(false)
  const [setupData, setSetupData] = useState(null)
  const [totpCode, setTotpCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [hasCopiedSecret, setHasCopiedSecret] = useState(false)
  const [hasCopiedCodes, setHasCopiedCodes] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isEnabled = Boolean(user?.twoFactorEnabled)

  const handleStartSetup = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await setupTwoFactor()
      setSetupData(res?.data || res)
      setRecoveryCodes([])
      setTotpCode('')
      setIsSetupOpen(true)
    } catch (err) {
      toastError(err.message || t('profile.twoFactorSetupError', 'Impossible de préparer la configuration 2FA.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmEnable = async (e) => {
    e.preventDefault()
    if (!totpCode.trim()) {
      setErrorMessage(t('profile.twoFactorCodeRequired', 'Veuillez saisir le code à 6 chiffres.'))
      return
    }
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await enableTwoFactor({ code: totpCode.trim() })
      const data = res?.data || res
      setRecoveryCodes(data.recoveryCodes || [])
      if (updateSessionUser) {
        updateSessionUser({ twoFactorEnabled: true })
      }
      success(t('profile.twoFactorEnabledSuccess', 'Authentification à deux facteurs activée avec succès.'))
    } catch (err) {
      const msg = err.message || t('profile.twoFactorInvalidCode', 'Code de vérification incorrect.')
      setErrorMessage(msg)
      toastError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDisable = async (e) => {
    e.preventDefault()
    if (!disablePassword || !disableCode) {
      setErrorMessage(t('profile.twoFactorDisableFieldsRequired', 'Veuillez renseigner votre mot de passe et un code valide.'))
      return
    }
    setIsLoading(true)
    setErrorMessage('')
    try {
      await disableTwoFactor({ password: disablePassword, code: disableCode.trim() })
      if (updateSessionUser) {
        updateSessionUser({ twoFactorEnabled: false })
      }
      setIsDisableOpen(false)
      setDisablePassword('')
      setDisableCode('')
      success(t('profile.twoFactorDisabledSuccess', 'Authentification à deux facteurs désactivée.'))
    } catch (err) {
      const msg = err.message || t('profile.twoFactorDisableError', 'Mot de passe ou code invalide.')
      setErrorMessage(msg)
      toastError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (setupData?.secretKey) {
      navigator.clipboard.writeText(setupData.secretKey)
      setHasCopiedSecret(true)
      setTimeout(() => setHasCopiedSecret(false), 2000)
    }
  }

  const handleCopyCodes = () => {
    if (recoveryCodes.length > 0) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'))
      setHasCopiedCodes(true)
      setTimeout(() => setHasCopiedCodes(false), 2000)
    }
  }

  return (
    <section aria-label="Authentification à deux facteurs" data-contract="two-factor-card" className="profile-card mt-6">
      <div className="profile-card-heading">
        <div className="profile-card-identity">
          <div className="flex items-center gap-2">
            <h2>{t('profile.twoFactorHeading', 'Authentification à deux facteurs (2FA)')}</h2>
            <span
              className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                isEnabled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              {isEnabled ? t('common.enabled', 'Activée') : t('common.disabled', 'Désactivée')}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {t(
              'profile.twoFactorSubtitle',
              'Protégez votre compte avec une application TOTP (Google Authenticator, Authy, Apple Keychain, etc.).'
            )}
          </p>
        </div>
        <div>
          {isEnabled ? (
            <button
              type="button"
              onClick={() => {
                setErrorMessage('')
                setIsDisableOpen(true)
              }}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-md border border-rose-200 transition-colors cursor-pointer"
            >
              {t('profile.disable2fa', 'Désactiver la 2FA')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSetup}
              disabled={isLoading}
              className="text-xs font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] px-3.5 py-1.5 rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{t('profile.enable2fa', 'Activer la 2FA')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Setup Modal */}
      {isSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  {recoveryCodes.length > 0
                    ? t('profile.recoveryCodesTitle', 'Codes de secours d’urgence')
                    : t('profile.setup2faTitle', 'Configurer l’application d’authentification')}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {recoveryCodes.length > 0
                    ? t('profile.recoveryCodesSubtitle', 'Conservez précieusement ces codes à usage unique dans un endroit sûr.')
                    : t('profile.setup2faSubtitle', 'Scannez l’URI ou saisissez la clé secrète manuellement.')}
                </p>
              </div>
            </div>

            {recoveryCodes.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{t('profile.saveRecoveryWarning', 'Attention : Ces codes ne seront plus jamais réaffichés !')}</span>
                  </div>
                  <p className="leading-relaxed">
                    Si vous perdez l’accès à votre appareil d’authentification, chaque code vous permettra de vous connecter une seule fois.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200 font-mono text-center text-xs font-semibold text-zinc-800">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="bg-white py-1.5 px-2 rounded border border-zinc-200/80 shadow-2xs">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCodes}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-300 rounded-lg px-3 py-1.5 cursor-pointer"
                  >
                    {hasCopiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedCodes ? t('common.copied', 'Copié !') : t('profile.copyCodes', 'Copier les 8 codes')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSetupOpen(false)
                      setRecoveryCodes([])
                      setSetupData(null)
                    }}
                    className="text-xs font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] px-4 py-2 rounded-lg cursor-pointer"
                  >
                    {t('common.done', 'J’ai bien noté mes codes')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmEnable} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-700">
                    {t('profile.secretKeyLabel', 'Clé secrète (Base32) :')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={setupData?.secretKey || ''}
                      className="flex-1 h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-zinc-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="h-9 px-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 cursor-pointer"
                    >
                      {hasCopiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedSecret ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-700">
                    {t('profile.qrUriLabel', 'Lien d’importation rapide (otpauth://) :')}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={setupData?.qrCodeUri || ''}
                    className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded text-2xs font-mono text-zinc-500 truncate"
                  />
                </div>

                <div>
                  <label htmlFor="verify-totp-code" className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    {t('profile.enterTotpPrompt', 'Saisissez le code à 6 chiffres affiché sur votre application :')}
                  </label>
                  <input
                    id="verify-totp-code"
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    autoFocus
                    required
                    className="w-full h-11 px-3 bg-[#fcfcfd] border border-zinc-200 rounded-lg text-center tracking-widest text-lg font-mono font-semibold text-zinc-900 focus:border-[#1d4ed8] focus:ring-2 focus:ring-[#1d4ed8]/10 focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <div role="alert" className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSetupOpen(false)
                      setSetupData(null)
                    }}
                    className="text-xs font-medium text-zinc-600 hover:text-zinc-800 px-3.5 py-2 rounded-lg cursor-pointer"
                  >
                    {t('common.cancel', 'Annuler')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || totpCode.length !== 6}
                    className="text-xs font-medium text-white bg-[#1d4ed8] hover:bg-[#1e40af] px-4 py-2 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t('profile.verifyAndEnable', 'Vérifier et activer')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {isDisableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base border-b border-zinc-100 pb-3">
              <ShieldAlert className="w-5 h-5" />
              <h3>{t('profile.disable2faTitle', 'Désactiver l’authentification à deux facteurs')}</h3>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Pour confirmer la désactivation, veuillez entrer votre mot de passe de compte et un code d’authentification ou de secours.
            </p>

            <form onSubmit={handleConfirmDisable} className="space-y-3.5">
              <div>
                <label htmlFor="disable-pwd" className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t('profile.password', 'Mot de passe')}
                </label>
                <input
                  id="disable-pwd"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full h-9 px-3 bg-[#fcfcfd] border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:border-[#1d4ed8] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="disable-code" className="block text-xs font-semibold text-zinc-700 mb-1">
                  {t('profile.totpOrRecoveryCode', 'Code TOTP (6 chiffres) ou code de secours')}
                </label>
                <input
                  id="disable-code"
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.toUpperCase())}
                  required
                  placeholder="123456 ou A1B2C3D4"
                  className="w-full h-9 px-3 bg-[#fcfcfd] border border-zinc-200 rounded-lg text-xs font-mono text-zinc-900 focus:border-[#1d4ed8] focus:outline-none"
                />
              </div>

              {errorMessage && (
                <div role="alert" className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsDisableOpen(false)}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-800 px-3.5 py-2 rounded-lg cursor-pointer"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{t('profile.confirmDisable', 'Confirmer la désactivation')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default TwoFactorSection
