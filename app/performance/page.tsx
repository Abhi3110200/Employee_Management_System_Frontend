'use client';

import React, { useState, useMemo } from 'react';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { Navbar } from '../../src/components/Navbar';
import { useAuth } from '../../src/hooks/useAuth';
import {
  Award,
  Target,
  TrendingUp,
  Star,
  Plus,
  CheckCircle,
  Clock,
  User,
  Search,
  Filter,
  BarChart2,
  Calendar,
  Zap,
  Edit,
  X,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  title: string;
  category: 'OKR' | 'Project' | 'Skill' | 'Leadership';
  dueDate: string;
  progress: number; // 0 to 100
  status: 'in_progress' | 'completed' | 'behind';
}

export interface EmployeeReview {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  rating: number; // 1.0 to 5.0
  quarter: string; // e.g. "Q3 2026"
  reviewStatus: 'completed' | 'pending';
  strengths: string;
  growthAreas: string;
  lastUpdated: string;
}

const INITIAL_GOALS: PerformanceGoal[] = [
  {
    id: 'g1',
    employeeId: 'emp1',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    title: 'Migrate Microservices to Kubernetes Cluster',
    category: 'Project',
    dueDate: '2026-09-30',
    progress: 85,
    status: 'in_progress',
  },
  {
    id: 'g2',
    employeeId: 'emp2',
    employeeName: 'David Chen',
    department: 'Product',
    title: 'Launch Mobile App V2 Design System',
    category: 'OKR',
    dueDate: '2026-08-31',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'g3',
    employeeId: 'emp3',
    employeeName: 'Emily Watson',
    department: 'Marketing',
    title: 'Increase Q3 Organic Inbound Leads by 35%',
    category: 'OKR',
    dueDate: '2026-09-15',
    progress: 60,
    status: 'in_progress',
  },
  {
    id: 'g4',
    employeeId: 'emp4',
    employeeName: 'Michael Chang',
    department: 'Sales',
    title: 'Close $250k Enterprise SaaS Subscriptions',
    category: 'OKR',
    dueDate: '2026-08-15',
    progress: 40,
    status: 'behind',
  },
  {
    id: 'g5',
    employeeId: 'emp5',
    employeeName: 'Jessica Taylor',
    department: 'HR',
    title: 'Implement Automated Employee Onboarding Portal',
    category: 'Leadership',
    dueDate: '2026-10-01',
    progress: 90,
    status: 'in_progress',
  },
];

const INITIAL_REVIEWS: EmployeeReview[] = [
  {
    id: 'r1',
    employeeId: 'emp1',
    employeeName: 'Sarah Jenkins',
    designation: 'Senior Full Stack Lead',
    department: 'Engineering',
    rating: 4.9,
    quarter: 'Q3 2026',
    reviewStatus: 'completed',
    strengths: 'Exceptional architectural foresight and mentorship',
    growthAreas: 'Delegation of minor maintenance tickets',
    lastUpdated: '2026-08-01',
  },
  {
    id: 'r2',
    employeeId: 'emp2',
    employeeName: 'David Chen',
    designation: 'Principal Product Manager',
    department: 'Product',
    rating: 4.8,
    quarter: 'Q3 2026',
    reviewStatus: 'completed',
    strengths: 'Outstanding user experience intuition and roadmap execution',
    growthAreas: 'Cross-departmental budget forecasting',
    lastUpdated: '2026-08-03',
  },
  {
    id: 'r3',
    employeeId: 'emp3',
    employeeName: 'Emily Watson',
    designation: 'Marketing Director',
    department: 'Marketing',
    rating: 4.6,
    quarter: 'Q3 2026',
    reviewStatus: 'completed',
    strengths: 'Creative brand positioning and multi-channel strategy',
    growthAreas: 'Data analytics deep dives',
    lastUpdated: '2026-08-04',
  },
  {
    id: 'r4',
    employeeId: 'emp4',
    employeeName: 'Michael Chang',
    designation: 'Enterprise Account Executive',
    department: 'Sales',
    rating: 4.2,
    quarter: 'Q3 2026',
    reviewStatus: 'pending',
    strengths: 'Strong client negotiation and relationship management',
    growthAreas: 'CRM pipeline documentation speed',
    lastUpdated: '2026-07-20',
  },
  {
    id: 'r5',
    employeeId: 'emp5',
    employeeName: 'Jessica Taylor',
    designation: 'HR Specialist',
    department: 'HR',
    rating: 4.7,
    quarter: 'Q3 2026',
    reviewStatus: 'completed',
    strengths: 'Top-tier employee relations and policy enforcement',
    growthAreas: 'HR Tech automation scripting',
    lastUpdated: '2026-08-06',
  },
];

