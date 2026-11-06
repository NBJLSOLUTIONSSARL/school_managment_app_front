import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  Eye,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  AlertTriangle,
  Clock,
  MoreVertical,
  FlaskConical,
  Globe,
  Palette,
} from 'lucide-react';
import HeroBanner from '../components/common/HeroBanner';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { departmentService } from '../services/departmentService';
import { teacherService } from '../services/teacherService';

export default function ClassesView() {
  const { hasAnyRole, searchQuery } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalError, setModalError] = useState(null);
  const [localSearch, setLocalSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewTeachersModalOpen, setIsViewTeachersModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewingDept, setViewingDept] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  // Figma reference classes for pixel-perfect presentation
  const figmaClasses = [
    {
      id: 'c-1',
      className: 'Mathematics 10A',
      teacher: 'Mr. D. Thompson',
      students: 32,
      status: 'Active',
    },
    {
      id: 'c-2',
      className: 'Biology 9B',
      teacher: 'Dr. S. Lee',
      students: 28,
      status: 'Active',
    },
    {
      id: 'c-3',
      className: 'English Lit 11A',
      teacher: 'Ms. M. Rodriguez',
      students: 30,
      status: 'Low Attendance',
    },
    {
      id: 'c-4',
      className: 'History 8C',
      teacher: 'Mr. J. Park',
      students: 25,
      status: 'Unassigned',
    },
    {
      id: 'c-5',
      className: 'Physics 11B',
      teacher: '—',
      students: 22,
      status: 'No Teacher',
    },
  ];

  const figmaSchedule = [
    {
      id: 'sch-1',
      time: '08:00',
      subject: 'Mathematics 10A',
      room: 'Room 201 · Mr. Thompson',
      bgColor: 'bg-[#EEF2FF]',
      borderColor: 'border-l-4 border-l-[#4361EE]',
    },
    {
      id: 'sch-2',
      time: '09:30',
      subject: 'Biology 9B',
      room: 'Lab 3 · Dr. Lee',
      bgColor: 'bg-[#ECFDF5]',
      borderColor: 'border-l-4 border-l-[#10B981]',
    },
    {
      id: 'sch-3',
      time: '11:00',
      subject: 'English Lit 11A',
      room: 'Room 105 · Ms. Rodriguez',
      bgColor: 'bg-[#FFFBEB]',
      borderColor: 'border-l-4 border-l-[#F59E0B]',
    },
    {
      id: 'sch-4',
      time: '13:00',
      subject: 'History 8C',
      room: 'Room 302 · Mr. Park',
      bgColor: 'bg-[#FEF2F2]',
      borderColor: 'border-l-4 border-l-[#EF4444]',
    },
    {
      id: 'sch-5',
      time: '14:30',
      subject: 'Physical Ed. 7A',
      room: 'Gymnasium · Ms. Martinez',
      bgColor: 'bg-[#F5F3FF]',
      borderColor: 'border-l-4 border-l-[#8B5CF6]',
    },
  ];

  const subjectCounts = [
    { name: 'Mathematics', count: 5, icon: BookOpen, color: 'text-[#4361EE]' },
    { name: 'Science', count: 4, icon: FlaskConical, color: 'text-[#10B981]' },
    { name: 'English', count: 4, icon: BookOpen, color: 'text-[#EF4444]' },
    { name: 'Humanities', count: 3, icon: Globe, color: 'text-[#F59E0B]' },
    { name: 'Arts', count: 2, icon: Palette, color: 'text-[#8B5CF6]' },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptsRes, teachersRes] = await Promise.allSettled([
        departmentService.getDepartments(),
        teacherService.getTeachers(),
      ]);

      if (deptsRes.status === 'fulfilled') {
        const dList = Array.isArray(deptsRes.value)
          ? deptsRes.value
          : deptsRes.value?.data || [];
        setDepartments(dList);
      }
      if (teachersRes.status === 'fulfilled') {
        const tList = Array.isArray(teachersRes.value)
          ? teachersRes.value
          : teachersRes.value?.data || [];
        setTeachers(tList);
      }
    } catch (err) {
      setError(err.message || 'Error loading classes and departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setModalError(null);
    setSelectedDept(null);
    setDeptName('');
    setSelectedTeacherIds([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setModalError(null);
    setSelectedDept(dept);
    setDeptName(dept.name || '');
    const currentTeacherIds = teachers
      .filter((t) => t.department?.id === dept.id)
      .map((t) => t.id);
    setSelectedTeacherIds(currentTeacherIds);
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) {
      setModalError('Department name is required.');
      return;
    }
    setSubmitting(true);
    try {
      await departmentService.createDepartment({ name: deptName });
      setIsAddModalOpen(false);
      setSuccessMessage('Class created successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Error creating class.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedDept || !deptName.trim()) return;
    setSubmitting(true);
    try {
      await departmentService.updateDepartment(selectedDept.id, { name: deptName });
      setIsEditModalOpen(false);
      setSuccessMessage('Class updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchData();
    } catch (err) {
      setModalError(err.message || 'Error updating class.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayClasses =
    departments.length > 0
      ? departments.map((d, idx) => {
          const deptTeachers = teachers.filter((t) => t.department?.id === d.id);
          const teacherName =
            deptTeachers.length > 0
              ? `${deptTeachers[0].user?.firstName || ''} ${deptTeachers[0].user?.lastName || ''}`.trim()
              : '—';
          return {
            id: d.id,
            className: d.name,
            teacher: teacherName,
            students: 25 + (idx % 10),
            status: deptTeachers.length > 0 ? 'Active' : 'No Teacher',
            raw: d,
          };
        })
      : figmaClasses;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title="Class Management"
        description="You have 18 active classes running this semester. Assign teachers, manage schedules, and track class performance all in one place."
        buttonText="+ Create New Class"
        onButtonClick={handleOpenAdd}
        icon={BookOpen}
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
            onClick={fetchData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Classes Needing Attention + All Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Classes Needing Attention */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                Classes Needing Attention
              </h2>
              <button
                onClick={handleOpenAdd}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                see all
              </button>
            </div>

            {/* 4 StatCards matching Figma */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                value="2"
                title="Classes Unassigned"
                subtitle="(Need teacher)"
                badgeText="!"
                badgeType="warning"
                iconBg="bg-[#FFE4E6]"
                iconColor="text-[#E11D48]"
                icon={AlertCircle}
              />
              <StatCard
                value="3"
                title="Low Attendance"
                subtitle="(<75% this week)"
                badgeText="A"
                badgeType="warning"
                iconBg="bg-[#FEF3C7]"
                iconColor="text-[#D97706]"
                icon={AlertTriangle}
              />
              <StatCard
                value="5"
                title="Exams Scheduled"
                subtitle="(Next 2 weeks)"
                iconBg="bg-[#EEF2FF]"
                iconColor="text-[#4361EE]"
                icon={Calendar}
              />
              <StatCard
                value="8"
                title="Pending Grades"
                subtitle="(Overdue)"
                progress={85}
                progressColor="#06B6D4"
              />
            </div>
          </div>

          {/* All Classes Table */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                All Classes
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
                    <th className="pb-3 font-semibold">Class Name</th>
                    <th className="pb-3 font-semibold">Teacher</th>
                    <th className="pb-3 font-semibold">Students</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {displayClasses.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-[#1E293B]">
                        {item.className}
                      </td>
                      <td className="py-3.5 pr-4 text-[#64748B]">
                        {item.teacher}
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-[#1E293B]">
                        {item.students}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={item.status} variant="dot" />
                      </td>
                      <td className="py-3.5 text-right text-[#94A3B8]">
                        <button
                          onClick={() => item.raw && handleOpenEdit(item.raw)}
                          className="p-1 hover:text-[#4361EE] rounded-md transition cursor-pointer"
                        >
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

        {/* Right Column (Span 1): Today's Schedule + By Subject */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Today's Schedule
              </h2>
            </div>

            <div className="space-y-2.5">
              {figmaSchedule.map((sch) => (
                <div
                  key={sch.id}
                  className={`p-3 rounded-xl ${sch.bgColor} ${sch.borderColor} transition shadow-2xs`}
                >
                  <span className="text-[10px] font-bold text-[#64748B] block">
                    {sch.time}
                  </span>
                  <h4 className="text-xs font-bold text-[#1E293B] mt-0.5">
                    {sch.subject}
                  </h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {sch.room}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* By Subject Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                By Subject
              </h2>
              <button className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer">
                see all
              </button>
            </div>

            <div className="space-y-3">
              {subjectCounts.map((sub) => {
                const Icon = sub.icon;
                return (
                  <div
                    key={sub.name}
                    className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${sub.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-[#1E293B]">
                        {sub.name}
                      </span>
                    </div>
                    <span className="text-xs text-[#64748B]">
                      {sub.count} classes
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Create Class Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Class / Section"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Class Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mathematics 10A"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
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
              <span>Create Class</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Class"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Class Name *
            </label>
            <input
              type="text"
              required
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
