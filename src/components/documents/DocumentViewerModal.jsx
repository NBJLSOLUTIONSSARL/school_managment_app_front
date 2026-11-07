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
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../context/AuthContext';

export default function DocumentViewerModal({
  isOpen,
  onClose,
  documentId,
  initialDoc,
  onVerified,
}) {
  const { hasAnyRole } = useAuth();
  const canVerify = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const [doc, setDoc] = useState(initialDoc || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [blobUrl, setBlobUrl] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

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
      setIsRejectMode(false);
      setRejectionReason('');
      setVerifyError(null);
      fetchDocument(documentId);
    }
  }, [isOpen, documentId, initialDoc]);

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

  const rawUrl =
    doc?.fileKey && (doc.fileKey.startsWith('http://') || doc.fileKey.startsWith('https://'))
      ? doc.fileKey
      : (doc?.downloadUrl || (doc?.fileKey ? `/api/v1/documents/files/${doc.fileKey}` : ''));
  const fileUrl = rawUrl;

  const extension = (() => {
    const target = doc?.fileKey || doc?.downloadUrl || '';
    const clean = target.split('?')[0];
    const lastDot = clean.lastIndexOf('.');
    return lastDot !== -1 ? clean.substring(lastDot + 1).toLowerCase() : '';
  })();

  const isPdf = extension === 'pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(extension);

  useEffect(() => {
    let isCurrent = true;
    let createdUrl = null;

    if (!isOpen || !fileUrl) {
      setBlobUrl(null);
      setFileLoading(false);
      setFileError(null);
      return;
    }

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      if (!fileUrl.includes('localhost') && !fileUrl.includes('127.0.0.1')) {
        setBlobUrl(fileUrl);
        setFileLoading(false);
        return;
      }
    }

    setFileLoading(true);
    setFileError(null);

    const token = localStorage.getItem('academie_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(fileUrl, { headers })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: Impossible de récupérer le flux du document.`);
        }
        return res.blob();
      })
      .then((blob) => {
        if (!isCurrent) return;
        const mime = isPdf ? 'application/pdf' : (blob.type || 'application/octet-stream');
        const typedBlob = new Blob([blob], { type: mime });
        createdUrl = URL.createObjectURL(typedBlob);
        setBlobUrl(createdUrl);
      })
      .catch((err) => {
        if (!isCurrent) return;
        setFileError(err.message || 'Impossible de charger le fichier dans le visualiseur.');
      })
      .finally(() => {
        if (isCurrent) {
          setFileLoading(false);
        }
      });

    return () => {
      isCurrent = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, fileUrl, isPdf]);

  if (!isOpen) return null;

  const activePreviewUrl = blobUrl || fileUrl;

  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleVerify = async (status, reason = null) => {
    if (!doc?.id) return;
    if (status === 'REJECTED' && !reason?.trim()) {
      setVerifyError('Un motif de rejet est obligatoire en cas de refus.');
      return;
    }

    setVerifying(true);
    setVerifyError(null);

    try {
      const payload = {
        status,
        rejectionReason: status === 'REJECTED' ? reason.trim() : null,
      };

      const res = await documentService.verifyDocument(doc.id, payload);
      const updated = res?.data || res;
      setDoc((prev) => ({ ...prev, ...updated, status, rejectionReason: payload.rejectionReason }));

      if (onVerified) {
        onVerified(updated);
      }
      setIsRejectMode(false);
      setRejectionReason('');
    } catch (err) {
      setVerifyError(err.message || 'Erreur lors de la validation du document.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#16222F]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={`relative bg-white border border-[#EFECE6] shadow-2xl z-10 flex flex-col transition-all overflow-hidden ${
          isFullscreen
            ? 'fixed inset-0 rounded-none w-screen h-screen'
            : 'w-full max-w-[98vw] 2xl:max-w-7xl h-[95vh] rounded-3xl my-auto'
        }`}
      >
        <div className="px-5 py-3.5 border-b border-[#F4EDE2] bg-[#FAF7F2] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#EFECE6] flex items-center justify-center text-[#16222F] shadow-xs shrink-0">
              <FileText className="w-5 h-5 text-[#4361EE]" />
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
            {activePreviewUrl && (
              <a
                href={activePreviewUrl}
                target="_blank"
                rel="noreferrer"
                download={doc?.fileKey || 'document'}
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
              className="p-2 text-[#78716C] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-[#FAF7F2] border border-[#EFECE6] px-4 py-2.5 rounded-2xl shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#78716C] font-medium">
              <span className="font-semibold text-[#16222F] uppercase tracking-wider text-[11px]">
                Format :
              </span>
              <span className="px-2 py-0.5 bg-white border border-[#EFECE6] rounded-md font-bold text-[#16222F]">
                {extension ? extension.toUpperCase() : 'DOCUMENT'}
              </span>
              {isPdf && (
                <span className="text-xs text-[#78716C] hidden sm:inline ml-2">
                  Lecteur PDF intégré
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                <button
                  type="button"
                  onClick={() => fetchDocument(doc?.id || documentId)}
                  className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-white rounded-lg transition-colors"
                  title="Rafraîchir le lien"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}

              {activePreviewUrl && (
                <a
                  href={activePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={doc?.fileKey || 'document'}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#FAF7F2] text-[#16222F] border border-[#EFECE6] rounded-xl text-xs font-medium transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#4361EE]" />
                  <span className="hidden sm:inline">Télécharger</span>
                </a>
              )}
            </div>
          </div>

          <div
            className={`relative w-full ${
              isFullscreen ? 'min-h-[78vh] flex-1' : 'min-h-[60vh] md:min-h-[66vh] flex-1'
            } bg-[#FAF7F2]/40 border border-[#EFECE6] rounded-2xl overflow-hidden flex items-center justify-center`}
          >
            {(loading || fileLoading) && (
              <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-[#78716C]">
                <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
                <span className="text-xs font-medium">Chargement du fichier sécurisé...</span>
              </div>
            )}

            {error || fileError ? (
              <div className="p-6 text-center space-y-3 max-w-md">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h4 className="font-bold text-sm text-[#16222F]">Erreur de visualisation</h4>
                <p className="text-xs text-[#78716C]">{error || fileError}</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => fetchDocument(doc?.id || documentId)}
                    className="px-4 py-2 bg-[#16222F] text-white rounded-xl text-xs font-semibold hover:bg-[#203144] transition-colors cursor-pointer"
                  >
                    Réessayer
                  </button>
                  {rawUrl && (
                    <a
                      href={rawUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#4361EE] text-white rounded-xl text-xs font-semibold hover:bg-[#3451D1] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir en direct</span>
                    </a>
                  )}
                </div>
              </div>
            ) : isPdf && activePreviewUrl ? (
              <object
                data={activePreviewUrl}
                type="application/pdf"
                className="w-full h-full min-h-[60vh] md:min-h-[66vh] border-0 bg-white"
              >
                <iframe
                  src={activePreviewUrl}
                  title={doc?.documentTypeName || 'Aperçu du PDF'}
                  className="w-full h-full min-h-[60vh] md:min-h-[66vh] border-0 bg-white"
                />
              </object>
            ) : isImage && activePreviewUrl ? (
              <div className="w-full h-full min-h-[60vh] md:min-h-[66vh] overflow-auto flex items-center justify-center p-4">
                <img
                  src={activePreviewUrl}
                  alt={doc?.documentTypeName || 'Justificatif'}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-w-full max-h-[64vh] object-contain select-none shadow-sm rounded-lg"
                />
              </div>
            ) : (
              <div className="p-8 text-center space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-3xl bg-white border border-[#EFECE6] flex items-center justify-center mx-auto shadow-xs text-[#4361EE]">
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
                {activePreviewUrl && (
                  <a
                    href={activePreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={doc?.fileKey || 'document'}
                    className="inline-flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger le fichier original</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#FAF7F2] border border-[#EFECE6] rounded-2xl p-4 sm:p-5 shrink-0 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F4EDE2] pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4361EE]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#16222F]">
                  Informations du document
                </h4>
              </div>
              {doc?.fileKey && (
                <span className="text-[11px] text-[#78716C] font-mono truncate max-w-sm hidden md:inline">
                  {doc.fileKey}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-xs">
              <div>
                <span className="text-[#78716C] block text-[11px] mb-0.5">Type officiel</span>
                <span className="font-semibold text-[#16222F] truncate block">
                  {doc?.documentTypeName || `Type #${doc?.documentTypeId || 1}`}
                </span>
              </div>

              <div>
                <span className="text-[#78716C] block text-[11px] mb-0.5">Déposé par</span>
                <span className="font-medium text-[#16222F] truncate block" title={doc?.userEmail}>
                  {doc?.userEmail || 'Utilisateur système'}
                </span>
              </div>

              <div>
                <span className="text-[#78716C] block text-[11px] mb-0.5">Date de dépôt</span>
                <span className="font-medium text-[#16222F]">
                  {doc?.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : '-'}
                </span>
              </div>

              <div>
                <span className="text-[#78716C] block text-[11px] mb-0.5">Date d'expiration</span>
                <span className="font-medium text-[#16222F]">
                  {doc?.expiresAt || 'Indéterminée'}
                </span>
              </div>

              <div>
                <span className="text-[#78716C] block text-[11px] mb-0.5">Statut actuel</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
            </div>

            {(doc?.verifiedAt || doc?.verifiedByStaffPosition || (doc?.status === 'REJECTED' && doc?.rejectionReason)) && (
              <div className="pt-2.5 border-t border-[#F4EDE2] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                {doc?.verifiedAt && (
                  <div className="flex items-center gap-1.5 text-[#78716C]">
                    <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <span>Vérifié le {new Date(doc.verifiedAt).toLocaleString('fr-FR')}</span>
                  </div>
                )}
                {doc?.verifiedByStaffPosition && (
                  <div className="flex items-center gap-1.5 text-[#78716C]">
                    <User className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <span>
                      Instructeur : <span className="font-medium text-[#16222F]">{doc.verifiedByStaffPosition}</span>
                    </span>
                  </div>
                )}
                {doc?.status === 'REJECTED' && doc?.rejectionReason && (
                  <div className="w-full mt-1 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs block">Motif du rejet administratif :</span>
                      <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{doc.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {canVerify && doc?.status === 'PENDING' && (
            <div className="bg-white border border-[#EFECE6] shadow-sm rounded-2xl p-4 sm:p-5 shrink-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4EDE2] pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#16222F]">
                    Actions administratives de validation
                  </h4>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Validez la conformité légale du document ou formulez un motif de refus.
                  </p>
                </div>

                {!isRejectMode && (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => setIsRejectMode(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Rejeter</span>
                    </button>
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => handleVerify('APPROVED')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {verifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Approuver le document</span>
                    </button>
                  </div>
                )}
              </div>

              {verifyError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {isRejectMode && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#16222F] mb-1.5 uppercase tracking-wider">
                      Motif officiel du rejet *
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Précisez la raison administrative du rejet (ex: document illisible, date de validité expirée, document incomplet...)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFECE6] bg-[#FAF7F2] text-xs text-[#16222F] focus:outline-hidden focus:ring-2 focus:ring-[#4361EE]/30 focus:border-[#4361EE] transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => {
                        setIsRejectMode(false);
                        setRejectionReason('');
                        setVerifyError(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={verifying}
                      onClick={() => handleVerify('REJECTED', rejectionReason)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {verifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>Confirmer le rejet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
