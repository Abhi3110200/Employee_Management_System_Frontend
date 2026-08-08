'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { useAuth } from '../../src/hooks/useAuth';
import { useEmployees } from '../../src/hooks/useEmployees';
import { User, Role, UserStatus } from '../../src/types/auth';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Trash2,
  Edit,
  ArrowLeft,
  AlertCircle,
  X,
  Lock,
  ArrowUpDown,
  Filter,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';

function EmployeeDirectoryContent() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'joiningDate' | 'createdAt' | 'salary'>('joiningDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showDeleted, setShowDeleted] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');

  // Delete Modal & Toast State
  const [deletingEmployee, setDeletingEmployee] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Form State for all 12 Employee Fields
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    salary: 85000,
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active' as UserStatus,
    role: 'employee' as Role,
    manager: '',
    profileImage: '',
    address: '',
  });

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isHRManager = currentUser?.role === 'hr_manager';
  const isEmployeeRole = currentUser?.role === 'employee';

  const {
    employees,
    pagination,
    isLoading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    restoreEmployee,
    exportCSV,
    importCSV,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting,
  } = useEmployees({
    search: searchTerm,
    department: departmentFilter,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
    page,
    limit,
    showDeleted,
  });

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      email: '',
      password: '',
      phone: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      salary: 75000,
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'active',
      role: 'employee',
      manager: '',
      profileImage: '',
      address: '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (employee: User) => {
    setEditingEmployee(employee);
    const mgrId =
      typeof employee.manager === 'object' && employee.manager
        ? employee.manager.id || employee.manager._id || ''
        : String(employee.manager || '');

    setFormData({
      employeeId: employee.employeeId || '',
      name: employee.name,
      email: employee.email,
      password: '',
      phone: employee.phone || '',
      department: employee.department || 'Engineering',
      designation: employee.designation || employee.position || 'Staff Member',
      salary: employee.salary || 0,
      joiningDate: employee.joiningDate
        ? new Date(employee.joiningDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      status: employee.status || 'active',
      role: employee.role,
      manager: mgrId,
      profileImage: employee.profileImage || '',
      address: employee.address || '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    // Client-side validations
    if (!formData.name || !formData.name.trim()) {
      setModalError('Full Name is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      setModalError('Please enter a valid email address format (e.g. name@company.com)');
      return;
    }

    if (formData.phone && formData.phone.trim() !== '') {
      const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setModalError('Please enter a valid phone number (e.g. +1 555-012-3456)');
        return;
      }
    }

    if (formData.salary < 0 || isNaN(Number(formData.salary))) {
      setModalError('Annual salary must be a non-negative number');
      return;
    }

    try {
      const cleanManager = formData.manager && formData.manager.trim() !== '' ? formData.manager.trim() : undefined;

      if (editingEmployee) {
        // Edit Employee
        const empId = editingEmployee.id || editingEmployee._id;
        if (!empId) {
          setModalError('Invalid employee ID');
          return;
        }

        const updatePayload: Partial<User> = {
          employeeId: formData.employeeId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          department: formData.department,
          designation: formData.designation,
          position: formData.designation,
          salary: Number(formData.salary),
          joiningDate: formData.joiningDate,
          status: formData.status,
          role: formData.role,
          manager: cleanManager as any,
          profileImage: formData.profileImage,
          address: formData.address,
        };

        await updateEmployee({ id: String(empId), data: updatePayload });
        showToast(`Employee '${formData.name}' updated successfully.`);
      } else {
        // Create Employee
        if (!formData.password || formData.password.length < 6) {
          setModalError('Password is required and must be at least 6 characters');
          return;
        }

        await createEmployee({
          employeeId: formData.employeeId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          department: formData.department,
          designation: formData.designation,
          position: formData.designation,
          salary: Number(formData.salary),
          joiningDate: formData.joiningDate,
          status: formData.status,
          role: formData.role,
          manager: cleanManager as any,
          profileImage: formData.profileImage,
          address: formData.address,
        });
        showToast(`Employee '${formData.name}' created successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to save employee. Check inputs & permissions.');
    }
  };

  const triggerDeleteModal = (id: string, name: string) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admins can delete employee records.', 'error');
      return;
    }
    setDeletingEmployee({ id, name });
    setDeleteError(null);
  };

  const confirmDeleteSubmit = async () => {
    if (!deletingEmployee) return;
    try {
      await deleteEmployee(deletingEmployee.id);
      showToast(`Employee '${deletingEmployee.name}' was soft-deleted successfully.`);
      setDeletingEmployee(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to soft-delete employee record.');
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (!isSuperAdmin) return;
    try {
      await restoreEmployee(id);
      showToast(`Employee '${name}' restored successfully.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to restore employee.', 'error');
    }
  };

  const handleCSVImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      await importCSV(rows);
      setIsImportModalOpen(false);
      setImportJsonText('');
      showToast('CSV employee records imported successfully.');
    } catch (err) {
      showToast('Invalid JSON format. Expected JSON array of objects.', 'error');
    }
  };

  const getRoleBadgeStyle = (role: Role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'hr_manager':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  const formatRoleName = (role: Role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'hr_manager':
        return 'HR Manager';
      default:
        return 'Employee';
    }
  };

  if (isEmployeeRole) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Directory Access Restricted</h2>
          <p className="text-slate-400 text-sm">
            Standard employee accounts are only authorized to view and edit their own profile.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Profile</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight">Employee Directory</h1>
                <span className="text-xs text-slate-400 font-medium">Enterprise CRUD, CSV & Pagination Engine</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
              title="Export employees as CSV file"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {(isSuperAdmin || isHRManager) && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                title="Import employees CSV payload"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Import CSV</span>
              </button>
            )}

            {(isSuperAdmin || isHRManager) && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search, Filter & Sorting Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Name, Email, or Employee ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase mr-1">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filter:</span>
              </div>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                className="py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Executive">Executive</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as Role | '');
                  setPage(1);
                }}
                className="py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="hr_manager">HR Manager</option>
                <option value="employee">Employee</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as UserStatus | '');
                  setPage(1);
                }}
                className="py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Show Soft Deleted Toggle for Super Admin */}
              {isSuperAdmin && (
                <button
                  onClick={() => setShowDeleted(!showDeleted)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    showDeleted
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {showDeleted ? 'Showing Soft Deleted' : 'Active Only'}
                </button>
              )}
            </div>
          </div>

          {/* Sorting Row */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold uppercase flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" /> Sort By:
              </span>

              <button
                onClick={() => setSortBy('joiningDate')}
                className={`px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  sortBy === 'joiningDate'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Joining Date
              </button>

              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  sortBy === 'name'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Name
              </button>

              <button
                onClick={() => setSortBy('salary')}
                className={`px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  sortBy === 'salary'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Salary
              </button>

              <button
                onClick={() => setSortBy('createdAt')}
                className={`px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  sortBy === 'createdAt'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Created Date
              </button>
            </div>

            {/* Sort Direction Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold uppercase">Order:</span>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold transition-all flex items-center gap-1.5"
              >
                <span>{sortOrder === 'asc' ? 'Ascending (A-Z / Oldest)' : 'Descending (Z-A / Newest)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading employees directory...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 bg-rose-950/20 border-b border-slate-800 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No employee records match your search and filter parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse align-middle">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-5 whitespace-nowrap min-w-[100px]">ID</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[220px]">Employee</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[160px]">Designation</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[140px]">Department</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[120px]">Joining Date</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[100px]">Salary</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[100px]">Status</th>
                    <th className="py-4 px-5 whitespace-nowrap min-w-[130px]">Role</th>
                    <th className="py-4 px-5 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {employees.map((emp) => {
                    const rawId = String(emp.id || emp._id || '');
                    const fallbackCode = rawId ? `EMP-${rawId.slice(-4).toUpperCase()}` : 'EMP-1000';

                    return (
                      <tr key={rawId || emp.email} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5 font-mono text-xs text-indigo-400 font-bold whitespace-nowrap min-w-[100px]">
                          {emp.employeeId || fallbackCode}
                        </td>

                        <td className="py-4 px-5 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            {emp.profileImage ? (
                              <img
                                src={emp.profileImage}
                                alt={emp.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                                {emp.name.charAt(0)}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <div className="font-semibold text-white truncate">{emp.name}</div>
                              <div className="text-xs text-slate-400 truncate">{emp.email}</div>
                              {emp.phone && <div className="text-[11px] text-slate-500 truncate">{emp.phone}</div>}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-slate-300 font-medium whitespace-nowrap min-w-[160px]">
                          {emp.designation || emp.position || 'Staff Member'}
                        </td>

                        <td className="py-4 px-5 text-slate-300 font-medium whitespace-nowrap min-w-[140px]">
                          {emp.department || 'N/A'}
                        </td>

                        <td className="py-4 px-5 text-slate-400 text-xs font-mono whitespace-nowrap min-w-[120px]">
                          {emp.joiningDate
                            ? new Date(emp.joiningDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>

                        <td className="py-4 px-5 text-slate-300 font-mono whitespace-nowrap min-w-[100px]">
                          ${emp.salary ? emp.salary.toLocaleString() : '0'}
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap min-w-[100px]">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              emp.status === 'inactive'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                emp.status === 'inactive' ? 'bg-rose-400' : 'bg-emerald-400'
                              }`}
                            />
                            <span className="capitalize">{emp.status || 'active'}</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 whitespace-nowrap min-w-[130px]">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-bold uppercase rounded-full border ${getRoleBadgeStyle(
                              emp.role
                            )}`}
                          >
                            {formatRoleName(emp.role)}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap min-w-[100px] space-x-2">
                          {!showDeleted ? (
                            <>
                              <button
                                onClick={() => openEditModal(emp)}
                                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
                                title="Edit Employee"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {isSuperAdmin ? (
                                <button
                                  onClick={() => triggerDeleteModal(rawId, emp.name)}
                                  disabled={isDeleting}
                                  className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/50 transition-all"
                                  title="Soft Delete Employee (Super Admin Only)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="p-2 rounded-lg bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                                  title="Delete restricted to Super Admin"
                                >
                                  <Trash2 className="w-4 h-4 opacity-50" />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => handleRestore(rawId, emp.name)}
                              className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-200 border border-emerald-800/50 transition-all flex items-center gap-1 text-xs font-semibold"
                              title="Restore Soft-Deleted Employee"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>Restore</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Navigation Bar */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="py-1 px-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium focus:outline-none"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <span>Total: <strong className="text-slate-200">{pagination.totalResults}</strong> records</span>
            </div>

            <div className="flex items-center gap-3">
              <span>
                Page <strong className="text-white">{pagination.currentPage}</strong> of{' '}
                <strong className="text-white">{pagination.totalPages}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Create / Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {editingEmployee ? 'Edit Employee Record' : 'Create New Employee'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Complete employee details for enterprise directory management.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="EMP-1001"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {editingEmployee ? 'Password (leave empty to keep unchanged)' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required={!editingEmployee}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Executive">Executive</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Senior Software Engineer"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Annual Salary ($)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Role Permission</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr_manager">HR Manager</option>
                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reporting Manager</label>
                  <select
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">-- Select Manager --</option>
                    {employees
                      .filter((e) => e.role === 'super_admin' || e.role === 'hr_manager')
                      .filter((e) => editingEmployee ? (e.id || e._id) !== (editingEmployee.id || editingEmployee._id) : true)
                      .map((mgr) => {
                        const mgrId = String(mgr.id || mgr._id || '');
                        return (
                          <option key={mgrId} value={mgrId}>
                            {mgr.name} ({mgr.position || mgr.designation || mgr.role})
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Profile Image URL</label>
                  <input
                    type="url"
                    value={formData.profileImage}
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Office Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Tech Blvd, City, State"
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-900 pt-4 pb-2 border-t border-slate-800 flex justify-end gap-3 mt-6 z-20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {(isCreating || isUpdating) && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{editingEmployee ? 'Save Changes' : 'Create Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Import Bulk CSV Records</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Paste a JSON array of employee objects parsed from CSV rows.
            </p>

            <form onSubmit={handleCSVImportSubmit} className="space-y-4">
              <textarea
                rows={6}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[{"name": "Jane Smith", "email": "jane.smith@corp.com", "department": "Marketing", "salary": 80000}]'
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  {isImporting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>Import Records</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Soft Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setDeletingEmployee(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Soft-Delete Employee</h3>
                <span className="text-xs text-rose-400 font-semibold">Action requires confirmation</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to soft-delete employee <strong className="text-white font-semibold">{deletingEmployee.name}</strong>? The record will be hidden from active lists and can be restored anytime by a Super Admin.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSubmit}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                {isDeleting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>Confirm Soft Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/40'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}

export default function EmployeeDirectoryPage() {
  return (
    <ProtectedRoute>
      <EmployeeDirectoryContent />
    </ProtectedRoute>
  );
}
