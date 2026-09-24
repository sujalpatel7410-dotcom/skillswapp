import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  Star,
  Award,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { User, AppNotification } from '../../types';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';

interface NavbarProps {
  currentUser: User | null;
  currentRoute: string;
  onNavigate: (route: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  onOpenAuthModal,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (currentUser) {
        setNotifications(storageService.getNotifications(currentUser.id));
      } else {
        setNotifications([]);
      }
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = (notif: AppNotification) => {
    storageService.markNotificationAsRead(notif.id);
    if (notif.link) {
      onNavigate(notif.link);
      setShowNotifMenu(false);
    }
  };

  const isPublicPage = ['/', '/about', '/how-it-works', '/pricing'].includes(currentRoute);

  return (
    <header
      className="sticky top-0 z-40 w-full transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-soft)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate(isPublicPage ? '/' : '/dashboard')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform"
              style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span
                className="text-xl font-medium tracking-tight block"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                SkillSwap
              </span>
              <span
                className="hidden sm:block text-[10px] font-normal uppercase tracking-wider -mt-1"
                style={{ color: 'var(--color-muted)' }}
              >
                Learn by Teaching
              </span>
            </div>
          </button>

          {/* Quick tagline badge on desktop */}
          <div
            className="hidden lg:flex items-center px-3 py-1 rounded-full text-xs font-normal"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-soft)'
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full mr-2"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            One skill in, one skill out
          </div>
        </div>

        {/* Public Navigation Links */}
        {isPublicPage && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: currentRoute === '/' ? 'var(--color-primary)' : 'var(--color-muted)',
                backgroundColor: currentRoute === '/' ? 'var(--color-soft)' : 'transparent'
              }}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('/how-it-works')}
              className="px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: currentRoute === '/how-it-works' ? 'var(--color-primary)' : 'var(--color-muted)',
                backgroundColor: currentRoute === '/how-it-works' ? 'var(--color-soft)' : 'transparent'
              }}
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('/pricing')}
              className="px-3 py-1.5 rounded-full transition-colors"
              style={{
                color: currentRoute === '/pricing' ? 'var(--color-primary)' : 'var(--color-muted)',
                backgroundColor: currentRoute === '/pricing' ? 'var(--color-soft)' : 'transparent'
              }}
            >
              Business Model
            </button>
            <button
              onClick={() => onNavigate('/discover')}
              className="px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ color: 'var(--color-muted)' }}
            >
              Browse Campus Skills
            </button>
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Discover / Search shortcut */}
          {!isPublicPage && (
            <button
              onClick={() => onNavigate('/discover')}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-full transition-colors"
              style={{
                backgroundColor: 'var(--color-soft)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-soft)'
              }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--color-text)' }}>Search skills or campus peers...</span>
              <kbd
                className="hidden md:inline-block px-1.5 py-0.5 text-[10px] rounded"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-muted)',
                  border: '1px solid var(--color-soft)'
                }}
              >
                Ctrl K
              </kbd>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-full transition-colors hover:opacity-80"
            style={{ color: 'var(--color-muted)' }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* If Logged in or in Demo App mode */}
          {currentUser ? (
            <>
              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                </button>

                {showNotifMenu && (
                  <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 py-2 z-50 animate-in fade-in"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)'
                    }}
                  >
                    <div
                      className="px-4 py-2 flex items-center justify-between"
                      style={{ borderBottom: '1px solid var(--color-soft)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-soft)',
                              color: 'var(--color-primary)'
                            }}
                          >
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => storageService.markAllNotificationsAsRead(currentUser.id)}
                          className="text-xs hover:underline"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
                          No notifications right now
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className="p-3.5 cursor-pointer transition-colors flex gap-3 hover:opacity-90"
                            style={{
                              backgroundColor: !n.read ? 'var(--color-soft)' : 'transparent',
                              borderBottom: '1px solid var(--color-soft)'
                            }}
                          >
                            <div className="mt-0.5">
                              {n.type === 'match' && <Sparkles className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
                              {n.type === 'session' && <Calendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
                              {n.type === 'badge' && <Award className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
                              {n.type === 'review' && <Star className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
                              {n.type === 'request' && <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}
                              {n.type === 'system' && <Bell className="w-4 h-4" style={{ color: 'var(--color-muted)' }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium leading-tight" style={{ color: 'var(--color-text)' }}>
                                {n.title}
                              </p>
                              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-muted)' }}>
                                {n.description}
                              </p>
                              <span className="text-[10px] mt-1 block" style={{ color: 'var(--color-muted)' }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1 rounded-full transition-colors focus:outline-none"
                >
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ border: '1px solid var(--color-soft)' }}
                  />
                  <div className="hidden md:block text-left text-xs">
                    <div className="font-medium flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
                      <span>{currentUser.name}</span>
                      {currentUser.verificationStatus === 'verified' && (
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                      )}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                      {currentUser.learningStreak}d streak
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-muted)' }} />
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 py-2 z-50 animate-in fade-in"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)'
                    }}
                  >
                    <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--color-soft)' }}>
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--color-muted)' }}>
                        {currentUser.collegeName}
                      </p>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          onNavigate('/profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-text)' }}
                      >
                        My Student Profile
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('/dashboard');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('/progress');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Learning Progress & Stats
                      </button>
                      {currentUser.isAdmin && (
                        <button
                          onClick={() => {
                            onNavigate('/admin');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 font-medium flex items-center justify-between hover:opacity-80"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          <span>Campus Admin Panel</span>
                          <span
                            className="text-[9px] uppercase px-1.5 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                          >
                            Staff
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 text-xs" style={{ borderTop: '1px solid var(--color-soft)' }}>
                      <button
                        onClick={() => {
                          storageService.resetToDefaults();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-muted)' }}
                        title="Reloads sample students and reviews"
                      >
                        Reload Sample Campus Data
                      </button>
                      <button
                        onClick={async () => {
                          await authService.logout();
                          onNavigate('/');
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:opacity-80"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-text)' }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuthModal('register')}
                className="px-4 py-1.5 text-xs font-medium rounded-full transition-all"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                Join SkillSwap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
