import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { INITIAL_ABSENCES, INITIAL_CLASSES, INITIAL_STUDENTS } from '../data/mockData';

export default function AbsencesView() {
  const [absences, setAbsences] = useState(INITIAL_ABSENCES);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAbsence, setNewAbsence] = useState({
    studentName: INITIAL_STUDENTS[0].fullName,
    class: '1ère A',
    date: '28/10/2026',
    reason: 'Maladie',
    status: 'En attente'
  });

  const filteredAbsences = absences.filter((a) => {
    const matchClass = selectedClass === 'all' || a.class === selectedClass;
    const matchStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return matchClass && matchStatus;
  });

  const handleAddAbsence = (e) => {
    e.preventDefault();
    const student = INITIAL_STUDENTS.find(s => s.fullName === newAbsence.studentName) || INITIAL_STUDENTS[0];

    setAbsences([
      {
        id: Date.now(),
        studentName: student.fullName,
        avatar: student.avatar,
        class: newAbsence.class,
        date: newAbsence.date,
        reason: newAbsence.reason,
        status: newAbsence.status
      },
      ...absences
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Vie Scolaire
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Absences
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Suivez les absences et justifications
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 w-full md:w-auto justify-end">
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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#EFECE6] rounded-full px-4 py-2 text-xs font-semibold text-[#16222F] shadow-sm focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="Justifiée">Justifiée</option>
            <option value="En attente">En attente</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Déclarer une absence</span>
          </button>
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="py-4 px-6">Élève</th>
                <th className="py-4 px-6">Classe</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Motif</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EDE2] text-sm">
              {filteredAbsences.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FAF7F2]/60 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.studentName}
                        className="w-10 h-10 rounded-full object-cover border border-[#EFECE6]"
                      />
                      <span className="font-semibold text-[#16222F]">
                        {item.studentName}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#78716C] font-medium">
                    {item.class}
                  </td>
                  <td className="py-4 px-6 text-[#16222F] font-medium">
                    {item.date}
                  </td>
                  <td className="py-4 px-6 text-[#78716C]">
                    {item.reason}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Modifier le statut"
                        onClick={() => {
                          setAbsences(absences.map(a => a.id === item.id ? { ...a, status: a.status === 'Justifiée' ? 'En attente' : 'Justifiée' } : a));
                        }}
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        title="Supprimer"
                        onClick={() => setAbsences(absences.filter(a => a.id !== item.id))}
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
        title="Signaler une absence"
        subtitle="Enregistrez une absence avec motif et justificatif"
      >
        <form onSubmit={handleAddAbsence} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Élève concerné
            </label>
            <select
              value={newAbsence.studentName}
              onChange={(e) => {
                const s = INITIAL_STUDENTS.find(item => item.fullName === e.target.value);
                setNewAbsence({ ...newAbsence, studentName: e.target.value, class: s?.class || '1ère A' });
              }}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            >
              {INITIAL_STUDENTS.map(s => (
                <option key={s.id} value={s.fullName}>
                  {s.fullName} ({s.class})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Date de l'absence
              </label>
              <input
                type="text"
                value={newAbsence.date}
                onChange={(e) => setNewAbsence({ ...newAbsence, date: e.target.value })}
                placeholder="JJ/MM/AAAA"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Statut
              </label>
              <select
                value={newAbsence.status}
                onChange={(e) => setNewAbsence({ ...newAbsence, status: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="Justifiée">Justifiée</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Motif de l'absence
            </label>
            <input
              type="text"
              required
              value={newAbsence.reason}
              onChange={(e) => setNewAbsence({ ...newAbsence, reason: e.target.value })}
              placeholder="Ex. Certificat médical, rendez-vous officiel..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            />
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
              Valider l'absence
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
