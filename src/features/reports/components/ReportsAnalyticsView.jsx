import React, { useState, useEffect, useCallback } from 'react';
import { reportService } from '../api/reportService';

export const ReportsAnalyticsView = () => {
  const [activeTab, setActiveTab] = useState('enrollment');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadReport = useCallback(async (tab) => {
    try {
      setLoading(true);
      setData(null);
      let res;
      switch (tab) {
        case 'enrollment':
          res = await reportService.getEnrollmentReport({});
          break;
        case 'attendance':
          res = await reportService.getAttendanceReport({});
          break;
        case 'academic':
          res = await reportService.getAcademicReport({});
          break;
        case 'finance':
          res = await reportService.getFinanceReport({});
          break;
        case 'staff':
          res = await reportService.getStaffReport({});
          break;
        default:
          res = null;
      }
      setData(res);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) loadReport(activeTab);
    });
    return () => {
      active = false;
    };
  }, [activeTab, loadReport]);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const blob = await reportService.exportReport(activeTab, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${activeTab}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      // Non-blocking
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Moteur de Rapports & Analyses Multi-Critères (Spec 4.16)
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            Indicateurs consolidés, ratios d'assiduité, performances scolaires, finances et personnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="text-2xs px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            {exporting ? 'Export...' : 'Exporter CSV'}
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="text-2xs px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            {exporting ? 'Export...' : 'Exporter PDF'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 gap-1 text-xs font-medium">
        {[
          { key: 'enrollment', label: 'Effectifs & Inscriptions' },
          { key: 'attendance', label: 'Assiduité & Présences' },
          { key: 'academic', label: 'Résultats Scolaires' },
          { key: 'finance', label: 'Finances & Recouvrement' },
          { key: 'staff', label: 'Personnel & Charge Horaire' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-xs text-gray-500 animate-pulse">
          Calcul et agrégation des indicateurs...
        </div>
      ) : !data ? (
        <div className="py-8 text-center text-xs text-gray-500">Aucune donnée disponible.</div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'enrollment' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Total Élèves</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{data.totalEnrolled}</div>
              </div>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-2xs text-emerald-700 uppercase">Élèves Actifs</div>
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1">{data.activeStudents}</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Inactifs</div>
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">{data.inactiveStudents}</div>
              </div>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900/30">
                <div className="text-2xs text-blue-700 uppercase">Diplômés</div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-1">{data.graduatedStudents}</div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-2xs text-emerald-700 uppercase">Taux d'Assiduité</div>
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1">{data.overallAssiduityRate}%</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Présences</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{data.presentCount}</div>
              </div>
              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded border border-rose-100 dark:border-rose-900/30">
                <div className="text-2xs text-rose-700 uppercase">Absences</div>
                <div className="text-lg font-bold text-rose-800 dark:text-rose-300 mt-1">{data.absentCount}</div>
              </div>
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded border border-amber-100 dark:border-amber-900/30">
                <div className="text-2xs text-amber-700 uppercase">Retards</div>
                <div className="text-lg font-bold text-amber-800 dark:text-amber-300 mt-1">{data.lateCount}</div>
              </div>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900/30">
                <div className="text-2xs text-blue-700 uppercase">Excusées</div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-1">{data.excusedCount}</div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900/30">
                <div className="text-2xs text-blue-700 uppercase">Moyenne Générale</div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-1">{data.overallAverage} / 20</div>
              </div>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-2xs text-emerald-700 uppercase">Taux de Réussite</div>
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1">{data.passingRate}%</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Note Max</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{data.highestAverage} / 20</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Total Évaluations</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{data.totalGrades}</div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-2xs text-emerald-700 uppercase">Taux Recouvrement</div>
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1">{data.recoveryRate}%</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Total Facturé</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{data.totalInvoiced} EUR</div>
              </div>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900/30">
                <div className="text-2xs text-blue-700 uppercase">Encaissé</div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-1">{data.totalCollected} EUR</div>
              </div>
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded border border-indigo-100 dark:border-indigo-900/30">
                <div className="text-2xs text-indigo-700 uppercase">Flux Net</div>
                <div className="text-lg font-bold text-indigo-800 dark:text-indigo-300 mt-1">{data.netCashFlow} EUR</div>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Effectif Administratif</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{data.totalStaff}</div>
              </div>
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900/30">
                <div className="text-2xs text-blue-700 uppercase">Corps Enseignant</div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-300 mt-1">{data.totalTeachers}</div>
              </div>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-2xs text-emerald-700 uppercase">Note Moyenne RH</div>
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1">{data.averageEvaluationScore} / 5</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-700">
                <div className="text-2xs text-gray-500 uppercase">Heures Hebdo Cumulées</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">{data.totalWeeklyWorkloadHours} h</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
