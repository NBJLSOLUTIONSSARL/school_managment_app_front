export const roleLabels = {
  ROLE_ADMIN: 'Administrateur', ROLE_TEACHER: 'Enseignant', ROLE_STUDENT: 'Élève',
  ROLE_PARENT: 'Parent', ROLE_STAFF: 'Personnel',
}

export function displayName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Mon compte'
}
