import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  FileText,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { documentService } from '../../services/documentService';

export default function VerifyDocumentModal({
  isOpen,
  onClose,
  doc,
  onVerified,
  onOpenPreview
}) {
  const [decision, setDecision] = useState('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setDecision('APPROVED');
      setRejectionReason('');
      setError(null);
    }
  }, [isOpen, doc]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen && typeof window !== 'undefined' && window.document?.body) {
      window.document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (typeof window !== 'undefined' && window.document?.body) {
        window.document.body.style.overflow = 'auto';
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (decision === 'REJECTED' && !rejectionReason.trim()) {
      setError('Un motif de rejet est obligatoire en cas de refus.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        status: decision,
        rejectionReason: decision === 'REJECTED' ? rejectionReason.trim() : null
      };

      const res = await documentService.verifyDocument(doc.id, payload);
      const updated = res?.data || res;

      if (onVerified) {
        onVerified(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la validation du document.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#16222F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EFECE6] p-6 sm:p-8 z-10 my-8 transform transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-[#F4EDE2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] flex items-center justify-center text-[#16222F] shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#4361EE]" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif-title text-[#16222F]">
                Vérification du justificatif
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Instruction administrative et validation du document officiel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#A8A29E] hover:text-[#16222F] p-1.5 rounded-full hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16222F]">
                {doc.documentTypeName || `Document #${doc.id}`}
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                En attente d'instruction
              </span>
            </div>

            <div className="text-xs text-[#78716C] flex flex-wrap gap-x-4 gap-y-1 pt-1">
              {doc.userEmail && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>{doc.userEmail}</span>
                </span>
              )}
              {doc.uploadedAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>Déposé le {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</span>
                </span>
              )}
            </div>

            {onOpenPreview && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPreview(doc);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16222F] hover:text-[#4361EE] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Consulter le document avant de décider</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-2 uppercase tracking-wider">
              Décision administrative *
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  decision === 'APPROVED'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-[#FAF7F2] border-[#EFECE6] hover:bg-white text-[#78716C]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      decision === 'APPROVED' ? 'text-emerald-600' : 'text-[#A8A29E]'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      decision === 'APPROVED' ? 'text-emerald-900' : 'text-[#16222F]'
                    }`}
                  >
                    Approuver
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] leading-snug">
                  Déclarer conforme et valider
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  decision === 'REJECTED'
                    ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20'
                    : 'bg-[#FAF7F2] border-[#EFECE6] hover:bg-white text-[#78716C]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle
                    className={`w-4 h-4 ${
                      decision === 'REJECTED' ? 'text-rose-600' : 'text-[#A8A29E]'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      decision === 'REJECTED' ? 'text-rose-900' : 'text-[#16222F]'
                    }`}
                  >
                    Rejeter
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] leading-snug">
                  Refuser avec motif obligatoire
                </p>
              </button>
            </div>
          </div>

          {decision === 'APPROVED' && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1.5 animate-in fade-in">
              <h5 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirmation d'approbation</span>
              </h5>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Ce document sera officiellement approuvé et enregistré comme justificatif valide dans la base de données.
              </p>
            </div>
          )}

          {decision === 'REJECTED' && (
            <div className="space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-rose-900">
                Motif officiel du rejet (obligatoire) *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Précisez la raison du refus (ex: Document illisible, mauvaise année académique, pièce manquante...)"
                className="w-full bg-[#FAF7F2] border border-rose-200 rounded-2xl p-3 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <p className="text-[11px] text-[#78716C]">
                Ce motif sera visible par l'élève ou le candidat pour qu'il puisse soumettre un document conforme.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4EDE2]">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting || (decision === 'REJECTED' && !rejectionReason.trim())}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                decision === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {decision === 'APPROVED' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
