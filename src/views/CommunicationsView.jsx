import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Send,
  Bell,
  Trash2,
  Plus,
  Mail,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  Megaphone,
  User
} from 'lucide-react';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { communicationService } from '../services/communicationService';
import { teacherService } from '../services/teacherService';

export default function CommunicationsView() {
  const { currentUser } = useAuth();
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [messageForm, setMessageForm] = useState({
    recipientId: '1',
    subject: '',
    content: '',
  });

  const userId = currentUser?.id;

  const loadCommunications = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [inboxRes, sentRes, annRes, teachersRes] = await Promise.allSettled([
        communicationService.getInbox(userId, { page: 0, size: 50 }),
        communicationService.getSent(userId, { page: 0, size: 50 }),
        communicationService.getAnnouncements({ page: 0, size: 20 }),
        teacherService.getTeachers()
      ]);

      const inboxList = inboxRes.status === 'fulfilled' ? (inboxRes.value?.content || (Array.isArray(inboxRes.value) ? inboxRes.value : [])) : [];
      const sentList = sentRes.status === 'fulfilled' ? (sentRes.value?.content || (Array.isArray(sentRes.value) ? sentRes.value : [])) : [];
      const annList = annRes.status === 'fulfilled' ? (annRes.value?.content || (Array.isArray(annRes.value) ? annRes.value : [])) : [];
      const teachersList = teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value) ? teachersRes.value : [];

      setInboxMessages(inboxList);
      setSentMessages(sentList);
      setAnnouncements(annList);
      setContacts(teachersList);
    } catch (err) {
      setError(err.message || 'Impossible de charger la messagerie.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunications();
  }, [userId]);

  const handleOpenCompose = () => {
    setMessageForm({
      recipientId: contacts.length > 0 ? (contacts[0].user?.id || '1') : '1',
      subject: '',
      content: '',
    });
    setIsComposeOpen(true);
  };

  const handleOpenView = async (msg) => {
    setSelectedMessage(msg);
    setIsViewOpen(true);
    if (!msg.isRead && activeFolder === 'inbox') {
      try {
        await communicationService.markMessageRead(msg.id);
        setInboxMessages(inboxMessages.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch {
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await communicationService.sendMessage({
        senderId: userId,
        recipientId: Number(messageForm.recipientId),
        subject: messageForm.subject,
        content: messageForm.content,
      });
      setIsComposeOpen(false);
      setSuccessMessage('Message envoyé avec succès.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadCommunications();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du message.');
    } finally {
      setSubmitting(false);
    }
  };

  const unreadInboxCount = inboxMessages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6 pb-12">
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 pb-2 overflow-hidden">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif-title font-bold text-[#16222F] tracking-tight">
            Communications & Messagerie
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-2">
            Envoyez et consultez les messages internes et les annonces scolaires
          </p>
        </div>

        <button
          onClick={handleOpenCompose}
          className="flex items-center gap-2 bg-[#16222F] hover:bg-[#203144] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nouveau message</span>
        </button>
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
            onClick={loadCommunications}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="academy-card p-4 h-fit space-y-1.5">
          <button
            onClick={() => setActiveFolder('inbox')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeFolder === 'inbox'
                ? 'bg-[#16222F] text-white shadow-xs'
                : 'text-[#16222F] hover:bg-[#FAF7F2]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Inbox className="w-4 h-4" />
              <span>Boîte de réception</span>
            </div>
            {unreadInboxCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeFolder === 'inbox' ? 'bg-white/20 text-white' : 'bg-[#EF4444] text-white'
              }`}>
                {unreadInboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveFolder('sent')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeFolder === 'sent'
                ? 'bg-[#16222F] text-white shadow-xs'
                : 'text-[#16222F] hover:bg-[#FAF7F2]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4" />
              <span>Messages envoyés</span>
            </div>
            <span className="text-[10px] opacity-70">
              {sentMessages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('announcements')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              activeFolder === 'announcements'
                ? 'bg-[#16222F] text-white shadow-xs'
                : 'text-[#16222F] hover:bg-[#FAF7F2]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-4 h-4" />
              <span>Annonces officielles</span>
            </div>
            <span className="text-[10px] opacity-70">
              {announcements.length}
            </span>
          </button>
        </div>

        <div className="lg:col-span-3 academy-card overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#78716C]">
              <Loader2 className="w-8 h-8 animate-spin text-[#16222F]" />
              <span className="text-sm font-medium">Chargement des messages depuis MySQL...</span>
            </div>
          ) : activeFolder === 'announcements' ? (
            <div className="p-6 space-y-4">
              <h3 className="font-serif-title font-bold text-lg text-[#16222F]">
                Annonces de l'Académie Lumière
              </h3>
              {announcements.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#78716C]">
                  Aucune annonce publiée pour le moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFECE6] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#16222F]">{ann.title}</span>
                        <span className="text-[10px] text-[#78716C]">
                          {ann.publishedAt ? new Date(ann.publishedAt).toLocaleDateString('fr-FR') : '-'}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">{ann.content}</p>
                      <span className="inline-block text-[9px] font-bold uppercase bg-[#E8DFC9] text-[#16222F] px-2 py-0.5 rounded-full">
                        Cible : {ann.targetRole || 'Tous'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F4EDE2] bg-[#FAF7F2]/50 text-xs font-bold text-[#78716C] uppercase tracking-wider">
                    <th className="py-4 px-6">Objet du message</th>
                    <th className="py-4 px-6">{activeFolder === 'inbox' ? 'Expéditeur' : 'Destinataire'}</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Statut</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EDE2] text-sm">
                  {(activeFolder === 'inbox' ? inboxMessages : sentMessages).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-xs text-[#78716C]">
                        {activeFolder === 'inbox' ? 'Aucun message dans votre boîte de réception.' : 'Aucun message envoyé.'}
                      </td>
                    </tr>
                  ) : (
                    (activeFolder === 'inbox' ? inboxMessages : sentMessages).map((msg) => (
                      <tr key={msg.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                        <td className="py-4 px-6 font-semibold text-[#16222F]">
                          <div className="flex items-center gap-2.5">
                            <Mail className={`w-4 h-4 ${!msg.isRead && activeFolder === 'inbox' ? 'text-[#C5A880]' : 'text-[#94A3B8]'}`} />
                            <span className={!msg.isRead && activeFolder === 'inbox' ? 'font-bold' : 'font-normal'}>
                              {msg.subject}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs text-[#78716C]">
                          Utilisateur #{activeFolder === 'inbox' ? msg.senderId : msg.recipientId}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#78716C]">
                          {msg.sentAt ? new Date(msg.sentAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              msg.isRead
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-sky-50 text-sky-700 border border-sky-200 font-bold'
                            }`}
                          >
                            {msg.isRead ? 'Lu' : 'Non lu'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenView(msg)}
                            className="p-1.5 text-[#78716C] hover:text-[#16222F] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Nouveau message interne"
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Destinataire (Enseignant / Direction) *</label>
            <select
              value={messageForm.recipientId}
              onChange={(e) => setMessageForm({ ...messageForm, recipientId: e.target.value })}
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none"
            >
              <option value="1">Direction - Marc Dupont (admin@school.com)</option>
              {contacts.map((t) => (
                <option key={t.id} value={t.user?.id || t.id}>
                  {t.user?.firstName} {t.user?.lastName} - {t.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Objet *</label>
            <input
              type="text"
              required
              value={messageForm.subject}
              onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
              placeholder="Ex: Suivi pédagogique trimestriel"
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#16222F] mb-1">Message *</label>
            <textarea
              required
              rows={4}
              value={messageForm.content}
              onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
              placeholder="Rédigez votre message ici..."
              className="w-full bg-[#FAF7F2] border border-[#EFECE6] rounded-xl p-3 text-sm text-[#16222F] focus:outline-none focus:ring-1 focus:ring-[#C5A880]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsComposeOpen(false)}
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
              <span>Envoyer le message</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Lecture du message"
      >
        {selectedMessage && (
          <div className="space-y-4 text-xs">
            <div className="pb-3 border-b border-[#F4EDE2]">
              <span className="text-[10px] text-[#A8A29E] block">
                Envoyé le {selectedMessage.sentAt ? new Date(selectedMessage.sentAt).toLocaleString('fr-FR') : '-'}
              </span>
              <h3 className="text-base font-bold text-[#16222F] mt-1">
                {selectedMessage.subject}
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EFECE6] whitespace-pre-wrap text-[#1E293B] leading-relaxed">
              {selectedMessage.content}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
