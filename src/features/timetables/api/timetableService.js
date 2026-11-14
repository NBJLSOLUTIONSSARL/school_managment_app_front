import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const timetableService = {
  /**
   * Get all timetables
   */
  async getTimetables() {
    try {
      const res = await axiosClient.get('/v1/timetables')
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Get timetable by ID
   */
  async getTimetableById(id) {
    try {
      const res = await axiosClient.get(`/v1/timetables/${id}`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Get timetable slots for a class
   */
  async getSlotsByClass(classId, termId) {
    try {
      const res = await axiosClient.get(`/v1/timetables/class/${classId}`, {
        params: { termId: termId || undefined },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get timetable slots for a teacher
   */
  async getSlotsByTeacher(teacherId, termId) {
    try {
      const res = await axiosClient.get(`/v1/timetables/teacher/${teacherId}`, {
        params: { termId: termId || undefined },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get timetable slots for a room
   */
  async getSlotsByRoom(roomId, termId) {
    try {
      const res = await axiosClient.get(`/v1/timetables/room/${roomId}`, {
        params: { termId: termId || undefined },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get timetable slots for a student
   */
  async getSlotsByStudent(studentId, termId) {
    try {
      const res = await axiosClient.get(`/v1/timetables/student/${studentId}`, {
        params: { termId: termId || undefined },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get today's slots for authenticated user
   */
  async getTodaySlots() {
    try {
      const res = await axiosClient.get('/v1/timetables/today')
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Create a timetable slot with conflict detection
   */
  async createSlot(payload) {
    try {
      const res = await axiosClient.post('/v1/timetables/slots', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Update a timetable slot
   */
  async updateSlot(timetableId, slotId, payload) {
    try {
      const res = await axiosClient.put(`/v1/timetables/${timetableId}/slots/${slotId}`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Delete a timetable slot
   */
  async deleteSlot(timetableId, slotId) {
    try {
      await axiosClient.delete(`/v1/timetables/${timetableId}/slots/${slotId}`)
      return { success: true, data: true, error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Download weekly timetable as PDF
   */
  async downloadTimetablePdf({ classId, teacherId, roomId, termId } = {}) {
    try {
      const res = await axiosClient.get('/v1/timetables/pdf', {
        params: {
          classId: classId || undefined,
          teacherId: teacherId || undefined,
          roomId: roomId || undefined,
          termId: termId || undefined,
        },
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `emploi-du-temps.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  /**
   * Get classrooms
   */
  async getClassrooms() {
    try {
      const res = await axiosClient.get('/v1/timetables/classrooms')
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Teacher availabilities
   */
  async getTeacherAvailabilities(teacherId) {
    try {
      const res = await axiosClient.get(`/v1/timetables/teachers/${teacherId}/availability`)
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async createTeacherAvailability(payload) {
    try {
      const res = await axiosClient.post('/v1/timetables/teachers/availability', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async deleteTeacherAvailability(id) {
    try {
      await axiosClient.delete(`/v1/timetables/teachers/availability/${id}`)
      return { success: true, data: true, error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Timetable exceptions
   */
  async getExceptions({ classId, date } = {}) {
    try {
      const res = await axiosClient.get('/v1/timetables/exceptions', {
        params: {
          classId: classId || undefined,
          date: date || undefined,
        },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async createException(payload) {
    try {
      const res = await axiosClient.post('/v1/timetables/exceptions', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async deleteException(id) {
    try {
      await axiosClient.delete(`/v1/timetables/exceptions/${id}`)
      return { success: true, data: true, error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * School calendar
   */
  async getCalendarEvents(academicYearId) {
    try {
      const res = await axiosClient.get('/v1/timetables/calendar', {
        params: { academicYearId: academicYearId || undefined },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async createCalendarEvent(payload) {
    try {
      const res = await axiosClient.post('/v1/timetables/calendar', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async deleteCalendarEvent(id) {
    try {
      await axiosClient.delete(`/v1/timetables/calendar/${id}`)
      return { success: true, data: true, error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },
}

export default timetableService
