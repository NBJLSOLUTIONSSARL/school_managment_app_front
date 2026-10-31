import React, { useState } from 'react';
import { FileText, Upload, Download, Eye } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { INITIAL_DOCUMENTS } from '../data/mockData';

export default function DocumentsView() {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    name: '',
    type: 'Identité',
    expirationDate: '-',
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newDoc.name) return;

    setDocuments([
      {
        id: Date.now(),
        name: newDoc.name,
        type: newDoc.type,
        status: 'En attente',
        expirationDate: newDoc.expirationDate || '-',
        size: '1.5 MB',
        uploadedAt: '31/10/2026'
      },
      ...documents
    ]);
    setIsModalOpen(false);
    setNewDoc({ name: '', type: 'Identité', expirationDate: '-' });
  };

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
            Mes documents
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Gérez et consultez vos documents
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Téléverser un document</span>
          </button>
        </div>
      </div>

      <div className="academy-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="py-4 px-6">Nom du document</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6">Date d'expiration</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EDE2] text-sm">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-[#FAF7F2]/60 transition-colors"
                >
                  <td className="py-4 px-6 font-semibold text-[#16222F]">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#C5A880]" />
                      <div>
                        <span>{doc.name}</span>
                        <span className="block text-xs text-[#A8A29E] font-normal">
                          {doc.size}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#78716C] font-medium">
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EFECE6] text-xs">
                      {doc.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="py-4 px-6 text-[#78716C]">
                    {doc.expirationDate}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        title="Aperçu"
                        onClick={() => alert(`Aperçu du document : ${doc.name}`)}
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Télécharger"
                        onClick={() => alert(`Téléchargement de ${doc.name}...`)}
                        className="p-1.5 rounded-lg text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Téléverser un document"
        subtitle="Ajoutez une pièce justificative ou administrative"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Intitulé du document *
            </label>
            <input
              type="text"
              required
              value={newDoc.name}
              onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
              placeholder="Ex. Attestation d'assurance scolaire"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Catégorie *
              </label>
              <select
                value={newDoc.type}
                onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              >
                <option value="Identité">Identité</option>
                <option value="Santé">Santé</option>
                <option value="Personnel">Personnel</option>
                <option value="Académique">Académique</option>
                <option value="Financier">Financier</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
                Date d'expiration
              </label>
              <input
                type="text"
                value={newDoc.expirationDate}
                onChange={(e) => setNewDoc({ ...newDoc, expirationDate: e.target.value })}
                placeholder="JJ/MM/AAAA ou -"
                className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-[#C5A880]/50 rounded-2xl p-6 text-center bg-[#FAF7F2]">
            <Upload className="w-8 h-8 text-[#C5A880] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#16222F]">
              Glissez-déposez votre fichier ici, ou cliquez pour parcourir
            </p>
            <p className="text-[11px] text-[#A8A29E] mt-1">
              Formats acceptés : PDF, JPG, PNG (Max 10 MB)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-md"
            >
              Enregistrer le document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
