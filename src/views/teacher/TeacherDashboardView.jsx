import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckSquare,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Bell,
  MoreVertical,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import HeroBanner from '../../components/common/HeroBanner';
import MiniCalendar from '../../components/common/MiniCalendar';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/statsService';

export default function TeacherDashboardView() {
  const { currentUser, setActiveView } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const teacherName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : '';

  const fetchTeacherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsService.getTeacherStats(teacherName);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Error loading teacher data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, [teacherName]);

  const displayName = teacherName || currentUser?.email || 'Teacher';

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Good morning, ${displayName}!`}
        description="You have 4 classes scheduled today and 8 pending student evaluations. Keep track of your academic timetable and student submissions."
        buttonText="View Timetable"
        onButtonClick={() => setActiveView('timetable')}
        icon={BookOpen}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchTeacherData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 StatCards with Circular Progress from Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Assigned Classes"
          value={stats?.totalClasses?.toString() || '4'}
          subtitle="Active Courses"
          progress={85}
          progressColor="#4361EE"
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents?.toString() || '112'}
          subtitle="Under Supervision"
          progress={92}
          progressColor="#10B981"
        />
        <StatCard
          title="Pending Grades"
          value={stats?.totalExams?.toString() || '8'}
          subtitle="Needs Review"
          progress={25}
          progressColor="#EF4444"
        />
        <StatCard
          title="Attendance Rate"
          value="96%"
          subtitle="Class Average"
          progress={96}
          progressColor="#06B6D4"
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Weekly Schedule Table + Upcoming Evaluations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4361EE]" />
                <h2 className="text-base font-bold text-[#1E293B]">
                  My Teaching Schedule
                </h2>
              </div>
              <button
                onClick={() => setActiveView('timetable')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Full timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {stats?.timetableSlots && stats.timetableSlots.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      <th className="pb-3">Day</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Subject</th>
                      <th className="pb-3">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {stats.timetableSlots.slice(0, 6).map((slot) => (
                      <tr key={slot.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 font-bold text-[#1E293B]">
                          {slot.dayOfWeek}
                        </td>
                        <td className="py-3.5 text-[#64748B]">
                          {slot.timeSlotLabel || `${slot.startTime} - ${slot.endTime}`}
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4361EE]">
                            <BookOpen className="w-3 h-3" />
                            {slot.subject}
                          </span>
                        </td>
                        <td className="py-3.5 text-[#64748B]">
                          {slot.classroomName || 'Assigned Room'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[#94A3B8]">
                No teaching slots assigned for today in MySQL.
              </div>
            )}
          </div>

          {/* Evaluations / Exams Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Active Evaluations & Tests
              </h2>
              <button
                onClick={() => setActiveView('grades')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                Grade submissions
              </button>
            </div>

            {stats?.upcomingExams && stats.upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingExams.slice(0, 4).map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3.5 bg-slate-50/70 rounded-xl border border-[#F1F5F9] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">
                        {exam.title || exam.name || `Exam #${exam.id}`}
                      </h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Coefficient: {exam.coefficient || 1} · Date: {exam.examDate || 'Scheduled'}
                      </p>
                    </div>
                    <StatusBadge status="Active" variant="pill" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#94A3B8]">
                All active assessments have been recorded.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Span 1): MiniCalendar + Upcoming Deadlines */}
        <div className="space-y-6">
          <MiniCalendar onSelectDate={() => {}} />

          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Faculty Milestones
              </h2>
            </div>

            <div className="space-y-3.5">
              {[
                { title: 'Grade Submission Deadline', date: 'Oct 24 · Semester 1', icon: Calendar, color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]' },
                { title: 'Department Faculty Meeting', date: 'Oct 28 · Conference Room', icon: Users, color: 'text-[#4361EE]', bg: 'bg-[#EEF2FF]' },
                { title: 'Mid-term Exams Start', date: 'Nov 02 · All Sections', icon: BookOpen, color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center justify-between p-1 hover:bg-slate-50 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1E293B]">{item.title}</h4>
                        <p className="text-[11px] text-[#64748B]">{item.date}</p>
                      </div>
                    </div>
                    <button className="text-[#94A3B8] hover:text-[#4361EE] p-1 cursor-pointer">
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
