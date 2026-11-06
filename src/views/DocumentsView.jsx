import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  Folder,
} from 'lucide-react';
import HeroBanner from '../components/common/HeroBanner';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import DocumentViewerModal from '../components/documents/DocumentViewerModal';
import VerifyDocumentModal from '../components/documents/VerifyDocumentModal';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/documentService';

export default function DocumentsView() {
  const { hasAnyRole, searchQuery } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalError, setModalError] = useState(null);
  const [localSearch, setLocalSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [documentTypeId, setDocumentTypeId] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocId, setViewerDocId] = useState(null);
  const [viewerInitialDoc, setViewerInitialDoc] = useState(null);

  const canVerify = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getMyDocuments();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setDocuments(list);
    } catch (err) {
      setError(err.message || 'Impossible de charger les documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleOpenUpload = () => {
    setModalError(null);
    setSelectedFile(null);
    setDocumentTypeId('1');
    setExpiresAt('');
    setIsModalOpen(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setModalError('Veuillez sélectionner un fichier.');
      return;
    }
    setSubmitting(true);
    setModalError(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentTypeId', documentTypeId);
      if (expiresAt) {
        formData.append('expiresAt', expiresAt);
      }

      await documentService.uploadDocument(formData);
      setIsModalOpen(false);
      setSelectedFile(null);
      setSuccessMessage('Document téléversé avec succès dans MySQL.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadDocuments();
    } catch (err) {
      setModalError(err.message || 'Erreur lors du téléversement du document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenVerify = (doc) => {
    setSelectedDoc(doc);
    setIsVerifyModalOpen(true);
  };

  const handleOpenPreview = (doc) => {
    setViewerDocId(doc.id);
    setViewerInitialDoc(doc);
    setViewerOpen(true);
  };

  const handleDocumentUpdated = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? { ...d, ...updatedDoc } : d))
    );
    setSuccessMessage(
      `Document #${updatedDoc.id} mis à jour : statut ${
        updatedDoc.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'
      }.`
    );
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const q = (localSearch || searchQuery).toLowerCase().trim();
  const filteredDocuments = documents.filter((doc) => {
    if (!q) return true;
    const name = (doc.documentTypeName || doc.fileName || '').toLowerCase();
    const reason = (doc.rejectionReason || '').toLowerCase();
    return name.includes(q) || reason.includes(q) || doc.id.toString().includes(q);
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* EduTrack Hero Banner */}
      <HeroBanner
        title="Document Management & Archive"
        description="Official school transcripts, medical records, identity verifications, and institutional diplomas."
        buttonText="+ Upload Document"
        onButtonClick={handleOpenUpload}
        icon={Folder}
      />

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDocuments}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-white border border-[#E2E8F0] rounded-full pl-10 pr-4 py-2 text-xs text-[#1E293B] placeholder:text-[#94A3B8] shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
          />
        </div>
      </div>

      <div className="edutrack-card bg-white rounded-2xl border border-[#F1F5F9] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#64748B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#4361EE]" />
            <span className="text-xs sm:text-sm font-medium">Loading documents from MySQL database...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Folder className="w-12 h-12 text-[#94A3B8] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[#1E293B]">
              No documents found
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Upload a student birth certificate, previous school records, or enrollment file.
            </p>
            <button
              onClick={handleOpenUpload}
              className="mt-2 inline-flex items-center gap-2 bg-[#4361EE] text-white text-xs font-semibold px-5 py-2.5 rounded-full cursor-pointer hover:bg-[#3451D1] shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Nom du document</th>
                  <th className="py-4 px-6 font-semibold">Identifiant Type</th>
                  <th className="py-4 px-6 font-semibold">Date de dépôt</th>
                  <th className="py-4 px-6 font-semibold">Date d'expiration</th>
                  <th className="py-4 px-6 font-semibold">Statut</th>
                  <th className="py-4 px-6 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#1E293B]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#4361EE]" />
                        <div>
                          <span>{doc.documentTypeName || doc.fileName || `Document #${doc.id}`}</span>
                          {doc.rejectionReason && (
                            <span className="block text-xs text-rose-600 font-normal">
                              Motif : {doc.rejectionReason}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#78716C] font-medium">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EFECE6] text-xs">
                        Type #{doc.documentTypeId || 1}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#78716C]">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#78716C]">
                      {doc.expiresAt || 'Non spécifiée'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          doc.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : doc.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === 'APPROVED'
                              ? 'bg-emerald-500'
                              : doc.status === 'REJECTED'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        ></span>
                        <span>{doc.status === 'APPROVED' ? 'Approuvé' : doc.status === 'REJECTED' ? 'Rejeté' : 'En attente'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#16222F] text-[#16222F] hover:text-white border border-[#EFECE6] hover:border-[#16222F] rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Voir le document</span>
                        </button>
                        {canVerify && doc.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleOpenVerify(doc)}
                            className="px-3 py-1.5 bg-[#16222F] hover:bg-[#203144] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                          >
                            Vérifier
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Téléverser un justificatif officiel"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Type de document *</label>
            <select
              value={documentTypeId}
              onChange={(e) => setDocumentTypeId(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            >
              <option value="1">Certificat de naissance</option>
              <option value="2">Carnet de vaccination</option>
              <option value="3">Dernier bulletin scolaire</option>
              <option value="4">Attestation d'assurance scolaire</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Fichier (PDF ou Image) *</label>
            <input
              type="file"
              required
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Date d'expiration (si applicable)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Téléverser</span>
            </button>
          </div>
        </form>
      </Modal>

      <VerifyDocumentModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        doc={selectedDoc}
        onVerified={handleDocumentUpdated}
        onOpenPreview={handleOpenPreview}
      />

      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentId={viewerDocId}
        initialDoc={viewerInitialDoc}
        onVerified={handleDocumentUpdated}
      />
    </div>
  );
}
