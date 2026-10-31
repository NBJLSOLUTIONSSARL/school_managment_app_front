import React, { useState } from 'react';
import {
  Inbox,
  Send,
  FileEdit,
  Trash2,
  Plus,
  Mail,
  User,
  Check,
  Search
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
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
    { id: 'sent', label: 'Messages envoyés', icon: Send, count: 5 },
    { id: 'drafts', label: 'Brouillons', icon: FileEdit, count: 2 },
    { id: 'trash', label: 'Corbeille', icon: Trash2, count: 0 },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!composeData.subject) return;

    const newMsg = {
      id: Date.now(),
      subject: composeData.subject,
      sender: 'Dr. Martin (Direction)',
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
      
      <div className="academy-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-0.5 bg-[#C5A880]"></span>
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold">
              Messagerie Interne
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#16222F]">
            Communications
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Envoyez et gérez vos messages
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouveau message</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="academy-card p-4 space-y-1 md:col-span-1">
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = activeFolder === folder.id;

            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#E8DFC9] text-[#16222F] shadow-sm'
                    : 'text-[#78716C] hover:bg-[#FAF7F2] hover:text-[#16222F]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{folder.label}</span>
                </div>
                {folder.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#16222F] text-white' : 'bg-[#FAF7F2] text-[#78716C] border border-[#EFECE6]'
                    }`}
                  >
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="academy-card overflow-hidden md:col-span-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                  <th className="py-4 px-6">Objet</th>
                  <th className="py-4 px-6">Expéditeur</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EDE2] text-sm">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="hover:bg-[#FAF7F2]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-semibold text-[#16222F]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#C5A880] group-hover:scale-110 transition-transform" />
                        <span>{msg.subject}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#78716C]">
                      {msg.sender}
                    </td>
                    <td className="py-4 px-6 text-[#78716C]">
                      {msg.date}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StatusBadge status={msg.status} />
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
                className="px-5 py-2 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-md"
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
              placeholder="Ex. Calendrier des devoirs surveillés"
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
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#78716C] hover:bg-[#FAF7F2]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#16222F] text-white hover:bg-[#203144] shadow-md flex items-center gap-2"
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
