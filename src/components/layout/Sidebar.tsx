import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Video,
  MessageSquare,
  BookOpen,
  Flame,
  Trophy,
  Award,
  ShieldAlert,
  GraduationCap,
  Radio
} from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  currentUser: User;
  unreadMessagesCount?: number;
  pendingRequestsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  currentUser,
  unreadMessagesCount = 0,
  pendingRequestsCount = 0
}) => {
  const mainNav = [
    {
      id: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: '/matches',
      label: 'AI Matches',
      icon: Sparkles,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : undefined,
      highlight: true
    },
    {
      id: '/discover',
      label: 'Discover Peers',
      icon: Compass
    },
    {
      id: '/sessions',
      label: 'Exchange Sessions',
      icon: Video
    },
    {
      id: '/messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? (unreadMessagesCount > 99 ? '99+' : `${unreadMessagesCount}`) : undefined
    }
  ];

  const learningNav = [
    {
      id: '/skills',
      label: 'My Skills',
      icon: BookOpen
    },
    {
      id: '/progress',
      label: 'Progress & Streaks',
      icon: Flame
    },
    {
      id: '/leaderboard',
      label: 'Campus Leaderboard',
      icon: Trophy
    },
    {
      id: '/badges',
      label: 'Badges & Rewards',
      icon: Award
    }
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-64 p-4 space-y-6 select-none shrink-0 min-h-[calc(100vh-4rem)] transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-soft)'
      }}
    >
      {/* Student Mini Profile Snapshot */}
      <div
        onClick={() => onNavigate('/profile')}
        className="p-3.5 cursor-pointer transition-all group"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.photoURL}
              alt={currentUser.name}
              className="w-11 h-11 rounded-full object-cover transition-transform"
              style={{ border: '1px solid var(--color-soft)' }}
            />
            {currentUser.verificationStatus === 'verified' && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                ✓
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className="text-xs font-medium truncate transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              {currentUser.name}
            </h4>
            <p className="text-[11px] truncate" style={{ color: 'var(--color-muted)' }}>
              {currentUser.course}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center text-[10px] font-medium" style={{ color: 'var(--color-primary)' }}>
                ★ {currentUser.rating}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-soft)' }}>•</span>
              <span className="inline-flex items-center text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>
                {currentUser.learningStreak}d streak
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Session Status Toggle */}
      <div
        className="p-3 transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {currentUser.isAvailableForLiveSession && (
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{
                  backgroundColor: currentUser.isAvailableForLiveSession
                    ? 'var(--color-primary)'
                    : 'var(--color-muted)'
                }}
              />
            </span>
            <span
              className="text-xs font-medium truncate"
              style={{ color: 'var(--color-text)' }}
            >
              Available for Live
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={Boolean(currentUser.isAvailableForLiveSession)}
            onClick={(e) => {
              e.stopPropagation();
              storageService.toggleLiveSessionAvailability(currentUser.id);
            }}
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
            style={{
              backgroundColor: currentUser.isAvailableForLiveSession
                ? 'var(--color-primary)'
                : 'var(--color-soft)'
            }}
            title={
              currentUser.isAvailableForLiveSession
                ? 'Available for Live Session (Active) - Click to turn off'
                : 'Offline for live sessions - Click to mark available'
            }
          >
            <span
              className="pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"
              style={{
                backgroundColor: currentUser.isAvailableForLiveSession ? '#FFFFFF' : 'var(--color-muted)',
                transform: currentUser.isAvailableForLiveSession ? 'translateX(16px)' : 'translateX(0)'
              }}
            />
          </button>
        </div>

        <p className="text-[10px] mt-1.5 leading-tight" style={{ color: 'var(--color-muted)' }}>
          {currentUser.isAvailableForLiveSession
            ? 'Live on campus: visible in matching for instant video exchanges.'
            : 'Scheduled only: not featured as ready for instant live calls.'}
        </p>
      </div>

      {/* Main Core Flows */}
      <div>
        <div
          className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--color-muted)' }}
        >
          Core Exchange
        </div>
        <nav className="space-y-1">
          {mainNav.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-soft)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: isActive ? 500 : 400
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="w-4 h-4"
                    style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted)' }}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Learning & Growth */}
      <div>
        <div
          className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider"
          style={{ color: 'var(--color-muted)' }}
        >
          Learning & Growth
        </div>
        <nav className="space-y-1">
          {learningNav.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--color-soft)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  fontWeight: isActive ? 500 : 400
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted)' }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin section if user has admin flag */}
      {currentUser.isAdmin && (
        <div className="pt-2" style={{ borderTop: '1px solid var(--color-soft)' }}>
          <div
            className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-muted)' }}
          >
            Campus Administration
          </div>
          <button
            onClick={() => onNavigate('/admin')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: currentRoute.startsWith('/admin') ? 'var(--color-soft)' : 'transparent',
              color: 'var(--color-primary)'
            }}
          >
            <ShieldAlert className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <span>Admin Center</span>
          </button>
        </div>
      )}

      {/* Bottom info callout */}
      <div
        className="mt-auto p-3 text-[11px] flex items-center gap-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)',
          color: 'var(--color-muted)'
        }}
      >
        <GraduationCap className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
        <span className="line-clamp-2">
          {currentUser.collegeName}
        </span>
      </div>
    </aside>
  );
};
