import React, { useState, useEffect, useCallback } from 'react';
import { addonService } from '../api/addonService';
import { HeartPulse, ShieldAlert, Plus, Search, FileText, CheckCircle, AlertTriangle, User } from 'lucide-react';

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getNowDateTime = () => new Date().toISOString().slice(0, 16);

const DISPOSITIONS = [
  { value: 'RETURNED_TO_CLASS', label: 'Retour en classe', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'SENT_HOME', label: 'Retour à domicile', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'HOSPITALIZED', label: 'Évacuation médicale / Hôpital', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'PENDING', label: 'En observation', color: 'bg-blue-50 text-blue-700 border-blue-200' },
];

export default function HealthCenterView() {
  const [activeTab, setActiveTab] = useState('visits'); // 'visits' | 'vaccinations' | 'dossier'
  const [visits, setVisits] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Dossier
  const [lookupStudentId, setLookupStudentId] = useState('');
  const [studentDossier, setStudentDossier] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);

  // Modals
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showVacModal, setShowVacModal] = useState(false);

  // Forms
  const [visitForm, setVisitForm] = useState(() => ({
    studentId: '',
    visitDateTime: getNowDateTime(),
    symptoms: '',
    treatment: '',
    disposition: 'RETURNED_TO_CLASS',
    parentNotified: false,
    nurseNotes: '',
  }));

  const [vacForm, setVacForm] = useState(() => ({
    studentId: '',
    vaccineName: '',
    dateAdministered: getTodayDate(),
    doseNumber: 1,
    nextDueDate: '',
    administeredBy: '',
    notes: '',
  }));

  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [vPage, vacList, statsData] = await Promise.all([
        addonService.getInfirmaryVisits(undefined, 0, 30).catch(() => ({ content: [] })),
        addonService.getVaccinations().catch(() => []),
        addonService.getHealthStats().catch(() => null),
      ]);
      setVisits(vPage?.content || []);
      setVaccinations(vacList);
      setStats(statsData);
    } catch (err) {
      if (err.response?.status === 403) {
        setMessage({ type: 'error', text: 'Accès restreint : Seuls les infirmiers et administrateurs peuvent consulter le pôle santé.' });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors du chargement des données de l’infirmerie.' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleLookupDossier = async (e) => {
    e.preventDefault();
    if (!lookupStudentId) return;
    try {
      setDossierLoading(true);
      const dossier = await addonService.getStudentHealthDossier(lookupStudentId);
      setStudentDossier(dossier);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Dossier médical introuvable pour cet élève.' });
      setStudentDossier(null);
    } finally {
      setDossierLoading(false);
    }
  };

  const handleCreateVisit = async (e) => {
    e.preventDefault();
    try {
      await addonService.createInfirmaryVisit({
        ...visitForm,
        studentId: parseInt(visitForm.studentId, 10),
      });
      setMessage({ type: 'success', text: 'Passage infirmerie enregistré avec succès.' });
      setShowVisitModal(false);
      setVisitForm({
        studentId: '',
        visitDateTime: getNowDateTime(),
        symptoms: '',
        treatment: '',
        disposition: 'RETURNED_TO_CLASS',
        parentNotified: false,
        nurseNotes: '',
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de l’enregistrement de la visite.' });
    }
  };

  const handleCreateVac = async (e) => {
    e.preventDefault();
    try {
      await addonService.createVaccination({
        ...vacForm,
        studentId: parseInt(vacForm.studentId, 10),
        doseNumber: parseInt(vacForm.doseNumber, 10),
        nextDueDate: vacForm.nextDueDate || null,
      });
      setMessage({ type: 'success', text: 'Vaccination ajoutée au carnet de santé.' });
      setShowVacModal(false);
      setVacForm({
        studentId: '',
        vaccineName: '',
        dateAdministered: getTodayDate(),
        doseNumber: 1,
        nextDueDate: '',
        administeredBy: '',
        notes: '',
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Erreur lors de l’ajout du vaccin.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Privacy Alert */}
      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>
            <strong>Espace Médical Confidentiel (HIPAA / RGPD) :</strong> Accès strictement réservé au personnel médical (Infirmière) et Direction. Chaque consultation et modification fait l'objet d'un audit horodaté immuable.
          </span>
        </div>
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-red-600" /> Infirmerie & Santé Scolaire
          </h2>
          <p className="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">
            Suivi des soins d'urgence, carnet vaccinal et dossiers médicaux des élèves.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'visits' && (
            <button
              onClick={() => setShowVisitModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle Visite
            </button>
          )}
          {activeTab === 'vaccinations' && (
            <button
              onClick={() => setShowVacModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Nouveau Vaccin
            </button>
          )}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Passages Infirmerie</span>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{stats?.totalVisits ?? visits.length}</span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Visites ce Mois</span>
          <span className="text-lg font-bold text-blue-600">{stats?.monthlyVisits ?? '—'}</span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Retours à Domicile</span>
          <span className="text-lg font-bold text-amber-600">
            {visits.filter((v) => v.disposition === 'SENT_HOME').length}
          </span>
        </div>
        <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs">
          <span className="text-2xs text-gray-500 uppercase tracking-wider block">Carnets Vaccinaux Enregistrés</span>
          <span className="text-lg font-bold text-emerald-600">{vaccinations.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 text-xs">
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'visits'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Registre des Soins & Visites ({visits.length})
        </button>
        <button
          onClick={() => setActiveTab('vaccinations')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'vaccinations'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Suivi Vaccinal ({vaccinations.length})
        </button>
        <button
          onClick={() => setActiveTab('dossier')}
          className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'dossier'
              ? 'border-red-600 text-red-600 dark:text-red-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Dossier Médical Individuel
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-500">Chargement des données de l’infirmerie...</div>
      ) : activeTab === 'visits' ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-2xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="py-2.5 px-3">Date & Heure</th>
                <th className="py-2.5 px-3">Élève</th>
                <th className="py-2.5 px-3">Symptômes / Motif</th>
                <th className="py-2.5 px-3">Soins & Traitement</th>
                <th className="py-2.5 px-3">Orientation</th>
                <th className="py-2.5 px-3 text-center">Parents Notifiés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 text-xs">
                    Aucune visite enregistrée à l’infirmerie.
                  </td>
                </tr>
              ) : (
                visits.map((v) => {
                  const disp = DISPOSITIONS.find((d) => d.value === v.disposition) || DISPOSITIONS[0];
                  return (
                    <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                      <td className="py-2.5 px-3 font-mono text-2xs text-gray-600 dark:text-gray-300">
                        {v.visitDateTime?.replace('T', ' ')}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-gray-100">
                        {v.studentName || `Élève #${v.studentId}`}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 dark:text-gray-200 font-medium">
                        {v.symptoms}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                        {v.treatment || 'Repos / surveillance'}
                        {v.nurseNotes && <div className="text-2xs text-gray-400 mt-0.5">{v.nurseNotes}</div>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-2xs font-semibold border ${disp.color}`}>
                          {disp.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {v.parentNotified ? (
                          <span className="inline-flex items-center gap-1 text-2xs text-emerald-600 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Oui
                          </span>
                        ) : (
                          <span className="text-2xs text-gray-400">Non</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'vaccinations' ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-2xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="py-2.5 px-3">Élève</th>
                <th className="py-2.5 px-3">Vaccin</th>
                <th className="py-2.5 px-3">Dose</th>
                <th className="py-2.5 px-3">Date d'injection</th>
                <th className="py-2.5 px-3">Prochain Rappel</th>
                <th className="py-2.5 px-3">Praticien / Centre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {vaccinations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 text-xs">
                    Aucun vaccin consigné dans le registre.
                  </td>
                </tr>
              ) : (
                vaccinations.map((vac) => (
                  <tr key={vac.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                    <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-gray-100">
                      {vac.studentName || `Élève #${vac.studentId}`}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-700 dark:text-gray-300">
                      {vac.vaccineName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-2xs rounded font-medium">
                        Dose {vac.doseNumber}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-600 dark:text-gray-300">
                      {vac.dateAdministered}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-2xs">
                      {vac.nextDueDate ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">{vac.nextDueDate}</span>
                      ) : (
                        <span className="text-gray-400">À jour</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-2xs">
                      {vac.administeredBy || 'Infirmerie scolaire'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Student Dossier Lookup */
        <div className="space-y-4">
          <form onSubmit={handleLookupDossier} className="flex items-center gap-2 max-w-md">
            <input
              type="number"
              placeholder="Entrez l’ID de l’élève (ex: 1)..."
              value={lookupStudentId}
              onChange={(e) => setLookupStudentId(e.target.value)}
              className="flex-1 text-xs border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
            <button
              type="submit"
              disabled={dossierLoading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded inline-flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" /> Consulter Dossier
            </button>
          </form>

          {studentDossier && (
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-red-600" />
                    Dossier Médical : {studentDossier.studentName}
                  </h3>
                  <p className="text-2xs text-gray-500">ID Élève : #{studentDossier.studentId}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    Groupe Sanguin : {studentDossier.bloodGroup || 'Non renseigné'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded">
                  <h4 className="text-2xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Allergies & Intolérances
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {studentDossier.allergies || 'Aucune allergie connue déclarée.'}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded">
                  <h4 className="text-2xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Pathologies & Conditions Chroniques
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {studentDossier.chronicConditions || 'Aucun traitement de fond signalé.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-2xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Historique des Passages à l’Infirmerie ({studentDossier.visits?.length || 0})
                </h4>
                {studentDossier.visits?.length === 0 ? (
                  <p className="text-2xs text-gray-400">Aucun passage consigné.</p>
                ) : (
                  <div className="space-y-1.5">
                    {studentDossier.visits.map((v) => (
                      <div key={v.id} className="p-2 bg-gray-50 dark:bg-gray-750 rounded text-xs flex justify-between">
                        <div>
                          <span className="font-mono text-2xs text-gray-500 mr-2">{v.visitDateTime?.slice(0, 10)}:</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{v.symptoms}</span>
                          {v.treatment && <span className="text-gray-500 ml-2">({v.treatment})</span>}
                        </div>
                        <span className="text-2xs font-medium text-gray-600 dark:text-gray-300">{v.disposition}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-600" /> Enregistrer un Passage Infirmerie
            </h3>
            <form onSubmit={handleCreateVisit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">ID Élève *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 1"
                    value={visitForm.studentId}
                    onChange={(e) => setVisitForm({ ...visitForm, studentId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date & Heure *</label>
                  <input
                    type="datetime-local"
                    required
                    value={visitForm.visitDateTime}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDateTime: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Motif / Symptômes observés *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Céphalées intenses, fièvre 38.5°C"
                  value={visitForm.symptoms}
                  onChange={(e) => setVisitForm({ ...visitForm, symptoms: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Soins administrés</label>
                <input
                  type="text"
                  placeholder="Ex: Paracétamol 500mg, repos 30 min, poche de glace"
                  value={visitForm.treatment}
                  onChange={(e) => setVisitForm({ ...visitForm, treatment: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Décision / Orientation</label>
                <select
                  value={visitForm.disposition}
                  onChange={(e) => setVisitForm({ ...visitForm, disposition: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  {DISPOSITIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="parentNotified"
                  checked={visitForm.parentNotified}
                  onChange={(e) => setVisitForm({ ...visitForm, parentNotified: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <label htmlFor="parentNotified" className="text-2xs font-medium text-gray-700 dark:text-gray-300">
                  Famille / Tuteur contacté par téléphone
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                >
                  Enregistrer Visite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vaccination Modal */}
      {showVacModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-600" /> Ajouter un Vaccin au Carnet
            </h3>
            <form onSubmit={handleCreateVac} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">ID Élève *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 1"
                    value={vacForm.studentId}
                    onChange={(e) => setVacForm({ ...vacForm, studentId: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Dose n°</label>
                  <input
                    type="number"
                    min="1"
                    value={vacForm.doseNumber}
                    onChange={(e) => setVacForm({ ...vacForm, doseNumber: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Nom du Vaccin *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DTP (Diphtérie-Tétanos-Poliomyélite)"
                  value={vacForm.vaccineName}
                  onChange={(e) => setVacForm({ ...vacForm, vaccineName: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date d'injection *</label>
                  <input
                    type="date"
                    required
                    value={vacForm.dateAdministered}
                    onChange={(e) => setVacForm({ ...vacForm, dateAdministered: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date Prochain Rappel</label>
                  <input
                    type="date"
                    value={vacForm.nextDueDate}
                    onChange={(e) => setVacForm({ ...vacForm, nextDueDate: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-medium text-gray-600 dark:text-gray-300 mb-1">Praticien / Centre</label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Martin / Centre de Santé Scolaire"
                  value={vacForm.administeredBy}
                  onChange={(e) => setVacForm({ ...vacForm, administeredBy: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowVacModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                >
                  Enregistrer Vaccin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
