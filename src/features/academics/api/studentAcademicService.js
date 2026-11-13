import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const studentAcademicService = {
  // --- Contacts d'urgence ---
  async getEmergencyContacts(studentId) {
    try {
      const res = await axiosClient.get(`/v1/students/${studentId}/emergency-contacts`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async addEmergencyContact(studentId, payload) {
    try {
      const res = await axiosClient.post(`/v1/students/${studentId}/emergency-contacts`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async deleteEmergencyContact(studentId, contactId) {
    try {
      await axiosClient.delete(`/v1/students/${studentId}/emergency-contacts/${contactId}`)
      return { success: true, data: true, error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  // --- Fratrie ---
  async getSiblings(studentId) {
    try {
      const res = await axiosClient.get(`/v1/students/${studentId}/siblings`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async addSibling(studentId, payload) {
    try {
      const res = await axiosClient.post(`/v1/students/${studentId}/siblings`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async deleteSibling(studentId, siblingId) {
    try {
      await axiosClient.delete(`/v1/students/${studentId}/siblings/${siblingId}`)
      return { success: true, data: true, error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  // --- Dossier Médical (Accès Restreint) ---
  async getMedicalNote(studentId) {
    try {
      const res = await axiosClient.get(`/v1/students/${studentId}/medical-notes`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async saveMedicalNote(studentId, payload) {
    try {
      const res = await axiosClient.put(`/v1/students/${studentId}/medical-notes`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  // --- Discipline ---
  async getDisciplineRecords(studentId) {
    try {
      const res = await axiosClient.get(`/v1/students/${studentId}/discipline`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async addDisciplineRecord(studentId, payload) {
    try {
      const res = await axiosClient.post(`/v1/students/${studentId}/discipline`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async deleteDisciplineRecord(studentId, recordId) {
    try {
      await axiosClient.delete(`/v1/students/${studentId}/discipline/${recordId}`)
      return { success: true, data: true, error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  // --- Import / Export CSV ---
  async importStudents(file, dryRun = false) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axiosClient.post('/v1/students/import', formData, {
        params: { dryRun },
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async exportStudentsCsv() {
    try {
      const res = await axiosClient.get('/v1/students/export', { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `eleves_export_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  // --- Documents PDF ---
  async downloadIdCardPdf(studentId) {
    try {
      const res = await axiosClient.get(`/v1/students/${studentId}/id-card`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  async downloadTransferCertPdf(studentId) {
    try {
      const res = await axiosClient.get(`/v1/students/${studentId}/transfer-certificate`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  async downloadLeavingCertPdf(studentId) {
    try {
      const res = await axiosClient.get(`/v1/students/${studentId}/leaving-certificate`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },
}

export default studentAcademicService
