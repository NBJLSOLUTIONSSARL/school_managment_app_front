import React, { useState } from 'react';
import {
  Inbox,
  Send,
  FileEdit,
  Trash2,
  Plus
} from 'lucide-react';
import Modal from '../components/common/Modal';
import { INITIAL_MESSAGES } from '../data/mockData';

export default function CommunicationsView() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient: 'Tous les enseignants',
    subject: '',
    content: ''
  });

  const folders = [
    { id: 'inbox', label: 'Boîte de réception', icon: Inbox, count: 12 },
    { id: 'sent', label: 'Messages envoyés', icon: Send, count: 0 },
    { id: 'drafts', label: 'Brouillons', icon: FileEdit, count: 0 },
    { id: 'trash', label: 'Corbeille', icon: Trash2, count: 0 },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!composeData.subject) return;

    const newMsg = {
      id: Date.now(),
      subject: composeData.subject,
      sender: 'Direction',
      senderRole: 'Direction',
      date: '31/10/2026',
      status: 'Non lu',
      preview: composeData.content.slice(0, 80) + '...',
      content: composeData.content,
      folder: 'sent'
    };

    setMessages([newMsg, ...messages]);
    setIsComposeOpen(false);
    setComposeData({ recipient: 'Tous les enseignants', subject: '', content: '' });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-2 overflow-hidden">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#16222F] tracking-tight">
            Communications
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-2">
            Envoyez et gérez vos messages
          </p>
        </div>

        <div className="hidden lg:block absolute right-48 top-1/2 -translate-y-1/2 h-28 w-44 pointer-events-none">
          <img
            src="/assets/communications-illustration.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau message</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFECE6] p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-3 space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;

              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#FAF5EB] text-[#16222F] font-semibold'
                      : 'text-[#475569] hover:bg-[#FAF7F2] hover:text-[#16222F]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 stroke-[1.8]" />
                    <span>{folder.label}</span>
                  </div>
                  {folder.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E5DFD5] text-[#16222F]">
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="md:col-span-9 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F0EBE1] text-xs font-bold text-[#16222F]">
                  <th className="py-3 px-4 font-bold">Objet</th>
                  <th className="py-3 px-4 font-bold">Expéditeur</th>
                  <th className="py-3 px-4 font-bold">Date</th>
                  <th className="py-3 px-4 text-right font-bold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F5EE] text-xs sm:text-sm">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-medium text-[#16222F]">
                      {msg.subject}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      {msg.sender}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      {msg.date}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {msg.status === 'Non lu' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#E0EEFF] text-[#2563EB]">
                          Non lu
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D]">
                          Lu
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedMessage && (
        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title={selectedMessage.subject}
          subtitle={`De: ${selectedMessage.sender} • ${selectedMessage.date}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] text-sm leading-relaxed text-[#16222F]">
              {selectedMessage.content}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setMessages(messages.map(m => m.id === selectedMessage.id ? { ...m, status: 'Lu' } : m));
                  setSelectedMessage(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-xs"
              >
                Fermer & marquer comme lu
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Rédiger un message"
        subtitle="Communiquez avec les équipes pédagogiques, élèves ou parents"
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Destinataire *
            </label>
            <select
              value={composeData.recipient}
              onChange={(e) => setComposeData({ ...composeData, recipient: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            >
              <option value="Tous les enseignants">Tous les enseignants</option>
              <option value="Toute la classe 1ère A">Toute la classe 1ère A</option>
              <option value="Toute la classe 1ère B">Toute la classe 1ère B</option>
              <option value="Association des parents">Association des parents</option>
              <option value="Administration générale">Administration générale</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Objet du message *
            </label>
            <input
              type="text"
              required
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              placeholder="Ex. Réunion pédagogique"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] uppercase mb-1">
              Message *
            </label>
            <textarea
              rows="5"
              required
              value={composeData.content}
              onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
              placeholder="Écrivez votre message ici..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F4EDE2]">
            <button
              type="button"
              onClick={() => setIsComposeOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-xs flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer le message</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
