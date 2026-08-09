'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { Navbar } from '../../src/components/Navbar';
import { useAuth } from '../../src/hooks/useAuth';
import {
  Layers,
  Building2,
  Users,
  DollarSign,
  Briefcase,
  UserCheck,
  TrendingUp,
  Plus,
  Search,
  CheckCircle,
  X,
  ChevronRight,
  PieChart,
  FolderGit2,
  AlertCircle,
} from 'lucide-react';

import { useDepartments, DepartmentInfo } from '../../src/hooks/useDepartments';

function DepartmentsContent() {
  const { user } = useAuth();
  const { departments, createDepartment } = useDepartments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<DepartmentInfo | null>(null);

  // New Department Modal
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptLead, setDeptLead] = useState('');
  const [deptBudget, setDeptBudget] = useState('300000');

  const isSuperAdminOrHR = user?.role === 'super_admin' || user?.role === 'hr_manager';

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.leadName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHeadcount = departments.reduce((acc, d) => acc + d.headcount, 0);
  const totalBudget = departments.reduce((acc, d) => acc + d.totalBudget, 0);
  const totalSpent = departments.reduce((acc, d) => acc + d.spentBudget, 0);

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    try {
      await createDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        leadName: deptLead.trim() || user?.name || 'Department Lead',
        totalBudget: Number(deptBudget) || 300000,
      });
      setIsAddDeptOpen(false);
      setDeptName('');
      setDeptCode('');
      setDeptLead('');
    } catch (err: any) {
      console.error('Failed to create department:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Department & Budget Hub</h1>
                <p className="text-sm text-slate-400">Manage department rosters, budget allocations, and team projects</p>
              </div>
            </div>
          </div>

          {isSuperAdminOrHR && (
            <button
              onClick={() => setIsAddDeptOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Department</span>
            </button>
          )}
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Departments</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{departments.length}</span>
              <span className="text-sm text-slate-400 font-medium">Active Divisions</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{totalHeadcount}</span>
              <span className="text-sm text-slate-400 font-medium">Employees</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Annual Operating Budget</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">${(totalBudget / 1000000).toFixed(2)}M</span>
              <span className="text-sm text-slate-400 font-medium">Allocated</span>
            </div>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${Math.round((totalSpent / totalBudget) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Spent</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">${(totalSpent / 1000000).toFixed(2)}M</span>
              <span className="text-sm text-amber-400 font-medium">
                ({Math.round((totalSpent / totalBudget) * 100)}%)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">
              ${((totalBudget - totalSpent) / 1000).toFixed(0)}k Remaining
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search department, code, or lead name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => {
            const pctSpent = Math.round((dept.spentBudget / dept.totalBudget) * 100);

            return (
              <div
                key={dept.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between space-y-5 group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dept.color} flex items-center justify-center font-extrabold text-xs text-white shadow-lg`}>
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {dept.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">Division Code: {dept.code}</span>
                      </div>
                    </div>
                  </div>

                  {/* Department Lead */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                      {dept.leadName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{dept.leadName}</div>
                      <div className="text-[10px] text-slate-400">{dept.leadTitle}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Headcount</span>
                      <span className="text-lg font-bold text-white">{dept.headcount} Team Members</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/60 text-center">
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Open Roles</span>
                      <span className="text-lg font-bold text-emerald-400">+{dept.openPositions} Requisitions</span>
                    </div>
                  </div>

                  {/* Budget Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Budget Spent</span>
                      <span className="font-bold text-white">
                        ${(dept.spentBudget / 1000).toFixed(0)}k / ${(dept.totalBudget / 1000).toFixed(0)}k ({pctSpent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          pctSpent > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${pctSpent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Active Projects */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" /> Active Initiatives ({dept.projects.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.projects.map((proj, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-300 border border-slate-700/60 text-[10px]"
                        >
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDept(dept)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 hover:border-indigo-500 transition-all flex items-center justify-center gap-2"
                >
                  <span>View Roster & Budget Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal 1: Create Department */}
        {isAddDeptOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Create New Department</h3>
                    <p className="text-xs text-slate-400">Set up division title, code, and budget</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddDeptOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDept} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name</label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Data Science & AI"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Division Code</label>
                    <input
                      type="text"
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      placeholder="e.g. AI"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Budget ($ USD)</label>
                    <input
                      type="number"
                      value={deptBudget}
                      onChange={(e) => setDeptBudget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Lead Name</label>
                  <input
                    type="text"
                    value={deptLead}
                    onChange={(e) => setDeptLead(e.target.value)}
                    placeholder="e.g. Dr. Alan Turing"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDeptOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30"
                  >
                    Create Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Department Roster Details */}
        {selectedDept && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedDept.color} flex items-center justify-center font-extrabold text-xs text-white shadow-lg`}>
                    {selectedDept.code}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedDept.name} Department</h3>
                    <p className="text-xs text-slate-400">Head: {selectedDept.leadName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Department Roster</h4>
                <div className="space-y-2">
                  {(selectedDept.members || []).map((m, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.title} • {m.email}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedDept(null)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedRoute>
      <DepartmentsContent />
    </ProtectedRoute>
  );
}
