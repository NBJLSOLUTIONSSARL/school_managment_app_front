import { useState } from 'react'
import { UploadCloud, FileText, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { studentAcademicService } from '@/features/academics/api/studentAcademicService'

export function StudentImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [report, setReport] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setReport(null)
      setErrorMsg(null)
    }
  }

  // Phase 1: Dry-Run Validation
  const handleValidate = async () => {
    if (!file) return
    setValidating(true)
    setErrorMsg(null)
    const res = await studentAcademicService.importStudents(file, true)
    setValidating(false)
    if (res.success) {
      setReport(res.data)
    } else {
      setErrorMsg(res.error?.message || 'Erreur lors de la validation du fichier CSV')
    }
  }

  // Phase 2: Commit Real Import
  const handleCommit = async () => {
    if (!file) return
    setImporting(true)
    setErrorMsg(null)
    const res = await studentAcademicService.importStudents(file, false)
    setImporting(false)
    if (res.success) {
      alert(`Importation réussie : ${res.data?.importedRows || 0} élève(s) importé(s) avec succès !`)
      onSuccess?.()
      onClose?.()
    } else {
      setErrorMsg(res.error?.message || "Erreur lors de l'enregistrement final des élèves")
    }
  }

  const handleReset = () => {
    setFile(null)
    setReport(null)
    setErrorMsg(null)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importation d'élèves en masse (CSV)"
      description="Format attendu : prenom, nom, email, matricule, date_naissance (YYYY-MM-DD), sexe, adresse"
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Upload area */}
        {!report ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center hover:border-slate-400">
            <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-xs font-medium text-slate-700">
              {file ? file.name : 'Sélectionner un fichier CSV'}
            </p>
            <p className="mt-0.5 text-2xs text-slate-400">
              Séparateur virgule (,), encodage UTF-8 recommandé
            </p>
            <label className="mt-3 inline-block cursor-pointer rounded bg-slate-900 px-3 py-1.5 text-2xs font-medium text-white hover:bg-slate-800">
              Parcourir les fichiers
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          /* File loaded pill */
          <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-2.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <span className="font-medium text-slate-800">{file?.name}</span>
            </div>
            <Button size="2xs" variant="ghost" onClick={handleReset}>
              Changer de fichier
            </Button>
          </div>
        )}

        {errorMsg && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Validation Report (Dry-Run results) */}
        {report && (
          <div className="space-y-3">
            <h4 className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
              Rapport d'analyse préalable (Dry-Run)
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded border border-slate-200 bg-white p-3 text-center">
                <span className="text-3xs text-slate-500">Lignes lues</span>
                <p className="font-mono text-base font-bold text-slate-800">{report.totalRows}</p>
              </div>
              <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-center">
                <span className="text-3xs text-emerald-700">Lignes valides</span>
                <p className="font-mono text-base font-bold text-emerald-700">{report.validRows}</p>
              </div>
              <div className="rounded border border-rose-200 bg-rose-50 p-3 text-center">
                <span className="text-3xs text-rose-700">Erreurs bloquantes</span>
                <p className="font-mono text-base font-bold text-rose-700">{report.errorCount}</p>
              </div>
            </div>

            {/* Error list */}
            {report.errorCount > 0 && (
              <div className="rounded border border-rose-200 bg-rose-50/50 p-3">
                <div className="mb-2 flex items-center gap-1.5 font-semibold text-rose-800">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span>Détail des erreurs détectées dans le fichier :</span>
                </div>
                <ul className="max-h-40 space-y-1 overflow-y-auto pl-5 font-mono text-3xs text-rose-700 list-disc">
                  {report.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.validRows > 0 && report.errorCount === 0 && (
              <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Toutes les lignes sont conformes et prêtes à être importées.</span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <Button variant="outline" size="xs" onClick={onClose}>
            Fermer
          </Button>

          {!report ? (
            <Button
              size="xs"
              disabled={!file || validating}
              onClick={handleValidate}
            >
              {validating ? 'Validation en cours...' : 'Vérifier le fichier (Dry-Run)'}
            </Button>
          ) : (
            report.validRows > 0 && (
              <Button
                size="xs"
                variant="primary"
                disabled={importing}
                onClick={handleCommit}
              >
                {importing ? 'Importation...' : `Importer ${report.validRows} élève(s)`}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )
          )}
        </div>
      </div>
    </Modal>
  )
}
