import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';

export default function StudentsView() {
  const { searchQuery, hasAnyRole } = useAuth();
  const [students, setStudents] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [localSearch, setLocalSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'MALE',
    address: '',
    previousSchool: '',
  });

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = (localSearch || searchQuery).trim();
      const params = {
        page,
        size: 20,
      };
      if (q) params.name = q;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const data = await studentService.getStudents(params);
      const list = data.content || (Array.isArray(data) ? data : []);
      setStudents(list);
      setTotalElements(data.totalElements !== undefined ? data.totalElements : list.length);
    } catch (err) {
      setError(err.message || 'Impossible de charger les élèves.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '2010-01-01',
      gender: 'MALE',
      address: '',
      previousSchool: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.user?.firstName || '',
      lastName: student.user?.lastName || '',
      email: student.user?.email || '',
      phone: student.user?.phone || '',
      birthDate: student.birthDate || '',
      gender: student.gender || 'MALE',
      address: student.address || '',
      previousSchool: student.previousSchool || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await studentService.createStudent(formData);
      setIsAddModalOpen(false);
      setSuccessMessage('Élève enregistré avec succès dans la base de données.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchStudents();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'élève.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    setError(null);
    try {
      await studentService.updateStudent(selectedStudent.id, formData);
      setIsEditModalOpen(false);
      setSuccessMessage('Informations de l\'élève mises à jour avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchStudents();
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet élève de MySQL ?')) {
      return;
    }
    setError(null);
    try {
      await studentService.deleteStudent(id);
      setSuccessMessage('Élève supprimé avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchStudents();
    } catch (err) {
      setError(err.message || 'Impossible de supprimer cet élève.');
    }
  };

  const activeCount = students.filter((s) => s.status === 'ACTIVE' || s.status === 'Actif').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Scolarité
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Élèves
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Consultez et gérez les dossiers officiels enregistrés dans MySQL
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter un élève</span>
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
            onClick={fetchStudents}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Users}
          title="Total élèves"
          value={totalElements.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Enregistrés dans MySQL"
        />
        <StatCard
          icon={GraduationCap}
          title="Élèves actifs"
          value={activeCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Statut régulier"
        />
        <StatCard
          icon={TrendingUp}
          title="Tuteurs associés"
          value={students.reduce((acc, s) => acc + (s.guardians?.length || 0), 0).toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Parents référencés"
        />
        <StatCard
          icon={FileText}
          title="Inscriptions"
          value={totalElements.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Dossiers validés"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher par nom ou matricule..."
            className="w-full bg-white border border-[#EFECE6] rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#16222F] placeholder:text-[#A8A29E] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2.5 text-xs font-semibold text-[#16222F] shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actif (ACTIVE)</option>
            <option value="INACTIVE">Inactif</option>
          </select>
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des données élèves depuis MySQL...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-12 h-12 text-[#C5A880] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-[#16222F]">
              Aucun élève trouvé dans la base de données
            </h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Aucun enregistrement ne correspond à vos critères de recherche.
            </p>
            {canManage && (
              <button
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-2 bg-[#16222F] text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-[#203144]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer le premier élève</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  <th className="py-4 px-6">Photo</th>
                  <th className="py-4 px-6">Nom complet & Matricule</th>
                  <th className="py-4 px-6">Email & Contact</th>
                  <th className="py-4 px-6">Genre / Naissance</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2] text-sm">
                {students.map((student) => {
                  const user = student.user || {};
                  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Élève';
                  const avatar = user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

                  return (
                    <tr key={student.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-6">
                        <img
                          src={avatar}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover border border-[#EFECE6]"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                          }}
                        />
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#16222F]">
                        <span className="block">{fullName}</span>
                        <span className="block text-xs text-[#A8A29E] font-mono mt-0.5">
                          {student.studentNumber || `ID-${student.id}`}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#78716C] text-xs">
                        <span className="block text-[#16222F] font-medium">{user.email || '-'}</span>
                        <span className="block text-[#A8A29E] mt-0.5">{user.phone || '-'}</span>
                      </td>
                      <td className="py-4 px-6 text-[#78716C] text-xs">
                        <span className="block">{student.gender === 'MALE' ? 'Masculin' : 'Féminin'}</span>
                        <span className="block text-[#A8A29E] mt-0.5">{student.birthDate || '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{student.status || 'ACTIVE'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1">
                        <button
                          onClick={() => handleOpenView(student)}
                          title="Voir le dossier"
                          className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(student)}
                              title="Modifier"
                              className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
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
        title="Ajouter un nouvel élève dans MySQL"
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
              <label className="block text-xs font-bold text-[#16222F] mb-1">Date de naissance *</label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Genre</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
              >
                <option value="MALE">Masculin</option>
                <option value="FEMALE">Féminin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Adresse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Établissement précédent</label>
            <input
              type="text"
              value={formData.previousSchool}
              onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
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
        title="Modifier l'élève"
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
              <label className="block text-xs font-bold text-[#16222F] mb-1">Téléphone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Date de naissance</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Adresse</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
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
        title="Dossier scolaire de l'élève"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-[#F4EDE2]">
              <img
                src={selectedStudent.user?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border border-[#EFECE6]"
              />
              <div>
                <h3 className="text-base font-bold text-[#16222F]">
                  {selectedStudent.user?.firstName} {selectedStudent.user?.lastName}
                </h3>
                <p className="text-[#78716C]">Matricule officiel : {selectedStudent.studentNumber}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedStudent.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[#A8A29E] font-medium">Email</span>
                <span className="block text-[#16222F] font-semibold">{selectedStudent.user?.email || '-'}</span>
              </div>
              <div>
                <span className="block text-[#A8A29E] font-medium">Téléphone</span>
                <span className="block text-[#16222F] font-semibold">{selectedStudent.user?.phone || '-'}</span>
              </div>
              <div>
                <span className="block text-[#A8A29E] font-medium">Date de naissance</span>
                <span className="block text-[#16222F] font-semibold">{selectedStudent.birthDate || '-'}</span>
              </div>
              <div>
                <span className="block text-[#A8A29E] font-medium">Genre</span>
                <span className="block text-[#16222F] font-semibold">{selectedStudent.gender || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[#A8A29E] font-medium">Adresse</span>
                <span className="block text-[#16222F] font-semibold">{selectedStudent.address || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="block text-[#A8A29E] font-medium">Établissement précédent</span>
                <span className="block text-[#16222F] font-semibold">{selectedStudent.previousSchool || '-'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F4EDE2]">
              <h4 className="font-bold text-[#16222F] mb-2">Tuteurs & Parents associés</h4>
              {!selectedStudent.guardians || selectedStudent.guardians.length === 0 ? (
                <p className="text-[#78716C] italic">Aucun tuteur associé dans MySQL.</p>
              ) : (
                <div className="space-y-2">
                  {selectedStudent.guardians.map((g, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#16222F] block">{g.guardianName}</span>
                        <span className="text-[10px] text-[#78716C] block">{g.relationship} • {g.guardianEmail}</span>
                      </div>
                      {g.primaryContact && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Contact principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
