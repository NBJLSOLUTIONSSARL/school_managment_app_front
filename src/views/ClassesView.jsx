import React, { useState, useEffect } from 'react';
import { School, Building2, Users, AlertCircle, Loader2, Plus, Search, Edit2, CheckCircle2 } from 'lucide-react';
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
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptName, setDeptName] = useState('');
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
    setDeptName('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setModalError(null);
    setSelectedDept(dept);
    setDeptName(dept.name || '');
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await departmentService.createDepartment({ name: deptName });
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
    setSubmitting(true);
    setModalError(null);
    try {
      await departmentService.updateDepartment(selectedDept.id, { name: deptName });
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

  const q = (localSearch || searchQuery).toLowerCase().trim();
  const filteredDepartments = departments.filter((dept) => {
    if (!q) return true;
    const name = (dept.name || '').toLowerCase();
    const id = (dept.id || '').toString();
    return name.includes(q) || id.includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Structure Académique
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Structure & Pôles Pédagogiques
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Organisation des départements et des enseignants rattachés
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

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Note d'intégration Backend :</span>
          <span>
            Le backend Spring Boot actuel regroupe les enseignants par <strong>Départements académiques</strong> (table MySQL <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">departments</code>).
            La table des classes scolaires (ex: 1ère A) n'est pas encore implémentée dans le schéma de la base de données. Aucune statistique fictive de classe n'est affichée ici afin de respecter l'intégrité absolue des données MySQL.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Building2}
          title="Départements réels"
          value={departments.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Pôles enregistrés"
        />
        <StatCard
          icon={Users}
          title="Enseignants affectés"
          value={teachers.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Effectif professoral"
        />
        <StatCard
          icon={School}
          title="Classes (salles)"
          value="Non configuré"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Entité absente du backend"
        />
        <StatCard
          icon={AlertCircle}
          title="Emplois du temps"
          value="Non configuré"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Donnée non disponible"
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
            className="w-full bg-white border border-[#EFECE6] rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-[#16222F] placeholder:text-[#A8A29E] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
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
                  <th className="py-4 px-6">Nom du département académique</th>
                  <th className="py-4 px-6">Enseignants rattachés</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2]">
                {filteredDepartments.map((dept) => {
                  const assignedTeachers = teachers.filter((t) => t.department?.id === dept.id);
                  return (
                    <tr key={dept.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-4 px-6 font-mono text-[#78716C]">#{dept.id}</td>
                      <td className="py-4 px-6 font-bold text-[#16222F] text-sm">{dept.name}</td>
                      <td className="py-4 px-6 text-[#16222F]">
                        {assignedTeachers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedTeachers.map((t) => (
                              <span key={t.id} className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFECE6] text-[11px]">
                                {t.user?.firstName} {t.user?.lastName} ({t.specialization})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#A8A29E] italic">Aucun enseignant rattaché</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {canManage && (
                          <button
                            onClick={() => handleOpenEdit(dept)}
                            className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
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
    </div>
  );
}
