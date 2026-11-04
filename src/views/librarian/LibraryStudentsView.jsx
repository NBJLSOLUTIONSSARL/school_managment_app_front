import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Mail,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import Modal from '../../components/common/Modal';

export default function LibraryStudentsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      setError(err.message || 'Impossible de consulter les élèves.');
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

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] bg-slate-100 px-2 py-0.5 rounded-md">
                Consultation • Lecture seule
              </span>
            </div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F] mt-1">
              Répertoire des élèves
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Consultation des coordonnées et des fiches élèves pour l'attribution des emprunts.
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
            placeholder="Rechercher par nom, prénom ou matricule..."
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
            <span className="text-sm font-medium">Chargement du répertoire...</span>
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
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Téléphone</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {students.map((student) => {
                  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
                  return (
                    <tr key={student.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#16222F]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#16222F] text-[#DFC2A0] flex items-center justify-center font-bold text-xs shrink-0">
                            {student.firstName?.[0] || 'E'}
                          </div>
                          <span>{fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#78716C]">
                        {student.studentNumber || `ID #${student.id}`}
                      </td>
                      <td className="py-3 px-4 text-[#78716C]">
                        {student.email || '—'}
                      </td>
                      <td className="py-3 px-4 text-[#78716C]">
                        {student.phone || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {student.status || 'Actif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#78716C] hover:text-[#16222F] transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
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
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title="Fiche élève (Lecture seule)"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EFECE6]">
              <div className="w-12 h-12 rounded-full bg-[#16222F] text-[#DFC2A0] flex items-center justify-center font-bold text-lg shrink-0">
                {selectedStudent.firstName?.[0] || 'E'}
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#16222F]">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <span className="text-[#78716C] block">
                  Matricule : {selectedStudent.studentNumber || `ID #${selectedStudent.id}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#78716C] block">Adresse email :</span>
                <span className="font-semibold text-[#16222F]">{selectedStudent.email || '—'}</span>
              </div>
              <div>
                <span className="text-[#78716C] block">Téléphone :</span>
                <span className="font-semibold text-[#16222F]">{selectedStudent.phone || '—'}</span>
              </div>
              <div>
                <span className="text-[#78716C] block">Date de naissance :</span>
                <span className="font-semibold text-[#16222F]">{selectedStudent.birthDate || '—'}</span>
              </div>
              <div>
                <span className="text-[#78716C] block">Statut du dossier :</span>
                <span className="font-semibold text-emerald-700">{selectedStudent.status || 'Actif'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-[#16222F] text-white text-xs font-semibold hover:bg-[#223244] transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
