'use client';

import React, { useState, useMemo } from 'react';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { Navbar } from '../../src/components/Navbar';
import { useAuth } from '../../src/hooks/useAuth';
import { useEmployees } from '../../src/hooks/useEmployees';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  DollarSign,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  Award,
  ArrowUpRight,
  Briefcase,
  Layers,
} from 'lucide-react';

import { useAnalytics } from '../../src/hooks/useAnalytics';

export function AnalyticsContent() {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { analytics, isLoading: isAnalyticsLoading } = useAnalytics();

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-Q3');

  // Interactive Salary Bands (Fallback to dynamic analytics metrics)
  const salaryBands = analytics?.salaryBands || [
    { label: '$30k - $60k', count: 6, percentage: 12, color: 'bg-indigo-500' },
    { label: '$60k - $90k', count: 14, percentage: 28, color: 'bg-purple-500' },
    { label: '$90k - $120k', count: 18, percentage: 36, color: 'bg-emerald-500' },
    { label: '$120k - $150k', count: 8, percentage: 16, color: 'bg-amber-500' },
    { label: '$150k+', count: 4, percentage: 8, color: 'bg-rose-500' },
  ];

  // Department Compensation breakdown
  const departmentPayMetrics = analytics?.departmentPayMetrics || [
    { name: 'Engineering', avgSalary: 128000, minSalary: 85000, maxSalary: 185000, headcount: 18 },
    { name: 'Product', avgSalary: 115000, minSalary: 78000, maxSalary: 165000, headcount: 10 },
    { name: 'Sales', avgSalary: 98000, minSalary: 55000, maxSalary: 175000, headcount: 14 },
    { name: 'Marketing', avgSalary: 92000, minSalary: 52000, maxSalary: 140000, headcount: 8 },
    { name: 'HR & Ops', avgSalary: 84000, minSalary: 48000, maxSalary: 125000, headcount: 13 },
  ];

  // Retention & Tenure Metrics
  const tenureMetrics = [
    { bracket: '< 1 Year (New Hires)', count: 12, pct: 24, bg: 'bg-blue-500' },
    { bracket: '1 - 3 Years', count: 22, pct: 44, bg: 'bg-emerald-500' },
    { bracket: '3 - 5 Years', count: 11, pct: 22, bg: 'bg-purple-500' },
    { bracket: '5+ Years (Veterans)', count: 5, pct: 10, bg: 'bg-amber-500' },
  ];

  // Export Analytics CSV Handler
  const handleExportCSV = () => {
    const csvRows = [
      ['Department', 'Headcount', 'Average Salary ($)', 'Min Salary ($)', 'Max Salary ($)'],
      ...departmentPayMetrics.map((d) => [d.name, d.headcount, d.avgSalary, d.minSalary, d.maxSalary]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enterprise_Analytics_Report_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Advanced Visual Analytics Suite</h1>
                <p className="text-sm text-slate-400">Compensation breakdown, tenure distribution, and executive reporting</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Executive CSV Report</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Report Scope:</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="2026-Q3">Q3 2026 (Current)</option>
              <option value="2026-Q2">Q2 2026</option>
              <option value="2026-Q1">Q1 2026</option>
              <option value="2025-FY">Full Year 2025</option>
            </select>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Divisions</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>

        {/* Top Analytics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Salary</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">$106,200</span>
              <span className="text-xs text-emerald-400 font-bold">+4.2% YoY</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">Across all 50 employees</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Median Tenure</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">2.8 Years</span>
              <span className="text-xs text-indigo-400 font-bold">Stable</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">Retention Rate: 96.4%</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quarterly Hiring</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">+8 Hires</span>
              <span className="text-xs text-purple-400 font-bold">Net Growth</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">13 Open Requisitions</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender Diversity</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">48% / 52%</span>
              <span className="text-xs text-amber-400 font-bold">Balanced</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">Female / Male Representation</p>
          </div>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Salary Distribution Histogram */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  Salary Distribution Histogram
                </h3>
                <p className="text-xs text-slate-400">Employee count grouped into salary brackets</p>
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-full">
                50 Employees Total
              </span>
            </div>

            <div className="space-y-4">
              {salaryBands.map((band, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{band.label}</span>
                    <span className="font-extrabold text-white">
                      {band.count} employees ({band.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/80 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${band.color}`}
                      style={{ width: `${band.percentage * 2.5}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Tenure & Retention Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Employee Tenure Breakdown
                </h3>
                <p className="text-xs text-slate-400">Distribution of employee service longevity</p>
              </div>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-full">
                Retention 96.4%
              </span>
            </div>

            <div className="space-y-4">
              {tenureMetrics.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{item.bracket}</span>
                    <span className="font-extrabold text-white">
                      {item.count} staff ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/80 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.bg}`}
                      style={{ width: `${item.pct * 2}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Department Pay Comparison Table & Visualizer */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                Department Compensation & Pay Equity Matrix
              </h3>
              <p className="text-xs text-slate-400">Comparing average, minimum, and maximum salaries by department</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Headcount</th>
                  <th className="px-6 py-4">Average Salary</th>
                  <th className="px-6 py-4">Salary Range (Min → Max)</th>
                  <th className="px-6 py-4">Relative Pay Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {departmentPayMetrics.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      {dept.name}
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-200">{dept.headcount} Staff</td>

                    <td className="px-6 py-4 font-extrabold text-emerald-400">${dept.avgSalary.toLocaleString()} / yr</td>

                    <td className="px-6 py-4 font-medium text-slate-300">
                      ${dept.minSalary.toLocaleString()} → ${dept.maxSalary.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="w-48 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.round((dept.avgSalary / 185000) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
