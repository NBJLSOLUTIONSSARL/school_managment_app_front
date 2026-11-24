import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Eye,
  Reply,
  Trash2,
  Mail,
} from 'lucide-react'
import { EntityListToolbar, EntityDataTable, EntityTableActions } from '@/components/shared'
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
  const [loadError, setLoadError] = useState(null)

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
      setLoadError(null)
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
          const msg = res.error?.message || 'Erreur lors du chargement des messages.'
          setLoadError(msg)
          if (!signal?.aborted) {
            toastError(msg)
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          const msg = err.message || 'Erreur lors du chargement des messages.'
          setLoadError(msg)
          toastError(msg)
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
        toastError(res.error?.message || 'Erreur lors de la suppression.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReply = (msg) => {
    const isInbox = activeTab === 'inbox'
    const targetUserId = isInbox ? msg.senderId : msg.recipientId
    const replySubject = msg.subject?.startsWith('Re:') ? msg.subject : `Re: ${msg.subject || ''}`
    setComposeDefaults({
      recipientId: String(targetUserId || ''),
      subject: replySubject,
    })
    setSelectedMessage(null)
    setIsComposeOpen(true)
  }

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

  const columns = [
    {
      key: 'contact',
      label: activeTab === 'inbox' ? 'Expéditeur' : 'Destinataire',
      width: '180px',
      render: (_, row) => (
        <span className="font-semibold text-xs text-[#0F172A]">
          Utilisateur #{activeTab === 'inbox' ? row.senderId : row.recipientId}
        </span>
      ),
    },
    {
      key: 'subject',
      label: 'Objet',
      render: (val, row) => (
        <div className="min-w-0">
          <span
            className={cn(
              'text-xs truncate block max-w-md',
              !row.read && activeTab === 'inbox'
                ? 'font-bold text-[#0F172A]'
                : 'font-normal text-[#475569]'
            )}
          >
            {val || '(Sans objet)'}
          </span>
          {row.content && (
            <span className="text-[11px] text-[#94A3B8] block truncate max-w-md">
              {row.content}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'sentAt',
      label: 'Date',
      width: '160px',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      align: 'right',
      render: (_, row) => (
        <EntityTableActions
          row={row}
          actions={[
            {
              label: 'Lire',
              icon: Eye,
              onClick: () => setSelectedMessage(row),
            },
            {
              label: 'Répondre',
              icon: Reply,
              onClick: () => handleReply(row),
            },
            {
              label: 'Supprimer',
              icon: Trash2,
              variant: 'danger',
              hidden: activeTab !== 'inbox',
              onClick: () => setDeleteTarget(row),
            },
          ]}
        />
      ),
    },
  ]

  const hasActiveFilters = activeTab !== 'inbox'

  const filtersContent = (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">
        Boîte aux lettres
      </label>
      <select
        value={activeTab}
        onChange={(e) => {
          setActiveTab(e.target.value)
          setPage(1)
        }}
        className="w-full h-8 px-2.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-hidden focus:border-[#2563EB]"
      >
        <option value="inbox">Boîte de réception</option>
        <option value="sent">Messages envoyés</option>
      </select>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 select-none bg-[#F9FAFB] min-h-screen">
      <EntityListToolbar
        onAddNew={() => {
          setComposeDefaults({ recipientId: '', subject: '' })
          setIsComposeOpen(true)
        }}
        addNewLabel="Nouveau message"
        canAddNew={true}
        addNewIcon={Mail}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setPage(1)
        }}
        searchPlaceholder="Rechercher par objet, utilisateur..."
        filtersContent={filtersContent}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={hasActiveFilters ? 1 : 0}
        onClearFilters={() => {
          setActiveTab('inbox')
          setPage(1)
        }}
      />

      <EntityDataTable
        columns={columns}
        data={filteredMessages}
        isLoading={isLoading}
        error={loadError}
        onRetry={loadMessages}
        emptyTitle={activeTab === 'inbox' ? 'Boîte de réception vide' : 'Aucun message envoyé'}
        emptyDescription={
          searchTerm
            ? 'Aucun message ne correspond à votre recherche.'
            : activeTab === 'inbox'
              ? 'Vous n’avez aucun message reçu.'
              : 'Vous n’avez encore envoyé aucun message.'
        }
        emptyAction={{
          label: 'Nouveau message',
          onClick: () => {
            setComposeDefaults({ recipientId: '', subject: '' })
            setIsComposeOpen(true)
          },
        }}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
        onRowClick={(row) => setSelectedMessage(row)}
      />

      {isComposeOpen && (
        <MessageComposeModal
          isOpen={isComposeOpen}
          defaultRecipientId={composeDefaults.recipientId}
          defaultSubject={composeDefaults.subject}
          onClose={() => setIsComposeOpen(false)}
          onSuccess={() => {
            if (activeTab === 'sent') loadMessages()
          }}
        />
      )}

      {selectedMessage && (
        <MessageDetailsModal
          isOpen={Boolean(selectedMessage)}
          message={selectedMessage}
          isSentTab={activeTab === 'sent'}
          onClose={() => setSelectedMessage(null)}
          onReply={handleReply}
          onDeleted={() => {
            setSelectedMessage(null)
            loadMessages()
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          title="Supprimer ce message ?"
          message="Êtes-vous sûr de vouloir supprimer définitivement ce message de votre boîte ?"
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
