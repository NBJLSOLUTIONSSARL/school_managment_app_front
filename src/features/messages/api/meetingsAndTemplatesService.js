import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const meetingsAndTemplatesService = {
  // --- SLOTS ---

  async createSlot(payload) {
    try {
      const res = await axiosClient.post('/v1/meetings/slots', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async getTeacherSlots(teacherId, upcomingOnly = false) {
    try {
      const res = await axiosClient.get(`/v1/meetings/slots/teacher/${teacherId}`, {
        params: { upcomingOnly },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async deleteSlot(id) {
    try {
      await axiosClient.delete(`/v1/meetings/slots/${id}`)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  // --- BOOKINGS ---

  async bookMeeting(payload) {
    try {
      const res = await axiosClient.post('/v1/meetings/bookings', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async updateBookingStatus(bookingId, payload) {
    try {
      const res = await axiosClient.put(
        `/v1/meetings/bookings/${bookingId}/status`,
        payload
      )
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async getGuardianBookings(guardianId) {
    try {
      const res = await axiosClient.get(
        `/v1/meetings/bookings/guardian/${guardianId}`
      )
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async cancelBooking(bookingId) {
    try {
      await axiosClient.delete(`/v1/meetings/bookings/${bookingId}`)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  // --- NOTIFICATION TEMPLATES ---

  async getTemplates() {
    try {
      const res = await axiosClient.get('/v1/notification-templates')
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async createTemplate(payload) {
    try {
      const res = await axiosClient.post('/v1/notification-templates', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async updateTemplate(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/notification-templates/${id}`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async deleteTemplate(id) {
    try {
      await axiosClient.delete(`/v1/notification-templates/${id}`)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },
}
