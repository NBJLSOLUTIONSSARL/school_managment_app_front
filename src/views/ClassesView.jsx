import React, { useState } from 'react';
import { School, Users, UserCheck, Percent, Plus, Edit2, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { INITIAL_CLASSES, INITIAL_TEACHERS } from '../data/mockData';

export default function ClassesView() {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    level: '1ère Année',
    effectif: 25,
    capacity: 30,
    mainTeacher: INITIAL_TEACHERS[0].fullName,
  });

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.name) return;

    setClasses([
      ...classes,
      {
        id: Date.now(),
        ...newClass,
        effectif: Number(newClass.effectif),
        capacity: Number(newClass.capacity),
      }
    ]);
    setIsModalOpen(false);
    setNewClass({ name: '', level: '1ère Année', effectif: 25, capacity: 30, mainTeacher: INITIAL_TEACHERS[0].fullName });
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Organisation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Classes
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Organisez les classes et leurs effectifs
          </p>
        </div>

        <div className="flex items-center gap-4 z-10 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajouter une classe</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={School}
          title="Classes"
          value="12"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={Users}
          title="Élèves inscrits"
          value="320"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={UserCheck}
          title="Moyenne/ classe"
          value="26"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
        <StatCard
          icon={Percent}
          title="Taux d'occupation"
          value="95%"
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
        />
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="py-4 px-6">Nom de la classe</th>
                <th className="py-4 px-6">Niveau</th>
                <th className="py-4 px-6">Effectif</th>
                <th className="py-4 px-6">Professeur principal</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EDE2] text-sm">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-[#16222F]">
                    {c.name}
                  </td>
                  <td className="py-4 px-6 text-[#78716C]">
                    <span className="px-2.5 py-1 rounded-full bg-[#F4EDE2] text-xs font-medium text-[#16222F]">
                      {c.level}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-[#16222F]">
                    {c.effectif} <span className="text-xs text-[#A8A29E] font-normal">/ {c.capacity || 30}</span>
                  </td>
                  <td className="py-4 px-6 text-[#16222F] font-medium">
                    {c.mainTeacher}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Modifier"
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Supprimer"
                        onClick={() => setClasses(classes.filter(item => item.id !== c.id))}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter une classe"
        subtitle="Créez une division pour l'année scolaire"
      >
        <form onSubmit={handleAddClass} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Nom de la classe *
              </label>
              <input
                type="text"
                required
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                placeholder="Ex. 1ère C"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Niveau
              </label>
              <select
                value={newClass.level}
                onChange={(e) => setNewClass({ ...newClass, level: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="1ère Année">1ère Année</option>
                <option value="2ème Année">2ème Année</option>
                <option value="3ème Année">3ème Année</option>
                <option value="Terminale">Terminale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Professeur Principal
            </label>
            <select
              value={newClass.mainTeacher}
              onChange={(e) => setNewClass({ ...newClass, mainTeacher: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            >
              {INITIAL_TEACHERS.map((t) => (
                <option key={t.id} value={t.fullName}>
                  {t.fullName} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-md"
            >
              Créer la classe
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
