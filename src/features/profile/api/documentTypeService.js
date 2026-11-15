import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const documentTypeService = {
  /**
   * Get all active or all document types
   */
  async getDocumentTypes(activeOnly = false) {
    try {
      const res = await axiosClient.get('/v1/document-types', {
        params: { activeOnly },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Create document type
   */
  async createDocumentType(payload) {
    try {
      const res = await axiosClient.post('/v1/document-types', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Update document type
   */
  async updateDocumentType(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/document-types/${id}`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Delete document type
   */
  async deleteDocumentType(id) {
    try {
      await axiosClient.delete(`/v1/document-types/${id}`)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  /**
   * Get missing documents compliance checklist for a user or student
   */
  async getChecklist({ userId, studentId }) {
    try {
      const res = await axiosClient.get('/v1/documents/checklist', {
        params: {
          userId: userId || undefined,
          studentId: studentId || undefined,
        },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Archive document
   */
  async archiveDocument(documentId) {
    try {
      const res = await axiosClient.post(`/v1/documents/${documentId}/archive`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },
}
