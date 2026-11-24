import React, { useState, useEffect, useCallback } from 'react';
import { addonService } from '../api/addonService';
import { Sparkles, Users, Plus, Trash2, Calendar, MapPin } from 'lucide-react';

const CATEGORIES = [
  { value: 'ROBOTICS', label: 'Robotique & Coding' },
  { value: 'SPORTS', label: 'Sports & Athlétisme' },
  { value: 'CHESS', label: 'Échecs & Stratégie' },
  { value: 'THEATER', label: 'Théâtre & Expression' },
  { value: 'MUSIC', label: 'Musique & Chorale' },
  { value: 'ARTS', label: 'Arts Plastiques' },
  { value: 'SCIENCE', label: 'Sciences & Nature' },
  { value: 'DEBATE', label: 'Débat & Éloquence' },
  { value: 'OTHER', label: 'Autre' },
];

export default function ClubsActivitiesView() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showClubModal, setShowClubModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Forms
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
    category: 'ROBOTICS',
    supervisorTeacherId: '',
    schedule: 'Mercredi 14h00 - 16h00',
    roomLocation: '',
    maxCapacity: 20,
  });

  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    clubId: '',
    notes: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await addonService.getClubs({ category: selectedCategory || undefined });
      setClubs(data);
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des clubs périscolaires.' });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadData]);

  const loadClubMembers = async (club) => {
    try {
      setSelectedClub(club);
      setMembersLoading(true);
      const m = await addonService.getClubMembers(club.id);
      setMembers(m);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger la liste des membres.' });
    } finally {
      setMembersLoading(false);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await addonService.createClub({
        ...clubForm,
        supervisorTeacherId: clubForm.supervisorTeacherId ? parseInt(clubForm.supervisorTeacherId, 10) : null,
        maxCapacity: parseInt(clubForm.maxCapacity, 10) || 20,
      });
      setMessage({ type: 'success', text: 'Nouveau club créé avec succès.' });
      setShowClubModal(false);
      setClubForm({
        name: '',
        description: '',
        category: 'ROBOTICS',
        supervisorTeacherId: '',
        schedule: 'Mercredi 14h00 - 16h00',
        roomLocation: '',
        maxCapacity: 20,
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de la création du club.' });
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await addonService.enrollStudent({
        studentId: parseInt(enrollForm.studentId, 10),
        clubId: parseInt(enrollForm.clubId, 10),
        notes: enrollForm.notes || null,
      });
      const isWait = res.status === 'WAITLISTED';
      setMessage({
        type: 'success',
        text: isWait
          ? 'Club complet : Élève placé sur liste d’attente.'
          : 'Inscription de l’élève confirmée.',
      });
      setShowEnrollModal(false);
      setEnrollForm({ studentId: '', clubId: '', notes: '' });
      loadData();
      if (selectedClub && selectedClub.id === parseInt(enrollForm.clubId, 10)) {
        loadClubMembers(selectedClub);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de l’inscription au club.' });
    }
  };

  const handleUpdateStatus = async (enrollmentId, newStatus) => {
    try {
      await addonService.updateEnrollmentStatus(enrollmentId, newStatus);
      setMessage({ type: 'success', text: 'Statut d’inscription actualisé.' });
      if (selectedClub) {
        loadClubMembers(selectedClub);
      }
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors du changement de statut.' });
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm('Voulez-vous supprimer ce club ?')) return;
    try {
      await addonService.deleteClub(id);
      setMessage({ type: 'success', text: 'Club supprimé.' });
      if (selectedClub?.id === id) {
        setSelectedClub(null);
        setMembers([]);
      }
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur de suppression.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> Activités Périscolaires & Clubs
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            Clubs thématiques, gestion des jauges et suivi des inscriptions d'élèves.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEnrollForm((prev) => ({ ...prev, clubId: clubs[0]?.id?.toString() || '' }));
              setShowEnrollModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 rounded shadow-xs"
          >
            <Users className="w-3.5 h-3.5" /> Inscrire un Élève
          </button>
          <button
            onClick={() => setShowClubModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Nouveau Club
          </button>
        </div>
      </div>

      {/* Messages */}
      {message.text && (
        <div
          className={`p-3 rounded text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2">
        <span className="text-2xs font-semibold text-gray-500 uppercase">Domaine / Catégorie :</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
          <option value="">Tous les domaines</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Clubs Grid & Member Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Clubs Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Chargement des clubs...</div>
          ) : clubs.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs">
              Aucun club actif répertorié.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clubs.map((c) => {
                const count = c.currentEnrollmentCount || 0;
                const max = c.maxCapacity || 20;
                const pct = Math.min(100, Math.round((count / max) * 100));
                const isSelected = selectedClub?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => loadClubMembers(c)}
                    className={`p-4 bg-white dark:bg-gray-800 border rounded shadow-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 ring-1 ring-purple-600'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-2xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800 mb-1">
                          {CATEGORIES.find((cat) => cat.value === c.category)?.label || c.category}
                        </span>
                        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100">{c.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClub(c.id);
                        }}
                        className="text-gray-300 hover:text-red-500 p-1"
                        title="Supprimer le club"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-2xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {c.description || 'Club périscolaire ouvert aux élèves volontaires.'}
                    </p>

                    <div className="space-y-1 text-2xs text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{c.schedule || 'Créneau hebdomadaire'}</span>
                      </div>
                      {c.roomLocation && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{c.roomLocation}</span>
                        </div>
                      )}
                      {c.supervisorTeacherName && (
                        <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                          <Users className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>Resp: {c.supervisorTeacherName}</span>
                        </div>
                      )}
                    </div>

                    {/* Capacity Bar */}
                    <div>
                      <div className="flex items-center justify-between text-2xs mb-1">
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                          Inscrits : {count} / {max}
                        </span>
                        <span className={`font-bold ${pct >= 100 ? 'text-red-500' : 'text-purple-600'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 100 ? 'bg-red-500' : 'bg-purple-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected Club Members List */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <div className="pb-3 border-b border-gray-100 dark:border-gray-700 mb-3">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              {selectedClub ? `Membres : ${selectedClub.name}` : 'Membres du Club'}
            </h3>
            <p className="text-2xs text-gray-500 mt-0.5">
              {selectedClub
                ? 'Sélectionnez un club pour gérer les approbations ou les listes d’attente.'
                : 'Cliquez sur une carte de club pour afficher ses effectifs.'}
            </p>
          </div>

          {membersLoading ? (
            <div className="py-8 text-center text-xs text-gray-400">Chargement des membres...</div>
          ) : !selectedClub ? (
            <div className="py-12 text-center text-xs text-gray-400">Aucun club sélectionné.</div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Aucun élève inscrit dans ce club pour l'instant.
            </div>
          ) : (
            <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800">
              {members.map((m) => (
                <div key={m.id} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">
                      {m.studentName || `Élève #${m.studentId}`}
                    </div>
                    <div className="text-2xs text-gray-400">
                      Inscrit le {m.enrolledAt ? m.enrolledAt.slice(0, 10) : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-2xs font-semibold ${
                        m.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : m.status === 'WAITLISTED'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {m.status}
                    </span>
                    {m.status === 'WAITLISTED' && (
                      <button
                        onClick={() => handleUpdateStatus(m.id, 'APPROVED')}
                        className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-2xs font-medium"
                      >
                        Valider
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Club Modal */}
      {showClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Créer un Club Périscolaire
            </h3>
            <form onSubmit={handleCreateClub} className="space-y-3 text-xs">
              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nom du Club *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Club Robotique & IA"
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Domaine / Catégorie *</label>
                <select
                  value={clubForm.category}
                  onChange={(e) => setClubForm({ ...clubForm, category: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Objectifs de l'atelier, projets annuels, public visé..."
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Créneau horaire *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mercredi 14h-16h"
                    value={clubForm.schedule}
                    onChange={(e) => setClubForm({ ...clubForm, schedule: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Lieu / Salle</label>
                  <input
                    type="text"
                    placeholder="Ex: Labo Sciences 1"
                    value={clubForm.roomLocation}
                    onChange={(e) => setClubForm({ ...clubForm, roomLocation: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Capacité Max (Élèves)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={clubForm.maxCapacity}
                    onChange={(e) => setClubForm({ ...clubForm, maxCapacity: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">ID Enseignant Responsable</label>
                  <input
                    type="number"
                    placeholder="Ex: 3"
                    value={clubForm.supervisorTeacherId}
                    onChange={(e) => setClubForm({ ...clubForm, supervisorTeacherId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowClubModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded"
                >
                  Créer le Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Inscription Élève à un Club
            </h3>
            <form onSubmit={handleEnrollStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Club *</label>
                <select
                  required
                  value={enrollForm.clubId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, clubId: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Sélectionner un club</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.currentEnrollmentCount || 0}/{c.maxCapacity} inscrits)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">ID Élève *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 1"
                  value={enrollForm.studentId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Motivations / Remarques</label>
                <input
                  type="text"
                  placeholder="Ex: Passionné par les échecs depuis 2 ans"
                  value={enrollForm.notes}
                  onChange={(e) => setEnrollForm({ ...enrollForm, notes: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded"
                >
                  Confirmer Inscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
