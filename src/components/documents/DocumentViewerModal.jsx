import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Download,
  FileText,
  Calendar,
  User,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { documentService } from '../../services/documentService';

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentId,
  initialDoc,
}) {
  const [doc, setDoc] = useState(initialDoc || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchDocument = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await documentService.getDocumentById(id);
      const data = res?.data || res;
      setDoc(data);
    } catch (err) {
      setError(err.message || 'Impossible de charger les détails du document.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && documentId) {
      setDoc(initialDoc || null);
      setZoom(1);
      setRotation(0);
      fetchDocument(documentId);
    }
  }, [isOpen, documentId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawUrl = doc?.downloadUrl || (doc?.fileKey ? `/api/v1/documents/files/${doc.fileKey}` : '');
  const fileUrl = rawUrl;

  const extension = (() => {
    const target = doc?.fileKey || doc?.downloadUrl || '';
    const clean = target.split('?')[0];
    const lastDot = clean.lastIndexOf('.');
    return lastDot !== -1 ? clean.substring(lastDot + 1).toLowerCase() : '';
  })();

  const isPdf = extension === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension);

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#16222F]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative bg-white border border-[#EFECE6] shadow-2xl z-10 flex flex-col transition-all overflow-hidden ${
          isFullscreen
            ? 'fixed inset-0 rounded-none w-screen h-screen'
            : 'w-full max-w-6xl max-h-[92vh] rounded-3xl my-auto'
        }`}
      >
        <div className="px-6 py-4 border-b border-[#F4EDE2] bg-[#FAF7F2] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EFECE6] flex items-center justify-center text-[#16222F] shadow-xs shrink-0">
              <FileText className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif-title text-[#16222F] truncate">
                  {doc?.documentTypeName || doc?.fileKey || `Document #${doc?.id || documentId}`}
                </h3>
                {doc?.status && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
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
                    />
                    <span>
                      {doc.status === 'APPROVED'
                        ? 'Approuvé'
                        : doc.status === 'REJECTED'
                        ? 'Rejeté'
                        : 'En attente'}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#78716C] truncate mt-0.5">
                Clé fichier : {doc?.fileKey || 'Génération du lien...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="p-2 text-[#78716C] hover:text-[#16222F] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#EFECE6]"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-[#78716C] hover:text-[#16222F] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-[#EFECE6]"
              title={isFullscreen ? 'Réduire' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
            <div className="lg:col-span-8 flex flex-col gap-3 min-h-[480px]">
              <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#EFECE6] px-4 py-2.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs text-[#78716C] font-medium">
                  <span className="font-semibold text-[#16222F] uppercase tracking-wider">
                    Format :
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-[#EFECE6] rounded-md font-bold text-[#16222F]">
                    {extension ? extension.toUpperCase() : 'DOCUMENT'}
                  </span>
                </div>

                {isImage && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#EFECE6]"
                      title="Zoom arrière"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-[#16222F] px-2 min-w-[50px] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#EFECE6]"
                      title="Zoom avant"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#EFECE6]"
                      title="Pivoter de 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="text-xs font-semibold text-[#78716C] hover:text-[#16222F] hover:bg-white px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-[#EFECE6]"
                    >
                      Réinitialiser
                    </button>
                  </div>
                )}

                {isPdf && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#78716C]">Lecteur PDF intégré</span>
                    <button
                      type="button"
                      onClick={() => fetchDocument(doc?.id || documentId)}
                      className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-white rounded-lg transition-colors"
                      title="Rafraîchir le lien"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="relative flex-1 min-h-[460px] lg:min-h-[580px] bg-[#FAF7F2]/50 border border-[#EFECE6] rounded-2xl overflow-hidden flex items-center justify-center">
                {loading && (
                  <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-[#78716C]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
                    <span className="text-xs font-medium">Chargement du fichier sécurisé...</span>
                  </div>
                )}

                {error ? (
                  <div className="p-6 text-center space-y-3 max-w-md">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <h4 className="font-bold text-sm text-[#16222F]">Erreur de visualisation</h4>
                    <p className="text-xs text-[#78716C]">{error}</p>
                    <button
                      type="button"
                      onClick={() => fetchDocument(doc?.id || documentId)}
                      className="px-4 py-2 bg-[#16222F] text-white rounded-xl text-xs font-semibold hover:bg-[#203144] transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : isPdf && fileUrl ? (
                  <iframe
                    src={fileUrl}
                    title={doc?.documentTypeName || 'Aperçu du PDF'}
                    className="w-full h-full min-h-[560px] border-0 bg-white"
                  />
                ) : isImage && fileUrl ? (
                  <div className="w-full h-full min-h-[560px] overflow-auto flex items-center justify-center p-4">
                    <img
                      src={fileUrl}
                      alt={doc?.documentTypeName || 'Justificatif'}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s ease-out',
                      }}
                      className="max-w-full max-h-[520px] object-contain select-none shadow-sm rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-[#EFECE6] flex items-center justify-center mx-auto shadow-xs text-[#C5A880]">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-serif-title text-[#16222F]">
                        Prévisualisation non prise en charge
                      </h4>
                      <p className="text-xs text-[#78716C] mt-1.5 leading-relaxed">
                        Le format de ce fichier ne permet pas un affichage direct dans le navigateur. Vous pouvez le télécharger pour le consulter en toute sécurité.
                      </p>
                    </div>
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger le fichier original</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#F4EDE2] pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#16222F]">
                    Informations du document
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#78716C] block mb-0.5">Type officiel</span>
                    <span className="font-semibold text-[#16222F]">
                      {doc?.documentTypeName || `Type #${doc?.documentTypeId || 1}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#78716C] block mb-0.5">Déposé par</span>
                    <span className="font-medium text-[#16222F] break-all">
                      {doc?.userEmail || 'Utilisateur système'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[#78716C] block mb-0.5">Date de dépôt</span>
                      <span className="font-medium text-[#16222F]">
                        {doc?.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block mb-0.5">Expiration</span>
                      <span className="font-medium text-[#16222F]">
                        {doc?.expiresAt || 'Indéterminée'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#78716C] block mb-0.5">Statut actuel</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        doc?.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : doc?.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          doc?.status === 'APPROVED'
                            ? 'bg-emerald-500'
                            : doc?.status === 'REJECTED'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span>
                        {doc?.status === 'APPROVED'
                          ? 'Approuvé'
                          : doc?.status === 'REJECTED'
                          ? 'Rejeté'
                          : 'En attente'}
                      </span>
                    </span>
                  </div>

                  {doc?.verifiedAt && (
                    <div className="pt-2 border-t border-[#F4EDE2] space-y-2">
                      <div>
                        <span className="text-[#78716C] block mb-0.5">Vérifié le</span>
                        <span className="font-medium text-[#16222F]">
                          {new Date(doc.verifiedAt).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      {doc?.verifiedByStaffPosition && (
                        <div>
                          <span className="text-[#78716C] block mb-0.5">Instructeur</span>
                          <span className="font-medium text-[#16222F]">
                            {doc.verifiedByStaffPosition}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {doc?.status === 'REJECTED' && doc?.rejectionReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-rose-800 block">
                        Motif officiel du rejet :
                      </span>
                      <p className="text-xs text-rose-700 leading-relaxed">
                        {doc.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="text-xs text-[#78716C]">
                  Besoin d'enregistrer le document ?
                </div>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#16222F] text-white rounded-xl text-xs font-semibold hover:bg-[#203144] transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Télécharger</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
