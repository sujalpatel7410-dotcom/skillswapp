import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Flag,
  Ban,
  Bell,
  Clock,
  CheckCheck
} from 'lucide-react';
import { User, SafetyReport } from '../../types';
import { storageService } from '../../services/storageService';
import { usePageLoader } from '../../hooks/usePageLoader';
import { AdminSkeleton } from '../ui/Skeleton';

interface AdminDashboardViewProps {
  currentUser: User;
}

type AdminTab = 'users' | 'reports';

const STATUS_COLORS: Record<SafetyReport['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-600',
  resolved: 'bg-emerald-500/10 text-emerald-600',
  dismissed: 'bg-slate-500/10 text-slate-500',
  warned: 'bg-indigo-500/10 text-indigo-600'
};

const CATEGORY_COLORS: Record<SafetyReport['category'], string> = {
  Harassment: 'bg-rose-500/10 text-rose-600',
  Spam: 'bg-orange-500/10 text-orange-600',
  'Inappropriate content': 'bg-purple-500/10 text-purple-600',
  'No-show': 'bg-blue-500/10 text-blue-600',
  Other: 'bg-slate-500/10 text-slate-500'
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ currentUser }) => {
  const isLoadingPage = usePageLoader(450);
  if (isLoadingPage) return <AdminSkeleton />;
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all' | 'flagged'>('pending');
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed' | 'warned'>('pending');
  const [search, setSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  useEffect(() => {
    const update = () => {
      setUsers(storageService.getUsers());
      setReports(storageService.getReports());
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, []);

  const pendingUsers = users.filter(u => u.verificationStatus === 'pending');
  const verifiedUsers = users.filter(u => u.verificationStatus === 'verified');
  const pendingReports = reports.filter(r => r.status === 'pending');

  const handleApprove = (userId: string) => storageService.approveVerification(userId);
  const handleReject = (userId: string) => storageService.rejectVerification(userId);

  const handleToggleSuspend = (userId: string, currentSuspended?: boolean) => {
    const target = storageService.getUserById(userId);
    if (!target) return;
    storageService.saveUser({ ...target, isSuspended: !currentSuspended });
  };

  const handleReportDismiss = (reportId: string) => storageService.updateReportStatus(reportId, 'dismissed');
  const handleReportResolve = (reportId: string) => storageService.updateReportStatus(reportId, 'resolved');
  const handleReportWarn = (reportId: string, userId: string) => {
    storageService.updateReportStatus(reportId, 'warned');
    storageService.warnUser(userId);
  };
  const handleReportSuspend = (reportId: string, userId: string) => {
    storageService.updateReportStatus(reportId, 'resolved');
    const target = storageService.getUserById(userId);
    if (target) storageService.saveUser({ ...target, isSuspended: true });
  };

  const filteredUsers = users
    .filter(u => {
      if (filter === 'pending') return u.verificationStatus === 'pending';
      if (filter === 'flagged') return u.isSuspended;
      return true;
    })
    .filter(u => {
      if (!search) return true;
      return u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.collegeName.toLowerCase().includes(search.toLowerCase());
    });

  const filteredReports = reports
    .filter(r => reportFilter === 'all' || r.status === reportFilter)
    .filter(r => {
      if (!reportSearch) return true;
      const q = reportSearch.toLowerCase();
      return r.reporterName.toLowerCase().includes(q) ||
        r.reportedUserName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Campus Staff & Admin Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review student verification requests, moderate campus interactions, and ensure authentic collegiate peer exchanges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => storageService.resetToDefaults()}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center gap-1.5"
          title="Reload initial campus students"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Stat Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Total Students</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{users.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-amber-500 font-semibold">Pending Verifications</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingUsers.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-emerald-500 font-semibold">Verified Students</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{verifiedUsers.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-rose-500 font-semibold">Pending Reports</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{pendingReports.length}</p>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'users'
            ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-900'
            }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Student Management</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${tab === 'reports'
            ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-900'
            }`}
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Safety Reports</span>
          {pendingReports.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none">
              {pendingReports.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── USERS TAB ─── */}
      {tab === 'users' && (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
              {(['pending', 'all', 'flagged'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${filter === f
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {f === 'pending' ? `Pending (${pendingUsers.length})` : f === 'all' ? `All (${users.length})` : `Suspended (${users.filter(u => u.isSuspended).length})`}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by name or college..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No students found in this category.</div>
              ) : (
                filteredUsers.map(u => (
                  <div
                    key={u.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <img src={u.photoURL} alt={u.name} className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${u.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-600'
                            : u.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                            }`}>
                            {u.verificationStatus}
                          </span>
                          {u.isSuspended && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">Suspended</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{u.collegeName} • {u.course}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                      {u.verificationStatus === 'pending' && (
                        <>
                          <button type="button" onClick={() => handleReject(u.id)} className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                            Reject ID
                          </button>
                          <button type="button" onClick={() => handleApprove(u.id)} className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve ID</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${u.isSuspended
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        {u.isSuspended ? 'Lift Suspension' : 'Suspend'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── REPORTS TAB ─── */}
      {tab === 'reports' && (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Status filter pills */}
            <div className="flex items-center flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
              {(['all', 'pending', 'warned', 'resolved', 'dismissed'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setReportFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${reportFilter === f
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {f === 'all' ? `All (${reports.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${reports.filter(r => r.status === f).length})`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={reportSearch}
                onChange={e => setReportSearch(e.target.value)}
                placeholder="Search by name, category..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredReports.length === 0 ? (
                <div className="p-12 text-center">
                  <Flag className="w-10 h-10 mx-auto mb-3 text-slate-200 dark:text-slate-700" />
                  <p className="text-sm font-medium text-slate-400">No reports found</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                    {reportFilter === 'pending' ? 'Campus is safe! No pending reports.' : 'Try a different filter or search term.'}
                  </p>
                </div>
              ) : (
                filteredReports.map(report => (
                  <div
                    key={report.id}
                    className="p-4 sm:p-5 space-y-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Report header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${CATEGORY_COLORS[report.category]}`}>
                          {report.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_COLORS[report.status]}`}>
                          {report.status}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                          R
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Reporter</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{report.reporterName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20">
                        <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-[10px] font-bold text-rose-500 shrink-0">
                          !
                        </div>
                        <div>
                          <p className="text-[10px] text-rose-400 font-medium">Reported User</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{report.reportedUserName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    {report.details && report.details !== 'No additional details provided.' && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-xl">
                        "{report.details}"
                      </p>
                    )}

                    {/* Admin Actions */}
                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Actions:</span>
                        <button
                          type="button"
                          onClick={() => handleReportDismiss(report.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReportWarn(report.id, report.reportedUserId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          Warn User
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReportSuspend(report.id, report.reportedUserId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Suspend Account
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReportResolve(report.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark Resolved
                        </button>
                      </div>
                    )}

                    {/* Already resolved note */}
                    {report.status !== 'pending' && (
                      <p className="text-[10px] text-slate-400 italic">
                        This report has been {report.status} by an administrator.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
