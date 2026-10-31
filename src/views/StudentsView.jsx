import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  FileText,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { INITIAL_STUDENTS, INITIAL_CLASSES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function StudentsView() {
  const { searchQuery } = useAuth();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [selectedClass, setSelectedClass] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    class: '1ère A',
    email: '',
    phone: '',
    birthDate: '',
  });

  const query = (localSearch || searchQuery).toLowerCase();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(query) ||
      s.studentNumber.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query);
    const matchesClass = selectedClass === 'all' || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.firstName || !newStudent.lastName) return;

    const created = {
      id: Date.now(),
      studentNumber: `ETU-2026-00${students.length + 1}`,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      fullName: `${newStudent.firstName} ${newStudent.lastName}`,
      class: newStudent.class,
      email: newStudent.email || `${newStudent.firstName.toLowerCase()}.${newStudent.lastName.toLowerCase()}@etudiant.academie-lumiere.ma`,
      phone: newStudent.phone || '+212 6 00 00 00 00',
      status: 'Actif',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      grades: { math: 15.0, physics: 15.0, french: 15.0, average: 15.0 },
      attendanceRate: 98,
    };

    setStudents([created, ...students]);
    setIsAddModalOpen(false);
    setNewStudent({ firstName: '', lastName: '', class: '1ère A', email: '', phone: '', birthDate: '' });
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

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
            Consultez et gérez les informations des élèves
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter un élève</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Campus"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Users}
          title="Total élèves"
          value="1 248"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={GraduationCap}
          title="Taux de présence"
          value="98%"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={TrendingUp}
          title="Nouveaux cette mois"
          value="12"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={FileText}
          title="En attente"
          value="24"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher un élève..."
            className="w-full bg-white border border-[#EFECE6] rounded-full pl-10 pr-4 py-2 text-sm text-[#16222F] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]/30"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2 text-xs font-semibold text-[#16222F] shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes les classes</option>
            {INITIAL_CLASSES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="py-4 px-6">Photo</th>
                <th className="py-4 px-6">Nom complet</th>
                <th className="py-4 px-6">Classe</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EDE2] text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-[#78716C]">
                    Aucun élève trouvé.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-[#FAF7F2]/60 transition-colors group"
                  >
                    <td className="py-3 px-6">
                      <img
                        src={student.avatar}
                        alt={student.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-[#EFECE6]"
                      />
                    </td>
                    <td className="py-3 px-6 font-semibold text-[#16222F]">
                      <div>{student.fullName}</div>
                      <div className="text-xs text-[#A8A29E] font-normal">
                        {student.studentNumber}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-[#78716C] font-medium">
                      {student.class}
                    </td>
                    <td className="py-3 px-6">
                      <StatusBadge status={student.status} dot />
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          title="Voir fiche élève"
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => alert(`Modifier ${student.fullName}`)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un nouvel élève"
        subtitle="Créez le dossier d'un élève dans l'établissement"
      >
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                placeholder="Ex. Omar"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Nom de famille *
              </label>
              <input
                type="text"
                required
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                placeholder="Ex. Berrada"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A880]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Classe *
              </label>
              <select
                value={newStudent.class}
                onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              >
                {INITIAL_CLASSES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.level})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={newStudent.phone}
                onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                placeholder="+212 6..."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Email étudiant (Optionnel)
            </label>
            <input
              type="email"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              placeholder="auto-généré si vide"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-md"
            >
              Enregistrer l'élève
            </button>
          </div>
        </form>
      </Modal>

      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Fiche élève • ${selectedStudent.fullName}`}
          subtitle={`Matricule: ${selectedStudent.studentNumber}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6]">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C5A880]"
              />
              <div>
                <h4 className="text-lg font-bold text-[#16222F]">{selectedStudent.fullName}</h4>
                <p className="text-xs text-[#78716C]">{selectedStudent.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold bg-[#E8DFC9] text-[#16222F] px-2.5 py-0.5 rounded-full">
                    {selectedStudent.class}
                  </span>
                  <StatusBadge status={selectedStudent.status} dot />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#EFECE6]">
                <span className="text-[#A8A29E] block">Moyenne générale</span>
                <span className="text-lg font-bold text-[#16222F]">
                  {selectedStudent.grades?.average || 16.5} / 20
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EFECE6]">
                <span className="text-[#A8A29E] block">Taux d'assiduité</span>
                <span className="text-lg font-bold text-emerald-600">
                  {selectedStudent.attendanceRate || 98}%
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
