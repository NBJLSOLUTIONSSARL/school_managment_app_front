import React, { useState } from 'react';
import {
  School,
  User,
  Star,
  Bell,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function SettingsView() {
  const { currentUser } = useAuth();

  // School profile state
  const [schoolProfile, setSchoolProfile] = useState({
    name: 'Greenfield Academy',
    code: 'GFA-2026',
    academicYear: '2026 - 2027',
    phone: '+1 (555) 234-5678',
    address: '123 Education Lane, Springfield, IL 62701',
  });

  // Admin account state
  const [adminAccount, setAdminAccount] = useState({
    fullName: currentUser
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Dr. Patricia Adams'
      : 'Dr. Patricia Adams',
    email: currentUser?.email || 'p.adams@greenfieldacademy.edu',
    newPassword: '',
    confirmPassword: '',
  });

  // Academic settings
  const [academicSettings, setAcademicSettings] = useState({
    gradingSystem: 'GPA (4.0 Scale)',
    passMark: '60%',
    minAttendance: '80%',
    maxClassSize: '35 students',
  });

  // Notifications toggles
  const [notifications, setNotifications] = useState({
    enrollmentAlerts: true,
    attendanceReports: true,
    gradeSubmissions: false,
    eventReminders: true,
    parentMessages: true,
  });

  // System toggles
  const [systemSettings, setSystemSettings] = useState({
    darkMode: false,
    twoFactorAuth: true,
    autoBackup: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSystem = (key) => {
    setSystemSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess('');
    setLoading(true);

    try {
      if (adminAccount.newPassword) {
        if (adminAccount.newPassword !== adminAccount.confirmPassword) {
          throw new Error('New password and confirmation do not match.');
        }
        if (adminAccount.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await authService.changePassword('CurrentPass123', adminAccount.newPassword);
      }

      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Error saving settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setAdminAccount({
      ...adminAccount,
      newPassword: '',
      confirmPassword: '',
    });
    setSuccess('Modifications discarded.');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Alert Banners */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: 2 Columns matching Figma */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2): Profile, Account, Grading Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: School Profile */}
          <div className="edutrack-card bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center">
                <School className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#1E293B]">
                School Profile
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={schoolProfile.name}
                    onChange={(e) =>
                      setSchoolProfile({ ...schoolProfile, name: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    School Code
                  </label>
                  <input
                    type="text"
                    value={schoolProfile.code}
                    onChange={(e) =>
                      setSchoolProfile({ ...schoolProfile, code: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    value={schoolProfile.academicYear}
                    onChange={(e) =>
                      setSchoolProfile({ ...schoolProfile, academicYear: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={schoolProfile.phone}
                    onChange={(e) =>
                      setSchoolProfile({ ...schoolProfile, phone: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={schoolProfile.address}
                  onChange={(e) =>
                    setSchoolProfile({ ...schoolProfile, address: e.target.value })
                  }
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Administrator Account */}
          <div className="edutrack-card bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                <User className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#1E293B]">
                Administrator Account
              </h2>
            </div>

            {/* Admin Profile Row from Figma */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-[#F1F5F9] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4361EE] font-bold text-xs flex items-center justify-center shadow-xs">
                  PA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">
                    {adminAccount.fullName}
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    {adminAccount.email}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#4361EE] bg-[#EEF2FF] px-2 py-0.2 rounded-md">
                    Super Admin
                  </span>
                </div>
              </div>

              <button className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#1E293B] hover:bg-slate-50 transition cursor-pointer">
                Edit
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={adminAccount.fullName}
                    onChange={(e) =>
                      setAdminAccount({ ...adminAccount, fullName: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={adminAccount.email}
                    onChange={(e) =>
                      setAdminAccount({ ...adminAccount, email: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminAccount.newPassword}
                    onChange={(e) =>
                      setAdminAccount({ ...adminAccount, newPassword: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={adminAccount.confirmPassword}
                    onChange={(e) =>
                      setAdminAccount({ ...adminAccount, confirmPassword: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Grading & Academic Settings */}
          <div className="edutrack-card bg-white p-6 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Star className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-base font-bold text-[#1E293B]">
                Grading & Academic Settings
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Grading System
                  </label>
                  <select
                    value={academicSettings.gradingSystem}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        gradingSystem: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none"
                  >
                    <option value="GPA (4.0 Scale)">GPA (4.0 Scale)</option>
                    <option value="Percentage (0-100%)">Percentage (0-100%)</option>
                    <option value="Scale (0-20)">Système Français (0-20)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Pass Mark
                  </label>
                  <input
                    type="text"
                    value={academicSettings.passMark}
                    onChange={(e) =>
                      setAcademicSettings({ ...academicSettings, passMark: e.target.value })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Minimum Attendance
                  </label>
                  <input
                    type="text"
                    value={academicSettings.minAttendance}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        minAttendance: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
                    Max Class Size
                  </label>
                  <input
                    type="text"
                    value={academicSettings.maxClassSize}
                    onChange={(e) =>
                      setAcademicSettings({
                        ...academicSettings,
                        maxClassSize: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons matching Figma */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="px-5 py-2.5 rounded-full border border-[#E2E8F0] bg-white text-xs font-semibold text-[#64748B] hover:bg-slate-50 transition cursor-pointer"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#4361EE] hover:bg-[#3451D1] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Settings</span>
            </button>
          </div>
        </div>

        {/* Right Column (Span 1): Notifications, System, Danger Zone */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-[#EF4444]" />
              <h2 className="text-base font-bold text-[#1E293B]">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'enrollmentAlerts',
                  title: 'Enrollment Alerts',
                  desc: 'New student applications',
                },
                {
                  id: 'attendanceReports',
                  title: 'Attendance Reports',
                  desc: 'Daily attendance summary',
                },
                {
                  id: 'gradeSubmissions',
                  title: 'Grade Submissions',
                  desc: 'Teacher grade uploads',
                },
                {
                  id: 'eventReminders',
                  title: 'Event Reminders',
                  desc: 'School events & exams',
                },
                {
                  id: 'parentMessages',
                  title: 'Parent Messages',
                  desc: 'Incoming parent messages',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotification(item.id)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                      notifications[item.id] ? 'bg-[#4361EE]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        notifications[item.id] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-[#F1F5F9] shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-base font-bold text-[#1E293B]">
                System
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  id: 'darkMode',
                  title: 'Dark Mode',
                  desc: 'Switch app appearance',
                },
                {
                  id: 'twoFactorAuth',
                  title: 'Two-Factor Auth',
                  desc: 'Enhanced login security',
                },
                {
                  id: 'autoBackup',
                  title: 'Auto Backup',
                  desc: 'Daily data backup',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSystem(item.id)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                      systemSettings[item.id] ? 'bg-[#4361EE]' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        systemSettings[item.id] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="edutrack-card bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-[#EF4444]">
              <AlertTriangle className="w-4 h-4" />
              <h2 className="text-base font-bold">
                Danger Zone
              </h2>
            </div>

            <p className="text-[11px] text-[#64748B] mb-4">
              These actions are irreversible. Please proceed with caution.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset the academic year?')) {
                    setSuccess('Academic year reset request processed.');
                  }
                }}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                Reset Academic Year
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('DANGER: Are you sure you want to delete all student test data?')) {
                    setSuccess('Student data deletion requested.');
                  }
                }}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
              >
                Delete All Student Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
