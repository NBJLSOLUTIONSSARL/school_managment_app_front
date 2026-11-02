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
  Search
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import DocumentViewerModal from '../components/documents/DocumentViewerModal';
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

  const [verifyStatus, setVerifyStatus] = useState('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');

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
    setVerifyStatus('APPROVED');
    setRejectionReason('');
    setModalError(null);
    setIsVerifyModalOpen(true);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setSubmitting(true);
    setModalError(null);
    setError(null);
    try {
      await documentService.verifyDocument(selectedDoc.id, {
        status: verifyStatus,
        rejectionReason: verifyStatus === 'REJECTED' ? rejectionReason : null,
      });
      setIsVerifyModalOpen(false);
      setSuccessMessage(`Document ${verifyStatus === 'APPROVED' ? 'validé' : 'rejeté'} avec succès.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadDocuments();
    } catch (err) {
      setModalError(err.message || 'Erreur lors de la validation.');
    } finally {
      setSubmitting(false);
    }
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
    <div className="space-y-6 pb-12">
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              GED & Justificatifs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Gestion des Documents
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Gérez et vérifiez les documents officiels enregistrés dans le système
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 w-full md:w-auto justify-end">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Rechercher un document..."
              className="w-full bg-white border border-[#EFECE6] rounded-full pl-9 pr-3 py-2 text-xs text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>
          <button
            onClick={handleOpenUpload}
            className="flex items-center justify-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Téléverser un document</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDocuments}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="academy-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
            <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
            <span className="text-sm font-medium">Chargement des documents depuis MySQL...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileText className="w-12 h-12 text-[#C5A880] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-[#16222F]">
              Aucun document trouvé
            </h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Aucun document ne correspond à votre recherche dans la base de données.
            </p>
            <button
              onClick={handleOpenUpload}
              className="mt-2 inline-flex items-center gap-2 bg-[#16222F] text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-[#203144]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Téléverser un justificatif</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  <th className="py-4 px-6">Nom du document</th>
                  <th className="py-4 px-6">Identifiant Type</th>
                  <th className="py-4 px-6">Date de dépôt</th>
                  <th className="py-4 px-6">Date d'expiration</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2] text-sm">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#16222F]">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#C5A880]" />
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

      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Vérification administrative du document"
      >
        <form onSubmit={handleVerify} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Décision *</label>
            <select
              value={verifyStatus}
              onChange={(e) => setVerifyStatus(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            >
              <option value="APPROVED">Approuver (Validé)</option>
              <option value="REJECTED">Rejeter (Refusé)</option>
            </select>
          </div>

          {verifyStatus === 'REJECTED' && (
            <div>
              <label className="block text-xs font-bold text-[#16222F] mb-1">Motif de rejet *</label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ex: Document illisible ou périmé."
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl p-3 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsVerifyModalOpen(false)}
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
              <span>Enregistrer la décision</span>
            </button>
          </div>
        </form>
      </Modal>

      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentId={viewerDocId}
        initialDoc={viewerInitialDoc}
        canVerify={canVerify}
        onDocumentUpdated={handleDocumentUpdated}
      />
    </div>
  );
}
