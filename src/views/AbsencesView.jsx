import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Loader2, CheckCircle2, XCircle, Plus, Search, ShieldCheck } from 'lucide-react';
import HeroBanner from '../components/common/HeroBanner';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { communicationService } from '../services/communicationService';

export default function AbsencesView() {
  const { currentUser, hasAnyRole } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const [formData, setFormData] = useState({
    type: 'SICK',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const canManage = hasAnyRole(['ROLE_ADMIN', 'ROLE_STAFF']);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await communicationService.getLeaveRequests({
        userId: canManage ? null : currentUser?.id,
        page: 0,
        size: 50,
      });
      const list = res?.content || (Array.isArray(res) ? res : []);
      setLeaveRequests(list);
    } catch {
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [currentUser?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      setModalError("Please provide a reason for the absence.");
      return;
    }
    if (formData.endDate < formData.startDate) {
      setModalError("End date must be after or equal to start date.");
      return;
    }

    setSubmitting(true);
    setModalError(null);
    setError(null);
    try {
      await communicationService.createLeaveRequest({
        ...formData,
        userId: currentUser?.id,
      });
      setIsModalOpen(false);
      setFormData({
        type: 'SICK',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      });
      setSuccessMessage('Absence request recorded successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchLeaves();
    } catch (err) {
      setModalError(err.message || 'Error recording absence request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await communicationService.updateLeaveStatus(id, { status });
      setSuccessMessage(`Request #${id} status updated to ${status}.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      await fetchLeaves();
    } catch (err) {
      setError(err.message || 'Status update failed.');
    }
  };

  const approvedCount = leaveRequests.filter((l) => l.status === 'APPROVED').length;
  const pendingCount = leaveRequests.filter((l) => l.status === 'PENDING').length;
  const rejectedCount = leaveRequests.filter((l) => l.status === 'REJECTED').length;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* EduTrack Hero Banner */}
      <HeroBanner
        title="Attendance & Leave Requests"
        description="Monitor excused absences, sick leave submissions, and attendance logs across all academic departments."
        buttonText="+ Declare Absence"
        onButtonClick={() => {
          setModalError(null);
          setIsModalOpen(true);
        }}
        icon={Calendar}
      />

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 StatCards with Circular Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Requests"
          value={leaveRequests.length.toString()}
          subtitle="Recorded in MySQL"
          progress={100}
          progressColor="#4361EE"
        />
        <StatCard
          title="Approved Leaves"
          value={approvedCount.toString()}
          subtitle="Status Approved"
          progress={leaveRequests.length > 0 ? Math.round((approvedCount / leaveRequests.length) * 100) : 85}
          progressColor="#10B981"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount.toString()}
          subtitle="Awaiting decision"
          progress={leaveRequests.length > 0 ? Math.round((pendingCount / leaveRequests.length) * 100) : 15}
          progressColor="#F59E0B"
        />
        <StatCard
          title="Rejected / At Risk"
          value={rejectedCount.toString()}
          subtitle="Unexcused absences"
          progress={leaveRequests.length > 0 ? Math.round((rejectedCount / leaveRequests.length) * 100) : 5}
          progressColor="#EF4444"
        />
      </div>

      <div className="edutrack-card bg-white rounded-2xl border border-[#F1F5F9] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1E293B]">
            Absence & Leave Registry
          </h2>
          <span className="text-xs font-semibold text-[#64748B] bg-slate-100 px-3 py-1 rounded-full">
            {leaveRequests.length} entries
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#64748B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#4361EE]" />
            <span className="text-xs sm:text-sm font-medium">Loading absence records from MySQL...</span>
          </div>
        ) : leaveRequests.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Calendar className="w-12 h-12 text-[#94A3B8] mx-auto opacity-40" />
            <h3 className="text-base font-bold text-[#1E293B]">
              No absences recorded
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              All students and staff currently have a regular attendance record.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 bg-[#4361EE] text-white text-xs font-semibold px-5 py-2.5 rounded-full cursor-pointer hover:bg-[#3451D1] shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Declare Absence</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">User</th>
                  <th className="py-4 px-6 font-semibold">Type</th>
                  <th className="py-4 px-6 font-semibold">Dates</th>
                  <th className="py-4 px-6 font-semibold">Reason</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  {canManage && <th className="py-4 px-6 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {leaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#1E293B]">
                      {req.user?.firstName || 'User'} {req.user?.lastName || `#${req.userId}`}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 font-medium text-[11px] text-[#1E293B]">
                        {req.type || 'Standard'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#64748B]">
                      {req.startDate} → {req.endDate}
                    </td>
                    <td className="py-4 px-6 text-[#64748B] max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={req.status || 'PENDING'} variant="pill" />
                    </td>
                    {canManage && (
                      <td className="py-4 px-6 text-right space-x-1.5">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Declare Absence */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Declare Absence or Leave Request"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Type of Absence *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            >
              <option value="SICK">Medical / Sick Leave</option>
              <option value="FAMILY">Family Reason</option>
              <option value="AUTHORIZATION">Authorized Absence</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1E293B] mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E293B] mb-1">
              Reason / Justification *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explain the reason for this absence..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1E293B] focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              <span>Submit Request</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
