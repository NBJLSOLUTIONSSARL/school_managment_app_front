import React, { useState, useEffect } from 'react';
import { schoolProfileService } from '../api/schoolProfileService';

export const SchoolProfileSettingsView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await schoolProfileService.getProfile();
        setProfile(data);
      } catch {
        // Non-blocking
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      const updated = await schoolProfileService.updateProfile(profile);
      setProfile(updated);
      setMessage({ type: 'success', text: 'Paramètres institutionnels mis à jour avec succès' });
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des paramètres' });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-xs text-gray-500">Chargement des paramètres...</div>;
  }

  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Paramètres de l'Établissement & Barèmes
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            Nom, cachet, coordonnées et configuration du barème de notation pour tous les documents officiels.
          </p>
        </div>
        {message && (
          <span
            className={`text-2xs px-2.5 py-1 rounded font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
            }`}
          >
            {message.text}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Identité école */}
        <div className="space-y-3">
          <div className="text-2xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Identité Institutionnelle
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de l'établissement *
              </label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse postale
              </label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Web
              </label>
              <input
                type="text"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Devise comptable
              </label>
              <input
                type="text"
                value={profile.currency || 'EUR'}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Barème de notation et bulletins */}
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-2xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Barème de Notation & Bulletins
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Note Maximale
              </label>
              <input
                type="number"
                step="0.5"
                value={profile.gradingScaleMax ?? 20}
                onChange={(e) => setProfile({ ...profile, gradingScaleMax: parseFloat(e.target.value) })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Moyenne d'Admission
              </label>
              <input
                type="number"
                step="0.5"
                value={profile.passingGrade ?? 10}
                onChange={(e) => setProfile({ ...profile, passingGrade: parseFloat(e.target.value) })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seuil Mention Bien
              </label>
              <input
                type="number"
                step="0.5"
                value={profile.highHonorsThreshold ?? 14}
                onChange={(e) => setProfile({ ...profile, highHonorsThreshold: parseFloat(e.target.value) })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modèle de Bulletin PDF
              </label>
              <select
                value={profile.reportCardTemplate || 'CLASSIC'}
                onChange={(e) => setProfile({ ...profile, reportCardTemplate: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="CLASSIC">Classique Académique</option>
                <option value="MODERN">Moderne Frappe Desk</option>
                <option value="MINIMAL">Épuré / Synthétique</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors shadow-2xs"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};
