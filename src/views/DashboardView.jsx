import React, { useState, useEffect } from 'react';
import {
  School,
  GraduationCap,
  Users,
  Building2,
  Calendar,
  Bell,
  Clock,
  ArrowRight,
  MoreVertical,
  Edit3,
  FlaskConical,
  Palette,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import HeroBanner from '../components/common/HeroBanner';
import StatCard from '../components/common/StatCard';
import MiniCalendar from '../components/common/MiniCalendar';
import StatusBadge from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { statsService } from '../services/statsService';
import { communicationService } from '../services/communicationService';
import { applicationService } from '../services/applicationService';
import { studentService } from '../services/studentService';

export default function DashboardView() {
  const { currentUser, setActiveView } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultEnrollments = [
    { id: 1, name: 'Emma Johnson', grade: 'Grade 10', status: 'Documents Review' },
    { id: 2, name: 'Liam Carter', grade: 'Grade 7', status: 'Pending Payment' },
    { id: 3, name: 'Olivia Brown', grade: 'Grade 11', status: 'Approved' },
    { id: 4, name: 'Noah Williams', grade: 'Grade 8', status: 'Pending Payment' },
    { id: 5, name: 'Sophia Davis', grade: 'Grade 9', status: 'Final Interview' },
  ];

  const defaultEvents = [
    {
      id: 'e1',
      title: 'Mid-term Exams Start',
      date: 'Oct 20 · All Grades',
      icon: Edit3,
      iconBg: 'bg-[#FFEDD5]',
      iconColor: 'text-[#EA580C]',
    },
    {
      id: 'e2',
      title: 'Science Fair',
      date: 'Oct 25 · Auditorium',
      icon: FlaskConical,
      iconBg: 'bg-[#DCFCE7]',
      iconColor: 'text-[#16A34A]',
    },
    {
      id: 'e3',
      title: 'Parent-Teacher Meeting',
      date: 'Oct 28 · Main Hall',
      icon: Users,
      iconBg: 'bg-[#FCE7F3]',
      iconColor: 'text-[#DB2777]',
    },
    {
      id: 'e4',
      title: 'Annual Art Exhibition',
      date: 'Nov 3 · Gallery',
      icon: Palette,
      iconBg: 'bg-[#FEF3C7]',
      iconColor: 'text-[#D97706]',
    },
    {
      id: 'e5',
      title: 'Graduation Ceremony',
      date: 'Nov 10 · Main Stage',
      icon: GraduationCap,
      iconBg: 'bg-[#EDE9FE]',
      iconColor: 'text-[#7C3AED]',
    },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminStats, eventsRes, appsRes] = await Promise.allSettled([
        statsService.getAdminStats(),
        communicationService.getEvents({ page: 0, size: 5 }),
        applicationService.getApplications({ page: 0, size: 5 }),
      ]);

      if (adminStats.status === 'fulfilled' && adminStats.value) {
        setStats(adminStats.value);
      }

      if (eventsRes.status === 'fulfilled' && eventsRes.value) {
        const list = eventsRes.value.content || (Array.isArray(eventsRes.value) ? eventsRes.value : []);
        if (list.length > 0) {
          setEvents(list);
        }
      }

      if (appsRes.status === 'fulfilled' && appsRes.value) {
        const appsList = appsRes.value.content || (Array.isArray(appsRes.value) ? appsRes.value : []);
        if (appsList.length > 0) {
          const mapped = appsList.slice(0, 5).map((app) => ({
            id: app.id,
            name: `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Student Applicant',
            grade: app.applyingForGrade ? `Grade ${app.applyingForGrade}` : 'Grade 9',
            status: app.status || 'Documents Review',
          }));
          setEnrollments(mapped);
        } else {
          setEnrollments(defaultEnrollments);
        }
      } else {
        setEnrollments(defaultEnrollments);
      }
    } catch (err) {
      setError(err.message || 'Error loading dashboard data.');
      setEnrollments(defaultEnrollments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const principalGreetingName = currentUser?.lastName
    ? `Principal ${currentUser.lastName}`
    : 'Principal Adams';

  const pendingAppsCount = stats?.totalApplications ?? 16;
  const pendingTeachersCount = 3;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Figma Hero Banner */}
      <HeroBanner
        title={`Good morning, ${principalGreetingName}!`}
        description={`You have ${pendingAppsCount} new enrollment requests and ${pendingTeachersCount} pending teacher approvals. Let's get through today's tasks! 🎯`}
        buttonText="Review Enrollments"
        onButtonClick={() => setActiveView('admissions-admin')}
        icon={School}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns (Main Content + Right Side Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): School Overview + Recent Enrollments */}
        <div className="lg:col-span-2 space-y-6">
          {/* School Overview Section */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B]">
                School Overview
              </h2>
              <button
                onClick={() => setActiveView('students')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                see all
              </button>
            </div>

            {/* 4 StatCards with Circular Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total Students"
                value={stats?.totalStudents ? stats.totalStudents.toString() : '342'}
                subtitle="(+12 this month)"
                progress={88}
                progressColor="#4361EE"
                onClick={() => setActiveView('students')}
              />
              <StatCard
                title="Active Teachers"
                value={stats?.totalTeachers ? stats.totalTeachers.toString() : '28'}
                subtitle="(3 on leave)"
                progress={90}
                progressColor="#EF4444"
                onClick={() => setActiveView('teachers')}
              />
              <StatCard
                title="Active Classes"
                value={stats?.totalDepartments ? stats.totalDepartments.toString() : '18'}
                subtitle="(2 pending setup)"
                progress="-"
                progressColor="#94A3B8"
                onClick={() => setActiveView('classes')}
              />
              <StatCard
                title="Attendance Rate"
                value="94%"
                subtitle="(This week)"
                progress={94}
                progressColor="#06B6D4"
              />
            </div>
          </div>

          {/* Recent Enrollments Table */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Recent Enrollments
              </h2>
              <button
                onClick={() => setActiveView('admissions-admin')}
                className="bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
              >
                See all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Student Name</th>
                    <th className="pb-3 font-semibold">Grade</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {enrollments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-[#1E293B]">
                        {item.name}
                      </td>
                      <td className="py-3.5 pr-4 text-[#64748B]">
                        {item.grade}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={item.status} variant="dot" />
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

        {/* Right Column (Span 1): Mini Calendar + Upcoming Events */}
        <div className="space-y-6">
          {/* Mini Calendar Widget */}
          <MiniCalendar onSelectDate={() => {}} />

          {/* Upcoming Events Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1E293B]">
                Upcoming Events
              </h2>
              <button
                onClick={() => setActiveView('timetable')}
                className="text-xs font-semibold text-[#64748B] hover:text-[#4361EE] transition cursor-pointer"
              >
                see all
              </button>
            </div>

            <div className="space-y-3.5">
              {events.length > 0
                ? events.map((evt, idx) => (
                    <div
                      key={evt.id || idx}
                      className="flex items-center justify-between gap-3 p-1 hover:bg-slate-50 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#1E293B] truncate">
                            {evt.title}
                          </h4>
                          <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                            {evt.startAt
                              ? new Date(evt.startAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Upcoming'}
                            {evt.location ? ` · ${evt.location}` : ''}
                          </p>
                        </div>
                      </div>
                      <button className="text-[#94A3B8] hover:text-[#4361EE] p-1.5 rounded-full transition cursor-pointer shrink-0">
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                : defaultEvents.map((evt) => {
                    const EvtIcon = evt.icon;
                    return (
                      <div
                        key={evt.id}
                        className="flex items-center justify-between gap-3 p-1 hover:bg-slate-50 rounded-xl transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-full ${evt.iconBg} ${evt.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            <EvtIcon className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#1E293B] truncate">
                              {evt.title}
                            </h4>
                            <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                              {evt.date}
                            </p>
                          </div>
                        </div>
                        <button className="text-[#94A3B8] hover:text-[#4361EE] p-1.5 rounded-full transition cursor-pointer shrink-0">
                          <Bell className="w-4 h-4" />
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
