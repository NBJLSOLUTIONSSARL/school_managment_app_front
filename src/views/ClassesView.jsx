import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  Eye,
  Trash2,
  GraduationCap,
  Mail,
  Calendar,
  X,
  Check
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { departmentService } from '../services/departmentService';
import { teacherService } from '../services/teacherService';

export default function ClassesView() {
  const { hasAnyRole, searchQuery } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalError, setModalError] = useState(null);
  const [localSearch, setLocalSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewTeachersModalOpen, setIsViewTeachersModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewingDept, setViewingDept] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptsRes, teachersRes] = await Promise.all([
        departmentService.getDepartments(),
        teacherService.getTeachers()
      ]);
      const dList = Array.isArray(deptsRes) ? deptsRes : (deptsRes?.data || []);
      const tList = Array.isArray(teachersRes) ? teachersRes : (teachersRes?.data || []);
      setDepartments(dList);
      setTeachers(tList);
    } catch (err) {
      setError(err.message || 'Impossible de charger la structure pédagogique.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setModalError(null);
    setSelectedDept(null);
    setDeptName('');
    setSelectedTeacherIds([]);
    setTeacherSearch('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setModalError(null);
    setSelectedDept(dept);
    setDeptName(dept.name || '');
    const currentTeacherIds = teachers.filter((t) => t.department?.id === dept.id).map((t) => t.id);
    setSelectedTeacherIds(currentTeacherIds);
    setTeacherSearch('');
    setIsEditModalOpen(true);
  };

  const handleOpenViewTeachers = (dept) => {
    setViewingDept(dept);
    setIsViewTeachersModalOpen(true);
  };

  const toggleTeacherSelection = (teacherId) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setModalError('Le nom du département est obligatoire.');
      return;
    }
    setSubmitting(true);
    setModalError(null);
    try {
      await departmentService.createDepartment({
        name: deptName.trim(),
        teacherIds: selectedTeacherIds
      });
      setIsAddModalOpen(false);
      setSuccessMessage('Département créé avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Erreur lors de la création du département.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    if (!deptName.trim()) {
      setModalError('Le nom du département est obligatoire.');
      return;
    }
    setSubmitting(true);
    setModalError(null);
    try {
      await departmentService.updateDepartment(selectedDept.id, {
        name: deptName.trim(),
        teacherIds: selectedTeacherIds
      });
      setIsEditModalOpen(false);
      setSuccessMessage('Département mis à jour avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dept) => {
    const assigned = teachers.filter((t) => t.department?.id === dept.id);
    if (assigned.length > 0) {
      alert(`Impossible de supprimer le département "${dept.name}" car ${assigned.length} enseignant(s) y sont actuellement rattaché(s). Veuillez d'abord modifier leur département.`);
      return;
    }
    if (!window.confirm(`Confirmez-vous la suppression du département académique "${dept.name}" de la base de données ?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await departmentService.deleteDepartment(dept.id);
      setSuccessMessage(`Département "${dept.name}" supprimé avec succès.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression du département.');
    } finally {
      setLoading(false);
    }
  };

  const q = (localSearch || searchQuery).toLowerCase().trim();
  const filteredDepartments = departments.filter((dept) => {
    if (!q) return true;
    const name = (dept.name || '').toLowerCase();
    const id = (dept.id || '').toString();
    return name.includes(q) || id.includes(q);
  });

  const activeDeptsCount = departments.filter((d) => teachers.some((t) => t.department?.id === d.id)).length;
  const emptyDeptsCount = departments.filter((d) => !teachers.some((t) => t.department?.id === d.id)).length;
  const viewingTeachers = viewingDept ? teachers.filter((t) => t.department?.id === viewingDept.id) : [];

  const filteredTeachersForModal = teachers.filter((t) => {
    if (!teacherSearch) return true;
    const searchLower = teacherSearch.toLowerCase();
    const fullName = `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.toLowerCase();
    const spec = (t.specialization || '').toLowerCase();
    return fullName.includes(searchLower) || spec.includes(searchLower);
  });

  const renderTeacherSelectionSection = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#16222F]">
          Enseignant(s) rattaché(s) au département
        </label>
        <span className="text-[11px] font-semibold text-[#78716C]">
          {selectedTeacherIds.length} sélectionné{selectedTeacherIds.length > 1 ? 's' : ''}
        </span>
      </div>

      {selectedTeacherIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-white border border-[#EFECE6] max-h-28 overflow-y-auto">
          {selectedTeacherIds.map((id) => {
            const teacher = teachers.find((t) => t.id === id);
            if (!teacher) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg bg-[#FAF7F2] border border-[#EFECE6] text-xs text-[#16222F]"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span className="font-semibold">
                  {teacher.user?.firstName} {teacher.user?.lastName}
                </span>
                {teacher.specialization && (
                  <span className="text-[11px] text-[#78716C]">({teacher.specialization})</span>
                )}
                <button
                  type="button"
                  onClick={() => toggleTeacherSelection(id)}
                  className="p-0.5 hover:bg-[#EFECE6] text-[#78716C] hover:text-[#16222F] rounded transition-colors cursor-pointer"
                  title="Retirer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="border border-[#EFECE6] rounded-xl overflow-hidden bg-white">
        <div className="relative border-b border-[#EFECE6] bg-[#FAF7F2]">
          <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            placeholder="Rechercher par nom ou spécialité..."
            className="w-full bg-transparent pl-8 pr-3 py-2 text-xs text-[#16222F] placeholder:text-[#A8A29E] focus:outline-hidden"
          />
        </div>
        <div className="max-h-48 overflow-y-auto divide-y divide-[#F4EDE2]">
          {filteredTeachersForModal.map((t) => {
            const isSelected = selectedTeacherIds.includes(t.id);
            const currentDeptName = t.department?.name;
            const isOtherDept = t.department && (!selectedDept || t.department.id !== selectedDept.id);
            return (
              <label
                key={t.id}
                className={`flex items-center justify-between p-2.5 hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#FAF7F2]/60' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTeacherSelection(t.id)}
                    className="w-4 h-4 rounded-md border-[#EFECE6] text-[#16222F] focus:ring-[#C5A880] cursor-pointer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[#16222F] truncate">
                        {t.user?.firstName} {t.user?.lastName}
                      </span>
                      {t.specialization && (
                        <span className="text-[11px] text-[#78716C] truncate">
                          — {t.specialization}
                        </span>
                      )}
                    </div>
                    {isOtherDept && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5 font-medium">
                        Actuellement : {currentDeptName}
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    <Check className="w-3 h-3" />
                    <span>Rattaché</span>
                  </span>
                )}
              </label>
            );
          })}
          {filteredTeachersForModal.length === 0 && (
            <div className="p-4 text-center text-xs text-[#78716C]">
              Aucun enseignant correspondant.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Départements Académiques
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Départements Académiques
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Organisation des pôles d'enseignement et affectation des enseignants
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter un département</span>
            </button>
          </div>
        )}

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Campus"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] text-xs text-[#78716C] flex items-start gap-3">
        <Building2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#16222F] block mb-0.5">Pôles Pédagogiques Académiques :</span>
          <span>
            Le système regroupe les enseignants par <strong>départements académiques</strong> enregistrés dans la table MySQL <code className="bg-white px-1.5 py-0.5 rounded border border-[#EFECE6] font-mono">departments</code>. Les effectifs et rattachements affichés ci-dessous sont synchronisés en temps réel avec la base de données.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Building2}
          title="Départements académiques"
          value={departments.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Pôles enregistrés en base"
        />
        <StatCard
          icon={Users}
          title="Enseignants affectés"
          value={teachers.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Corps professoral actif"
        />
        <StatCard
          icon={GraduationCap}
          title="Pôles actifs"
          value={activeDeptsCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Départements pourvus"
        />
        <StatCard
          icon={AlertCircle}
          title="Sans enseignant"
          value={emptyDeptsCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="En attente d'affectation"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher un département..."
            className="w-full bg-white border border-[#EFECE6] rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-[#16222F] placeholder:text-[#A8A29E] shadow-xs focus:outline-hidden focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des départements depuis MySQL...</span>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun département académique trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2] font-bold text-[#78716C] uppercase">
                  <th className="py-4 px-6">Identifiant</th>
                  <th className="py-4 px-6">Département académique</th>
                  <th className="py-4 px-6 text-center">Effectif</th>
                  <th className="py-4 px-6">Enseignants rattachés</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2]">
                {filteredDepartments.map((dept) => {
                  const assignedTeachers = teachers.filter((t) => t.department?.id === dept.id);
                  const teacherCount = assignedTeachers.length;
                  return (
                    <tr key={dept.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-[#78716C]">#{dept.id}</td>
                      <td className="py-4 px-6 font-bold text-[#16222F] text-sm">{dept.name}</td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            teacherCount > 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {teacherCount} {teacherCount > 1 ? 'enseignants' : 'enseignant'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#16222F]">
                        {teacherCount > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {assignedTeachers.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleOpenViewTeachers(dept)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] hover:bg-white border border-[#EFECE6] text-xs font-medium text-[#16222F] transition-colors cursor-pointer"
                                title="Cliquer pour afficher les détails"
                              >
                                <GraduationCap className="w-3 h-3 text-[#C5A880]" />
                                <span>{t.user?.firstName} {t.user?.lastName}</span>
                                {t.specialization && (
                                  <span className="text-[#78716C] text-[11px]">({t.specialization})</span>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#A8A29E] italic">
                            Aucun enseignant rattaché
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenViewTeachers(dept)}
                            className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                            title="Consulter les enseignants"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(dept)}
                                className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                                title="Modifier le département"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(dept)}
                                className="p-1.5 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Supprimer le département"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isViewTeachersModalOpen}
        onClose={() => setIsViewTeachersModalOpen(false)}
        title={viewingDept ? `Enseignants rattachés : ${viewingDept.name}` : 'Enseignants du département'}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4EDE2]">
            <div className="flex items-center gap-2 text-xs text-[#78716C]">
              <Building2 className="w-4 h-4 text-[#C5A880]" />
              <span>Département #{viewingDept?.id}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {viewingTeachers.length} {viewingTeachers.length > 1 ? 'enseignants' : 'enseignant'}
            </span>
          </div>

          {viewingTeachers.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <GraduationCap className="w-10 h-10 text-[#C5A880]/50 mx-auto" />
              <p className="text-sm font-semibold text-[#16222F]">Aucun enseignant rattaché</p>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                Ce département ne compte actuellement aucun enseignant. Vous pouvez lui affecter des enseignants en le modifiant.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {viewingTeachers.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.user?.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-[#EFECE6] shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#16222F]">
                        {t.user?.firstName} {t.user?.lastName}
                      </h4>
                      <p className="text-[#78716C]">{t.specialization || 'Enseignant'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-[#78716C] pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFECE6]">
                    {t.user?.email && (
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-[#A8A29E]" />
                        <span>{t.user.email}</span>
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-[11px]">
                      {t.contractType && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-[#EFECE6] font-semibold text-[#16222F]">
                          {t.contractType}
                        </span>
                      )}
                      {t.hireDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#A8A29E]" />
                          <span>Depuis le {t.hireDate}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsViewTeachersModalOpen(false)}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un département académique"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Nom du département *</label>
            <input
              type="text"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="Ex: Sciences Économiques & Sociales"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-hidden focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          {renderTeacherSelectionSection()}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le département"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Nom du département *</label>
            <input
              type="text"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-hidden focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          {renderTeacherSelectionSection()}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Mettre à jour</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
