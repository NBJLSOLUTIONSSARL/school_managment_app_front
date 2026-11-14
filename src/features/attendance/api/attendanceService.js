import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const attendanceService = {
  /**
   * Submit roll call for a class (daily or slot-based)
   */
  async submitRollCall(payload) {
    try {
      const res = await axiosClient.post('/v1/attendance/roll-call', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Get roll call list for a class on a date
   */
  async getRollCall({ classId, date, timetableSlotId }) {
    try {
      const res = await axiosClient.get('/v1/attendance/roll-call', {
        params: {
          classId,
          date: date || undefined,
          timetableSlotId: timetableSlotId || undefined,
        },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get attendance history for a student
   */
  async getStudentHistory(studentId, { startDate, endDate } = {}) {
    try {
      const res = await axiosClient.get(`/v1/attendance/students/${studentId}`, {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get student assiduity stats
   */
  async getStudentStats(studentId) {
    try {
      const res = await axiosClient.get(`/v1/attendance/students/${studentId}/stats`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Get class assiduity stats
   */
  async getClassStats(classId, { date } = {}) {
    try {
      const res = await axiosClient.get(`/v1/attendance/classes/${classId}/stats`, {
        params: { date: date || undefined },
      })
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Submit an absence justification
   */
  async submitJustification(payload) {
    try {
      const res = await axiosClient.post('/v1/attendance/justifications', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Review (approve / reject) an absence justification
   */
  async reviewJustification(id, payload) {
    try {
      const res = await axiosClient.put(`/v1/attendance/justifications/${id}/review`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Get pending justifications for admin/staff review
   */
  async getPendingJustifications(classId) {
    try {
      const res = await axiosClient.get('/v1/attendance/justifications/pending', {
        params: { classId: classId || undefined },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get justifications for a student
   */
  async getStudentJustifications(studentId) {
    try {
      const res = await axiosClient.get(`/v1/attendance/students/${studentId}/justifications`)
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get attendance alerts
   */
  async getAlerts({ classId, resolved } = {}) {
    try {
      const res = await axiosClient.get('/v1/attendance/alerts', {
        params: {
          classId: classId || undefined,
          resolved: resolved !== undefined ? resolved : undefined,
        },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Resolve an alert
   */
  async resolveAlert(id) {
    try {
      const res = await axiosClient.put(`/v1/attendance/alerts/${id}/resolve`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Staff clock-in
   */
  async staffCheckIn(payload = {}) {
    try {
      const res = await axiosClient.post('/v1/attendance/staff/check-in', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Staff clock-out
   */
  async staffCheckOut(payload = {}) {
    try {
      const res = await axiosClient.post('/v1/attendance/staff/check-out', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Get staff presence today
   */
  async getStaffToday(date) {
    try {
      const res = await axiosClient.get('/v1/attendance/staff/today', {
        params: { date: date || undefined },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get my staff attendance history
   */
  async getMyStaffAttendance() {
    try {
      const res = await axiosClient.get('/v1/attendance/staff/my')
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },
}
