import { axiosClient } from './api/axiosClient'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

function toResult(res) {
  return {
    success: true,
    data: extractApiData(res),
    message: res?.data?.message || null,
    error: null,
  }
}

function toError(error) {
  return {
    success: false,
    data: null,
    message: null,
    error: parseApiError(error),
  }
}

export const reportCardService = {
  async getReportCards({ term = '', academicYear = '', studentId = '' } = {}) {
    try {
      const res = await axiosClient.get('/v1/report-cards', {
        params: {
          term: term || undefined,
          academicYear: academicYear || undefined,
          studentId: studentId || undefined,
        },
      })
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async generateReportCards(payload) {
    try {
      const res = await axiosClient.post('/v1/report-cards/generate', payload)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async getReportCardById(id) {
    try {
      const res = await axiosClient.get(`/v1/report-cards/${id}`)
      return toResult(res)
    } catch (error) {
      return toError(error)
    }
  },

  async downloadReportCardPdf(id) {
    try {
      const res = await axiosClient.get(`/v1/report-cards/${id}/download`, {
        responseType: 'blob',
      })
      const disposition = res.headers?.['content-disposition'] || ''
      const match = /filename="?([^";]+)"?/i.exec(disposition)
      return {
        success: true,
        data: {
          blob: res.data,
          filename: match?.[1] || `bulletin_scolaire_${id}.pdf`,
        },
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },
}

export default reportCardService
