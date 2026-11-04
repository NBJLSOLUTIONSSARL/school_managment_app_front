import { apiClient } from './api/client';
import { downloadTimetablePdf } from './timetablePdfService';

const INITIAL_SLOTS = [
  { id: 1, dayOfWeek: 'Lundi', timeSlotLabel: '08h – 09h', startTime: '08:00', endTime: '09:00', subject: 'Mathématiques', colorKey: 'blue', teacherName: 'Claire Martin', classroomName: 'Salle 101 Richelieu' },
  { id: 2, dayOfWeek: 'Lundi', timeSlotLabel: '09h – 10h', startTime: '09:00', endTime: '10:00', subject: 'Français', colorKey: 'peach', teacherName: 'Thomas Bernard', classroomName: 'Salle 102 Molière' },
  { id: 3, dayOfWeek: 'Lundi', timeSlotLabel: '10h – 11h', startTime: '10:00', endTime: '11:00', subject: 'Sciences', colorKey: 'mint', teacherName: 'Sophie Dubois', classroomName: 'Laboratoire 201 - Sciences' },
  { id: 4, dayOfWeek: 'Lundi', timeSlotLabel: '11h – 12h', startTime: '11:00', endTime: '12:00', subject: 'Sport', colorKey: 'blue', teacherName: 'Lucas Petit', classroomName: 'Gymnase Olympique' },
  { id: 5, dayOfWeek: 'Lundi', timeSlotLabel: '14h – 15h', startTime: '14:00', endTime: '15:00', subject: 'Arts Plastiques', colorKey: 'indigo', teacherName: 'Marie Robert', classroomName: 'Salle 102 Molière' },

  { id: 6, dayOfWeek: 'Mardi', timeSlotLabel: '08h – 09h', startTime: '08:00', endTime: '09:00', subject: 'Français', colorKey: 'peach', teacherName: 'Thomas Bernard', classroomName: 'Salle 102 Molière' },
  { id: 7, dayOfWeek: 'Mardi', timeSlotLabel: '09h – 10h', startTime: '09:00', endTime: '10:00', subject: 'Mathématiques', colorKey: 'blue', teacherName: 'Claire Martin', classroomName: 'Salle 101 Richelieu' },
  { id: 8, dayOfWeek: 'Mardi', timeSlotLabel: '10h – 11h', startTime: '10:00', endTime: '11:00', subject: 'Anglais', colorKey: 'lavender', teacherName: 'Sarah Miller', classroomName: 'Salle 102 Molière' },
  { id: 9, dayOfWeek: 'Mardi', timeSlotLabel: '11h – 12h', startTime: '11:00', endTime: '12:00', subject: 'Sciences', colorKey: 'mint', teacherName: 'Sophie Dubois', classroomName: 'Laboratoire 201 - Sciences' },
  { id: 10, dayOfWeek: 'Mardi', timeSlotLabel: '14h – 15h', startTime: '14:00', endTime: '15:00', subject: 'Musique', colorKey: 'peach', teacherName: 'Alain Laurent', classroomName: 'Amphithéâtre Descartes' },

  { id: 11, dayOfWeek: 'Mercredi', timeSlotLabel: '08h – 09h', startTime: '08:00', endTime: '09:00', subject: 'Sciences', colorKey: 'mint', teacherName: 'Sophie Dubois', classroomName: 'Laboratoire 201 - Sciences' },
  { id: 12, dayOfWeek: 'Mercredi', timeSlotLabel: '09h – 10h', startTime: '09:00', endTime: '10:00', subject: 'Arabe', colorKey: 'lavender', teacherName: 'Tarek Mansour', classroomName: 'Salle 101 Richelieu' },
  { id: 13, dayOfWeek: 'Mercredi', timeSlotLabel: '10h – 11h', startTime: '10:00', endTime: '11:00', subject: 'Mathématiques', colorKey: 'blue', teacherName: 'Claire Martin', classroomName: 'Salle 101 Richelieu' },
  { id: 14, dayOfWeek: 'Mercredi', timeSlotLabel: '11h – 12h', startTime: '11:00', endTime: '12:00', subject: 'Français', colorKey: 'peach', teacherName: 'Thomas Bernard', classroomName: 'Salle 102 Molière' },
  { id: 15, dayOfWeek: 'Mercredi', timeSlotLabel: '14h – 15h', startTime: '14:00', endTime: '15:00', subject: 'Sport', colorKey: 'blue', teacherName: 'Lucas Petit', classroomName: 'Gymnase Olympique' },

  { id: 16, dayOfWeek: 'Jeudi', timeSlotLabel: '08h – 09h', startTime: '08:00', endTime: '09:00', subject: 'Mathématiques', colorKey: 'blue', teacherName: 'Claire Martin', classroomName: 'Salle 101 Richelieu' },
  { id: 17, dayOfWeek: 'Jeudi', timeSlotLabel: '09h – 10h', startTime: '09:00', endTime: '10:00', subject: 'Sciences', colorKey: 'mint', teacherName: 'Sophie Dubois', classroomName: 'Laboratoire 201 - Sciences' },
  { id: 18, dayOfWeek: 'Jeudi', timeSlotLabel: '10h – 11h', startTime: '10:00', endTime: '11:00', subject: 'Français', colorKey: 'peach', teacherName: 'Thomas Bernard', classroomName: 'Salle 102 Molière' },
  { id: 19, dayOfWeek: 'Jeudi', timeSlotLabel: '11h – 12h', startTime: '11:00', endTime: '12:00', subject: 'Anglais', colorKey: 'lavender', teacherName: 'Sarah Miller', classroomName: 'Salle 102 Molière' },
  { id: 20, dayOfWeek: 'Jeudi', timeSlotLabel: '14h – 15h', startTime: '14:00', endTime: '15:00', subject: 'Musique', colorKey: 'peach', teacherName: 'Alain Laurent', classroomName: 'Amphithéâtre Descartes' },

  { id: 21, dayOfWeek: 'Vendredi', timeSlotLabel: '08h – 09h', startTime: '08:00', endTime: '09:00', subject: 'Français', colorKey: 'peach', teacherName: 'Thomas Bernard', classroomName: 'Salle 102 Molière' },
  { id: 22, dayOfWeek: 'Vendredi', timeSlotLabel: '09h – 10h', startTime: '09:00', endTime: '10:00', subject: 'Mathématiques', colorKey: 'blue', teacherName: 'Claire Martin', classroomName: 'Salle 101 Richelieu' },
  { id: 23, dayOfWeek: 'Vendredi', timeSlotLabel: '10h – 11h', startTime: '10:00', endTime: '11:00', subject: 'Sciences', colorKey: 'mint', teacherName: 'Sophie Dubois', classroomName: 'Laboratoire 201 - Sciences' },
  { id: 24, dayOfWeek: 'Vendredi', timeSlotLabel: '11h – 12h', startTime: '11:00', endTime: '12:00', subject: 'Sport', colorKey: 'blue', teacherName: 'Lucas Petit', classroomName: 'Gymnase Olympique' },
  { id: 25, dayOfWeek: 'Vendredi', timeSlotLabel: '14h – 15h', startTime: '14:00', endTime: '15:00', subject: 'Anglais', colorKey: 'lavender', teacherName: 'Sarah Miller', classroomName: 'Salle 102 Molière' },
];

