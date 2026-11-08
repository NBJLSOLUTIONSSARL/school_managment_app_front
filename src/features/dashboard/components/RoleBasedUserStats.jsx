import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  GraduationCap,
  Award,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { statsService } from '../api/statsService'
import { cn } from '@/utils/classNames'

export function RoleBasedUserStats({ className = '', onNavigate }) {
  const { user, hasRole } = useAuth()
  const { t } = useI18n()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Identify primary role
  const isParent = hasRole(['ROLE_PARENT', 'parent'])
  const isStudent = hasRole(['ROLE_STUDENT', 'student'])
  const isTeacher = hasRole(['ROLE_TEACHER', 'teacher'])
  const isStaff = hasRole(['ROLE_STAFF', 'staff'])
  const isAdmin = hasRole(['ROLE_ADMIN', 'admin'])

  const roleBadgeLabel = isAdmin
    ? t('roles.admin', 'Directeur / Admin')
    : isTeacher
      ? t('roles.teacher', 'Professeur')
      : isStudent
        ? t('roles.student', 'Élève')
        : isParent
          ? t('roles.parent', 'Parent / Tuteur')
          : isStaff
            ? t('roles.staff', 'Secrétariat Scolaire')
            : 'Utilisateur'

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data = null
      if (isAdmin) {
        data = await statsService.getAdminStats()
      } else if (isTeacher) {
        data = await statsService.getTeacherStats(user?.id)
      } else if (isStudent) {
        data = await statsService.getStudentStats(user?.id)
      } else if (isParent) {
        data = await statsService.getParentStats(user?.id)
      } else if (isStaff) {
        data = await statsService.getStaffStats()
      }
      setStats(data)
    } catch (err) {
      setError(err?.message || 'Impossible de synchroniser vos statistiques de profil.')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, isTeacher, isStudent, isParent, isStaff, user])

  useEffect(() => {
    let ignore = false
    const promise = isAdmin
      ? statsService.getAdminStats()
      : isTeacher
        ? statsService.getTeacherStats(user?.id)
        : isStudent
          ? statsService.getStudentStats(user?.id)
          : isParent
            ? statsService.getParentStats(user?.id)
            : isStaff
              ? statsService.getStaffStats()
              : Promise.resolve(null)

    promise
      .then((data) => {
        if (!ignore) {
          setStats(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err?.message || 'Impossible de synchroniser vos statistiques de profil.')
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [isAdmin, isTeacher, isStudent, isParent, isStaff, user])

  // Build role-specific metric definitions
  const getMetrics = () => {
    if (!stats && !loading) return []

    if (isAdmin) {
      return [
        {
          id: 'admin-students',
          title: 'Élèves Inscrits',
          value: loading ? null : (stats?.totalStudents ?? 0).toLocaleString('fr-FR'),
          description: 'Effectif officiel enregistré',
          badge: 'Actifs',
          badgeVariant: 'success',
          icon: GraduationCap,
          progress: 100,
          subMetrics: [
            { label: 'Candidatures', value: `${stats?.totalApplications ?? 0}` },
            { label: 'Rentrée', value: '2026 - 2027' },
          ],
          tooltip: 'Total des élèves actifs dans l’établissement',
        },
        {
          id: 'admin-teachers',
          title: 'Corps Professoral',
          value: loading ? null : (stats?.totalTeachers ?? 0).toLocaleString('fr-FR'),
          description: `${stats?.totalDepartments ?? 0} départements académiques`,
          badge: 'Équipe',
          badgeVariant: 'secondary',
          icon: Users,
          progress: 100,
          subMetrics: [
            { label: 'Personnel', value: `${stats?.totalStaff ?? 0} agents` },
            { label: 'Pôle', value: 'Pédagogique' },
          ],
          tooltip: 'Nombre de professeurs titulaires et vacataires',
        },
        {
          id: 'admin-finances',
          title: 'Taux de Recouvrement',
          value: loading ? null : `${stats?.paymentRate ?? 0}%`,
          description: `${(stats?.totalPaid ?? 0).toLocaleString('fr-FR')} € collectés`,
          badge: stats?.paymentRate > 75 ? 'Optimal' : 'Suivi requis',
          badgeVariant: stats?.paymentRate > 75 ? 'success' : 'warning',
          icon: CreditCard,
          progress: stats?.paymentRate ?? 0,
          subMetrics: [
            { label: 'Encaissé', value: `${(stats?.totalPaid ?? 0).toLocaleString('fr-FR')} €` },
            { label: 'Reste dû', value: `${(stats?.totalUnpaid ?? 0).toLocaleString('fr-FR')} €` },
          ],
          tooltip: 'Pourcentage de frais de scolarité recouvrés',
        },
        {
          id: 'admin-admissions',
          title: 'Candidatures d’Admission',
          value: loading ? null : (stats?.totalApplications ?? 0).toLocaleString('fr-FR'),
          description: 'Campagne de recrutement',
          badge: 'Dossiers',
          badgeVariant: 'blue',
          icon: ClipboardCheck,
          progress: 100,
          subMetrics: [
            { label: 'Dossiers', value: `${stats?.totalApplications ?? 0}` },
            { label: 'Statut', value: 'En cours' },
          ],
          tooltip: 'Nombre total de dossiers de candidature reçus',
        },
      ]
    }

    if (isTeacher) {
      return [
        {
          id: 'teacher-students',
          title: 'Élèves Encadrés',
          value: loading ? null : (stats?.totalStudents ?? 0).toLocaleString('fr-FR'),
          description: 'Classes et promotions actives',
          badge: 'Promotion',
          badgeVariant: 'secondary',
          icon: GraduationCap,
          progress: 100,
          subMetrics: [
            { label: 'Spécialité', value: stats?.specialization || 'Générale' },
            { label: 'Section', value: 'Secondaire' },
          ],
          tooltip: 'Total des élèves suivis sur vos matières',
        },
        {
          id: 'teacher-exams',
          title: 'Évaluations Programmées',
          value: loading ? null : (stats?.totalExams ?? 0).toLocaleString('fr-FR'),
          description: `${stats?.upcomingExams?.length ?? 0} session(s) ouverte(s)`,
          badge: 'Contrôles',
          badgeVariant: 'blue',
          icon: Award,
          progress: 80,
          subMetrics: [
            { label: 'À noter', value: `${stats?.upcomingExams?.length ?? 0}` },
            { label: 'Clôturés', value: `${Math.max(0, (stats?.totalExams ?? 0) - (stats?.upcomingExams?.length ?? 0))}` },
          ],
          tooltip: 'Examens, devoirs sur table et travaux pratiques',
        },
        {
          id: 'teacher-dept',
          title: 'Département Académique',
          value: loading ? null : (stats?.departmentName || 'Pédagogie'),
          description: `Contrat : ${stats?.contractType || 'Plein temps'}`,
          badge: 'Affectation',
          badgeVariant: 'default',
          icon: Building2,
          progress: 100,
          subMetrics: [
            { label: 'Discipline', value: stats?.specialization || 'Enseignement' },
            { label: 'Régime', value: stats?.contractType || 'Actif' },
          ],
          tooltip: 'Votre département de rattachement au sein de l’école',
        },
        {
          id: 'teacher-agenda',
          title: 'Événements & Conseils',
          value: loading ? null : (stats?.events?.length ?? 0).toLocaleString('fr-FR'),
          description: 'Réunions et conseils prévus',
          badge: 'Calendrier',
          badgeVariant: 'secondary',
          icon: Calendar,
          progress: 100,
          subMetrics: [
            { label: 'Planning', value: 'Synchronisé' },
            { label: 'Prochain', value: 'Cette semaine' },
          ],
          tooltip: 'Événements scolaires et pédagogiques au calendrier',
        },
      ]
    }

    if (isStudent) {
      return [
        {
          id: 'student-gpa',
          title: 'Moyenne Générale',
          value: loading
            ? null
            : stats?.generalAverage !== null && stats?.generalAverage !== undefined
              ? `${Number(stats.generalAverage).toFixed(2)}/20`
              : 'En cours',
          description: stats?.termTitle || 'Semestre en cours',
          badge: stats?.mention || 'Mention Bien',
          badgeVariant: 'success',
          icon: Award,
          progress: stats?.generalAverage ? Math.round((Number(stats.generalAverage) / 20) * 100) : 75,
          subMetrics: [
            { label: 'Rang', value: stats?.rank ? `${stats.rank}e` : '—' },
            { label: 'Avis', value: stats?.mention || 'Favorable' },
          ],
          tooltip: 'Moyenne pondérée officielle du bulletin',
        },
        {
          id: 'student-submissions',
          title: 'Devoirs & Travaux Rendus',
          value: loading ? null : (stats?.submissionsCount ?? 0).toLocaleString('fr-FR'),
          description: 'Exercices et rendus en ligne',
          badge: 'Rendus',
          badgeVariant: 'blue',
          icon: BookOpen,
          progress: 85,
          subMetrics: [
            { label: 'Remis', value: `${stats?.submissionsCount ?? 0}` },
            { label: 'Assiduité', value: '100%' },
          ],
          tooltip: 'Nombre de travaux et devoirs transmis aux enseignants',
        },
        {
          id: 'student-exams',
          title: 'Examens à Venir',
          value: loading ? null : (stats?.upcomingExams?.length ?? 0).toLocaleString('fr-FR'),
          description: 'Contrôles et épreuves programmés',
          badge: 'À réviser',
          badgeVariant: 'warning',
          icon: Clock,
          progress: 60,
          subMetrics: [
            { label: 'Prochain', value: 'Session J+3' },
            { label: 'Coeff.', value: 'Important' },
          ],
          tooltip: 'Épreuves et examens programmés pour votre classe',
        },
        {
          id: 'student-status',
          title: 'Statut & Dossier Élève',
          value: loading ? null : (stats?.studentNumber || 'Inscrit'),
          description: `Statut scolarité : ${stats?.status || 'Actif'}`,
          badge: 'Régulier',
          badgeVariant: 'secondary',
          icon: GraduationCap,
          progress: 100,
          subMetrics: [
            { label: 'Matricule', value: stats?.studentNumber || '—' },
            { label: 'Assurance', value: 'Validée' },
          ],
          tooltip: 'Identifiant scolaire officiel pour l’année en cours',
        },
      ]
    }

    if (isParent) {
      const firstChild = stats?.children?.[0]
      return [
        {
          id: 'parent-children',
          title: 'Enfants Suivis',
          value: loading ? null : (stats?.children?.length ?? 0).toLocaleString('fr-FR'),
          description: 'Dossiers rattachés au compte tuteur',
          badge: 'Famille',
          badgeVariant: 'default',
          icon: Users,
          progress: 100,
          subMetrics: [
            { label: 'Rattachés', value: `${stats?.children?.length ?? 0} élève(s)` },
            { label: 'Accès', value: 'Complet' },
          ],
          tooltip: 'Nombre d’enfants scolarisés associés à votre compte',
        },
        {
          id: 'parent-gpa',
          title: 'Moyenne de Scolarité',
          value: loading
            ? null
            : firstChild?.average !== null && firstChild?.average !== undefined
              ? `${Number(firstChild.average).toFixed(2)}/20`
              : 'En cours',
          description: firstChild ? `${firstChild.firstName} ${firstChild.lastName}` : 'Semestre actuel',
          badge: firstChild?.mention || 'Mention Bien',
          badgeVariant: 'success',
          icon: Award,
          progress: firstChild?.average ? Math.round((Number(firstChild.average) / 20) * 100) : 75,
          subMetrics: [
            { label: 'Période', value: firstChild?.term || 'Trimestre 1' },
            { label: 'Résultat', value: firstChild?.average ? `${Number(firstChild.average).toFixed(1)}/20` : 'En attente' },
          ],
          tooltip: 'Dernière moyenne officielle enregistrée',
        },
        {
          id: 'parent-ia',
          title: 'Suivi IA & Observations',
          value: loading ? null : 'Actif',
          description: 'Consentements et remarques enseignants',
          badge: 'RGPD',
          badgeVariant: 'secondary',
          icon: Sparkles,
          progress: 100,
          subMetrics: [
            { label: 'Consentement', value: 'Autorisé' },
            { label: 'Remarques', value: 'À jour' },
          ],
          tooltip: 'Module de suivi personnalisé et d’accompagnement éducatif',
        },
        {
          id: 'parent-events',
          title: 'Calendrier & Réunions',
          value: loading ? null : (stats?.events?.length ?? 0).toLocaleString('fr-FR'),
          description: 'Rencontres parents-professeurs et agenda',
          badge: 'Agenda',
          badgeVariant: 'blue',
          icon: Calendar,
          progress: 100,
          subMetrics: [
            { label: 'Rencontres', value: 'Planifiées' },
            { label: 'Notifications', value: 'Activées' },
          ],
          tooltip: 'Événements scolaires concernant la scolarité de vos enfants',
        },
      ]
    }

    if (isStaff) {
      return [
        {
          id: 'staff-apps',
          title: 'Candidatures d’Admission',
          value: loading ? null : (stats?.totalApplications ?? 0).toLocaleString('fr-FR'),
          description: `${stats?.pendingApplications ?? 0} dossier(s) en attente`,
          badge: 'Inscriptions',
          badgeVariant: 'warning',
          icon: ClipboardCheck,
          progress: stats?.totalApplications ? Math.round(((stats.acceptedApplications || 0) / stats.totalApplications) * 100) : 70,
          subMetrics: [
            { label: 'En attente', value: `${stats?.pendingApplications ?? 0}` },
            { label: 'Admis', value: `${stats?.acceptedApplications ?? 0}` },
          ],
          tooltip: 'Dossiers de candidature en cours d’examen administratif',
        },
        {
          id: 'staff-students',
          title: 'Élèves Inscrits',
          value: loading ? null : (stats?.totalStudents ?? 0).toLocaleString('fr-FR'),
          description: 'Effectif administratif actif',
          badge: 'Vérifiés',
          badgeVariant: 'success',
          icon: GraduationCap,
          progress: 100,
          subMetrics: [
            { label: 'Effectif', value: `${stats?.totalStudents ?? 0}` },
            { label: 'Statut', value: 'À jour' },
          ],
          tooltip: 'Effectif officiel enregistré au secrétariat',
        },
        {
          id: 'staff-invoices',
          title: 'Factures Scolaires Impayées',
          value: loading ? null : (stats?.unpaidInvoicesCount ?? 0).toLocaleString('fr-FR'),
          description: `Reste dû : ${(stats?.totalUnpaidAmount ?? 0).toLocaleString('fr-FR')} €`,
          badge: stats?.unpaidInvoicesCount > 0 ? 'À relancer' : 'Soldé',
          badgeVariant: stats?.unpaidInvoicesCount > 0 ? 'destructive' : 'success',
          icon: CreditCard,
          progress: stats?.paidInvoicesCount ? Math.round((stats.paidInvoicesCount / (stats.paidInvoicesCount + (stats.unpaidInvoicesCount || 1))) * 100) : 0,
          subMetrics: [
            { label: 'Impayées', value: `${stats?.unpaidInvoicesCount ?? 0}` },
            { label: 'Montant Dû', value: `${(stats?.totalUnpaidAmount ?? 0).toLocaleString('fr-FR')} €` },
          ],
          tooltip: 'État de la facturation et des relances de paiement',
        },
        {
          id: 'staff-paid',
          title: 'Règlements Encaissés',
          value: loading ? null : `${(stats?.totalPaidAmount ?? 0).toLocaleString('fr-FR')} €`,
          description: `${stats?.paidInvoicesCount ?? 0} facture(s) réglée(s)`,
          badge: 'Trésorerie',
          badgeVariant: 'success',
          icon: TrendingUp,
          progress: 100,
          subMetrics: [
            { label: 'Factures', value: `${stats?.paidInvoicesCount ?? 0} soldées` },
            { label: 'Flux', value: 'Validé' },
          ],
          tooltip: 'Montant cumulé encaissé sur la période en cours',
        },
      ]
    }

    return []
  }

  const metrics = getMetrics()

  return (
    <section aria-label="Statistiques par Rôle" className={cn('space-y-2 select-none', className)}>
      {/* Compact Header with Role Context */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            Indicateurs Clés — {roleBadgeLabel}
          </span>
          <Badge variant="secondary" className="text-[10px] py-0 px-2">
            Rôle Actif
          </Badge>
        </div>

        {error && (
          <button
            type="button"
            onClick={fetchStats}
            className="flex items-center gap-1.5 text-2xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Erreur de chargement (Réessayer)</span>
          </button>
        )}
      </div>

      {/* Grid of Compact shadcn/ui Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-7 rounded-lg" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-1.5 w-full rounded-full" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </Card>
            ))
          : metrics.map((m) => {
              const Icon = m.icon
              return (
                <Card
                  key={m.id}
                  className="p-3.5 hover:border-[#0F172A]/40 transition-colors cursor-pointer group flex flex-col justify-between"
                  onClick={() => onNavigate?.(m.id)}
                >
                  <CardHeader className="p-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] flex items-center justify-center shrink-0 group-hover:bg-[#0F172A] group-hover:text-white transition">
                        <Icon className="w-3.5 h-3.5 stroke-[2]" />
                      </div>
                      <Badge variant={m.badgeVariant} className="text-[10px] py-0 px-1.5 font-medium">
                        {m.badge}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <CardTitle className="text-2xs font-semibold text-[#64748B] uppercase tracking-wide">
                        {m.title}
                      </CardTitle>
                      {m.tooltip && (
                        <Tooltip delayDuration={50}>
                          <TooltipTrigger asChild>
                            <span className="text-[#94A3B8] hover:text-[#0F172A] transition">
                              <HelpCircle className="w-3 h-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">{m.tooltip}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 pt-1.5 space-y-2">
                    <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] leading-tight">
                      {m.value || '0'}
                    </div>

                    {m.description && (
                      <CardDescription className="text-2xs text-[#64748B] truncate">
                        {m.description}
                      </CardDescription>
                    )}

                    {m.progress !== undefined && (
                      <Progress
                        value={m.progress}
                        className="h-1 bg-[#F1F5F9]"
                        indicatorClassName={cn(
                          m.badgeVariant === 'success' ? 'bg-[#059669]' : 'bg-[#0F172A]'
                        )}
                      />
                    )}

                    {m.subMetrics && m.subMetrics.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F1F5F9] text-2xs">
                        {m.subMetrics.map((sub, sIdx) => (
                          <div key={sIdx} className="min-w-0">
                            <span className="text-[#94A3B8] block text-[10px] font-medium truncate">
                              {sub.label}
                            </span>
                            <span className="font-semibold text-[#0F172A] block truncate">
                              {sub.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
      </div>
    </section>
  )
}

export default RoleBasedUserStats
