import { Link } from 'react-router-dom'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { DocTimeline } from '@/components/ui/DocTimeline'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/hooks/useI18n'

export function DashboardView() {
  const { user } = useAuth()
  const { t } = useI18n()

  const stats = [
    {
      label: t('dashboard.stats.students'),
      value: '1 248',
      trend: t('dashboard.stats.studentsTrend'),
      status: 'Active',
    },
    {
      label: t('dashboard.stats.teachers'),
      value: '84',
      trend: t('dashboard.stats.teachersTrend'),
      status: 'Submitted',
    },
    {
      label: t('dashboard.stats.collection'),
      value: '94.2%',
      trend: t('dashboard.stats.collectionTrend'),
      status: 'Completed',
    },
    {
      label: t('dashboard.stats.pending'),
      value: '7',
      trend: t('dashboard.stats.pendingTrend'),
      status: 'Pending',
    },
  ]

  const recentActivities = [
    {
      user: t('dashboard.activities.user1'),
      time: t('dashboard.activities.time1'),
      content: t('dashboard.activities.content1'),
    },
    {
      user: t('dashboard.activities.user2'),
      time: t('dashboard.activities.time2'),
      content: t('dashboard.activities.content2'),
    },
    {
      user: t('dashboard.activities.user3'),
      time: t('dashboard.activities.time3'),
      content: t('dashboard.activities.content3'),
    },
  ]

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <DocTypePageHead
        breadcrumbs={[t('dashboard.breadcrumb'), t('common.dashboard')]}
        title={t('dashboard.title')}
        docstatus="Active"
        primaryAction={t('dashboard.primaryAction')}
        onPrimaryAction={() => {}}
        secondaryActions={[
          { label: t('dashboard.export'), onClick: () => {} },
          { label: t('dashboard.refresh'), onClick: () => {} },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">
              {t('dashboard.welcome', { name: user?.name || t('common.administrator') })}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">{t('dashboard.academicYear')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link to="/students">
              <Button variant="secondary" size="sm">
                {t('dashboard.viewStudents')}
              </Button>
            </Link>
            <Link to="/showcase">
              <Button variant="primary" size="sm">
                {t('dashboard.componentCatalog')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="space-y-2 rounded border border-slate-200 bg-white p-4 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs font-medium text-slate-500">{stat.label}</span>
                <StatusBadge status={stat.status} size="xs" />
              </div>
              <div className="text-xl font-bold tracking-tight text-slate-900">{stat.value}</div>
              <div className="text-[11px] text-slate-400">{stat.trend}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-6 md:col-span-3">
            <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="text-xs font-semibold text-slate-800">{t('dashboard.modulesTitle')}</h3>
                <span className="hidden font-mono text-2xs text-slate-400 sm:inline">
                  {t('dashboard.modulesSpec')}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                <Link
                  to="/students"
                  className="rounded border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  <div className="mb-1 font-semibold text-slate-800">
                    <span aria-hidden="true">🎓 </span>
                    {t('dashboard.studentsModule')}
                  </div>
                  <p className="text-2xs text-slate-500">{t('dashboard.studentsModuleDesc')}</p>
                </Link>

                <Link
                  to="/showcase"
                  className="rounded border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  <div className="mb-1 font-semibold text-slate-800">
                    <span aria-hidden="true">🧩 </span>
                    {t('dashboard.componentsModule')}
                  </div>
                  <p className="text-2xs text-slate-500">{t('dashboard.componentsModuleDesc')}</p>
                </Link>

                <Link
                  to="/admin-only"
                  className="rounded border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  <div className="mb-1 font-semibold text-slate-800">
                    <span aria-hidden="true">🛡️ </span>
                    {t('dashboard.securityModule')}
                  </div>
                  <p className="text-2xs text-slate-500">{t('dashboard.securityModuleDesc')}</p>
                </Link>
              </div>
            </div>

            <div className="rounded border border-slate-200 bg-white p-5 shadow-2xs">
              <DocTimeline activities={recentActivities} />
            </div>
          </div>

          <aside className="space-y-4 md:col-span-1">
            <div className="space-y-3 rounded border border-slate-200 bg-white p-4 text-xs shadow-2xs">
              <h4 className="border-b border-slate-100 pb-2 text-2xs font-semibold uppercase tracking-wider text-slate-500">
                {t('dashboard.metadataTitle')}
              </h4>
              <div className="space-y-2 text-2xs">
                <div>
                  <span className="text-slate-400">{t('dashboard.institution')} :</span>
                  <div className="font-medium text-slate-800">{t('dashboard.institutionValue')}</div>
                </div>
                <div>
                  <span className="text-slate-400">{t('dashboard.period')} :</span>
                  <div className="font-medium text-slate-800">{t('dashboard.periodValue')}</div>
                </div>
                <div>
                  <span className="text-slate-400">{t('dashboard.activeRole')} :</span>
                  <div className="font-medium text-slate-800">
                    {user?.roles?.[0] || t('roles.admin')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">{t('dashboard.gateway')} :</span>
                  <div className="font-mono text-slate-600">{t('dashboard.gatewayValue')}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export const DashboardPage = DashboardView
export default DashboardView
