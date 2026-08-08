'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { useHierarchyTree, useDirectReports } from '../../src/hooks/useHierarchy';
import { HierarchyNode, Role } from '../../src/types/auth';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import {
  GitFork,
  Users,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Building2,
  Shield,
} from 'lucide-react';

interface OrgNodeProps {
  node: HierarchyNode;
  selectedManagerId: string | null;
  onSelectManager: (node: HierarchyNode) => void;
  isRoot?: boolean;
}

function OrgTreeNode({ node, selectedManagerId, onSelectManager }: OrgNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasReports = node.directReports && node.directReports.length > 0;
  const isSelected = selectedManagerId === node.id;

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

  return (
    <div className="flex flex-col items-center relative group/node">
      {/* Top Vertical Connector Stem */}
      <div className="w-0.5 h-6 bg-slate-700/80 shrink-0" />

      {/* Node Card */}
      <div
        onClick={() => onSelectManager(node)}
        className={`w-[320px] bg-slate-900 border rounded-2xl p-4 cursor-pointer transition-all duration-200 shadow-xl relative z-10 ${
          isSelected
            ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-850 shadow-indigo-500/20'
            : 'border-slate-800 hover:border-indigo-500/60 hover:bg-slate-850'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {node.profileImage ? (
              <img
                src={node.profileImage}
                alt={node.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0 shadow-md">
                {node.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white truncate leading-tight">{node.name}</div>
              <div className="text-xs text-slate-400 truncate mt-0.5">
                {node.designation || node.position || 'Staff Member'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                {node.employeeId || 'EMP'}
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0 ${getRoleBadgeStyle(
              node.role
            )}`}
          >
            {formatRoleName(node.role)}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium truncate max-w-[140px]">
            {node.department || 'Engineering'}
          </span>
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-indigo-400 font-semibold text-[11px] shrink-0">
            <Users className="w-3 h-3" />
            <span>{node.directReportsCount} Direct Reports</span>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        {hasReports && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500 flex items-center justify-center shadow-lg transition-all z-20"
            title={isExpanded ? 'Collapse sub-tree' : 'Expand sub-tree'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Children Tree Branching */}
      {hasReports && isExpanded && (
        <div className="flex flex-col items-center relative w-full pt-6">
          {/* Bottom Stem down from parent card */}
          <div className="w-0.5 h-6 bg-slate-700/80" />

          {/* Horizontal Sibling Connecting Line */}
          {node.directReports!.length > 1 && (
            <div className="w-[calc(100%-320px)] max-w-full h-0.5 bg-slate-700/80 my-0 relative" />
          )}

          {/* Render Child Tree Nodes Horizontally */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 relative">
            {node.directReports!.map((child) => (
              <OrgTreeNode
                key={child.id}
                node={child}
                selectedManagerId={selectedManagerId}
                onSelectManager={onSelectManager}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HierarchyPageContent() {
  const { data: tree, isLoading, error } = useHierarchyTree();
  const [selectedManager, setSelectedManager] = useState<HierarchyNode | null>(null);

  const { data: directReports, isLoading: isReportsLoading } = useDirectReports(
    selectedManager ? selectedManager.id : null
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
                <GitFork className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight">Organizational Hierarchy</h1>
                <span className="text-xs text-slate-400 font-medium">Reporting Tree & Direct Reports Inspector</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/employees"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Employee Directory</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Interactive Reporting Structure Tree</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click on any manager node to inspect their direct reports and management tree.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Protected against circular reporting loops</span>
          </div>
        </div>

        {/* Tree Container */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 overflow-x-auto min-h-[500px]">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading organizational hierarchy...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400">Failed to load hierarchy tree.</div>
          ) : !tree || tree.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No root managers found.</div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-4 min-w-[700px]">
              {tree.map((rootNode) => (
                <div key={rootNode.id} className="flex flex-col items-center w-full">
                  <OrgTreeNode
                    node={rootNode}
                    selectedManagerId={selectedManager ? selectedManager.id : null}
                    onSelectManager={(node) => setSelectedManager(node)}
                    isRoot
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Manager Direct Reports Inspector */}
        {selectedManager && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Direct Reports for {selectedManager.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {selectedManager.designation || selectedManager.position} • {selectedManager.department}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedManager(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Close Inspector
              </button>
            </div>

            {isReportsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading direct reports...</div>
            ) : !directReports || directReports.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No direct reports assigned to {selectedManager.name}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {directReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3"
                  >
                    {report.profileImage ? (
                      <img
                        src={report.profileImage}
                        alt={report.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                        {report.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="font-semibold text-white text-sm truncate">{report.name}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {report.designation || report.position || 'Staff Member'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {report.employeeId || 'EMP'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HierarchyPage() {
  return (
    <ProtectedRoute>
      <HierarchyPageContent />
    </ProtectedRoute>
  );
}
