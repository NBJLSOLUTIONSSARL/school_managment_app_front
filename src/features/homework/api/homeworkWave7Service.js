import { axiosClient } from '@/lib/axios'
import { extractApiData, parseApiError } from '@/utils/apiHelpers'

export const homeworkWave7Service = {
  /**
   * Create homework assignment
   */
  async createAssignment(payload) {
    try {
      const res = await axiosClient.post('/v1/homework/assignments', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  /**
   * Get assignments by class
   */
  async getAssignmentsByClass(classId) {
    try {
      const res = await axiosClient.get(`/v1/homework/assignments/class/${classId}`)
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Get assignments by teacher
   */
  async getAssignmentsByTeacher(teacherId) {
    try {
      const res = await axiosClient.get(`/v1/homework/assignments/teacher/${teacherId}`)
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(id) {
    try {
      await axiosClient.delete(`/v1/homework/assignments/${id}`)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: parseApiError(error) }
    }
  },

  // --- COURSES ---

  async createCourse(payload) {
    try {
      const res = await axiosClient.post('/v1/courses', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async getCoursesByYear(yearId) {
    try {
      const res = await axiosClient.get(`/v1/courses/year/${yearId}`)
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async getCourseById(courseId) {
    try {
      const res = await axiosClient.get(`/v1/courses/${courseId}`)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async addCourseOutline(courseId, payload) {
    try {
      const res = await axiosClient.post(`/v1/courses/${courseId}/outlines`, payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async getCourseOutlines(courseId) {
    try {
      const res = await axiosClient.get(`/v1/courses/${courseId}/outlines`)
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async addCourseResource(payload) {
    try {
      const res = await axiosClient.post('/v1/courses/resources', payload)
      return { success: true, data: extractApiData(res), error: null }
    } catch (error) {
      return { success: false, data: null, error: parseApiError(error) }
    }
  },

  async getSharedCourseResources() {
    try {
      const res = await axiosClient.get('/v1/courses/resources/shared')
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },

  async getResourcesByLevelAndSubject(gradeLevelId, subjectId) {
    try {
      const res = await axiosClient.get('/v1/courses/resources/library', {
        params: { gradeLevelId, subjectId },
      })
      return { success: true, data: extractApiData(res) || [], error: null }
    } catch (error) {
      return { success: false, data: [], error: parseApiError(error) }
    }
  },
}
