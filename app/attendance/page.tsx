'use client';

import React, { useState, useMemo } from 'react';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { Navbar } from '../../src/components/Navbar';
import { useAuth } from '../../src/hooks/useAuth';
import { useLeaves, LeaveRequest } from '../../src/hooks/useLeaves';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Plane,
  Home,
  HeartPulse,
  Briefcase,
  Search,
  Filter,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Ban,
  Calendar,
} from 'lucide-react';

function AttendanceContent(): React.JSX.Element {
  const { user } = useAuth();
  const isSuperAdminOrHR = user?.role === 'super_admin' || user?.role === 'hr_manager';

  const [activeTab, setActiveTab] = useState<'overview' | 'calendar'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch all leave requests for balance tracking
  const { leaveRequests: allLeaveRequests } = useLeaves({});

  // Live Backend Data filtered for view/table
  const { leaveRequests, applyLeave, updateLeaveStatus } = useLeaves({
    status: filterStatus,
    type: filterType,
    search: searchQuery,
  });

  // Calculate dynamic balances based on user's approved leave requests
  const leaveBalances = useMemo(() => {
    const totalAllowances = {
      casual: 12,
      sick: 10,
      paid: 20,
      remote: 6,
    };

    const currentUserId = user?.id || (user as any)?._id;

    // Filter approved leaves for the logged-in user (or overall if user context matches)
    const userApprovedLeaves = allLeaveRequests.filter((r) => {
      if (r.status !== 'approved') return false;
      if (!user) return true;
      const isMatch =
        (r.employeeId && (r.employeeId === currentUserId || r.employeeId === user.employeeId)) ||
        (r.employeeName && user.name && r.employeeName.toLowerCase() === user.name.toLowerCase());
      return isMatch;
    });

    const used = {
      casual: 0,
      sick: 0,
      paid: 0,
      remote: 0,
    };

    userApprovedLeaves.forEach((r) => {
      const days = r.daysCount || 1;
      if (r.type in used) {
        used[r.type as keyof typeof used] += days;
      }
    });

    const casualRemaining = Math.max(0, totalAllowances.casual - used.casual);
    const sickRemaining = Math.max(0, totalAllowances.sick - used.sick);
    const paidRemaining = Math.max(0, totalAllowances.paid - used.paid);
    const remoteRemaining = Math.max(0, totalAllowances.remote - used.remote);

    return {
      casual: {
        remaining: casualRemaining,
        total: totalAllowances.casual,
        percent: Math.round((casualRemaining / totalAllowances.casual) * 100),
      },
      sick: {
        remaining: sickRemaining,
        total: totalAllowances.sick,
        percent: Math.round((sickRemaining / totalAllowances.sick) * 100),
      },
      paid: {
        remaining: paidRemaining,
        total: totalAllowances.paid,
        percent: Math.round((paidRemaining / totalAllowances.paid) * 100),
      },
      remote: {
        remaining: remoteRemaining,
        total: totalAllowances.remote,
        percent: Math.round((remoteRemaining / totalAllowances.remote) * 100),
      },
    };
  }, [allLeaveRequests, user]);

  // Modal State
  const todayStr = new Date().toISOString().split('T')[0];
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<'casual' | 'sick' | 'paid' | 'remote'>('casual');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Review Modal state for admins
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Calculate stats
  const pendingCount = leaveRequests.filter((r) => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter((r) => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter((r) => r.status === 'rejected').length;

  const filteredRequests = leaveRequests;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError('Please select both start date and end date.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    if (!reason.trim()) {
      setFormError('Please provide a reason for the leave application.');
      return;
    }

    try {
      await applyLeave({
        type: leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      setIsApplyModalOpen(false);
      setReason('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit leave request');
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedRequest || !reviewAction) return;

    try {
      await updateLeaveStatus({
        id: selectedRequest.id,
        status: reviewAction,
        reviewComment: reviewComment.trim() || undefined,
      });
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewComment('');
    } catch (err: any) {
      console.error('Failed to update leave status:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'casual':
        return { label: 'Casual Leave', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Plane };
      case 'sick':
        return { label: 'Sick Leave', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: HeartPulse };
      case 'paid':
        return { label: 'Paid Vacation', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Briefcase };
      case 'remote':
        return { label: 'Remote / WFH', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: Home };
      default:
        return { label: type, color: 'bg-slate-500/10 text-slate-400 border-slate-500/30', icon: CalendarDays };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: XCircle };
      default:
        return { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock };
    }
  };

  // Calendar Day Data generator for August 2026
  const daysInAugust = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Attendance & Leave Tracker</h1>
                <p className="text-sm text-slate-400">Manage time off, WFH schedules, and leave approvals</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Leave Balance Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Casual Leave</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{leaveBalances.casual.remaining}</span>
              <span className="text-sm text-slate-400 font-medium">/ {leaveBalances.casual.total} days remaining</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${leaveBalances.casual.percent}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sick Leave</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{leaveBalances.sick.remaining}</span>
              <span className="text-sm text-slate-400 font-medium">/ {leaveBalances.sick.total} days remaining</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${leaveBalances.sick.percent}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Vacation</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{leaveBalances.paid.remaining}</span>
              <span className="text-sm text-slate-400 font-medium">/ {leaveBalances.paid.total} days remaining</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${leaveBalances.paid.percent}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WFH / Remote Allowance</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{leaveBalances.remote.remaining}</span>
              <span className="text-sm text-slate-400 font-medium">/ {leaveBalances.remote.total} days remaining</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${leaveBalances.remote.percent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Role Alert for Manager Approvals */}
        {isSuperAdminOrHR && pendingCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-200">
                  {pendingCount} Pending Leave Request{pendingCount > 1 ? 's' : ''} Awaiting Review
                </p>
                <p className="text-xs text-amber-400/80">You have management rights to approve or reject leave applications.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFilterStatus('pending');
                setActiveTab('overview');
              }}
              className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-all shrink-0"
            >
              Review Queue
            </button>
          </div>
        )}

        {/* View Tabs & Search Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Leave Requests Overview
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Team Availability
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search request or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses ({leaveRequests.length})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Leave Types</option>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="paid">Paid Vacation</option>
                <option value="remote">Remote / WFH</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Requests Overview */}
        {activeTab === 'overview' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Leave Type</th>
                    <th className="px-6 py-4">Dates & Duration</th>
                    <th className="px-6 py-4">Reason</th>
                    <th className="px-6 py-4">Status</th>
                    {isSuperAdminOrHR && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdminOrHR ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                        No leave requests found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const typeInfo = getTypeBadge(req.type);
                      const statusInfo = getStatusBadge(req.status);
                      const TypeIcon = typeInfo.icon;
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4 font-medium text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 text-indigo-300 flex items-center justify-center font-bold text-xs border border-slate-700">
                                {req.employeeName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-200">{req.employeeName}</div>
                                <div className="text-[10px] text-slate-400">{req.department}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${typeInfo.color}`}>
                              <TypeIcon className="w-3.5 h-3.5" />
                              {typeInfo.label}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-200">
                              {req.startDate} → {req.endDate}
                            </div>
                            <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">
                              {req.daysCount} Day{req.daysCount > 1 ? 's' : ''}
                            </div>
                          </td>

                          <td className="px-6 py-4 max-w-xs">
                            <p className="truncate text-slate-300" title={req.reason}>
                              {req.reason}
                            </p>
                            {req.reviewComment && (
                              <p className="text-[10px] text-amber-400 italic mt-0.5">
                                Note: "{req.reviewComment}" ({req.reviewedBy})
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusInfo.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {statusInfo.label}
                            </span>
                          </td>

                          {isSuperAdminOrHR && (
                            <td className="px-6 py-4 text-right">
                              {req.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(req);
                                      setReviewAction('approved');
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
                                    title="Approve Leave"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(req);
                                      setReviewAction('rejected');
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                                    title="Reject Leave"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 italic">
                                  Reviewed by {req.reviewedBy || 'Admin'}
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Monthly Team Availability Grid */}
        {activeTab === 'calendar' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  August 2026 Team Schedule
                </h2>
                <p className="text-xs text-slate-400">Overview of scheduled team leaves and remote work days</p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-slate-300">Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-slate-300">Approved Leave</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-slate-300">Remote / WFH</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="font-bold text-slate-400 py-2 border-b border-slate-800">
                  {day}
                </div>
              ))}

              {/* August 2026 starts on Saturday (6 padding cells) */}
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-20 bg-slate-950/40 rounded-xl opacity-30"></div>
              ))}

              {daysInAugust.map((dayNum) => {
                const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                const leaveOnDay = leaveRequests.filter(
                  (r) => r.status === 'approved' && dateStr >= r.startDate && dateStr <= r.endDate
                );

                return (
                  <div
                    key={dayNum}
                    className={`h-20 p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${
                      dayNum === 9
                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-sm'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${dayNum === 9 ? 'text-indigo-400' : 'text-slate-300'}`}>
                        {dayNum}
                      </span>
                      {dayNum === 9 && (
                        <span className="px-1 text-[9px] font-extrabold bg-indigo-500 text-white rounded">Today</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {leaveOnDay.map((l) => (
                        <div
                          key={l.id}
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate ${
                            l.type === 'remote' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                          title={`${l.employeeName} (${l.type})`}
                        >
                          {l.employeeName.split(' ')[0]} ({l.type})
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Apply Leave Modal */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Apply for Leave</h3>
                    <p className="text-xs text-slate-400">Submit a leave or WFH application</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Leave Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'casual', label: 'Casual Leave', icon: Plane },
                      { id: 'sick', label: 'Sick Leave', icon: HeartPulse },
                      { id: 'paid', label: 'Paid Vacation', icon: Briefcase },
                      { id: 'remote', label: 'Remote / WFH', icon: Home },
                    ].map((item) => {
                      const Icon = item.icon;
                      const selected = leaveType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setLeaveType(item.id as any)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                            selected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Presets & Custom Date Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-300">Select Dates</label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-400 font-medium">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date().toISOString().split('T')[0];
                          setStartDate(now);
                          setEndDate(now);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-slate-700 transition-all"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                          setStartDate(tomorrow);
                          setEndDate(tomorrow);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-slate-700 transition-all"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date().toISOString().split('T')[0];
                          const threeDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
                          setStartDate(now);
                          setEndDate(threeDays);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-slate-700 transition-all"
                      >
                        3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date().toISOString().split('T')[0];
                          const week = new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0];
                          setStartDate(now);
                          setEndDate(week);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold border border-slate-700 transition-all"
                      >
                        1 Week
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-400 mb-1">Start Date</span>
                      <div
                        onClick={(e) => {
                          const input = e.currentTarget.querySelector('input');
                          if (input && 'showPicker' in input) (input as any).showPicker();
                        }}
                        className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 hover:border-indigo-500/60 focus-within:border-indigo-500 cursor-pointer transition-all"
                      >
                        <Calendar className="w-4 h-4 text-indigo-400 mr-2 shrink-0 pointer-events-none" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] font-medium text-slate-400 mb-1">End Date</span>
                      <div
                        onClick={(e) => {
                          const input = e.currentTarget.querySelector('input');
                          if (input && 'showPicker' in input) (input as any).showPicker();
                        }}
                        className="relative flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 hover:border-indigo-500/60 focus-within:border-indigo-500 cursor-pointer transition-all"
                      >
                        <Calendar className="w-4 h-4 text-indigo-400 mr-2 shrink-0 pointer-events-none" />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reason & Description</label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly state your reason for time off..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manager Review Modal */}
        {selectedRequest && reviewAction && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {reviewAction === 'approved' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  {reviewAction === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h3>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewAction(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400">Employee:</span> <span className="font-semibold text-white">{selectedRequest.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Duration:</span>{' '}
                  <span className="font-semibold text-white">
                    {selectedRequest.startDate} to {selectedRequest.endDate} ({selectedRequest.daysCount} days)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Reason:</span> <span className="text-slate-200">{selectedRequest.reason}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Management Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add feedback or approval notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewAction(null);
                  }}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-lg ${
                    reviewAction === 'approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  }`}
                >
                  Confirm {reviewAction === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <AttendanceContent />
    </ProtectedRoute>
  );
}