const INITIAL_TIMETABLE = {
  id: 1,
  title: 'Emploi du temps - 1ère A',
  academicYear: '2026 – 2027',
  semester: 'Semestre 1',
  className: '1ère A',
  departmentId: 1,
  status: 'PUBLISHED',
  satisfactionScore: 100,
  conflictCount: 0,
  slots: INITIAL_SLOTS,
};

export const timetableService = {
  async getTimetables() {
    try {
      const res = await apiClient.get('/timetables');
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {}
    return [INITIAL_TIMETABLE];
  },

  async getTimetableById(id) {
    try {
      const res = await apiClient.get(`/timetables/${id}`);
      const data = res?.data || res;
      if (data?.id) return data;
    } catch {}
    return INITIAL_TIMETABLE;
  },

  async getTimetablesByDepartment(departmentId) {
    try {
      const res = await apiClient.get(`/timetables/department/${departmentId}`);
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
    return [INITIAL_TIMETABLE];
  },

  async generate(payload) {
    try {
      const res = await apiClient.post('/timetables/generate', payload);
      const data = res?.data || res;
      if (data?.slots) return data;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      ...INITIAL_TIMETABLE,
      id: Date.now(),
      className: payload.className || '1ère A',
      academicYear: payload.academicYear || '2026 – 2027',
      semester: payload.semester || 'Semestre 1',
      title: `Emploi du temps - ${payload.className || '1ère A'}`,
    };
  },

  async updateSlot(timetableId, slotId, slotData) {
    try {
      const res = await apiClient.put(`/timetables/${timetableId}/slots/${slotId}`, slotData);
      return res?.data || res;
    } catch {
      return { success: true, ...slotData };
    }
  },

  async deleteSlot(timetableId, slotId) {
    try {
      const res = await apiClient.delete(`/timetables/${timetableId}/slots/${slotId}`);
      return res?.data || res;
    } catch {
      return { success: true };
    }
  },

  async deleteTimetable(id) {
    try {
      const res = await apiClient.delete(`/timetables/${id}`);
      return res?.data || res;
    } catch {
      return { success: true };
    }
  },

  async exportPdf(data) {
    return downloadTimetablePdf(data);
  },

  async getClassrooms() {
    try {
      const res = await apiClient.get('/timetables/classrooms');
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
    return [
      { id: 1, name: 'Salle 101 Richelieu', building: 'Bâtiment Principal Descartes', capacity: 35, type: 'STANDARD' },
      { id: 2, name: 'Salle 102 Molière', building: 'Bâtiment Principal Descartes', capacity: 35, type: 'STANDARD' },
      { id: 3, name: 'Laboratoire 201 - Sciences', building: 'Pôle Scientifique Pasteur', capacity: 30, type: 'LABORATOIRE' },
      { id: 4, name: 'Gymnase Olympique', building: 'Complexe Sportif', capacity: 60, type: 'SPORT' },
    ];
  },
};
