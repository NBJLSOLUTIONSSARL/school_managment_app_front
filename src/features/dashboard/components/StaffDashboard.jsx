import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileCheck,
  Users,
  Coins,
  Clock,
  AlertCircle,
  FilePlus,
  UserPlus,
  FileSearch,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { HeroBanner } from '@/components/ui/HeroBanner'
import { MiniCalendar } from '@/components/ui/MiniCalendar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/hooks/useAuth'
import { statsService } from '../api/statsService'

export function StaffDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    statsService.getStaffStats().then((data) => {
      if (!ignore) {
        setStats(data)
        setLoading(false)
      }
    }).catch((err) => {
      if (!ignore) {
        setError(err.message || 'Impossible de charger les données du secrétariat.')
        setLoading(false)
      }
    })
    return () => {
      ignore = true
    }
  }, [])

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Secrétariat'

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Bienvenue, ${displayName} !`}
        description="Gérez les admissions, les inscriptions d'élèves, les justificatifs d'absence et les demandes des familles pour aujourd'hui."
        buttonText="Gérer les élèves"
        onButtonClick={() => navigate('/students')}
        icon={FileCheck}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchStaffData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 4 StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={FileCheck}
          title="Dossiers d'Admission"
          value={loading ? '...' : (stats?.totalApplications?.toString() || '24')}
          subtitle="Candidatures cette session"
          iconBg="bg-[#EEF2FF]"
          iconColor="text-[#4361EE]"
        />
        <StatCard
          icon={Clock}
          title="Admissions en Attente"
          value={loading ? '...' : (stats?.pendingApplications?.toString() || '8')}
          subtitle="À valider en priorité"
          badgeText="À traiter"
          badgeType="warning"
          iconBg="bg-amber-50"
          iconColor="text-amber-800"
        />
        <StatCard
          icon={Users}
          title="Élèves Actifs"
          value={loading ? '...' : (stats?.totalStudents?.toString() || '1 248')}
          subtitle="Dossiers scolaires suivis"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          onClick={() => navigate('/students')}
        />
        <StatCard
          icon={Coins}
          title="Paiements & Factures"
          value={loading ? '...' : `${stats?.unpaidInvoicesCount || 14} impayés`}
          subtitle="Frais de scolarité"
          badgeText={`${stats?.totalUnpaidAmount || 14200} €`}
          badgeType="warning"
          iconBg="bg-rose-50"
          iconColor="text-rose-700"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#4361EE] hover:bg-blue-50/40 transition flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#4361EE] flex items-center justify-center shrink-0 group-hover:bg-[#4361EE] group-hover:text-white transition">
            <UserPlus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Inscrire un élève</div>
            <div className="text-[11px] text-slate-500">Créer un dossier</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/guardians')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#4361EE] hover:bg-blue-50/40 transition flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Parents & Tuteurs</div>
            <div className="text-[11px] text-slate-500">Coordonnées familles</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/leave-requests')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#4361EE] hover:bg-blue-50/40 transition flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-700 group-hover:text-white transition">
            <FilePlus className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Demandes de congés</div>
            <div className="text-[11px] text-slate-500">Personnel & Staff</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/announcements')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#4361EE] hover:bg-blue-50/40 transition flex items-center gap-3 text-left cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-700 group-hover:text-white transition">
            <FileSearch className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Diffuser une note</div>
            <div className="text-[11px] text-slate-500">Circulaire interne</div>
          </div>
        </button>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Student Inquiries */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Derniers Élèves Inscrits
              </h2>
              <button
                type="button"
                onClick={() => navigate('/students')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Gérer les dossiers
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Lucas Martin', grade: 'Seconde A', number: 'STU-2026-0041', date: 'Inscrit hier', status: 'Active' },
                { name: 'Chloé Bernard', grade: '1ère S', number: 'STU-2026-0042', date: 'Inscrit le 04 Nov', status: 'Active' },
                { name: 'Youssef Alami', grade: 'Terminale ES', number: 'STU-2026-0043', date: 'Dossier incomplet', status: 'Pending' },
              ].map((st, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9]">
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B]">{st.name} ({st.number})</h4>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{st.grade} · {st.date}</p>
                  </div>
                  <StatusBadge status={st.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Calendar */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
