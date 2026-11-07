import { useState, useEffect, useCallback, useMemo } from 'react'
import { DocTypePageHead } from '@/components/ui/DocTypePageHead'
import { PaginatedTable } from '@/components/ui/PaginatedTable'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Loader } from '@/components/ui/Loader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { MessageComposeModal } from './MessageComposeModal'
import { MessageDetailsModal } from './MessageDetailsModal'
import { messageService } from '../api/messageService'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/utils/classNames'

export function MessageInbox() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()

  const currentUserId = user?.id

  // Tab: 'inbox' | 'sent'
  const [activeTab, setActiveTab] = useState('inbox')

  // Search filter
  const [searchTerm, setSearchTerm] = useState('')

  // Pagination & items
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [composeDefaults, setComposeDefaults] = useState({ recipientId: '', subject: '' })
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadMessages = useCallback(
    async ({ signal } = {}) => {
      if (!currentUserId) return
      setIsLoading(true)
      try {
        let res
        if (activeTab === 'inbox') {
          res = await messageService.getInbox(currentUserId, { page, size: pageSize, signal })
        } else {
          res = await messageService.getSent(currentUserId, { page, size: pageSize, signal })
        }

        if (signal?.aborted) return

        if (res.success && res.data) {
          setMessages(res.data.items || [])
          setTotalItems(res.data.totalItems || 0)
          setTotalPages(res.data.totalPages || 0)
        } else {
          setMessages([])
          setTotalItems(0)
          setTotalPages(0)
          if (!signal?.aborted) {
            toastError(res.error?.message || 'Erreur lors du chargement des messages.')
          }
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [currentUserId, activeTab, page, pageSize, toastError]
  )

  useEffect(() => {
    const controller = new AbortController()
    const task = Promise.resolve().then(() => loadMessages({ signal: controller.signal }))
    return () => {
      controller.abort()
      task.catch(() => {})
    }
  }, [loadMessages])

  const unreadCount = useMemo(() => {
    if (activeTab !== 'inbox') return 0
    return messages.filter((m) => !m.read).length
  }, [messages, activeTab])

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return messages
    const q = searchTerm.toLowerCase()
    return messages.filter(
      (m) =>
        m.subject?.toLowerCase().includes(q) ||
        m.content?.toLowerCase().includes(q) ||
        String(m.senderId).includes(q) ||
        String(m.recipientId).includes(q)
    )
  }, [messages, searchTerm])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    try {
      const res = await messageService.deleteMessage(deleteTarget.id)
      if (res.success) {
        success('Message supprimé.')
        setDeleteTarget(null)
        loadMessages()
      } else {
        toastError(res.error?.message || 'Erreur lors de la suppression du message.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMessageRead = (msgId) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, read: true } : m))
    )
  }

  const handleReply = (msg) => {
    setComposeDefaults({
      recipientId: msg.senderId,
      subject: msg.subject?.startsWith('Re: ') ? msg.subject : `Re: ${msg.subject || ''}`,
    })
    setIsComposeOpen(true)
  }

  const columns = [
    {
      key: 'status',
      label: 'Statut',
      width: '90px',
      render: (_, row) =>
        activeTab === 'inbox' ? (
          <StatusBadge status={row.read ? 'Lu' : 'Non lu'} size="xs" />
        ) : (
          <span className="text-2xs text-slate-400">Envoyé</span>
        ),
    },
    {
      key: 'peer',
      label: activeTab === 'inbox' ? 'Expéditeur' : 'Destinataire',
      width: '140px',
      render: (_, row) => (
        <span className="font-medium text-slate-700">
          User #{activeTab === 'inbox' ? row.senderId : row.recipientId}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Objet',
      render: (val, row) => (
        <button
          type="button"
          onClick={() => setSelectedMessage(row)}
          className={cn(
            'text-start hover:underline truncate block max-w-md',
            !row.read && activeTab === 'inbox'
              ? 'font-bold text-slate-900'
              : 'font-normal text-slate-700'
          )}
        >
          {val || '(Sans objet)'}
        </button>
      ),
    },
    {
      key: 'sentAt',
      label: 'Date',
      width: '150px',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="xs" onClick={() => setSelectedMessage(row)}>
            Lire
          </Button>
          {activeTab === 'inbox' && (
            <Button
              variant="ghost"
              size="xs"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setDeleteTarget(row)}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 p-4 md:p-6">
      <DocTypePageHead
        title="Messagerie Interne"
        count={totalItems}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filtrer les messages par mot-clé..."
        primaryAction={{
          label: 'Nouveau Message',
          onClick: () => {
            setComposeDefaults({ recipientId: '', subject: '' })
            setIsComposeOpen(true)
          },
        }}
      />

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 rounded-t text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('inbox')
              setPage(1)
            }}
            className={cn(
              'flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition-colors',
              activeTab === 'inbox'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            📥 Boîte de réception
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('sent')
              setPage(1)
            }}
            className={cn(
              'rounded px-3 py-1.5 font-medium transition-colors',
              activeTab === 'sent'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            📤 Messages envoyés
          </button>
        </div>

        <div className="text-2xs text-slate-400">
          Connecté en tant que User #{currentUserId || '-'}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded border border-slate-200 bg-white">
          <Loader size="md" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'inbox'
              ? 'Boîte de réception vide'
              : 'Aucun message envoyé'
          }
          description={
            activeTab === 'inbox'
              ? 'Vous n’avez reçu aucun message pour le moment.'
              : 'Vous n’avez encore envoyé aucun message.'
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setComposeDefaults({ recipientId: '', subject: '' })
                setIsComposeOpen(true)
              }}
            >
              Écrire un message
            </Button>
          }
        />
      ) : (
        <PaginatedTable
          columns={columns}
          data={filteredMessages}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setPage(1)
          }}
          isLoading={isLoading}
        />
      )}

      {/* Compose Modal */}
      {isComposeOpen && (
        <MessageComposeModal
          key={`compose-${composeDefaults.recipientId}-${composeDefaults.subject}`}
          isOpen={isComposeOpen}
          defaultRecipientId={composeDefaults.recipientId}
          defaultSubject={composeDefaults.subject}
          onClose={() => setIsComposeOpen(false)}
          onSuccess={() => {
            setActiveTab('sent')
            setPage(1)
            loadMessages()
          }}
        />
      )}

      {/* Message Details Modal */}
      {selectedMessage && (
        <MessageDetailsModal
          isOpen={Boolean(selectedMessage)}
          message={selectedMessage}
          currentUserId={currentUserId}
          onClose={() => setSelectedMessage(null)}
          onMessageRead={handleMessageRead}
          onReply={handleReply}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer ce message ?"
          message={`Êtes-vous sûr de vouloir supprimer le message "${deleteTarget.subject}" ?`}
          confirmLabel={isDeleting ? 'Suppression...' : 'Supprimer'}
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

export default MessageInbox
