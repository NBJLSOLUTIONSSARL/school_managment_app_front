import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Power,
} from 'lucide-react';
import { userService } from '../../services/userService';
import Modal from '../../components/common/Modal';
import HeroBanner from '../../components/common/HeroBanner';

export default function UsersManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getUsers({
        query: search || undefined,
        role: selectedRole || undefined,
        page,
        size: 15,
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des comptes utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleUserStatus(user.id);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Impossible de modifier le statut de ce compte.');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(userToDelete.id);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Impossible de supprimer cet utilisateur.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (roles) => {
    if (!roles || roles.length === 0) return <span className="text-xs text-slate-400">Aucun</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {Array.from(roles).map((r) => {
          let color = 'bg-slate-100 text-slate-700 border-slate-200';
          let label = r.replace('ROLE_', '');
          if (r === 'ROLE_ADMIN') {
            color = 'bg-[#16222F] text-[#DFC2A0] border-[#C5A880]/30';
          } else if (r === 'ROLE_STAFF') {
            color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
          } else if (r === 'ROLE_LIBRARIAN') {
            color = 'bg-amber-50 text-amber-800 border-amber-200';
          } else if (r === 'ROLE_TEACHER') {
            color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          } else if (r === 'ROLE_STUDENT') {
            color = 'bg-sky-50 text-sky-700 border-sky-200';
          } else if (r === 'ROLE_PARENT') {
            color = 'bg-purple-50 text-purple-700 border-purple-200';
          }
          return (
            <span
              key={r}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}
            >
              {label}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <HeroBanner
        title="User & Account Access Management"
        description="Comprehensive administration of user accounts, authentication credentials, security permissions, and institutional role allocations."
        buttonText="Refresh Accounts"
        onButtonClick={fetchUsers}
        icon={Shield}
      />

      <div className="academy-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom ou email..."
            className="w-full bg-white border border-[#F1F5F9] rounded-xl pl-9 pr-4 py-2 text-xs text-[#16222F] placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#78716C] shrink-0" />
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(0);
            }}
            className="bg-white border border-[#F1F5F9] rounded-xl px-3 py-2 text-xs font-medium text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
          >
            <option value="">Tous les rôles</option>
            <option value="ROLE_ADMIN">Super Administrateurs</option>
            <option value="ROLE_STAFF">Secrétariat Administratif</option>
            <option value="ROLE_LIBRARIAN">Bibliothécaires</option>
            <option value="ROLE_TEACHER">Enseignants</option>
            <option value="ROLE_STUDENT">Élèves</option>
            <option value="ROLE_PARENT">Parents / Tuteurs</option>
          </select>
        </div>
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
            <span className="text-sm font-medium">Chargement des comptes utilisateurs...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#78716C]">
            Aucun compte trouvé correspondant aux critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-[#F1F5F9] text-[#78716C] uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Utilisateur</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Rôles</th>
                  <th className="py-3.5 px-4">Téléphone</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {users.map((u) => {
                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom';
                  return (
                    <tr key={u.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={u.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt={fullName}
                          className="w-8 h-8 rounded-full object-cover border border-[#F1F5F9]"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";
                          }}
                        />
                        <span className="font-semibold text-[#16222F]">{fullName}</span>
                      </td>
                      <td className="py-3 px-4 text-[#78716C] font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">{getRoleBadge(u.roles)}</td>
                      <td className="py-3 px-4 text-[#78716C]">{u.phone || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title="Cliquer pour activer/désactiver le compte"
                          className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors hover:opacity-80"
                          style={{
                            backgroundColor: u.active ? '#ECFDF5' : '#FEF2F2',
                            color: u.active ? '#047857' : '#B91C1C',
                            borderColor: u.active ? '#A7F3D0' : '#FECACA',
                          }}
                        >
                          {u.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Actif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Suspendu</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={u.active ? "Désactiver le compte" : "Activer le compte"}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-[#78716C] transition-colors cursor-pointer"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            title="Supprimer définitivement le compte"
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#78716C]">
            <span>Page {page + 1} sur {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#F1F5F9] disabled:opacity-40 hover:bg-white transition-colors cursor-pointer"
              >
                Précédent
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-[#F1F5F9] disabled:opacity-40 hover:bg-white transition-colors cursor-pointer"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title="Supprimer un compte utilisateur"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[#78716C]">
            Êtes-vous certain de vouloir supprimer définitivement le compte de{' '}
            <strong className="text-[#16222F]">
              {userToDelete?.firstName} {userToDelete?.lastName} ({userToDelete?.email})
            </strong>{' '}
            ? Cette action est irréversible.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setUserToDelete(null)}
              className="px-4 py-2 rounded-xl border border-[#F1F5F9] text-xs font-semibold text-[#16222F] hover:bg-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              disabled={actionLoading}
              onClick={handleDeleteUser}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? 'Suppression...' : 'Confirmer la suppression'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
