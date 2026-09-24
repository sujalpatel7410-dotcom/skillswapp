import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Search
} from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface AdminDashboardViewProps {
  currentUser: User;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all' | 'flagged'>('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const update = () => {
      setUsers(storageService.getUsers());
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, []);

  const pendingUsers = users.filter(u => u.verificationStatus === 'pending');
  const verifiedUsers = users.filter(u => u.verificationStatus === 'verified');

  const handleApprove = (userId: string) => {
    storageService.approveVerification(userId);
  };

  const handleReject = (userId: string) => {
    storageService.rejectVerification(userId);
  };

  const handleToggleSuspend = (userId: string, currentSuspended?: boolean) => {
    const target = storageService.getUserById(userId);
    if (!target) return;
    storageService.saveUser({
      ...target,
      isSuspended: !currentSuspended
    });
  };

  const filtered = users.filter(u => {
    if (filter === 'pending') return u.verificationStatus === 'pending';
    if (filter === 'flagged') return u.isSuspended;
    return true;
  }).filter(u => {
    if (!search) return true;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.collegeName.toLowerCase().includes(search.toLowerCase());
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
          title="Reload initial 20 campus students"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Admin Stat Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold">Total Students</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {users.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-amber-500 font-semibold">Pending Verifications</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {pendingUsers.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-emerald-500 font-semibold">Verified Students</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {verifiedUsers.length}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-indigo-500 font-semibold">Campus Trust Rate</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">
            {Math.round((verifiedUsers.length / (users.length || 1)) * 100)}%
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'pending'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending Verification ({pendingUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Students ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('flagged')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'flagged'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Suspended ({users.filter(u => u.isSuspended).length})
          </button>
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

      {/* Verification Queue & Student Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No students found in this category.
            </div>
          ) : (
            filtered.map(u => (
              <div
                key={u.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={u.photoURL}
                    alt={u.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {u.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          u.verificationStatus === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : u.verificationStatus === 'pending'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}
                      >
                        {u.verificationStatus}
                      </span>
                      {u.isSuspended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                          Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {u.collegeName} • ID #{u.studentIdNumber || '2414406022'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Email: {u.email} • {u.course}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {u.verificationStatus === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(u.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        Reject ID
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(u.id)}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve ID</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                      u.isSuspended
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
    </div>
  );
};
