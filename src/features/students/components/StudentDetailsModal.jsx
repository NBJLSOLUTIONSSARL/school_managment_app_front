import { Mail, Phone } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export function StudentDetailsModal({
  isOpen,
  onClose,
  student,
  onOpenAssignGuardian,
  onOpenEdit,
}) {
  const { hasRole } = useAuth()
  const canManage = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])

  if (!student) return null

  const user = student.user || {}
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Élève'
  const guardians = Array.isArray(student.guardians) ? student.guardians : []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={`Fiche d'information élève • Matricule : ${student.studentNumber || 'En attente'}`}
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Top Badges & Quick actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xs font-semibold text-slate-800">
              {student.studentNumber || '-'}
            </span>
            <StatusBadge status={student.status || (user.active ? 'ACTIVE' : 'INACTIVE')} showDot />
          </div>
          {canManage && onOpenEdit && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                onClose?.()
                onOpenEdit(student)
              }}
            >
              Modifier la fiche
            </Button>
          )}
        </div>

        {/* Section 1: Informations personnelles */}
        <div>
          <h4 className="mb-2 text-2xs font-bold uppercase tracking-wider text-slate-400">
            Identité & Coordonnées
          </h4>
          <div className="grid grid-cols-2 gap-3 rounded border border-slate-200 bg-slate-50 p-3 sm:grid-cols-4">
            <div>
              <span className="text-2xs text-slate-400">Adresse e-mail</span>
              <div className="mt-0.5 font-medium text-slate-900 truncate">{user.email || '-'}</div>
            </div>
            <div>
              <span className="text-2xs text-slate-400">Téléphone</span>
              <div className="mt-0.5 font-medium text-slate-900">{user.phone || '-'}</div>
            </div>
            <div>
              <span className="text-2xs text-slate-400">Date de naissance</span>
              <div className="mt-0.5 font-medium text-slate-900">{student.birthDate || '-'}</div>
            </div>
            <div>
              <span className="text-2xs text-slate-400">Genre</span>
              <div className="mt-0.5 font-medium text-slate-900">
                {student.gender === 'MALE'
                  ? 'Masculin'
                  : student.gender === 'FEMALE'
                    ? 'Féminin'
                    : student.gender || '-'}
              </div>
            </div>
            <div className="col-span-2">
              <span className="text-2xs text-slate-400">Adresse résidentielle</span>
              <div className="mt-0.5 font-medium text-slate-900">{student.address || '-'}</div>
            </div>
            <div className="col-span-2">
              <span className="text-2xs text-slate-400">Établissement précédent</span>
              <div className="mt-0.5 font-medium text-slate-900">{student.previousSchool || '-'}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Tuteurs légaux */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400">
              Tuteurs légaux ({guardians.length})
            </h4>
            {canManage && onOpenAssignGuardian && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onOpenAssignGuardian(student)}
              >
                + Associer un tuteur
              </Button>
            )}
          </div>

          {guardians.length === 0 ? (
            <div className="rounded border border-dashed border-slate-200 p-4 text-center text-2xs text-slate-500">
              Aucun tuteur légal associé à cet élève.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {guardians.map((g, idx) => (
                <div
                  key={g.guardianId || idx}
                  className="rounded border border-slate-200 bg-white p-3 shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{g.guardianName}</div>
                      <div className="text-2xs text-slate-500">{g.relationship || 'Tuteur'}</div>
                    </div>
                    {g.primaryContact && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        Contact principal
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 border-t border-slate-100 pt-1.5 text-xs text-slate-600">
                    {g.guardianEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{g.guardianEmail}</span>
                      </div>
                    )}
                    {g.guardianPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{g.guardianPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default StudentDetailsModal
