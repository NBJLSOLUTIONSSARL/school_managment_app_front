import React, { useState, useEffect, useCallback } from 'react';
import { staffEvaluationService } from '../api/staffEvaluationService';

export const StaffEvaluationsModal = ({ isOpen, onClose, staff }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(() => ({
    period: '2026-T1',
    evaluationDate: new Date().toISOString().split('T')[0],
    overallRating: 4,
    pedagogicalSkills: 4,
    punctualityAttendance: 5,
    communication: 4,
    strengths: '',
    areasForImprovement: '',
    comments: '',
  }));

  const loadEvaluations = useCallback(async () => {
    if (!staff?.id) return;
    try {
      setLoading(true);
      const data = await staffEvaluationService.getByStaff(staff.id);
      setEvaluations(data);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, [staff]);

  useEffect(() => {
    let active = true;
    if (isOpen && staff) {
      Promise.resolve().then(() => {
        if (active) loadEvaluations();
      });
    }
    return () => {
      active = false;
    };
  }, [isOpen, staff, loadEvaluations]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!staff?.id) return;

    try {
      setCreating(true);
      await staffEvaluationService.create({
        staffId: staff.id,
        ...formData,
      });
      setFormData({
        period: '2026-T1',
        evaluationDate: new Date().toISOString().split('T')[0],
        overallRating: 4,
        pedagogicalSkills: 4,
        punctualityAttendance: 5,
        communication: 4,
        strengths: '',
        areasForImprovement: '',
        comments: '',
      });
      loadEvaluations();
    } catch {
      // Non-blocking
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen || !staff) return null;

  const staffName = staff.user ? `${staff.user.firstName || ''} ${staff.user.lastName || ''}`.trim() : `Membre #${staff.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Évaluations de Performance — {staffName}
            </h3>
            <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
              Poste : {staff.position || '-'} · Département : {staff.department?.name || '-'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none p-1"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Create form */}
          <form onSubmit={handleCreate} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-md border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="text-2xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Nouvelle Évaluation Annuelle / Périodique
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Période</label>
                <input
                  type="text"
                  required
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.evaluationDate}
                  onChange={(e) => setFormData({ ...formData, evaluationDate: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Note Globale (1-5)</label>
                <select
                  value={formData.overallRating}
                  onChange={(e) => setFormData({ ...formData, overallRating: parseInt(e.target.value, 10) })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Très Bien</option>
                  <option value={3}>3 - Satisfaisant</option>
                  <option value={2}>2 - À Améliorer</option>
                  <option value={1}>1 - Insuffisant</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Assiduité (1-5)</label>
                <select
                  value={formData.punctualityAttendance}
                  onChange={(e) => setFormData({ ...formData, punctualityAttendance: parseInt(e.target.value, 10) })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value={5}>5 / 5</option>
                  <option value={4}>4 / 5</option>
                  <option value={3}>3 / 5</option>
                  <option value={2}>2 / 5</option>
                  <option value={1}>1 / 5</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Points Forts</label>
                <textarea
                  rows={2}
                  placeholder="Points forts observés..."
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-2xs text-gray-600 dark:text-gray-400 mb-1">Axes d'Amélioration</label>
                <textarea
                  rows={2}
                  placeholder="Axes de progression..."
                  value={formData.areasForImprovement}
                  onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                  className="w-full text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                {creating ? 'Enregistrement...' : '+ Enregistrer l\'Évaluation'}
              </button>
            </div>
          </form>

          {/* Evaluations list */}
          {loading ? (
            <div className="text-center py-6 text-xs text-gray-500">Chargement des évaluations...</div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500">Aucune évaluation enregistrée pour ce membre.</div>
          ) : (
            <div className="space-y-2">
              {evaluations.map((ev) => (
                <div key={ev.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">{ev.period}</span>
                      <span className="text-2xs text-gray-500">({ev.evaluationDate})</span>
                      <span className="text-2xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-medium">
                        Note : {ev.overallRating}/5
                      </span>
                    </div>
                    <span className="text-2xs font-mono text-gray-500">Par : {ev.evaluatorName || 'Direction'}</span>
                  </div>
                  {ev.strengths && (
                    <div className="text-2xs text-gray-700 dark:text-gray-300 mt-1">
                      <strong className="text-emerald-700 dark:text-emerald-400">Forces :</strong> {ev.strengths}
                    </div>
                  )}
                  {ev.areasForImprovement && (
                    <div className="text-2xs text-gray-700 dark:text-gray-300 mt-0.5">
                      <strong className="text-amber-700 dark:text-amber-400">Axes de progrès :</strong> {ev.areasForImprovement}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
