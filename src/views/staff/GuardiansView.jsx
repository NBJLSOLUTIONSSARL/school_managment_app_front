import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Search,
  Plus,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  Link as LinkIcon,
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { guardianService } from '../../services/guardianService';
import Modal from '../../components/common/Modal';

export default function GuardiansView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCreateGuardianModalOpen, setIsCreateGuardianModalOpen] = useState(false);
  const [guardiansList, setGuardiansList] = useState([]);
  const [guardianSearch, setGuardianSearch] = useState('');

  const [assignForm, setAssignForm] = useState({
    guardianId: '',
    relationship: 'FATHER',
    isPrimary: true,
  });

  const [createGuardianForm, setCreateGuardianForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    relationship: 'FATHER',
    isEmergencyContact: true,
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentService.getStudents({
        name: search || undefined,
        page,
        size: 15,
      });
      setStudents(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Impossible de charger la liste des élèves.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStudents();
  };

  const openAssignModal = async (student) => {
    setSelectedStudent(student);
    setAssignForm({
      guardianId: '',
      relationship: 'FATHER',
      isPrimary: true,
    });
    setIsAssignModalOpen(true);
    try {
      const res = await guardianService.searchGuardians();
      setGuardiansList(Array.isArray(res) ? res : res.content || []);
    } catch {
      setGuardiansList([]);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !assignForm.guardianId) return;
    setActionLoading(true);
    try {
      await studentService.assignGuardian(selectedStudent.id, {
        guardianId: Number(assignForm.guardianId),
        relationship: assignForm.relationship,
        isPrimary: assignForm.isPrimary,
      });
      setIsAssignModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Impossible d\'associer ce tuteur.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateGuardianSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      const newGuardian = await guardianService.createGuardian({
        firstName: createGuardianForm.firstName,
        lastName: createGuardianForm.lastName,
        email: createGuardianForm.email,
        phone: createGuardianForm.phone,
      });

      const guardianId = newGuardian.id || newGuardian.guardianId;
      if (guardianId) {
        await studentService.assignGuardian(selectedStudent.id, {
          guardianId: Number(guardianId),
          relationship: createGuardianForm.relationship,
          isPrimary: createGuardianForm.isEmergencyContact,
        });
      }

      setIsCreateGuardianModalOpen(false);
      setCreateGuardianForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        relationship: 'FATHER',
        isEmergencyContact: true,
      });
      fetchStudents();
    } catch (err) {
      alert(err.message || 'Erreur lors de la création du tuteur.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F]">
              Gestion des tuteurs et parents
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Association des responsables légaux, coordonnées d'urgence et filiation des élèves.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStudents}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="academy-card p-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un élève par nom ou prénom..."
            className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#16222F] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des fiches élèves et tuteurs...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun élève trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#EFECE6] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Élève</th>
                  <th className="py-3.5 px-4">Matricule</th>
                  <th className="py-3.5 px-4">Tuteurs & Parents associés</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {students.map((student) => {
                  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
                  const guardians = student.guardians || [];

                  return (
                    <tr key={student.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#16222F]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#16222F] text-[#DFC2A0] flex items-center justify-center font-bold text-xs shrink-0">
                            {student.firstName?.[0] || 'E'}
                          </div>
                          <div>
                            <span>{fullName}</span>
                            <span className="text-[10px] text-[#78716C] block">
                              {student.email || '—'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#78716C]">
                        {student.studentNumber || `ID #${student.id}`}
                      </td>
                      <td className="py-3 px-4">
                        {guardians.length === 0 ? (
                          <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Aucun tuteur associé
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {guardians.map((g, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[11px] text-[#16222F]">
                                <span className="font-semibold">
                                  {g.firstName} {g.lastName}
                                </span>
                                <span className="text-[10px] text-[#78716C] bg-slate-100 px-1.5 py-0.5 rounded border">
                                  {g.relationship || 'Tuteur'}
                                </span>
                                {g.phone && (
                                  <span className="text-[10px] text-[#78716C] flex items-center gap-1">
                                    <Phone className="w-2.5 h-2.5" />
                                    {g.phone}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openAssignModal(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Associer un tuteur</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#EFECE6] flex items-center justify-between text-xs text-[#78716C]">
            <span>Page {page + 1} sur {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#EFECE6] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#EFECE6] disabled:opacity-40 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Associer un tuteur à ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#16222F] font-semibold mb-1">
              Sélectionner un tuteur / parent existant :
            </label>
            <select
              value={assignForm.guardianId}
              onChange={(e) => setAssignForm({ ...assignForm, guardianId: e.target.value })}
              required
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            >
              <option value="">-- Choisir un tuteur --</option>
              {guardiansList.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.firstName} {g.lastName} ({g.phone || g.email || `ID #${g.id}`})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">
                Lien de parenté :
              </label>
              <select
                value={assignForm.relationship}
                onChange={(e) => setAssignForm({ ...assignForm, relationship: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              >
                <option value="FATHER">Père</option>
                <option value="MOTHER">Mère</option>
                <option value="GUARDIAN">Tuteur légal</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-[#16222F] font-semibold mb-1">
                Contact principal :
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={assignForm.isPrimary}
                  onChange={(e) => setAssignForm({ ...assignForm, isPrimary: e.target.checked })}
                  className="rounded text-[#16222F] focus:ring-[#C5A880]"
                />
                <label htmlFor="isPrimary" className="text-xs text-[#16222F] cursor-pointer">
                  Contact d'urgence prioritaire
                </label>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFECE6] flex items-center justify-between">
            <span className="text-[11px] text-[#78716C]">Le tuteur n'existe pas encore ?</span>
            <button
              type="button"
              onClick={() => {
                setIsAssignModalOpen(false);
                setIsCreateGuardianModalOpen(true);
              }}
              className="text-[11px] font-bold text-[#C5A880] hover:underline cursor-pointer"
            >
              Créer un nouveau tuteur
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Association...' : 'Enregistrer l\'association'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCreateGuardianModalOpen}
        onClose={() => setIsCreateGuardianModalOpen(false)}
        title="Créer un nouveau tuteur légal"
      >
        <form onSubmit={handleCreateGuardianSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Prénom :</label>
              <input
                type="text"
                required
                value={createGuardianForm.firstName}
                onChange={(e) => setCreateGuardianForm({ ...createGuardianForm, firstName: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Nom :</label>
              <input
                type="text"
                required
                value={createGuardianForm.lastName}
                onChange={(e) => setCreateGuardianForm({ ...createGuardianForm, lastName: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Email :</label>
              <input
                type="email"
                required
                value={createGuardianForm.email}
                onChange={(e) => setCreateGuardianForm({ ...createGuardianForm, email: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Téléphone :</label>
              <input
                type="tel"
                value={createGuardianForm.phone}
                onChange={(e) => setCreateGuardianForm({ ...createGuardianForm, phone: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Lien de parenté :</label>
              <select
                value={createGuardianForm.relationship}
                onChange={(e) => setCreateGuardianForm({ ...createGuardianForm, relationship: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              >
                <option value="FATHER">Père</option>
                <option value="MOTHER">Mère</option>
                <option value="GUARDIAN">Tuteur légal</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-[#16222F] font-semibold mb-1">Urgence :</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="createIsEmergency"
                  checked={createGuardianForm.isEmergencyContact}
                  onChange={(e) => setCreateGuardianForm({ ...createGuardianForm, isEmergencyContact: e.target.checked })}
                  className="rounded text-[#16222F] focus:ring-[#C5A880]"
                />
                <label htmlFor="createIsEmergency" className="text-xs text-[#16222F] cursor-pointer">
                  Contact prioritaire
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateGuardianModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#EFECE6] text-xs font-semibold text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#16222F] text-[#DFC2A0] text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Création...' : 'Créer et associer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
