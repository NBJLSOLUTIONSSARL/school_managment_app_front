import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Phone,
  MoreVertical,
} from 'lucide-react';
import HeroBanner from '../components/common/HeroBanner';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { teacherService } from '../services/teacherService';
import { departmentService } from '../services/departmentService';

export default function TeachersView() {
  const { searchQuery, hasAnyRole } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [localSearch, setLocalSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'Teacher@123',
    phone: '',
    specialization: '',
    contractType: 'CDI',
    hireDate: '2022-09-01',
    departmentId: '',
  });

  const canManage = hasAnyRole(['ROLE_ADMIN']);

  // Figma reference data for visual fidelity
  const figmaTeacherApplications = [
    {
      id: 'app-1',
      fullName: 'Dr. Alan Foster',
      department: 'Mathematics',
      stage: 'Demo Lesson',
      status: 'demo lesson',
    },
    {
      id: 'app-2',
      fullName: 'Ms. Rachel Kim',
      department: 'Science',
      stage: 'Assignment',
      status: 'assignment',
    },
    {
      id: 'app-3',
      fullName: 'Mr. Steve Huang',
      department: 'Physical Education',
      stage: 'CV Review',
      status: 'cv review',
    },
    {
      id: 'app-4',
      fullName: 'Ms. Chloe Bennett',
      department: 'Arts & Music',
      stage: 'Assignment',
      status: 'assignment',
    },
    {
      id: 'app-5',
      fullName: 'Dr. Paul Edwards',
      department: 'Mathematics',
      stage: 'Final Interview',
      status: 'final interview',
    },
  ];

  const figmaStaffList = [
    {
      id: 'staff-1',
      initials: 'MR',
      name: 'Ms. Maria Rodriguez',
      role: 'English Literature · Grade 9-11',
      initialsBg: 'bg-[#DBEAFE] text-[#1D4ED8]',
    },
    {
      id: 'staff-2',
      initials: 'DT',
      name: 'Mr. David Thompson',
      role: 'Mathematics · Grade 7-10',
      initialsBg: 'bg-[#DCFCE7] text-[#15803D]',
    },
    {
      id: 'staff-3',
      initials: 'SL',
      name: 'Dr. Susan Lee',
      role: 'Biology & Chemistry · Grade 9-11',
      initialsBg: 'bg-[#FFE4E6] text-[#E11D48]',
    },
    {
      id: 'staff-4',
      initials: 'JP',
      name: 'Mr. Jason Park',
      role: 'History & Geography · Grade 7-8',
      initialsBg: 'bg-[#FEF3C7] text-[#B45309]',
    },
    {
      id: 'staff-5',
      initials: 'AM',
      name: 'Ms. Anna Martinez',
      role: 'Physical Education · All Grades',
      initialsBg: 'bg-[#EDE9FE] text-[#6D28D9]',
    },
  ];

  const departmentBarData = [
    { name: 'Mathematics', count: 6, color: 'bg-[#4361EE]', percent: 85 },
    { name: 'Science', count: 5, color: 'bg-[#10B981]', percent: 70 },
    { name: 'English', count: 5, color: 'bg-[#EF4444]', percent: 70 },
    { name: 'Humanities', count: 4, color: 'bg-[#F59E0B]', percent: 55 },
    { name: 'Arts & PE', count: 3, color: 'bg-[#8B5CF6]', percent: 40 },
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const depId = selectedDepartment !== 'ALL' ? Number(selectedDepartment) : null;
      const [teachersRes, deptsRes] = await Promise.allSettled([
        teacherService.getTeachers(depId),
        departmentService.getDepartments(),
      ]);

      if (teachersRes.status === 'fulfilled') {
        const list = Array.isArray(teachersRes.value)
          ? teachersRes.value
          : teachersRes.value?.data || [];
        setTeachers(list);
      }
      if (deptsRes.status === 'fulfilled') {
        const depts = Array.isArray(deptsRes.value)
          ? deptsRes.value
          : deptsRes.value?.data || [];
        setDepartments(depts);
      }
    } catch (err) {
      setError(err.message || 'Error loading teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDepartment]);

  const handleOpenAdd = () => {
    setModalError(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: 'Teacher@123',
      phone: '',
      specialization: '',
      contractType: 'CDI',
      hireDate: new Date().toISOString().split('T')[0],
      departmentId: departments.length > 0 ? departments[0].id : 1,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setModalError(null);
    setFormData({
      firstName: teacher.user?.firstName || '',
      lastName: teacher.user?.lastName || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      specialization: teacher.specialization || '',
      contractType: teacher.contractType || 'CDI',
      hireDate: teacher.hireDate || '',
      departmentId: teacher.department?.id || (departments.length > 0 ? departments[0].id : 1),
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      await teacherService.createTeacher(formData);
      setIsAddModalOpen(false);
      setSuccessMessage('Teacher added successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Error creating teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setSubmitting(true);
    setModalError(null);
    try {
      await teacherService.updateTeacher(selectedTeacher.id, formData);
      setIsEditModalOpen(false);
      setSuccessMessage('Teacher profile updated.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setModalError(err.message || 'Error updating teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher from MySQL?')) return;
    try {
      await teacherService.deleteTeacher(id);
      setSuccessMessage('Teacher deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadData();
    } catch (err) {
      setError(err.message || 'Unable to delete teacher.');
    }
  };

  const query = (localSearch || searchQuery).toLowerCase().trim();
  const currentStaffList =
    teachers.length > 0
      ? teachers.slice(0, 5).map((t, idx) => {
          const user = t.user || {};
          const initials = `${(user.firstName || 'T')[0]}${(user.lastName || 'C')[0]}`.toUpperCase();
          const colors = [
            'bg-[#DBEAFE] text-[#1D4ED8]',
            'bg-[#DCFCE7] text-[#15803D]',
            'bg-[#FFE4E6] text-[#E11D48]',
            'bg-[#FEF3C7] text-[#B45309]',
            'bg-[#EDE9FE] text-[#6D28D9]',
          ];
          return {
            id: t.id,
            initials,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Teacher',
            role: `${t.specialization || 'Instructor'} · ${t.department?.name || 'Department'}`,
            initialsBg: colors[idx % colors.length],
            raw: t,
          };
        })
      : figmaStaffList;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title="Teaching Staff"
        description="You have 3 pending teacher applications to review. Keep your faculty roster up-to-date and manage class assignments efficiently."
        buttonText="Review Applications"
        onButtonClick={handleOpenAdd}
        icon={UserCheck}
      />

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Open Positions + Teacher Applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Open Positions by Department */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Open Positions by Department
              </h2>
              <button
                onClick={handleOpenAdd}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                see all
              </button>
            </div>

            {/* 4 StatCards with Circular Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                value="2"
                title="Mathematics Teachers"
                subtitle="(4 applicants)"
                progress={75}
                progressColor="#4361EE"
              />
              <StatCard
                value="1"
                title="Science Teacher"
                subtitle="(6 applicants)"
                progress={25}
                progressColor="#EF4444"
              />
              <StatCard
                value="1"
                title="Arts & Music"
                subtitle="(2 applicants)"
                progress="-"
                progressColor="#94A3B8"
              />
              <StatCard
                value="1"
                title="Physical Education"
                subtitle="(3 applicants)"
                progress={50}
                progressColor="#06B6D4"
              />
            </div>
          </div>

          {/* Teacher Applications Table */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Teacher Applications
              </h2>
              <button
                onClick={handleOpenAdd}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                See all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">FULL NAME</th>
                    <th className="pb-3 font-semibold">DEPARTMENT</th>
                    <th className="pb-3 font-semibold">STAGE</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {figmaTeacherApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-[#1E293B]">
                        {app.fullName}
                      </td>
                      <td className="py-3.5 pr-4 text-[#64748B]">
                        {app.department}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={app.stage} variant="dot" />
                      </td>
                      <td className="py-3.5 text-right text-[#94A3B8]">
                        <button className="p-1 hover:text-[#1E293B] rounded-md transition cursor-pointer">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1): Current Staff + Departments */}
        <div className="space-y-6">
          {/* Current Staff Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Current Staff
              </h2>
              <button
                onClick={handleOpenAdd}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                see all
              </button>
            </div>

            <div className="space-y-3.5">
              {currentStaffList.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full ${staff.initialsBg} flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}
                    >
                      {staff.initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#1E293B] truncate">
                        {staff.name}
                      </h4>
                      <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                        {staff.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-[#94A3B8]">
                    <button
                      className="p-1.5 hover:text-[#4361EE] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Send message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1.5 hover:text-[#10B981] hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments Progress Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Departments
              </h2>
            </div>

            <div className="space-y-3.5">
              {departmentBarData.map((dept) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1E293B]">{dept.name}</span>
                    <span className="text-[#64748B] font-normal">
                      {dept.count} teachers
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${dept.color}`}
                      style={{ width: `${dept.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Faculty Member"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Specialization</label>
              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#4361EE] text-white hover:bg-[#3451D1] disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Teacher</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