function PerformanceContent() {
  const { user } = useAuth();
  const isSuperAdminOrHR = user?.role === 'super_admin' || user?.role === 'hr_manager';

  const [goals, setGoals] = useState<PerformanceGoal[]>(INITIAL_GOALS);
  const [reviews, setReviews] = useState<EmployeeReview[]>(INITIAL_REVIEWS);
  const [activeTab, setActiveTab] = useState<'goals' | 'reviews'>('goals');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal state for Goal Creation
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAssignee, setNewGoalAssignee] = useState('Sarah Jenkins');
  const [newGoalDept, setNewGoalDept] = useState('Engineering');
  const [newGoalCategory, setNewGoalCategory] = useState<'OKR' | 'Project' | 'Skill' | 'Leadership'>('OKR');
  const [newGoalDueDate, setNewGoalDueDate] = useState('');
  const [newGoalProgress, setNewGoalProgress] = useState(25);

  // Modal state for Performance Review Evaluation (HR/Admin)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewEmp, setSelectedReviewEmp] = useState<EmployeeReview | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(4.5);
  const [strengthsInput, setStrengthsInput] = useState('');
  const [growthInput, setGrowthInput] = useState('');

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const matchesSearch =
        g.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'all' || g.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [goals, searchQuery, departmentFilter]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.designation.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'all' || r.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [reviews, searchQuery, departmentFilter]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const goal: PerformanceGoal = {
      id: `g-${Date.now()}`,
      employeeId: `emp-${Date.now()}`,
      employeeName: newGoalAssignee,
      department: newGoalDept,
      title: newGoalTitle,
      category: newGoalCategory,
      dueDate: newGoalDueDate || '2026-09-30',
      progress: Number(newGoalProgress),
      status: Number(newGoalProgress) === 100 ? 'completed' : 'in_progress',
    };

    setGoals([goal, ...goals]);
    setIsGoalModalOpen(false);
    setNewGoalTitle('');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewEmp) return;

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === selectedReviewEmp.id) {
          return {
            ...r,
            rating: Number(ratingScore),
            reviewStatus: 'completed',
            strengths: strengthsInput || r.strengths,
            growthAreas: growthInput || r.growthAreas,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return r;
      })
    );

    setIsReviewModalOpen(false);
    setSelectedReviewEmp(null);
  };

  const handleProgressUpdate = (goalId: string, delta: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newProg = Math.min(100, Math.max(0, g.progress + delta));
          return {
            ...g,
            progress: newProg,
            status: newProg === 100 ? 'completed' : newProg < 40 ? 'behind' : 'in_progress',
          };
        }
        return g;
      })
    );
  };

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;
  const goalCompletionRate = Math.round((completedGoalsCount / goals.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Performance & Goals Hub</h1>
                <p className="text-sm text-slate-400">Track quarterly OKRs, KPI milestones, and performance reviews</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Goal</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Performance Score</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{avgRating}</span>
              <span className="text-sm text-slate-400 font-medium">/ 5.0 score</span>
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +0.3 vs last quarter
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Goal Completion Rate</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{goalCompletionRate}%</span>
              <span className="text-sm text-slate-400 font-medium">({completedGoalsCount}/{goals.length} goals)</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${goalCompletionRate}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reviews Completed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {reviews.filter((r) => r.reviewStatus === 'completed').length}
              </span>
              <span className="text-sm text-slate-400 font-medium">/ {reviews.length} completed</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">Q3 2026 Evaluation Cycle</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Performers</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {reviews.filter((r) => r.rating >= 4.7).length}
              </span>
              <span className="text-sm text-purple-400 font-medium">High Rating (&gt;=4.7)</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">Eligible for promotion</p>
          </div>
        </div>

        {/* View Tabs & Search Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'goals' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Goal & OKR Progress ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reviews' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Employee Ratings & Reviews ({reviews.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Goal Progress */}
        {activeTab === 'goals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                      {goal.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2 leading-snug">{goal.title}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shrink-0 ${
                      goal.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : goal.status === 'behind'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-b border-slate-800/80 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                      {goal.employeeName.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-200">{goal.employeeName}</span>
                    <span className="text-[10px] text-slate-500">({goal.department})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Due: {goal.dueDate}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">Completion Progress</span>
                    <span className="font-extrabold text-amber-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        goal.progress === 100
                          ? 'bg-emerald-500'
                          : goal.progress < 40
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-amber-500 to-indigo-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Progress Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <span className="text-[10px] text-slate-500 mr-auto">Adjust Progress:</span>
                  <button
                    onClick={() => handleProgressUpdate(goal.id, -10)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                  >
                    -10%
                  </button>
                  <button
                    onClick={() => handleProgressUpdate(goal.id, 10)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                  >
                    +10%
                  </button>
                  <button
                    onClick={() => handleProgressUpdate(goal.id, 100 - goal.progress)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold"
                  >
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Ratings & Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department & Title</th>
                    <th className="px-6 py-4">Q3 Rating Score</th>
                    <th className="px-6 py-4">Key Strengths</th>
                    <th className="px-6 py-4">Growth Focus</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                            {rev.employeeName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100">{rev.employeeName}</div>
                            <div className="text-[10px] text-slate-400">{rev.quarter}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">{rev.designation}</div>
                        <div className="text-[10px] text-indigo-400 font-semibold">{rev.department}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-400">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span className="ml-1 text-sm font-extrabold text-white">{rev.rating}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">/ 5.0</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="truncate text-slate-300" title={rev.strengths}>
                          {rev.strengths}
                        </p>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <p className="truncate text-slate-400" title={rev.growthAreas}>
                          {rev.growthAreas}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isSuperAdminOrHR ? (
                          <button
                            onClick={() => {
                              setSelectedReviewEmp(rev);
                              setRatingScore(rev.rating);
                              setStrengthsInput(rev.strengths);
                              setGrowthInput(rev.growthAreas);
                              setIsReviewModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Evaluate</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal 1: Assign Goal */}
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Assign New Performance Goal</h3>
                    <p className="text-xs text-slate-400">Define OKR target or project milestone</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGoalModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="e.g. Implement OAuth2 Refresh Interceptor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Employee</label>
                    <select
                      value={newGoalAssignee}
                      onChange={(e) => setNewGoalAssignee(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Sarah Jenkins">Sarah Jenkins</option>
                      <option value="David Chen">David Chen</option>
                      <option value="Emily Watson">Emily Watson</option>
                      <option value="Michael Chang">Michael Chang</option>
                      <option value="Jessica Taylor">Jessica Taylor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                    <select
                      value={newGoalDept}
                      onChange={(e) => setNewGoalDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={newGoalCategory}
                      onChange={(e) => setNewGoalCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="OKR">Quarterly OKR</option>
                      <option value="Project">Project Milestone</option>
                      <option value="Skill">Skill Upgrade</option>
                      <option value="Leadership">Leadership & Management</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Target Due Date</label>
                    <input
                      type="date"
                      value={newGoalDueDate}
                      onChange={(e) => setNewGoalDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Progress ({newGoalProgress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newGoalProgress}
                    onChange={(e) => setNewGoalProgress(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsGoalModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20"
                  >
                    Assign Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Performance Review Evaluation */}
        {isReviewModalOpen && selectedReviewEmp && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Evaluate Employee Performance</h3>
                    <p className="text-xs text-slate-400">{selectedReviewEmp.employeeName} ({selectedReviewEmp.designation})</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReview} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Overall Rating Score</label>
                    <span className="text-sm font-extrabold text-amber-400">{ratingScore} / 5.0</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={ratingScore}
                    onChange={(e) => setRatingScore(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Key Strengths & Achievements</label>
                  <textarea
                    rows={3}
                    value={strengthsInput}
                    onChange={(e) => setStrengthsInput(e.target.value)}
                    placeholder="Highlight technical skill, communication, leadership..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Growth & Improvement Areas</label>
                  <textarea
                    rows={3}
                    value={growthInput}
                    onChange={(e) => setGrowthInput(e.target.value)}
                    placeholder="Feedback for further professional development..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20"
                  >
                    Save Review Evaluation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute>
      <PerformanceContent />
    </ProtectedRoute>
  );
}
