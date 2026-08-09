'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import {
  Building2,
  Users,
  GitFork,
  CalendarDays,
  Award,
  Layers,
  BarChart3,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ChevronRight,
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  Sparkles,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'task_assigned' | 'leave_update' | 'attendance_alert' | 'performance_review';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkHref: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'task_assigned',
    title: 'New Goal Assigned',
    message: 'Super Admin assigned you "Migrate Microservices to Kubernetes Cluster". Target due: Sep 30.',
    timestamp: '10m ago',
    isRead: false,
    linkHref: '/performance',
  },
  {
    id: 'n2',
    type: 'leave_update',
    title: 'Leave Application Approved',
    message: 'HR Manager approved your 3-day Casual Leave request (Aug 12 – Aug 14).',
    timestamp: '1h ago',
    isRead: false,
    linkHref: '/attendance',
  },
  {
    id: 'n3',
    type: 'attendance_alert',
    title: 'Attendance Action Required',
    message: 'You have 1 pending WFH request awaiting manager approval.',
    timestamp: '3h ago',
    isRead: false,
    linkHref: '/attendance',
  },
  {
    id: 'n4',
    type: 'performance_review',
    title: 'Q3 Performance Score Recorded',
    message: 'Your Q3 2026 performance rating score of 4.9 / 5.0 has been finalized.',
    timestamp: '1d ago',
    isRead: true,
    linkHref: '/performance',
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const isSuperAdminOrHR = user?.role === 'super_admin' || user?.role === 'hr_manager';

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.isRead;
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setNotifDropdownOpen(false);
    router.push(notif.linkHref);
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task_assigned':
        return <Target className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'leave_update':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'attendance_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'performance_review':
        return <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />;
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard, roleRestricted: false },
    { label: 'Employees', href: '/employees', icon: Users, roleRestricted: true },
    { label: 'Hierarchy', href: '/hierarchy', icon: GitFork, roleRestricted: false },
    { label: 'Attendance', href: '/attendance', icon: CalendarDays, roleRestricted: false },
    { label: 'Performance', href: '/performance', icon: Award, roleRestricted: false },
    { label: 'Departments', href: '/departments', icon: Layers, roleRestricted: false },
    { label: 'Analytics', href: '/analytics', icon: BarChart3, roleRestricted: false },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const formatRole = (role?: string) => {
    if (role === 'super_admin') return 'Super Admin';
    if (role === 'hr_manager') return 'HR Manager';
    return 'Employee';
  };

  const getRoleBadgeStyle = (role?: string) => {
    if (role === 'super_admin') return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (role === 'hr_manager') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-all duration-200">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base text-white tracking-tight leading-tight">
                    EmpManager
                  </h1>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Pro
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium block -mt-0.5">Enterprise Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.roleRestricted && !isSuperAdminOrHR) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Compact Navbar Links for medium desktop screens */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1">
            {navItems.slice(0, 5).map((item) => {
              if (item.roleRestricted && !isSuperAdminOrHR) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className={`p-2.5 rounded-xl border transition-all duration-200 relative flex items-center justify-center ${
                  notifDropdownOpen
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Notifications"
                aria-label="Open notifications drawer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {unreadCount} Unread
                        </span>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/80 bg-slate-900/40 text-xs">
                    <button
                      onClick={() => setNotifFilter('all')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        notifFilter === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotifFilter('unread')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                        notifFilter === 'unread'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        No notifications found.
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 relative group ${
                            !notif.isRead ? 'bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0 mt-0.5">
                            {getNotifIcon(notif.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                              <span className="text-[10px] text-slate-500 shrink-0">{notif.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                              {notif.message}
                            </p>
                          </div>

                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 self-center"></div>
                          )}

                          <button
                            onClick={(e) => handleDeleteNotification(e, notif.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                            title="Dismiss"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center">
                    <button
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Close Drawer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[110px]">
                    {user.name}
                  </span>
                  <span className={`text-[10px] font-medium border px-1 rounded mt-0.5 max-w-fit ${getRoleBadgeStyle(user.role)}`}>
                    {formatRole(user.role)}
                  </span>
                </div>
              </div>
            )}

            <ThemeToggle />

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-semibold border border-rose-500/30 transition-all disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2">
          {user && (
            <div className="flex items-center gap-3 p-3 mb-3 rounded-2xl bg-slate-800/80 border border-slate-700/70">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
                <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded max-w-fit mt-1 ${getRoleBadgeStyle(user.role)}`}>
                  {formatRole(user.role)}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              if (item.roleRestricted && !isSuperAdminOrHR) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
