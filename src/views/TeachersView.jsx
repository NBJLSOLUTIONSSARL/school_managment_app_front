import React, { useState } from 'react';
import { Users, CheckCircle, UserPlus, Calendar, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { INITIAL_TEACHERS } from '../data/mockData';

export default function TeachersView() {
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    specialty: 'Mathématiques',
    email: '',
    phone: '',
  });

  const handleAddTeacher = (e) => {
    e.preventDefault();
    if (!newTeacher.fullName) return;

    const created = {
      id: Date.now(),
      fullName: newTeacher.fullName,
      specialty: newTeacher.specialty,
      email: newTeacher.email || `${newTeacher.fullName.toLowerCase().replace(/[\s.]+/g, '.')}@academie-lumiere.ma`,
      phone: newTeacher.phone || '+212 6 00 00 00 00',
      status: 'Actif',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      classes: ['1ère A'],
      experience: '5 ans'
    };

    setTeachers([created, ...teachers]);
    setIsAddModalOpen(false);
    setNewTeacher({ fullName: '', specialty: 'Mathématiques', email: '', phone: '' });
  };

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
            Gérez les informations de vos enseignants
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter un enseignant</span>
          </button>
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
          <div className="w-32 h-32 rounded-full border-8 border-[#C5A880]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Users}
          title="Enseignants"
          value="156"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={CheckCircle}
          title="Taux d'activité"
          value="92%"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={UserPlus}
          title="Nouveaux"
          value="8"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={Calendar}
          title="En congé"
          value="12"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="py-4 px-6">Photo</th>
                <th className="py-4 px-6">Nom complet</th>
                <th className="py-4 px-6">Spécialité</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EDE2] text-sm">
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-[#FAF7F2]/60 transition-colors group"
                >
                  <td className="py-3 px-6">
                    <img
                      src={teacher.avatar}
                      alt={teacher.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-[#EFECE6]"
                    />
                  </td>
                  <td className="py-3 px-6 font-semibold text-[#16222F]">
                    <div>{teacher.fullName}</div>
                    <div className="text-xs text-[#A8A29E] font-normal">
                      {teacher.email}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-[#78716C] font-medium">
                    <span className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EFECE6] text-xs">
                      {teacher.specialty}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    <StatusBadge status={teacher.status} dot />
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Voir fiche"
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Modifier"
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Supprimer"
                        onClick={() => setTeachers(teachers.filter(t => t.id !== teacher.id))}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un enseignant"
        subtitle="Enregistrez un nouveau membre du corps professoral"
      >
        <form onSubmit={handleAddTeacher} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Nom complet avec titre *
            </label>
            <input
              type="text"
              required
              value={newTeacher.fullName}
              onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
              placeholder="Ex. Dr. Youssef Fassi"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Spécialité *
              </label>
              <select
                value={newTeacher.specialty}
                onChange={(e) => setNewTeacher({ ...newTeacher, specialty: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="Mathématiques">Mathématiques</option>
                <option value="Physique">Physique</option>
                <option value="Français">Français</option>
                <option value="Anglais">Anglais</option>
                <option value="SVT">SVT</option>
                <option value="Histoire-Géo">Histoire-Géo</option>
                <option value="Informatique">Informatique</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                placeholder="+212 6..."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              />
            </div>
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
              Enregistrer l'enseignant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
