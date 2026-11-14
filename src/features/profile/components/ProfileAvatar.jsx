import { useState, useRef, useContext } from 'react'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { AuthContext } from '@/features/auth/context/AuthContext'
import { ToastContext } from '@/context/toastContext'
import { useI18n } from '@/hooks/useI18n'
import { uploadProfilePhoto, deleteProfilePhoto } from '@/features/auth/api/authApi'

export default function ProfileAvatar({ user, small = false, editable = false }) {
  const authContext = useContext(AuthContext)
  const toastContext = useContext(ToastContext)
  const updateSessionUser = authContext?.updateSessionUser
  const toastSuccess = toastContext?.success || (() => {})
  const toastError = toastContext?.error || (() => {})
  const { t } = useI18n()
  const fileInputRef = useRef(null)

  const [failedUrl, setFailedUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  let safeUrl
  try {
    if (user?.photoUrl) {
      const url = new URL(user.photoUrl, window.location.origin)
      if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) {
        safeUrl = url.href
      }
    }
  } catch {
    /* Fall back to initials for invalid optional photos. */
  }

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((name) => Array.from(name.trim())[0] || '')
    .join('')
    .toLocaleUpperCase() || '?'

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toastError(t('profile.photoInvalidType', 'Format non supporté. Veuillez choisir un fichier PNG, JPEG ou WEBP.'))
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toastError(t('profile.photoTooLarge', 'La photo ne doit pas dépasser 5 Mo.'))
      return
    }

    setIsUploading(true)
    try {
      const res = await uploadProfilePhoto(file)
      const newPhotoUrl = res?.data?.photoUrl || res?.photoUrl
      if (updateSessionUser && newPhotoUrl) {
        updateSessionUser({ photoUrl: newPhotoUrl })
      }
      setFailedUrl(null)
      toastSuccess(t('profile.photoUploadSuccess', 'Photo de profil mise à jour.'))
    } catch (err) {
      toastError(err.message || t('profile.photoUploadError', 'Échec du téléversement de la photo.'))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (e) => {
    e.stopPropagation()
    if (!user?.photoUrl || isDeleting) return

    setIsDeleting(true)
    try {
      await deleteProfilePhoto()
      if (updateSessionUser) {
        updateSessionUser({ photoUrl: null })
      }
      setFailedUrl(null)
      toastSuccess(t('profile.photoDeleteSuccess', 'Photo de profil retirée.'))
    } catch (err) {
      toastError(err.message || t('profile.photoDeleteError', 'Échec du retrait de la photo.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative group shrink-0 inline-block">
      <div className={`profile-avatar ${small ? 'profile-avatar-small' : ''}`}>
        {safeUrl && failedUrl !== safeUrl ? (
          <img
            src={safeUrl}
            alt={small ? '' : 'Photo de profil'}
            onError={() => setFailedUrl(safeUrl)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span aria-label="Initiales du profil">{initials}</span>
        )}

        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-2xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
      </div>

      {editable && !small && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading || isDeleting}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDeleting}
            aria-label="Changer la photo de profil"
            title="Changer la photo"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shadow-md hover:bg-[#1e40af] transition-transform active:scale-95 cursor-pointer border-2 border-white"
          >
            <Camera className="w-4 h-4" />
          </button>

          {safeUrl && !isUploading && (
            <button
              type="button"
              onClick={handleDeletePhoto}
              disabled={isDeleting}
              aria-label="Retirer la photo de profil"
              title="Retirer la photo"
              className="absolute top-0 right-0 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md hover:bg-rose-700 transition-transform active:scale-95 cursor-pointer border-2 border-white"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </>
      )}
    </div>
  )
}
