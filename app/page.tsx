'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import { useAuth } from '../src/hooks/useAuth';
import { useEmployees, useDashboardStats } from '../src/hooks/useEmployees';
import { Navbar } from '../src/components/Navbar';
import {
  UserCheck,
  Building2,
  Users,
  Shield,
  Edit,
  Phone,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FolderGit2,
  PieChart,
  GitFork,
  BarChart3,
  CalendarDays,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const { updateEmployee } = useEmployees();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();

  // Self Edit Modal state for Employee role
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [editError, setEditError] = useState<string | null>(null);

  const handleSelfUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!user?.id) return;

    try {
      await updateEmployee({
        id: user.id,
        data: { phone, address },
      });
      setIsEditModalOpen(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile.');
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'hr_manager':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  const formatRoleName = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'hr_manager':
        return 'HR Manager';
      default:
        return 'Employee';
    }
  };

  const isSuperAdminOrHR = user?.role === 'super_admin' || user?.role === 'hr_manager';
  const totalEmpCount = stats?.totalEmployees || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getRoleBadgeStyle(
                    user?.role
                  )}`}
                >
                  {formatRoleName(user?.role)}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Active Session
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Connected with email <span className="text-slate-200 font-medium">{user?.email}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shrink-0">
              <UserCheck className="w-10 h-10 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Role Rights</div>
                <div className="text-sm font-bold text-white capitalize">
                  {user?.role === 'super_admin'
                    ? 'Full System CRUD'
                    : user?.role === 'hr_manager'
                    ? 'Create & Edit Employees'
                    : 'View & Edit Own Profile'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Feature Hub Launchers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Enterprise Feature Hubs</span>
            </h3>
            <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
              4 Modules Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1: Attendance & Leave */}
            <Link
              href="/attendance"
              className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Attendance & Leave
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Manage time-off applications, WFH schedules, and leave approvals.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <span>Open Tracker</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 2: Performance & Goals */}
            <Link
              href="/performance"
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 transition-all shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Performance & Goals
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Track quarterly OKRs, rating scorecards, and performance reviews.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <span>View Performance</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 3: Departments & Budget */}
            <Link
              href="/departments"
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Department & Budget
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Monitor division rosters, lead assignments, and annual budget.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span>Manage Divisions</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 4: Visual Analytics Suite */}
            <Link
              href="/analytics"
              className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 transition-all shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  Visual Analytics Suite
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Salary band distribution, tenure metrics, and executive CSV reports.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <span>Launch Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Analytics Dashboard Metrics Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Enterprise Dashboard Metrics</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time DB Counts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stat 1: Total Employees */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Employees</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-white">
                {isStatsLoading ? '...' : stats?.totalEmployees ?? 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Total registered organization staff</p>
            </div>

            {/* Stat 2: Active Employees */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Employees</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-400">
                {isStatsLoading ? '...' : stats?.activeEmployees ?? 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Currently active & working staff</p>
            </div>

            {/* Stat 3: Inactive Employees */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inactive Employees</span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-rose-400">
                {isStatsLoading ? '...' : stats?.inactiveEmployees ?? 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Inactive / on-leave accounts</p>
            </div>

            {/* Stat 4: Department Count */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Department Count</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderGit2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-400">
                {isStatsLoading ? '...' : stats?.departmentCount ?? 0}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Unique active departments</p>
            </div>
          </div>
        </div>

        {/* Headcount Breakdown Charts */}
        {((stats?.departmentBreakdown && stats.departmentBreakdown.length > 0) || (stats?.departmentHeadcounts && stats.departmentHeadcounts.length > 0)) && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  <span>Department Headcount Distribution</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time employee breakdown by department</p>
              </div>
              <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
                Live Data
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(stats?.departmentBreakdown || stats?.departmentHeadcounts || []).map((dept: { department: string; count: number }, idx: number) => {
                const percentage = Math.round((dept.count / totalEmpCount) * 100);
                const colors = [
                  'from-indigo-500 to-purple-500',
                  'from-purple-500 to-pink-500',
                  'from-blue-500 to-teal-500',
                  'from-amber-500 to-orange-500',
                  'from-emerald-500 to-teal-500',
                ];
                const bgGradient = colors[idx % colors.length];

                return (
                  <div key={dept.department} className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200">{dept.department}</span>
                      <span className="text-slate-400">
                        {dept.count} Staff ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${bgGradient} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                Edit Profile Contact Info
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSelfUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
