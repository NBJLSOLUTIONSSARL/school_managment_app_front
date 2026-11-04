import { studentService } from './studentService';
import { teacherService } from './teacherService';
import { staffService } from './staffService';
import { departmentService } from './departmentService';
import { applicationService } from './applicationService';
import { financeService } from './financeService';
import { evaluationService } from './evaluationService';
import { homeworkService } from './homeworkService';
import { communicationService } from './communicationService';
import { pedagogyService } from './pedagogyService';
import { timetableService } from './timetableService';

export const statsService = {
  async getAdminStats() {
    const [studentsRes, teachersRes, staffRes, deptsRes, appsRes, invoicesRes, eventsRes] = await Promise.allSettled([
      studentService.getStudents({ page: 0, size: 1 }),
      teacherService.getTeachers(),
      staffService.getStaff(),
      departmentService.getDepartments(),
      applicationService.getApplications({ page: 0, size: 1 }),
      financeService.getInvoices({ page: 0, size: 100 }),
      communicationService.getEvents({ page: 0, size: 5 }),
    ]);

    const totalStudents = studentsRes.status === 'fulfilled' ? studentsRes.value.totalElements ?? studentsRes.value.content?.length ?? 0 : 0;
    const teachersList = teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value) ? teachersRes.value : [];
    const totalTeachers = teachersList.length;
    const staffList = staffRes.status === 'fulfilled' && Array.isArray(staffRes.value) ? staffRes.value : [];
    const totalStaff = staffList.length;
    const deptsList = deptsRes.status === 'fulfilled' && Array.isArray(deptsRes.value) ? deptsRes.value : [];
    const totalDepartments = deptsList.length;
    const totalApplications = appsRes.status === 'fulfilled' ? appsRes.value.totalElements ?? appsRes.value.content?.length ?? 0 : 0;

    let totalInvoiced = 0;
    let totalUnpaid = 0;
    let totalPaid = 0;
    let paymentRate = 0;

    if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.content) {
      const invoices = invoicesRes.value.content;
      invoices.forEach((inv) => {
        const amount = Number(inv.totalAmount) || 0;
        totalInvoiced += amount;
        if (inv.status === 'PAID') {
          totalPaid += amount;
        } else {
          totalUnpaid += amount;
        }
      });
      if (totalInvoiced > 0) {
        paymentRate = Math.round((totalPaid / totalInvoiced) * 100);
      }
    }

    const eventsList = eventsRes.status === 'fulfilled' && eventsRes.value?.content ? eventsRes.value.content : [];

    return {
      totalStudents,
      totalTeachers,
      totalStaff,
      totalDepartments,
      totalApplications,
      totalInvoiced,
      totalPaid,
      totalUnpaid,
      paymentRate,
      recentEvents: eventsList,
      attendanceRate: null,
      totalClasses: totalDepartments,
    };
  },

  async getStaffStats() {
    const [appsRes, studentsRes, invoicesRes, eventsRes] = await Promise.allSettled([
      applicationService.getApplications({ page: 0, size: 50 }),
      studentService.getStudents({ page: 0, size: 5 }),
      financeService.getInvoices({ page: 0, size: 50 }),
      communicationService.getEvents({ page: 0, size: 5 }),
    ]);

    const appPage = appsRes.status === 'fulfilled' ? appsRes.value : { content: [], totalElements: 0 };
    const applications = appPage.content || [];
    const totalApplications = appPage.totalElements ?? applications.length;
    const pendingApplications = applications.filter((a) => a.status === 'PENDING' || a.status === 'SUBMITTED').length;
    const acceptedApplications = applications.filter((a) => a.status === 'ACCEPTED').length;

    const studentPage = studentsRes.status === 'fulfilled' ? studentsRes.value : { content: [] };
    const recentStudents = studentPage.content || [];
    const totalStudents = studentPage.totalElements ?? recentStudents.length;

    let unpaidInvoicesCount = 0;
    let paidInvoicesCount = 0;
    let totalUnpaidAmount = 0;
    let totalPaidAmount = 0;

    if (invoicesRes.status === 'fulfilled' && invoicesRes.value?.content) {
      const invoices = invoicesRes.value.content;
      invoices.forEach((inv) => {
        const amount = Number(inv.totalAmount) || 0;
        if (inv.status === 'PAID') {
          paidInvoicesCount++;
          totalPaidAmount += amount;
        } else {
          unpaidInvoicesCount++;
          totalUnpaidAmount += amount;
        }
      });
    }

    const eventsList = eventsRes.status === 'fulfilled' && eventsRes.value?.content ? eventsRes.value.content : [];

    return {
      totalApplications,
      pendingApplications,
      acceptedApplications,
      recentApplications: applications.slice(0, 5),
      totalStudents,
      recentStudents,
      unpaidInvoicesCount,
      paidInvoicesCount,
      totalUnpaidAmount,
      totalPaidAmount,
      recentEvents: eventsList,
    };
  },

  async getTeacherStats(teacherName = '') {
    const [classesRes, studentsRes, examsRes, eventsRes, timetableRes] = await Promise.allSettled([
      pedagogyService.getClasses(),
      studentService.getStudents({ page: 0, size: 50 }),
      evaluationService.getExams(),
      communicationService.getEvents({ page: 0, size: 5 }),
      timetableService.getTimetableById(1),
    ]);

    const classesList = classesRes.status === 'fulfilled' && Array.isArray(classesRes.value) ? classesRes.value : [];
    const totalClasses = classesList.length;

    const studentPage = studentsRes.status === 'fulfilled' ? studentsRes.value : { content: [], totalElements: 0 };
    const totalStudents = studentPage.totalElements ?? (studentPage.content?.length || 0);

    const examsList = examsRes.status === 'fulfilled' && Array.isArray(examsRes.value) ? examsRes.value : [];
    const upcomingExams = examsList.filter((e) => !e.locked);

    const eventsList = eventsRes.status === 'fulfilled' && eventsRes.value?.content ? eventsRes.value.content : [];

    let timetableSlots = [];
    if (timetableRes.status === 'fulfilled' && timetableRes.value?.slots) {
      const allSlots = timetableRes.value.slots;
      if (teacherName) {
        timetableSlots = allSlots.filter((s) => s.teacherName?.toLowerCase().includes(teacherName.toLowerCase()));
      } else {
        timetableSlots = allSlots;
      }
    }

    return {
      totalClasses,
      classes: classesList,
      totalStudents,
      totalExams: examsList.length,
      upcomingExams,
      events: eventsList,
      timetableSlots,
    };
  },

  async getStudentStats(studentId) {
    const [reportCardsRes, homeworkRes, eventsRes, timetableRes] = await Promise.allSettled([
      evaluationService.getReportCards({ studentId }),
      homeworkService.getSubmissionsByStudent(studentId),
      communicationService.getEvents({ page: 0, size: 5 }),
      timetableService.getTimetableById(1),
    ]);

    let generalAverage = null;
    let termTitle = null;
    if (reportCardsRes.status === 'fulfilled' && Array.isArray(reportCardsRes.value) && reportCardsRes.value.length > 0) {
      const latest = reportCardsRes.value[0];
      generalAverage = latest.average !== undefined ? latest.average : null;
      termTitle = latest.term || null;
    }

    let submissionCount = 0;
    if (homeworkRes.status === 'fulfilled' && Array.isArray(homeworkRes.value)) {
      submissionCount = homeworkRes.value.length;
    }

    const eventsList = eventsRes.status === 'fulfilled' && eventsRes.value?.content ? eventsRes.value.content : [];
    const slots = timetableRes.status === 'fulfilled' && timetableRes.value?.slots ? timetableRes.value.slots : [];

    return {
      generalAverage,
      termTitle,
      submissionCount,
      events: eventsList,
      timetableSlots: slots,
      attendanceRate: null,
    };
  },
};
