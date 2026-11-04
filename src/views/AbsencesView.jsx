import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Loader2, CheckCircle2, XCircle, Plus, Search } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { communicationService } from '../services/communicationService';

export default function AbsencesView() {
  const { currentUser, hasAnyRole } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [formData, setFormData] = useState({
    type: 'SICK',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.getLeaveRequests({
        userId: canManage ? null : currentUser?.id,
        page: 0,
        size: 50,
      });
      const list = res?.content || (Array.isArray(res) ? res : []);
      setLeaveRequests(list);
    } catch {
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentUser?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      setModalError('Veuillez renseigner le motif de l\'absence.');
      return;
    }
    if (formData.endDate < formData.startDate) {
      setModalError('La date de fin doit être postérieure ou égale à la date de début.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      await communicationService.createLeaveRequest({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });
      setIsModalOpen(false);
      setFormData({
        type: 'SICK',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      setSuccessMessage('Déclaration d\'absence enregistrée avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchLeaves();
    } catch (err) {
      setModalError(err.message || 'Erreur lors de l\'enregistrement de la demande.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await communicationService.approveLeaveRequest(id);
      setSuccessMessage('Demande validée avec succès.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchLeaves();
    } catch (err) {
      setError(err.message || 'Impossible de valider cette demande.');
    }
  };

  const handleReject = async (id) => {
    try {
      await communicationService.rejectLeaveRequest(id);
      setSuccessMessage('Demande refusée.');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchLeaves();
    } catch (err) {
      setError(err.message || 'Impossible de refuser cette demande.');
    }
  };

  const approvedCount = leaveRequests.filter((l) => l.status === 'APPROVED').length;
  const pendingCount = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const rejectedCount = leaveRequests.filter((l) => l.status === 'REJECTED' || l.status === 'CANCELLED').length;

  const getTypeBadge = (type) => {
    switch (type) {
      case 'SICK':
        return { label: 'Maladie', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ANNUAL':
        return { label: 'Congé Annuel', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ADMINISTRATIVE':
        return { label: 'Administratif', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Exceptionnel', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Vie Scolaire & Assiduité
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Absences & Congés
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Gestion et suivi officiel des absences et demandes d'autorisation
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setIsModalOpen(true);
          }}
          className="z-10 flex items-center gap-2 bg-[#16222F] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#203144] shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Déclarer une absence</span>
        </button>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
            alt="Absences"
            className="w-full h-full object-cover rounded-l-full"
          />
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Calendar}
          title="Demandes enregistrées"
          value={leaveRequests.length.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Total des déclarations"
        />
        <StatCard
          icon={CheckCircle2}
          title="Absences validées"
          value={approvedCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Statut Approuvé"
        />
        <StatCard
          icon={Clock}
          title="En attente d'avis"
          value={pendingCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="En cours d'examen"
        />
        <StatCard
          icon={XCircle}
          title="Refusées / Rejetées"
          value={rejectedCount.toString()}
          iconBg="bg-[#F4EDE2]"
          iconColor="text-[#16222F]"
          subtitle="Non justifiées ou refusées"
        />
      </div>

      <div className="academy-card overflow-hidden">
        <div className="p-6 border-b border-[#F4EDE2] flex items-center justify-between">
          <h2 className="text-lg font-bold font-serif-title text-[#16222F]">
            Registre officiel des absences & congés
          </h2>
          <span className="text-xs font-semibold text-[#78716C] bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EFECE6]">
            {leaveRequests.length} entrées
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement du registre...</span>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-xs text-[#78716C]">
            <Calendar className="w-10 h-10 text-[#C5A880] mx-auto opacity-50" />
            <p className="font-bold text-[#16222F]">Aucune absence enregistrée pour le moment.</p>
            <p>Utilisez le bouton ci-dessus pour déclarer une nouvelle absence.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2] font-bold text-[#78716C] uppercase">
                  <th className="py-4 px-6">Demandeur</th>
                  <th className="py-4 px-6">Type d'absence</th>
                  <th className="py-4 px-6">Période</th>
                  <th className="py-4 px-6">Motif</th>
                  <th className="py-4 px-6">Statut</th>
                  {canManage && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2]">
                {leaveRequests.map((leave) => {
                  const badge = getTypeBadge(leave.type);
                  return (
                    <tr key={leave.id} className="hover:bg-[#FAF7F2]/60">
                      <td className="py-4 px-6 font-mono text-[#16222F]">
                        Utilisateur #{leave.userId}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[#78716C]">
                        Du {leave.startDate} au {leave.endDate}
                      </td>
                      <td className="py-4 px-6 font-medium text-[#16222F] max-w-xs truncate">
                        {leave.reason}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${
                            leave.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : leave.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {leave.status === 'APPROVED' ? 'Validé' : leave.status === 'REJECTED' ? 'Refusé' : 'En attente'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="py-4 px-6 text-right">
                          {leave.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(leave.id)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => handleReject(leave.id)}
                                className="px-3 py-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                Refuser
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Déclarer une absence ou un congé"
        subtitle="Renseignez les dates et le motif pour enregistrement officiel"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
              Type de motif
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] text-xs font-semibold text-[#16222F] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="SICK">Maladie / Raison médicale</option>
              <option value="ANNUAL">Congé annuel / Absence autorisée</option>
              <option value="ADMINISTRATIVE">Motif administratif</option>
              <option value="UNPAID">Autre motif / Exceptionnel</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Date de début
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] text-xs text-[#16222F] focus:outline-none focus:border-[#C5A880]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
                Date de fin
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] text-xs text-[#16222F] focus:outline-none focus:border-[#C5A880]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase tracking-wider mb-1.5">
              Motif détaillé de l'absence
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Certificat médical transmis, consultation spécialisée, impératif familial..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] text-xs text-[#16222F] focus:outline-none focus:border-[#C5A880]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-full border border-[#EFECE6] text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-[#16222F] text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-[#203144] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer la déclaration</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
