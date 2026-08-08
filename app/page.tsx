'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import { useAuth } from '../src/hooks/useAuth';
import { useEmployees, useDashboardStats } from '../src/hooks/useEmployees';
import {
  LogOut,
  UserCheck,
  Building2,
  Users,
  Shield,
  KeyRound,
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
} from 'lucide-react';

function DashboardContent() {
  const { user, logout, isLoggingOut } = useAuth();
  const { updateEmployee, isUpdating } = useEmployees();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();

  // Self Edit Modal state for Employee role
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [editError, setEditError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Employee Portal</h1>
              <span className="text-xs text-slate-400 font-medium">Enterprise Management & Analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/hierarchy"
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <GitFork className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Org Hierarchy</span>
            </Link>

            {isSuperAdminOrHR && (
              <Link
                href="/employees"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Manage Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all shadow-sm disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
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

        {/* Analytics Dashboard Metrics Cards Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Enterprise Dashboard Analytics</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Real-time Metrics</span>
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

          {/* Interactive Visual Department Distribution Chart */}
          {stats?.departmentBreakdown && stats.departmentBreakdown.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>Department Headcount Analytics Chart</span>
                </div>
                <span className="text-xs text-slate-500">Distribution %</span>
              </div>

              <div className="space-y-4">
                {stats.departmentBreakdown.map((item) => {
                  const percentage = Math.round((item.count / totalEmpCount) * 100);
                  return (
                    <div key={item.department} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-200">{item.department}</span>
                        <span className="text-slate-400 font-mono">
                          {item.count} staff ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-indigo-400" />
              <span>Personal Employee Profile</span>
            </h3>

            <button
              onClick={() => {
                setPhone(user?.phone || '');
                setAddress(user?.address || '');
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-all"
            >
              <Edit className="w-4 h-4 text-indigo-400" />
              <span>Edit Contact Info</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-slate-500 font-semibold uppercase">Department</div>
              <div className="text-base font-bold text-slate-100 mt-1">{user?.department || 'Engineering'}</div>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-slate-500 font-semibold uppercase">Position Title</div>
              <div className="text-base font-bold text-slate-100 mt-1">{user?.position || 'Staff Member'}</div>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-slate-500 font-semibold uppercase">Assigned Role</div>
              <div className="text-base font-bold text-slate-100 mt-1 uppercase">{formatRoleName(user?.role)}</div>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
              <div className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone Number
              </div>
              <div className="text-base font-bold text-slate-100 mt-1">{user?.phone || 'Not specified'}</div>
            </div>

            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 sm:col-span-2">
              <div className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Office Address
              </div>
              <div className="text-base font-bold text-slate-100 mt-1">{user?.address || 'Not specified'}</div>
            </div>
          </div>
        </div>

        {/* RBAC Features Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Super Admin Permissions</h4>
            <ul className="text-xs text-slate-400 mt-2 space-y-1.5 list-disc list-inside">
              <li>Full System CRUD access</li>
              <li>Assign Super Admin & HR Manager roles</li>
              <li>Delete employee records</li>
              <li>Assign employee managers</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">HR Manager Permissions</h4>
            <ul className="text-xs text-slate-400 mt-2 space-y-1.5 list-disc list-inside">
              <li>Create & Edit employee profiles</li>
              <li>View complete staff directory</li>
              <li>Cannot delete employees</li>
              <li>Cannot assign Super Admin role</li>
            </ul>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Employee Permissions</h4>
            <ul className="text-xs text-slate-400 mt-2 space-y-1.5 list-disc list-inside">
              <li>View personal profile & department info</li>
              <li>Edit own contact info (phone & address)</li>
              <li>Cannot view full employee directory</li>
              <li>Cannot alter role, salary, or department</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Self Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">Edit Contact Information</h3>
            <p className="text-xs text-slate-400 mb-6">
              Employees can update personal phone numbers and office addresses.
            </p>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSelfUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {isUpdating && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
