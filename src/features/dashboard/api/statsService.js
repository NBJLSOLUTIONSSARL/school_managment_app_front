import { studentService } from '@/features/students/api/studentService'
import { teacherService } from '@/features/teachers/api/teacherService'
import { staffService } from '@/features/staff/api/staffService'
import { departmentService } from '@/features/departments/api/departmentService'
import { eventService } from '@/features/events/api/eventService'
import { axiosClient } from '@/lib/axios'
import { extractApiData } from '@/utils/apiHelpers'

export const statsService = {
  /**
   * Aggregate live system statistics for School Director / Administrator
   */
  async getAdminStats() {
    const [studentsRes, teachersRes, staffRes, deptsRes, eventsRes, financesRes, appsRes] =
      await Promise.allSettled([
        studentService.getStudents({ page: 1, size: 1 }),
        teacherService.getTeachers(),
        staffService.getStaff(),
        departmentService.getDepartments(),
        eventService.getEvents({ page: 1, size: 5 }),
        axiosClient.get('/v1/finances/invoices', { params: { page: 0, size: 100 } }),
        axiosClient.get('/v1/applications', { params: { page: 0, size: 5 } }),
      ])

    const totalStudents =
      studentsRes.status === 'fulfilled' && studentsRes.value?.success
        ? studentsRes.value.data?.totalItems ??
          studentsRes.value.data?.totalElements ??
          (Array.isArray(studentsRes.value.data?.items) ? studentsRes.value.data.items.length : 0)
        : 0

    const teachersList =
      teachersRes.status === 'fulfilled' && teachersRes.value?.success
        ? teachersRes.value.data || []
        : []
    const totalTeachers = teachersList.length

    const staffList =
      staffRes.status === 'fulfilled' && staffRes.value?.success
        ? staffRes.value.data || []
        : []
    const totalStaff = staffList.length

    const deptsList =
      deptsRes.status === 'fulfilled' && deptsRes.value?.success
        ? deptsRes.value.data || []
        : []
    const totalDepartments = deptsList.length

    let totalApplications = 0
    let applicationsList = []
    if (appsRes.status === 'fulfilled') {
      try {
        const appsData = extractApiData(appsRes.value)
        totalApplications = appsData?.totalElements ?? (Array.isArray(appsData) ? appsData.length : 0)
        applicationsList = Array.isArray(appsData)
          ? appsData.slice(0, 5)
          : appsData?.content?.slice(0, 5) || []
      } catch {
        totalApplications = 0
        applicationsList = []
      }
    }

    let totalInvoiced = 0
    let totalPaid = 0
    let totalUnpaid = 0
    let paymentRate = 0

    if (financesRes.status === 'fulfilled') {
      try {
        const finData = extractApiData(financesRes.value)
        const invoices = Array.isArray(finData) ? finData : finData?.content || []
        invoices.forEach((inv) => {
          const amount = Number(inv.totalAmount) || 0
          totalInvoiced += amount
          if (inv.status === 'PAID') {
            totalPaid += amount
          } else {
            totalUnpaid += amount
          }
        })
        if (totalInvoiced > 0) {
          paymentRate = Math.round((totalPaid / totalInvoiced) * 100)
        }
      } catch {
        // Leave at 0
      }
    }

    const eventsList =
      eventsRes.status === 'fulfilled' && eventsRes.value?.success
        ? eventsRes.value.data?.items || []
        : []

    return {
      totalStudents,
      totalTeachers,
      totalStaff,
      totalDepartments,
      totalApplications,
      applicationsList,
      totalInvoiced,
      totalPaid,
      totalUnpaid,
      paymentRate,
      recentEvents: eventsList,
    }
  },

  /**
   * Aggregate live administrative and secretarial statistics for Staff
   */
  async getStaffStats() {
    const [studentsRes, eventsRes, appsRes, financesRes] = await Promise.allSettled([
      studentService.getStudents({ page: 1, size: 5 }),
      eventService.getEvents({ page: 1, size: 5 }),
      axiosClient.get('/v1/applications', { params: { page: 0, size: 50 } }),
      axiosClient.get('/v1/finances/invoices', { params: { page: 0, size: 50 } }),
    ])

    const studentData =
      studentsRes.status === 'fulfilled' && studentsRes.value?.success ? studentsRes.value.data : null
    const totalStudents =
      studentData?.totalItems ??
      studentData?.totalElements ??
      (Array.isArray(studentData?.items) ? studentData.items.length : 0)
    const recentStudents = studentData?.items || []

    let totalApplications = 0
    let pendingApplications = 0
    let acceptedApplications = 0
    let recentApplications = []

    if (appsRes.status === 'fulfilled') {
      try {
        const appsData = extractApiData(appsRes.value)
        const apps = Array.isArray(appsData) ? appsData : appsData?.content || []
        totalApplications = appsData?.totalElements ?? apps.length
        pendingApplications = apps.filter(
          (a) => a.status === 'PENDING' || a.status === 'SUBMITTED'
        ).length
        acceptedApplications = apps.filter((a) => a.status === 'ACCEPTED').length
        recentApplications = apps.slice(0, 5)
      } catch {
        // Fallback to 0
      }
    }

    let unpaidInvoicesCount = 0
    let paidInvoicesCount = 0
    let totalUnpaidAmount = 0
    let totalPaidAmount = 0

    if (financesRes.status === 'fulfilled') {
      try {
        const finData = extractApiData(financesRes.value)
        const invoices = Array.isArray(finData) ? finData : finData?.content || []
        invoices.forEach((inv) => {
          const amount = Number(inv.totalAmount) || 0
          if (inv.status === 'PAID') {
            paidInvoicesCount++
            totalPaidAmount += amount
          } else {
            unpaidInvoicesCount++
            totalUnpaidAmount += amount
          }
        })
      } catch {
        // Fallback to 0
      }
    }

    const eventsList =
      eventsRes.status === 'fulfilled' && eventsRes.value?.success
        ? eventsRes.value.data?.items || []
        : []

    return {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      recentApplications,
      totalStudents,
      recentStudents,
      unpaidInvoicesCount,
      paidInvoicesCount,
      totalUnpaidAmount,
      totalPaidAmount,
      recentEvents: eventsList,
    }
  },

  /**
   * Aggregate live academic information for a Teacher
   * @param {number|string} [teacherId]
   */
  async getTeacherStats(teacherId) {
    const [teacherProfileRes, studentsRes, eventsRes, examsRes] = await Promise.allSettled([
      teacherId ? axiosClient.get(`/v1/teachers/${teacherId}`) : Promise.resolve(null),
      studentService.getStudents({ page: 1, size: 1 }),
      eventService.getEvents({ page: 1, size: 5 }),
      axiosClient.get('/v1/exams', { params: { size: 50 } }),
    ])

    let teacherProfile = null
    if (teacherProfileRes.status === 'fulfilled' && teacherProfileRes.value) {
      try {
        teacherProfile = extractApiData(teacherProfileRes.value)
      } catch {
        teacherProfile = null
      }
    }

    const totalStudents =
      studentsRes.status === 'fulfilled' && studentsRes.value?.success
        ? studentsRes.value.data?.totalItems ??
          studentsRes.value.data?.totalElements ??
          (Array.isArray(studentsRes.value.data?.items) ? studentsRes.value.data.items.length : 0)
        : 0

    let totalExams = 0
    let upcomingExams = []
    let teacherExams = []

    if (examsRes.status === 'fulfilled') {
      try {
        const examData = extractApiData(examsRes.value)
        const list = Array.isArray(examData) ? examData : examData?.content || []
        totalExams = list.length
        if (teacherId) {
          teacherExams = list.filter((e) => Number(e.teacherId) === Number(teacherId))
        }
        const relevantExams = teacherExams.length > 0 ? teacherExams : list
        upcomingExams = relevantExams.filter((e) => !e.locked)
      } catch {
        totalExams = 0
        upcomingExams = []
      }
    }

    const eventsList =
      eventsRes.status === 'fulfilled' && eventsRes.value?.success
        ? eventsRes.value.data?.items || []
        : []

    return {
      specialization: teacherProfile?.specialization || 'Enseignement',
      departmentName: teacherProfile?.department?.name || 'Département Académique',
      contractType: teacherProfile?.contractType || 'Plein temps',
      totalStudents,
      totalExams: teacherExams.length > 0 ? teacherExams.length : totalExams,
      upcomingExams,
      events: eventsList,
    }
  },

  /**
   * Aggregate live academic data for an authenticated Student
   * @param {number|string} studentId
   */
  async getStudentStats(studentId) {
    const [studentProfileRes, reportCardsRes, homeworkRes, examsRes, eventsRes] =
      await Promise.allSettled([
        studentId ? axiosClient.get(`/v1/students/${studentId}`) : Promise.resolve(null),
        axiosClient.get('/v1/report-cards', { params: { studentId } }),
        studentId
          ? axiosClient.get(`/v1/homework/students/${studentId}/submissions`)
          : Promise.resolve(null),
        axiosClient.get('/v1/exams', { params: { size: 10 } }),
        eventService.getEvents({ page: 1, size: 5 }),
      ])

    let studentProfile = null
    if (studentProfileRes.status === 'fulfilled' && studentProfileRes.value) {
      try {
        studentProfile = extractApiData(studentProfileRes.value)
      } catch {
        studentProfile = null
      }
    }

    let generalAverage = null
    let termTitle = 'Semestre en cours'
    let rank = null
    let mention = null
    let latestReportCard = null

    if (reportCardsRes.status === 'fulfilled') {
      try {
        const rcData = extractApiData(reportCardsRes.value)
        const list = Array.isArray(rcData) ? rcData : rcData?.content || []
        if (list.length > 0) {
          latestReportCard = list[0]
          if (latestReportCard.average !== undefined) {
            generalAverage = latestReportCard.average
          }
          if (latestReportCard.term) {
            termTitle = latestReportCard.term
          }
          rank = latestReportCard.rank
          mention = latestReportCard.mention
        }
      } catch {
        // No report cards yet
      }
    }

    let submissions = []
    if (homeworkRes.status === 'fulfilled' && homeworkRes.value) {
      try {
        const hwData = extractApiData(homeworkRes.value)
        submissions = Array.isArray(hwData) ? hwData : hwData?.content || []
      } catch {
        submissions = []
      }
    }

    let upcomingExams = []
    if (examsRes.status === 'fulfilled') {
      try {
        const examData = extractApiData(examsRes.value)
        const list = Array.isArray(examData) ? examData : examData?.content || []
        upcomingExams = list.filter((e) => !e.locked)
      } catch {
        upcomingExams = []
      }
    }

    const eventsList =
      eventsRes.status === 'fulfilled' && eventsRes.value?.success
        ? eventsRes.value.data?.items || []
        : []

    return {
      studentNumber: studentProfile?.studentNumber || '',
      status: studentProfile?.status || 'ACTIVE',
      generalAverage,
      termTitle,
      rank,
      mention,
      latestReportCard,
      submissionsCount: submissions.length,
      submissions,
      upcomingExams,
      events: eventsList,
    }
  },

  /**
   * Aggregate live data for a Parent / Guardian and their associated children
   * @param {number|string} guardianId
   */
  async getParentStats(guardianId) {
    const [studentsRes, eventsRes] = await Promise.allSettled([
      axiosClient.get('/v1/students', { params: { size: 100 } }),
      eventService.getEvents({ page: 1, size: 5 }),
    ])

    let children = []
    if (studentsRes.status === 'fulfilled') {
      try {
        const data = extractApiData(studentsRes.value)
        const allStudents = Array.isArray(data) ? data : data?.content || []
        if (guardianId) {
          children = allStudents.filter((s) =>
            s.guardians?.some((g) => Number(g.guardianId) === Number(guardianId))
          )
        }
      } catch {
        children = []
      }
    }

    // For each child found, load their latest report card if available
    const enrichedChildren = await Promise.all(
      children.map(async (child) => {
        try {
          const rcRes = await axiosClient.get('/v1/report-cards', {
            params: { studentId: child.id },
          })
          const rcData = extractApiData(rcRes)
          const cards = Array.isArray(rcData) ? rcData : rcData?.content || []
          const latest = cards[0] || null
          return {
            id: child.id,
            firstName: child.user?.firstName || child.firstName || 'Élève',
            lastName: child.user?.lastName || child.lastName || '',
            studentNumber: child.studentNumber,
            average: latest?.average ?? null,
            mention: latest?.mention ?? null,
            term: latest?.term ?? 'Semestre en cours',
            status: child.status,
          }
        } catch {
          return {
            id: child.id,
            firstName: child.user?.firstName || child.firstName || 'Élève',
            lastName: child.user?.lastName || child.lastName || '',
            studentNumber: child.studentNumber,
            average: null,
            mention: null,
            term: 'Semestre en cours',
            status: child.status,
          }
        }
      })
    )

    const eventsList =
      eventsRes.status === 'fulfilled' && eventsRes.value?.success
        ? eventsRes.value.data?.items || []
        : []

    return {
      children: enrichedChildren,
      events: eventsList,
    }
  },
}

export default statsService
