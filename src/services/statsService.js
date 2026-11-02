import { studentService } from './studentService';
import { teacherService } from './teacherService';
import { applicationService } from './applicationService';
import { financeService } from './financeService';
import { evaluationService } from './evaluationService';
import { homeworkService } from './homeworkService';
import { communicationService } from './communicationService';

export const statsService = {
  async getAdminStats() {
    const [studentsRes, teachersRes, appsRes, invoicesRes, eventsRes] = await Promise.allSettled([
      studentService.getStudents({ page: 0, size: 1 }),
      teacherService.getTeachers(),
      applicationService.getApplications({ page: 0, size: 1 }),
      financeService.getInvoices({ page: 0, size: 100 }),
      communicationService.getEvents({ page: 0, size: 5 }),
    ]);

    const totalStudents = studentsRes.status === 'fulfilled' ? studentsRes.value.totalElements ?? studentsRes.value.content?.length ?? 0 : 0;
    const teachersList = teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value) ? teachersRes.value : [];
    const totalTeachers = teachersList.length;
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
      totalApplications,
      totalInvoiced,
      totalPaid,
      totalUnpaid,
      paymentRate,
      recentEvents: eventsList,
      attendanceRate: null,
      totalClasses: null,
    };
  },

  async getStudentStats(studentId) {
    const [reportCardsRes, homeworkRes, eventsRes] = await Promise.allSettled([
      evaluationService.getReportCards({ studentId }),
      homeworkService.getSubmissionsByStudent(studentId),
      communicationService.getEvents({ page: 0, size: 5 }),
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

    return {
      generalAverage,
      termTitle,
      submissionCount,
      events: eventsList,
      attendanceRate: null,
    };
  },
};
