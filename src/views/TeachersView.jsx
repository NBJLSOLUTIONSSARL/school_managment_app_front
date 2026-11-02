import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building2
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { teacherService } from '../services/teacherService';
import { departmentService } from '../services/departmentService';

export default function TeachersView() {
  const { searchQuery, hasAnyRole } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [localSearch, setLocalSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    contractType: 'CDI',
    hireDate: '2022-09-01',
    departmentId: '',
  });

  const canManage = hasAnyRole(['ROLE_ADMIN']);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const depId = selectedDepartment !== 'ALL' ? Number(selectedDepartment) : null;
      const [teachersRes, deptsRes] = await Promise.all([
        teacherService.getTeachers(depId),
        departmentService.getDepartments()
      ]);

      const teachersList = Array.isArray(teachersRes) ? teachersRes : (teachersRes?.data || []);
      const deptsList = Array.isArray(deptsRes) ? deptsRes : (deptsRes?.data || []);

      setTeachers(teachersList);
      setDepartments(deptsList);
    } catch (err) {
      setError(err.message || 'Impossible de charger la liste des enseignants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDepartment]);

  const handleOpenAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      contractType: 'CDI',
      hireDate: new Date().toISOString().split('T')[0],
      departmentId: departments.length > 0 ? departments[0].id : '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      firstName: teacher.user?.firstName || '',
      lastName: teacher.user?.lastName || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      specialization: teacher.specialization || '',
      contractType: teacher.contractType || 'CDI',
      hireDate: teacher.hireDate || '',
      departmentId: teacher.department?.id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await teacherService.createTeacher(formData);
      setIsAddModalOpen(false);
      setSuccessMessage('Enseignant enregistré avec succès dans MySQL.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'enseignant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setSubmitting(true);
    setError(null);
    try {
      await teacherService.updateTeacher(selectedTeacher.id, formData);
      setIsEditModalOpen(false);
      setSuccessMessage('Profil enseignant mis à jour avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant de MySQL ?')) {
      return;
    }
    setError(null);
    try {
      await teacherService.deleteTeacher(id);
      setSuccessMessage('Enseignant supprimé avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer cet enseignant.');
    }
  };

  const query = (localSearch || searchQuery).toLowerCase().trim();

  const filteredTeachers = teachers.filter((t) => {
    const fullName = `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.toLowerCase();
    const spec = (t.specialization || '').toLowerCase();
    const email = (t.user?.email || '').toLowerCase();
    return fullName.includes(query) || spec.includes(query) || email.includes(query);
  });

  const cdiCount = teachers.filter((t) => t.contractType === 'CDI').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Corps professoral
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Enseignants
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Gérez les professeurs et leurs affectations départementales
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-end">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter un enseignant</span>
            </button>
          </div>
        )}

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Professeurs"
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
            onClick={loadData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={GraduationCap}
          title="Total enseignants"
          value={teachers.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Corps professoral réel"
        />
        <StatCard
          icon={Users}
          title="Titulaires (CDI)"
          value={cdiCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Contrat à durée indéterminée"
        />
        <StatCard
          icon={Building2}
          title="Départements"
          value={departments.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Disciplines académiques"
        />
        <StatCard
          icon={TrendingUp}
          title="Activité"
          value="100%"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Enseignants affectés"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher par nom ou spécialité..."
            className="w-full bg-white border border-[#EFECE6] rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#16222F] placeholder:text-[#A8A29E] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2.5 text-xs font-semibold text-[#16222F] shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les départements</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des enseignants depuis MySQL...</span>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-[#C5A880] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-[#16222F]">
              Aucun enseignant trouvé
            </h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Aucun professeur n'est enregistré pour ce département ou ce mot-clé.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  <th className="py-4 px-6">Photo</th>
                  <th className="py-4 px-6">Nom complet</th>
                  <th className="py-4 px-6">Spécialité & Discipline</th>
                  <th className="py-4 px-6">Département</th>
                  <th className="py-4 px-6">Statut & Contrat</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2] text-sm">
                {filteredTeachers.map((teacher) => {
                  const user = teacher.user || {};
                  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Enseignant';
                  const avatar = user.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";

                  return (
                    <tr key={teacher.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-6">
                        <img
                          src={avatar}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover border border-[#EFECE6]"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80";
                          }}
                        />
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#16222F]">
                        <span className="block">{fullName}</span>
                        <span className="block text-xs text-[#A8A29E] mt-0.5">
                          {user.email || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#16222F] text-xs font-medium">
                        {teacher.specialization || 'Généraliste'}
                      </td>
                      <td className="py-4 px-6 text-[#78716C] text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EFECE6] text-xs">
                          {teacher.department?.name || 'Département général'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{teacher.contractType || 'Actif'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          onClick={() => handleOpenView(teacher)}
                          title="Consulter"
                          className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(teacher)}
                              title="Modifier"
                              className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(teacher.id)}
                              title="Supprimer"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un enseignant dans MySQL"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Spécialité *</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Ex: Mathématiques"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Type de contrat</label>
              <select
                value={formData.contractType}
                onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
              >
                <option value="CDI">CDI (Titulaire)</option>
                <option value="CDD">CDD (Contractuel)</option>
                <option value="VACATAIRE">Vacataire</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Département académique</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
              >
                <option value="">Aucun département</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Date d'embauche</label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

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
        title="Modifier l'enseignant"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Nom *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Spécialité</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

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

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Fiche Enseignant"
      >
        {selectedTeacher && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-[#F4EDE2]">
              <img
                src={selectedTeacher.user?.photoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border border-[#EFECE6]"
              />
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  {selectedTeacher.user?.firstName} {selectedTeacher.user?.lastName}
                </h3>
                <p className="text-[#78716C]">{selectedTeacher.specialization}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedTeacher.contractType || 'CDI'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[#A8A29E] font-medium">Email</span>
                <span className="block text-[#16222F] font-semibold">{selectedTeacher.user?.email || '-'}</span>
              </div>
              <div>
                <span className="block text-[#A8A29E] font-medium">Téléphone</span>
                <span className="block text-[#16222F] font-semibold">{selectedTeacher.user?.phone || '-'}</span>
              </div>
              <div>
                <span className="block text-[#A8A29E] font-medium">Département</span>
                <span className="block text-[#16222F] font-semibold">{selectedTeacher.department?.name || 'Général'}</span>
              </div>
              <div>
                <span className="block text-[#A8A29E] font-medium">Date d'embauche</span>
                <span className="block text-[#16222F] font-semibold">{selectedTeacher.hireDate || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
