import { useState, useEffect, useCallback } from 'react'
import {
  Mail,
  Phone,
  User,
  Users,
  HeartPulse,
  AlertOctagon,
  FileText,
  Plus,
  Trash2,
  Download,
  ShieldAlert,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { studentAcademicService } from '@/features/academics/api/studentAcademicService'

export function StudentDetailsModal({
  isOpen,
  onClose,
  student,
  onOpenAssignGuardian,
  onOpenEdit,
}) {
  const { hasRole } = useAuth()
  const canManage = hasRole(['admin', 'staff', 'ROLE_ADMIN', 'ROLE_STAFF'])
  const isMedicalStaff = hasRole(['admin', 'nurse', 'ROLE_ADMIN', 'ROLE_NURSE', 'ROLE_STAFF'])

  const [activeTab, setActiveTab] = useState('general') // 'general' | 'emergency' | 'siblings' | 'medical' | 'discipline' | 'documents'

  // Sub-data states
  const [emergencyContacts, setEmergencyContacts] = useState([])
  const [siblings, setSiblings] = useState([])
  const [medicalNote, setMedicalNote] = useState(null)
  const [disciplineRecords, setDisciplineRecords] = useState([])

  // Emergency Contact Form
  const [ecFormOpen, setEcFormOpen] = useState(false)
  const [ecForm, setEcForm] = useState({ name: '', relationship: '', phone: '', email: '', primary: false })

  // Sibling Form
  const [siblingFormOpen, setSiblingFormOpen] = useState(false)
  const [siblingStudentId, setSiblingStudentId] = useState('')
  const [siblingRelationship, setSiblingRelationship] = useState('FRATRIE')

  // Medical Note Form
  const [medForm, setMedForm] = useState({
    allergies: '',
    medicalConditions: '',
    emergencyInstructions: '',
    bloodGroup: '',
    restrictedAccess: true,
  })
  const [savingMed, setSavingMed] = useState(false)

  // Discipline Form
  const [discFormOpen, setDiscFormOpen] = useState(false)
  const [discForm, setDiscForm] = useState(() => ({
    incidentDate: new Date().toISOString().slice(0, 10),
    incidentType: 'RETARD',
    severity: 'LOW',
    description: '',
    sanction: '',
  }))

  // Load section data based on active tab
  const loadTabContent = useCallback(async () => {
    if (!student?.id) return
    if (activeTab === 'emergency') {
      const res = await studentAcademicService.getEmergencyContacts(student.id)
      if (res.success) setEmergencyContacts(res.data || [])
    } else if (activeTab === 'siblings') {
      const res = await studentAcademicService.getSiblings(student.id)
      if (res.success) setSiblings(res.data || [])
    } else if (activeTab === 'medical') {
      const res = await studentAcademicService.getMedicalNote(student.id)
      if (res.success && res.data) {
        setMedicalNote(res.data)
        setMedForm({
          allergies: res.data.allergies || '',
          medicalConditions: res.data.medicalConditions || '',
          emergencyInstructions: res.data.emergencyInstructions || '',
          bloodGroup: res.data.bloodGroup || '',
          restrictedAccess: res.data.restrictedAccess ?? true,
        })
      }
    } else if (activeTab === 'discipline') {
      const res = await studentAcademicService.getDisciplineRecords(student.id)
      if (res.success) setDisciplineRecords(res.data || [])
    }
  }, [student, activeTab])

  useEffect(() => {
    let active = true
    if (isOpen) {
      Promise.resolve().then(() => {
        if (active) loadTabContent()
      })
    }
    return () => {
      active = false
    }
  }, [isOpen, loadTabContent])

  if (!student) return null

  const user = student.user || {}
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Élève'
  const guardians = Array.isArray(student.guardians) ? student.guardians : []

  // Emergency Contact Handlers
  const handleSaveContact = async (e) => {
    e.preventDefault()
    const res = await studentAcademicService.addEmergencyContact(student.id, ecForm)
    if (res.success) {
      setEcFormOpen(false)
      setEcForm({ name: '', relationship: '', phone: '', email: '', primary: false })
      loadTabContent()
    } else {
      alert(res.error?.message || "Erreur lors de l'ajout du contact")
    }
  }

  const handleDeleteContact = async (cid) => {
    if (!window.confirm("Supprimer ce contact d'urgence ?")) return
    const res = await studentAcademicService.deleteEmergencyContact(student.id, cid)
    if (res.success) loadTabContent()
  }

  // Sibling Handlers
  const handleSaveSibling = async (e) => {
    e.preventDefault()
    if (!siblingStudentId) return
    const res = await studentAcademicService.addSibling(student.id, {
      siblingStudentId: Number(siblingStudentId),
      relationship: siblingRelationship,
    })
    if (res.success) {
      setSiblingFormOpen(false)
      setSiblingStudentId('')
      loadTabContent()
    } else {
      alert(res.error?.message || "Impossible de lier cet élève")
    }
  }

  const handleDeleteSibling = async (sid) => {
    if (!window.confirm('Retirer ce lien de fratrie ?')) return
    const res = await studentAcademicService.deleteSibling(student.id, sid)
    if (res.success) loadTabContent()
  }

  // Medical Note Handler
  const handleSaveMedical = async (e) => {
    e.preventDefault()
    setSavingMed(true)
    const res = await studentAcademicService.saveMedicalNote(student.id, medForm)
    setSavingMed(false)
    if (res.success) {
      alert('Dossier médical enregistré avec succès (accès consigné au journal d’audit).')
      setMedicalNote(res.data)
    } else {
      alert(res.error?.message || "Erreur lors de l'enregistrement médical")
    }
  }

  // Discipline Handlers
  const handleSaveDiscipline = async (e) => {
    e.preventDefault()
    const res = await studentAcademicService.addDisciplineRecord(student.id, discForm)
    if (res.success) {
      setDiscFormOpen(false)
      setDiscForm({
        incidentDate: new Date().toISOString().slice(0, 10),
        incidentType: 'RETARD',
        severity: 'LOW',
        description: '',
        sanction: '',
      })
      loadTabContent()
    } else {
      alert(res.error?.message || "Erreur lors de l'ajout de l'incident")
    }
  }

  const handleDeleteDiscipline = async (did) => {
    if (!window.confirm('Supprimer cet enregistrement disciplinaire ?')) return
    const res = await studentAcademicService.deleteDisciplineRecord(student.id, did)
    if (res.success) loadTabContent()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fullName}
      description={`Dossier scolaire complet • Matricule : ${student.studentNumber || 'En attente'}`}
      size="xl"
    >
      <div className="space-y-3 text-xs">
        {/* Top Badges & Quick actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
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

        {/* Tab Strip */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-2xs font-medium transition-colors ${
              activeTab === 'general' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="h-3 w-3" />
            Général & Tuteurs
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-2xs font-medium transition-colors ${
              activeTab === 'emergency' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Phone className="h-3 w-3" />
            Urgences
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('siblings')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-2xs font-medium transition-colors ${
              activeTab === 'siblings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="h-3 w-3" />
            Fratrie
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medical')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-2xs font-medium transition-colors ${
              activeTab === 'medical' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HeartPulse className="h-3 w-3 text-rose-500" />
            Médical
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discipline')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-2xs font-medium transition-colors ${
              activeTab === 'discipline' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertOctagon className="h-3 w-3 text-amber-500" />
            Discipline
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-2xs font-medium transition-colors ${
              activeTab === 'documents' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-3 w-3 text-blue-500" />
            Documents PDF
          </button>
        </div>

        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-3">
            <div>
              <h4 className="mb-1.5 text-2xs font-bold uppercase tracking-wider text-slate-400">
                Identité & Coordonnées
              </h4>
              <div className="grid grid-cols-2 gap-2.5 rounded border border-slate-200 bg-slate-50 p-2.5 sm:grid-cols-4">
                <div>
                  <span className="text-3xs text-slate-400">E-mail</span>
                  <div className="font-medium text-slate-900 truncate">{user.email || '-'}</div>
                </div>
                <div>
                  <span className="text-3xs text-slate-400">Téléphone</span>
                  <div className="font-medium text-slate-900">{user.phone || '-'}</div>
                </div>
                <div>
                  <span className="text-3xs text-slate-400">Date de naissance</span>
                  <div className="font-medium text-slate-900">{student.birthDate || '-'}</div>
                </div>
                <div>
                  <span className="text-3xs text-slate-400">Genre</span>
                  <div className="font-medium text-slate-900">
                    {student.gender === 'MALE'
                      ? 'Masculin'
                      : student.gender === 'FEMALE'
                        ? 'Féminin'
                        : student.gender || '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-3xs text-slate-400">Adresse</span>
                  <div className="font-medium text-slate-900">{student.address || '-'}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-3xs text-slate-400">Établissement précédent</span>
                  <div className="font-medium text-slate-900">{student.previousSchool || '-'}</div>
                </div>
              </div>
            </div>

            {/* Guardians */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                  Tuteurs légaux ({guardians.length})
                </h4>
                {canManage && onOpenAssignGuardian && (
                  <Button
                    type="button"
                    variant="outline"
                    size="2xs"
                    onClick={() => onOpenAssignGuardian(student)}
                  >
                    + Associer un tuteur
                  </Button>
                )}
              </div>

              {guardians.length === 0 ? (
                <div className="rounded border border-dashed border-slate-200 p-3 text-center text-2xs text-slate-500">
                  Aucun tuteur légal associé.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {guardians.map((g, idx) => (
                    <div
                      key={g.guardianId || idx}
                      className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{g.guardianName}</div>
                          <div className="text-3xs text-slate-500">{g.relationship || 'Tuteur'}</div>
                        </div>
                        {g.primaryContact && (
                          <span className="rounded bg-emerald-50 px-1 py-0.2 text-3xs font-semibold text-emerald-700 border border-emerald-200">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 space-y-0.5 border-t border-slate-100 pt-1 text-2xs text-slate-600">
                        {g.guardianEmail && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{g.guardianEmail}</span>
                          </div>
                        )}
                        {g.guardianPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{g.guardianPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EMERGENCY CONTACTS */}
        {activeTab === 'emergency' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-800">
                Personnes à joindre en cas d'urgence médicale ou administrative
              </span>
              <Button size="2xs" onClick={() => setEcFormOpen(true)}>
                <Plus className="mr-1 h-3 w-3" />
                Nouveau contact
              </Button>
            </div>

            <div className="overflow-hidden rounded border border-slate-200 bg-white">
              <table className="w-full text-left text-2xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Nom</th>
                    <th className="px-3 py-2">Lien</th>
                    <th className="px-3 py-2">Téléphone</th>
                    <th className="px-3 py-2">E-mail</th>
                    <th className="px-3 py-2">Priorité</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emergencyContacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        Aucun contact d'urgence enregistré.
                      </td>
                    </tr>
                  ) : (
                    emergencyContacts.map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2 font-medium text-slate-900">{c.name}</td>
                        <td className="px-3 py-2 text-slate-600">{c.relationship}</td>
                        <td className="px-3 py-2 font-mono font-medium text-slate-800">{c.phone}</td>
                        <td className="px-3 py-2 text-slate-500">{c.email || '—'}</td>
                        <td className="px-3 py-2">
                          {c.primary ? (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-3xs font-semibold text-rose-700 border border-rose-200">
                              Prioritaire
                            </span>
                          ) : (
                            <span className="text-slate-400">Secondaire</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button size="2xs" variant="ghost" onClick={() => handleDeleteContact(c.id)}>
                            <Trash2 className="h-3 w-3 text-rose-500" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Add Contact */}
            <Modal
              isOpen={ecFormOpen}
              onClose={() => setEcFormOpen(false)}
              title="Ajouter un contact d'urgence"
              size="sm"
            >
              <form onSubmit={handleSaveContact} className="space-y-2.5 text-xs">
                <Input
                  label="Nom complet *"
                  required
                  value={ecForm.name}
                  onChange={(e) => setEcForm({ ...ecForm, name: e.target.value })}
                />
                <Input
                  label="Lien de parenté (ex: Oncle, Voisin, Médecin) *"
                  required
                  value={ecForm.relationship}
                  onChange={(e) => setEcForm({ ...ecForm, relationship: e.target.value })}
                />
                <Input
                  label="Téléphone d'urgence *"
                  required
                  value={ecForm.phone}
                  onChange={(e) => setEcForm({ ...ecForm, phone: e.target.value })}
                />
                <Input
                  type="email"
                  label="E-mail (optionnel)"
                  value={ecForm.email}
                  onChange={(e) => setEcForm({ ...ecForm, email: e.target.value })}
                />
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="primaryContactCheck"
                    checked={ecForm.primary}
                    onChange={(e) => setEcForm({ ...ecForm, primary: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-slate-300"
                  />
                  <label htmlFor="primaryContactCheck" className="text-2xs text-slate-700">
                    Définir comme contact prioritaire en premier appel
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="xs" onClick={() => setEcFormOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="xs">
                    Ajouter
                  </Button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* TAB 3: SIBLINGS (Fratrie) */}
        {activeTab === 'siblings' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-800">
                Frères et sœurs scolarisés dans l'établissement
              </span>
              <Button size="2xs" onClick={() => setSiblingFormOpen(true)}>
                <Plus className="mr-1 h-3 w-3" />
                Lier un élève
              </Button>
            </div>

            <div className="overflow-hidden rounded border border-slate-200 bg-white">
              <table className="w-full text-left text-2xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Élève</th>
                    <th className="px-3 py-2">Matricule</th>
                    <th className="px-3 py-2">Classe actuelle</th>
                    <th className="px-3 py-2">Origine du lien</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {siblings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        Aucun frère ou sœur identifié dans l'école.
                      </td>
                    </tr>
                  ) : (
                    siblings.map((s) => (
                      <tr key={s.id}>
                        <td className="px-3 py-2 font-medium text-slate-900">{s.siblingName}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{s.siblingStudentNumber || '-'}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {s.siblingClassName || <span className="italic text-slate-400">Non inscrit</span>}
                        </td>
                        <td className="px-3 py-2">
                          {s.derivedFromGuardians ? (
                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-3xs font-medium text-blue-700 border border-blue-200">
                              Déduit des tuteurs
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-3xs font-medium text-slate-700">
                              Manuel
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {!s.derivedFromGuardians && (
                            <Button size="2xs" variant="ghost" onClick={() => handleDeleteSibling(s.id)}>
                              <Trash2 className="h-3 w-3 text-rose-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Add Sibling */}
            <Modal
              isOpen={siblingFormOpen}
              onClose={() => setSiblingFormOpen(false)}
              title="Lier un frère ou une sœur"
              size="sm"
            >
              <form onSubmit={handleSaveSibling} className="space-y-3 text-xs">
                <Input
                  type="number"
                  label="ID de l'autre élève *"
                  required
                  placeholder="Ex: 12"
                  value={siblingStudentId}
                  onChange={(e) => setSiblingStudentId(e.target.value)}
                />
                <Input
                  label="Lien (FRATRIE, DEMI-FRERE, DEMI-SOEUR)"
                  value={siblingRelationship}
                  onChange={(e) => setSiblingRelationship(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="xs" onClick={() => setSiblingFormOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="xs">
                    Créer le lien
                  </Button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* TAB 4: MEDICAL NOTES (RESTRICTED ACCESS) */}
        {activeTab === 'medical' && (
          <div className="space-y-3">
            {/* Restricted Banner */}
            <div className="flex items-start gap-2.5 rounded border border-rose-300 bg-rose-50 p-3 text-rose-900">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
              <div className="text-2xs">
                <span className="font-bold uppercase tracking-wider">
                  Accès Médical Confidentiel & Tracé
                </span>
                <p className="mt-0.5 text-rose-700">
                  Ce dossier est réservé aux administrateurs et au personnel soignant scolaire. Chaque consultation et modification est irrévocablement enregistrée dans le journal d'audit de sécurité.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveMedical} className="space-y-3 rounded border border-slate-200 bg-white p-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Groupe Sanguin (ex: O+, A-, AB+)"
                  value={medForm.bloodGroup}
                  onChange={(e) => setMedForm({ ...medForm, bloodGroup: e.target.value })}
                  placeholder="O+"
                />
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="restrictedAccessCheck"
                    checked={medForm.restrictedAccess}
                    onChange={(e) => setMedForm({ ...medForm, restrictedAccess: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-slate-300"
                  />
                  <label htmlFor="restrictedAccessCheck" className="text-2xs font-medium text-slate-700">
                    Accès strictement restreint (infirmerie / direction)
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-2xs font-medium text-slate-700">
                  Allergies connues (alimentaires, médicamenteuses, contact)
                </label>
                <textarea
                  rows={2}
                  value={medForm.allergies}
                  onChange={(e) => setMedForm({ ...medForm, allergies: e.target.value })}
                  className="w-full rounded border border-slate-200 p-2 text-xs focus:outline-none"
                  placeholder="Arachides, pénicilline, piqûres de guêpes..."
                />
              </div>

              <div>
                <label className="mb-1 block text-2xs font-medium text-slate-700">
                  Conditions médicales chroniques (asthme, diabète, épilepsie)
                </label>
                <textarea
                  rows={2}
                  value={medForm.medicalConditions}
                  onChange={(e) => setMedForm({ ...medForm, medicalConditions: e.target.value })}
                  className="w-full rounded border border-slate-200 p-2 text-xs focus:outline-none"
                  placeholder="Asthme à l'effort, traitement régulier..."
                />
              </div>

              <div>
                <label className="mb-1 block text-2xs font-medium text-slate-700">
                  Protocole d'urgence (instructions immédiates en cas de crise)
                </label>
                <textarea
                  rows={2}
                  value={medForm.emergencyInstructions}
                  onChange={(e) => setMedForm({ ...medForm, emergencyInstructions: e.target.value })}
                  className="w-full rounded border border-slate-200 p-2 text-xs focus:outline-none"
                  placeholder="Administrer Ventoline (2 bouffées), appeler le 15 si persistance..."
                />
              </div>

              {medicalNote?.lastUpdated && (
                <p className="text-3xs text-slate-400">
                  Dernière mise à jour le {medicalNote.lastUpdated}
                </p>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" size="xs" disabled={savingMed || !isMedicalStaff}>
                  {savingMed ? 'Enregistrement...' : 'Enregistrer le dossier médical'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: DISCIPLINE */}
        {activeTab === 'discipline' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-semibold text-slate-800">
                Incidents disciplinaires, retenues et sanctions
              </span>
              <Button size="2xs" onClick={() => setDiscFormOpen(true)}>
                <Plus className="mr-1 h-3 w-3" />
                Signaler un incident
              </Button>
            </div>

            <div className="overflow-hidden rounded border border-slate-200 bg-white">
              <table className="w-full text-left text-2xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Gravité</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Sanction</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disciplineRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        Aucun incident disciplinaire enregistré pour cet élève.
                      </td>
                    </tr>
                  ) : (
                    disciplineRecords.map((d) => (
                      <tr key={d.id}>
                        <td className="px-3 py-2 font-mono text-slate-600">{d.incidentDate}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{d.incidentType}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-3xs font-semibold ${
                              d.severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : d.severity === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {d.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600 max-w-xs truncate">{d.description || '—'}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{d.sanction || 'Aucune'}</td>
                        <td className="px-3 py-2 text-right">
                          <Button size="2xs" variant="ghost" onClick={() => handleDeleteDiscipline(d.id)}>
                            <Trash2 className="h-3 w-3 text-rose-500" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Add Discipline */}
            <Modal
              isOpen={discFormOpen}
              onClose={() => setDiscFormOpen(false)}
              title="Enregistrer un incident disciplinaire"
              size="md"
            >
              <form onSubmit={handleSaveDiscipline} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="date"
                    label="Date de l'incident *"
                    required
                    value={discForm.incidentDate}
                    onChange={(e) => setDiscForm({ ...discForm, incidentDate: e.target.value })}
                  />
                  <div>
                    <label className="mb-1 block text-2xs font-medium text-slate-700">Type *</label>
                    <select
                      value={discForm.incidentType}
                      onChange={(e) => setDiscForm({ ...discForm, incidentType: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none"
                    >
                      <option value="RETARD">Retard injustifié</option>
                      <option value="ABSENCE">Absence non justifiée</option>
                      <option value="BAVARDAGE">Perturbation de cours</option>
                      <option value="INSOLENCE">Insolence / Manque de respect</option>
                      <option value="VIOLENCE">Comportement agressif</option>
                      <option value="FRAUDE">Fraude / Triche</option>
                      <option value="AUTRE">Autre incident</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-2xs font-medium text-slate-700">Gravité *</label>
                    <select
                      value={discForm.severity}
                      onChange={(e) => setDiscForm({ ...discForm, severity: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:outline-none"
                    >
                      <option value="LOW">Faible (Avertissement)</option>
                      <option value="MEDIUM">Moyenne (Heure de colle)</option>
                      <option value="HIGH">Élevée (Commission)</option>
                      <option value="CRITICAL">Critique (Exclusion)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-2xs font-medium text-slate-700">
                    Description des faits *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={discForm.description}
                    onChange={(e) => setDiscForm({ ...discForm, description: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-xs focus:outline-none"
                    placeholder="Circonstances, témoins, propos constatés..."
                  />
                </div>

                <Input
                  label="Sanction ou décision prise"
                  placeholder="1h de retenue le mercredi, travail d'intérêt général..."
                  value={discForm.sanction}
                  onChange={(e) => setDiscForm({ ...discForm, sanction: e.target.value })}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="xs" onClick={() => setDiscFormOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" size="xs">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* TAB 6: DOCUMENTS & CARTES PDF */}
        {activeTab === 'documents' && (
          <div className="space-y-3">
            <p className="text-2xs text-slate-500">
              Générez et imprimez instantanément les documents officiels normalisés au format PDF.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Carte Scolaire */}
              <div className="rounded border border-slate-200 bg-white p-3 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Carte Scolaire</h4>
                  <p className="text-3xs text-slate-400">Badge plastifiable avec matricule</p>
                </div>
                <Button
                  size="2xs"
                  className="w-full"
                  onClick={() => studentAcademicService.downloadIdCardPdf(student.id)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Télécharger (PDF)
                </Button>
              </div>

              {/* Certificat de Scolarité / Transfert */}
              <div className="rounded border border-slate-200 bg-white p-3 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Certificat de Scolarité</h4>
                  <p className="text-3xs text-slate-400">Attestation d'inscription en cours</p>
                </div>
                <Button
                  size="2xs"
                  variant="outline"
                  className="w-full"
                  onClick={() => studentAcademicService.downloadTransferCertPdf(student.id)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Télécharger (PDF)
                </Button>
              </div>

              {/* Certificat de Radiation / Sortie */}
              <div className="rounded border border-slate-200 bg-white p-3 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Certificat de Radiation</h4>
                  <p className="text-3xs text-slate-400">Attestation de sortie de l'établissement</p>
                </div>
                <Button
                  size="2xs"
                  variant="outline"
                  className="w-full"
                  onClick={() => studentAcademicService.downloadLeavingCertPdf(student.id)}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Télécharger (PDF)
                </Button>
              </div>
            </div>
          </div>
        )}

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
