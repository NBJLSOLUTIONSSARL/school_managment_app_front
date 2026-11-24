import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Mail,
  MessageSquare,
  Bell,
  RefreshCw,
  Search,
} from 'lucide-react'
import { meetingsAndTemplatesService } from '../api/meetingsAndTemplatesService'

const CHANNELS = [
  { value: 'IN_APP', label: 'In-App Notification', icon: Bell },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'SMS', label: 'SMS', icon: MessageSquare },
]

export const NotificationTemplatesManager = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState('ALL')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    channel: 'IN_APP',
    subject: '',
    body: '',
    active: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await meetingsAndTemplatesService.getTemplates()
    if (res.success) {
      setTemplates(res.data)
    } else {
      setError(res.error || 'Failed to load notification templates')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const task = Promise.resolve().then(() => loadTemplates())
    return () => {
      void task
    }
  }, [loadTemplates])

  const openCreateModal = () => {
    setEditingTemplate(null)
    setFormData({
      code: '',
      name: '',
      channel: 'IN_APP',
      subject: '',
      body: '',
      active: true,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const openEditModal = (tpl) => {
    setEditingTemplate(tpl)
    setFormData({
      code: tpl.code || '',
      name: tpl.name || '',
      channel: tpl.channel || 'IN_APP',
      subject: tpl.subject || '',
      body: tpl.body || '',
      active: tpl.active !== false,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return
    const res = await meetingsAndTemplatesService.deleteTemplate(id)
    if (res.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } else {
      alert(res.error || 'Failed to delete template')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    if (editingTemplate) {
      const res = await meetingsAndTemplatesService.updateTemplate(
        editingTemplate.id,
        formData
      )
      if (res.success) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplate.id ? res.data : t))
        )
        setModalOpen(false)
      } else {
        setFormError(res.error || 'Failed to update template')
      }
    } else {
      const res = await meetingsAndTemplatesService.createTemplate(formData)
      if (res.success) {
        setTemplates((prev) => [res.data, ...prev])
        setModalOpen(false)
      } else {
        setFormError(res.error || 'Failed to create template')
      }
    }
    setSubmitting(false)
  }

  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.code?.toLowerCase().includes(search.toLowerCase()) ||
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase())
    const matchesChannel =
      channelFilter === 'ALL' || t.channel === channelFilter
    return matchesSearch && matchesChannel
  })

  return (
    <div className="bg-white border border-neutral-200 rounded-sm shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-neutral-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-600" />
            <h2 className="text-sm font-semibold text-neutral-900">
              Notification Templates
            </h2>
            <span className="text-2xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-mono">
              {templates.length}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Predefined notification templates for emails, SMS, and in-app alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTemplates}
            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded text-xs inline-flex items-center gap-1"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Template
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3 bg-neutral-50/70 border-b border-neutral-200 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, title, subject..."
            className="w-full pl-8 pr-2.5 py-1 text-xs border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400"
          />
        </div>

        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value)}
          className="text-xs border border-neutral-200 rounded px-2.5 py-1 bg-white focus:outline-none focus:border-neutral-400"
        >
          <option value="ALL">All Channels</option>
          <option value="IN_APP">In-App</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {/* Table list */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 font-medium">
              <th className="py-2 px-3">Code</th>
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Channel</th>
              <th className="py-2 px-3">Subject</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && templates.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-neutral-400">
                  Loading notification templates...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-neutral-400">
                  No templates found.
                </td>
              </tr>
            ) : (
              filtered.map((tpl) => (
                <tr
                  key={tpl.id}
                  className="hover:bg-neutral-50/80 transition cursor-pointer"
                  onClick={() => onSelectTemplate && onSelectTemplate(tpl)}
                >
                  <td className="py-2 px-3 font-mono text-neutral-800 font-semibold">
                    {tpl.code}
                  </td>
                  <td className="py-2 px-3 text-neutral-900 font-medium">
                    {tpl.name}
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700 font-medium">
                      {tpl.channel === 'EMAIL' && <Mail className="w-3 h-3 text-blue-500" />}
                      {tpl.channel === 'SMS' && <MessageSquare className="w-3 h-3 text-emerald-500" />}
                      {tpl.channel === 'IN_APP' && <Bell className="w-3 h-3 text-amber-500" />}
                      {tpl.channel}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-neutral-600 max-w-xs truncate">
                    {tpl.subject || '—'}
                  </td>
                  <td className="py-2 px-3">
                    {tpl.active ? (
                      <span className="inline-flex items-center gap-1 text-2xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                        <XCircle className="w-3 h-3 text-neutral-400" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openEditModal(tpl)}
                      className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded"
                      title="Edit template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-md shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
              <h3 className="text-sm font-semibold text-neutral-900">
                {editingTemplate ? 'Edit Template' : 'Create Notification Template'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. ADMISSION_OFFER"
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded font-mono uppercase focus:outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Channel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) =>
                      setFormData({ ...formData, channel: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-neutral-300 rounded bg-white focus:outline-none focus:border-neutral-500"
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch.value} value={ch.value}>
                        {ch.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Admission Acceptance Notification"
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="e.g. Welcome to {{school_name}}, {{student_name}}!"
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                  Body Template <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  placeholder="Template text with placeholders, e.g. Dear {{guardian_name}}, we are pleased to inform you that..."
                  className="w-full px-2.5 py-1.5 border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 font-mono text-2xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tpl-active"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                />
                <label htmlFor="tpl-active" className="text-neutral-700 cursor-pointer">
                  Template is active and available for system triggers
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

NotificationTemplatesManager.propTypes = {
  onSelectTemplate: PropTypes.func,
}

export default NotificationTemplatesManager
