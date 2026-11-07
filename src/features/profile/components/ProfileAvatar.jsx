import { useState } from 'react'

export default function ProfileAvatar({ user, small = false }) {
  const [failedUrl, setFailedUrl] = useState(null)
  let safeUrl
  try {
    const url = new URL(user.photoUrl, window.location.origin)
    if (user.photoUrl && ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) safeUrl = url.href
  } catch { /* Fall back to initials for invalid optional photos. */ }
  const initials = [user.firstName, user.lastName].filter(Boolean).map((name) => Array.from(name.trim())[0] || '').join('').toLocaleUpperCase() || '?'
  return <div className={`profile-avatar ${small ? 'profile-avatar-small' : ''}`}>
    {safeUrl && failedUrl !== safeUrl
      ? <img src={safeUrl} alt={small ? '' : 'Photo de profil'} onError={() => setFailedUrl(safeUrl)} referrerPolicy="no-referrer" />
      : <span aria-label="Initiales du profil">{initials}</span>}
  </div>
}
