import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Calendar,
  Coins,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import HeroBanner from '../../components/common/HeroBanner';
import { useAuth } from '../../context/AuthContext';
import { guardianService } from '../../services/guardianService';
import { statsService } from '../../services/statsService';
import { financeService } from '../../services/financeService';
import { evaluationService } from '../../services/evaluationService';

export default function ParentDashboardView() {
  const { currentUser, setActiveView } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childStats, setChildStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const parentName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email
    : 'Parent';

  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await guardianService.getMyChildren();
        const list = Array.isArray(res) ? res : res?.data || [];
        setChildren(list);
        if (list.length > 0) {
          setSelectedChild(list[0]);
        }
      } catch (err) {
        setError(err.message || 'Impossible de récupérer la liste de vos enfants.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    if (!selectedChild?.id) return;

    const fetchChildDetails = async () => {
      try {
        const [statsRes, invRes, examsRes] = await Promise.allSettled([
          statsService.getStudentStats(selectedChild.id),
          financeService.getInvoicesByStudent(selectedChild.id),
          evaluationService.getExams(),
        ]);

        if (statsRes.status === 'fulfilled') {
          setChildStats(statsRes.value);
        }
        if (invRes.status === 'fulfilled') {
          const invData = invRes.value;
          setInvoices(Array.isArray(invData) ? invData : invData?.content || []);
        }
        if (examsRes.status === 'fulfilled' && Array.isArray(examsRes.value)) {
          setExams(examsRes.value);
        }
      } catch {
      }
    };

    fetchChildDetails();
  }, [selectedChild]);

  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');
  const totalUnpaid = unpaidInvoices.reduce((acc, i) => acc + (Number(i.totalAmount) || 0), 0);

  const childDisplayName = selectedChild?.user
    ? `${selectedChild.user.firstName || ''} ${selectedChild.user.lastName || ''}`.trim()
    : 'Votre enfant';

  return (
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="flex items-center gap-5 z-10">
          <img
            src={currentUser?.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"}
            alt={parentName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E8DFC9] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4361EE] text-white">
                Espace Parents & Tuteurs
              </span>
              <span className="text-xs text-[#64748B]">
                {currentUser?.email}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif-title text-[#16222F] mt-1">
              Bonjour, {parentName}
            </h1>
            <p className="text-sm text-[#64748B]">
              Suivez la scolarité, les notes et les frais de scolarité de vos enfants.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setActiveView('grades')}
            className="academy-btn-primary flex items-center gap-2 text-sm shadow-md"
          >
            <Award className="w-4 h-4" />
            <span>Notes & Bulletins</span>
          </button>
          <button
            onClick={() => setActiveView('finances')}
            className="academy-btn-secondary flex items-center gap-2 text-sm"
          >
            <Coins className="w-4 h-4" />
            <span>Frais & Factures</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <Loader2 className="w-8 h-8 text-[#4361EE] animate-spin mb-3" />
          <p className="text-sm text-[#64748B]">Chargement des données de vos enfants...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      ) : children.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-3">
          <Users className="w-12 h-12 text-[#94A3B8] mx-auto" />
          <h3 className="text-lg font-bold text-[#16222F] font-serif-title">
            Aucun enfant associé à ce compte
          </h3>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            Veuillez contacter le secrétariat de l'établissement pour faire rattacher vos enfants à votre dossier parent.
          </p>
        </div>
      ) : (
        <>
          <div className="academy-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Enfant sélectionné :
              </span>
              <div className="relative">
                <select
                  value={selectedChild?.id || ''}
                  onChange={(e) => {
                    const found = children.find((c) => String(c.id) === e.target.value);
                    if (found) setSelectedChild(found);
                  }}
                  className="appearance-none bg-[#FAF7F2] border border-[#E8DFC9] rounded-xl px-4 py-2 pr-9 font-semibold text-sm text-[#16222F] focus:outline-none focus:ring-2 focus:ring-[#C5A880] cursor-pointer"
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.user ? `${c.user.firstName} ${c.user.lastName}` : `Élève #${c.id}`} (Matricule: {c.studentNumber || `STU-${c.id}`})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span>Statut scolaire :</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                {selectedChild?.status || 'ACTIF'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Moyenne générale"
              value={childStats?.generalAverage ? `${childStats.generalAverage}/20` : 'En attente'}
              icon={Award}
              badge={childStats?.termTitle || 'Semestre 1'}
              trend="up"
            />
            <StatCard
              title="Devoirs enregistrés"
              value={childStats?.submissionCount ?? 0}
              icon={BookOpen}
              badge="Total rendus"
            />
            <StatCard
              title="Cours cette semaine"
              value={childStats?.timetableSlots?.length ?? 0}
              icon={Calendar}
              badge="Planifiés"
            />
            <StatCard
              title="Scolarité à régler"
              value={`${new Intl.NumberFormat('fr-FR').format(totalUnpaid)} MAD`}
              icon={Coins}
              badge={unpaidInvoices.length > 0 ? `${unpaidInvoices.length} impayée(s)` : 'À jour'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 academy-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4361EE]" />
                  <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                    Emploi du temps de {childDisplayName}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('timetable')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#4361EE] flex items-center gap-1 transition-colors"
                >
                  <span>Voir complet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {childStats?.timetableSlots && childStats.timetableSlots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase">
                        <th className="py-3 px-3">Jour</th>
                        <th className="py-3 px-3">Horaire</th>
                        <th className="py-3 px-3">Matière</th>
                        <th className="py-3 px-3">Professeur</th>
                        <th className="py-3 px-3">Salle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {childStats.timetableSlots.slice(0, 6).map((slot) => (
                        <tr key={slot.id} className="hover:bg-[#FAF7F2] transition-colors">
                          <td className="py-3 px-3 font-semibold text-[#16222F]">
                            {slot.dayOfWeek}
                          </td>
                          <td className="py-3 px-3 text-[#64748B]">
                            {slot.timeSlotLabel || `${slot.startTime} - ${slot.endTime}`}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4361EE]/5 text-[#16222F]">
                              <BookOpen className="w-3 h-3 text-[#4361EE]" />
                              {slot.subject}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-xs text-[#64748B]">
                            {slot.teacherName || 'Enseignant titulaire'}
                          </td>
                          <td className="py-3 px-3 text-xs text-[#64748B]">
                            {slot.classroomName || 'Salle attribuée'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#94A3B8] text-sm">
                  Aucun créneau de cours renseigné pour cette classe.
                </div>
              )}
            </div>

            <div className="academy-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#4361EE]" />
                  <h2 className="text-lg font-bold text-[#16222F] font-serif-title">
                    Situation Financière
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('finances')}
                  className="text-xs font-semibold text-[#16222F] hover:text-[#4361EE] flex items-center gap-1 transition-colors"
                >
                  <span>Détail factures</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {invoices && invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.slice(0, 4).map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC9] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-[#16222F]">
                          {inv.invoiceNumber || `Facture #${inv.id}`}
                        </span>
                        {inv.status === 'PAID' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Payée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" /> En attente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#16222F]">
                        <span className="text-[#64748B] font-normal">Montant dû :</span>
                        <span>{new Intl.NumberFormat('fr-FR').format(inv.totalAmount || 0)} MAD</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] text-center py-4">
                  Aucune facture émise pour cet élève.
                </p>
              )}

              <div className="pt-2 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setActiveView('reports')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F3ECE0] border border-[#E8DFC9] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-[#4361EE]" />
                    <span className="text-xs font-semibold text-[#16222F]">
                      Consulter les bulletins scolaires
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16222F]" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
