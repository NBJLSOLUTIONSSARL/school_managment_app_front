import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Mail,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { userService } from '../../services/userService';
import Modal from '../../components/common/Modal';

export default function LibraryStaffView() {
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers({
        query: search || undefined,
        page,
        size: 15,
      });
      const allUsers = res.content || [];
      const staffOnly = allUsers.filter(u =>
        u.roles?.some(r => r === 'ROLE_TEACHER' || r === 'ROLE_STAFF' || r === 'ROLE_ADMIN' || r === 'ROLE_LIBRARIAN')
      );
      setStaffUsers(staffOnly);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Impossible de consulter la liste du personnel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchStaff();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#16222F] text-[#DFC2A0] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] bg-slate-100 px-2 py-0.5 rounded-md">
                Consultation • Lecture seule
              </span>
            </div>
            <h1 className="text-2xl font-serif-title font-bold text-[#16222F] mt-1">
              Répertoire du personnel & enseignants
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
              Consultation des enseignants et membres administratifs pour les prêts internes.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStaff}
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
            placeholder="Rechercher par nom, prénom ou email..."
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
            <span className="text-sm font-medium">Chargement du personnel...</span>
          </div>
        ) : staffUsers.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun membre du personnel trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#EFECE6] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Membre du personnel</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Rôle</th>
                  <th className="py-3.5 px-4">Téléphone</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {staffUsers.map((user) => {
                  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                  return (
                    <tr key={user.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#16222F]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt={fullName}
                            className="w-8 h-8 rounded-full object-cover border border-[#EFECE6]"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
                            }}
                          />
                          <span>{fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#78716C]">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200">
                          {user.roles?.[0]?.replace('ROLE_', '') || 'STAFF'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#78716C]">
                        {user.phone || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          Actif
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedStaff(user)}
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
      </div>

      <Modal
        isOpen={Boolean(selectedStaff)}
        onClose={() => setSelectedStaff(null)}
        title="Fiche collaborateur (Lecture seule)"
      >
        {selectedStaff && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#EFECE6]">
              <img
                src={selectedStaff.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={selectedStaff.firstName}
                className="w-12 h-12 rounded-full object-cover border border-[#EFECE6]"
              />
              <div>
                <h3 className="font-bold text-sm text-[#16222F]">
                  {selectedStaff.firstName} {selectedStaff.lastName}
                </h3>
                <span className="text-[#78716C] block">
                  {selectedStaff.roles?.join(', ') || 'Personnel'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#78716C] block">Email professionnel :</span>
                <span className="font-semibold text-[#16222F]">{selectedStaff.email}</span>
              </div>
              <div>
                <span className="text-[#78716C] block">Téléphone :</span>
                <span className="font-semibold text-[#16222F]">{selectedStaff.phone || '—'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
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
