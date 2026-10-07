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
  ChevronDown,
  MessageSquare,
  X,
  Repeat,
  Settings2,
  Menu
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

type NotifType = AppNotification['type'];

const TYPE_ICON: Record<NotifType, React.ReactNode> = {
  match: <Sparkles className="w-3.5 h-3.5" />,
  request: <Repeat className="w-3.5 h-3.5" />,
  message: <MessageSquare className="w-3.5 h-3.5" />,
  session: <Calendar className="w-3.5 h-3.5" />,
  badge: <Award className="w-3.5 h-3.5" />,
  review: <Star className="w-3.5 h-3.5" />,
  system: <Bell className="w-3.5 h-3.5" />,
};

const TYPE_LABEL: Record<NotifType, string> = {
  match: 'Match',
  request: 'Request',
  message: 'Message',
  session: 'Session',
  badge: 'Badge',
  review: 'Review',
  system: 'System',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Load per-type enabled prefs from localStorage
function loadEnabledTypes(): Set<NotifType> {
  try {
    const raw = localStorage.getItem('skillswap_notif_prefs');
    if (raw) {
      const prefs = JSON.parse(raw) as Record<string, boolean>;
      return new Set(
        (Object.keys(prefs) as NotifType[]).filter(k => prefs[k] !== false)
      );
    }
  } catch { /* */ }
  // Default: all enabled
  return new Set(['match', 'request', 'message', 'session', 'badge', 'review', 'system']);
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentRoute,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  onOpenAuthModal,
}) => {
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [enabledTypes, setEnabledTypes] = useState<Set<NotifType>>(loadEnabledTypes);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotifType | 'all'>('all');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Re-read prefs when dropdown opens (may have changed in ProfileView)
  useEffect(() => {
    if (showNotifMenu) {
      setEnabledTypes(loadEnabledTypes());
    }
  }, [showNotifMenu]);

  useEffect(() => {
    const update = () => {
      if (currentUser) {
        setAllNotifications(storageService.getNotifications(currentUser.id));
      } else {
        setAllNotifications([]);
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

  // Only show notifications whose type is currently enabled
  const visibleNotifications = allNotifications.filter(n => enabledTypes.has(n.type));
  const unreadCount = visibleNotifications.filter(n => !n.read).length;

  const filteredNotifications = activeFilter === 'all'
    ? visibleNotifications
    : visibleNotifications.filter(n => n.type === activeFilter);

  const handleNotifClick = (notif: AppNotification) => {
    storageService.markNotificationAsRead(notif.id);
    if (notif.link) {
      onNavigate(notif.link);
      setShowNotifMenu(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storageService.deleteNotification(id);
  };

  const isPublicPage = ['/', '/about', '/how-it-works', '/pricing'].includes(currentRoute);

  // Tabs: unique types present in visible notifications
  const presentTypes = Array.from(new Set(visibleNotifications.map(n => n.type)));

  return (
    <header
      className="sticky top-0 z-40 w-full transition-colors glass-panel"
      style={{
        borderBottom: '1px solid var(--color-glass-border)'
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
          {/* Quick Search shortcut */}
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

          {/* Mobile Hamburger (public pages only) */}
          {isPublicPage && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-full transition-colors hover:opacity-80"
              style={{ color: 'var(--color-muted)' }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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

          {/* ---------- AUTHENTICATED STATE ---------- */}
          {currentUser ? (
            <>
              {/* ===== NOTIFICATIONS BELL ===== */}
              <div className="relative" ref={notifRef}>
                <button
                  id="notif-bell-btn"
                  type="button"
                  onClick={() => {
                    setShowNotifMenu(v => !v);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Notifications"
                  aria-haspopup="true"
                  aria-expanded={showNotifMenu}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold leading-none"
                      style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div
                    id="notif-dropdown"
                    className="absolute right-0 mt-2 w-[360px] sm:w-[420px] z-50 flex flex-col overflow-hidden"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      maxHeight: '80vh',
                    }}
                  >
                    {/* Header */}
                    <div
                      className="px-4 py-3 flex items-center justify-between shrink-0"
                      style={{ borderBottom: '1px solid var(--color-soft)' }}
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                          >
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => storageService.markAllNotificationsAsRead(currentUser.id)}
                            className="text-[10px] font-medium hover:underline"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowNotifMenu(false);
                            onNavigate('/profile');
                          }}
                          className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--color-muted)' }}
                          title="Notification settings"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Type filter tabs */}
                    {presentTypes.length > 1 && (
                      <div
                        className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0"
                        style={{ borderBottom: '1px solid var(--color-soft)' }}
                      >
                        {(['all', ...presentTypes] as Array<NotifType | 'all'>).map(t => (
                          <button
                            key={t}
                            onClick={() => setActiveFilter(t)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all cursor-pointer"
                            style={{
                              backgroundColor: activeFilter === t ? 'var(--color-primary)' : 'var(--color-bg)',
                              color: activeFilter === t ? '#fff' : 'var(--color-muted)',
                              border: `1px solid ${activeFilter === t ? 'transparent' : 'var(--color-soft)'}`,
                            }}
                          >
                            {t === 'all' ? 'All' : TYPE_LABEL[t]}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Notifications list */}
                    <div className="overflow-y-auto flex-1">
                      {filteredNotifications.length === 0 ? (
                        <div className="p-8 text-center" style={{ color: 'var(--color-muted)' }}>
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs font-medium">No notifications yet</p>
                          <p className="text-[10px] mt-1 opacity-70">
                            Complete your profile and start swapping skills!
                          </p>
                        </div>
                      ) : (
                        filteredNotifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className="group relative px-4 py-3 flex gap-3 cursor-pointer transition-colors"
                            style={{
                              backgroundColor: !n.read ? 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))' : 'transparent',
                              borderBottom: '1px solid var(--color-soft)',
                            }}
                          >
                            {/* Unread indicator dot */}
                            {!n.read && (
                              <span
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                              />
                            )}

                            {/* Type icon */}
                            <div
                              className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: 'var(--color-soft)',
                                color: 'var(--color-primary)',
                              }}
                            >
                              {TYPE_ICON[n.type] || <Bell className="w-3.5 h-3.5" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pl-1">
                              <p
                                className="text-xs font-semibold leading-tight truncate"
                                style={{ color: 'var(--color-text)' }}
                              >
                                {n.title}
                              </p>
                              <p
                                className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed"
                                style={{ color: 'var(--color-muted)' }}
                              >
                                {n.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                                >
                                  {TYPE_LABEL[n.type]}
                                </span>
                                <span className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
                                  {timeAgo(n.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Delete on hover */}
                            <button
                              onClick={e => handleDelete(e, n.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:opacity-70 shrink-0 mt-0.5"
                              style={{ color: 'var(--color-muted)' }}
                              title="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {visibleNotifications.length > 0 && (
                      <div
                        className="px-4 py-2.5 shrink-0 flex items-center justify-between"
                        style={{ borderTop: '1px solid var(--color-soft)' }}
                      >
                        <button
                          onClick={() => {
                            if (currentUser) storageService.clearAllNotifications(currentUser.id);
                          }}
                          className="text-[10px] hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => {
                            setShowNotifMenu(false);
                            onNavigate('/profile');
                          }}
                          className="text-[10px] font-medium hover:underline flex items-center gap-1"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          <Settings2 className="w-3 h-3" />
                          Manage preferences
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ===== USER PROFILE DROPDOWN ===== */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(v => !v);
                    setShowNotifMenu(false);
                  }}
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
                    className="absolute right-0 mt-2 w-56 py-2 z-50"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
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
                        onClick={() => { onNavigate('/profile'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-text)' }}
                      >
                        My Student Profile
                      </button>
                      <button
                        onClick={() => { onNavigate('/dashboard'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => { onNavigate('/progress'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Learning Progress & Stats
                      </button>
                      <button
                        onClick={() => { onNavigate('/settings'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2 hover:opacity-80"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Account Settings
                      </button>
                      {currentUser.isAdmin && (
                        <button
                          onClick={() => { onNavigate('/admin'); setShowProfileMenu(false); }}
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
                        onClick={() => { storageService.resetToDefaults(); setShowProfileMenu(false); }}
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
            <div className="hidden md:flex items-center gap-2">
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

      {/* Mobile Menu for public pages */}
      {isPublicPage && mobileMenuOpen && (
        <div
          className="md:hidden border-t"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-soft)'
          }}
        >
          <nav className="flex flex-col px-4 py-3 gap-1">
            <button
              onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                color: currentRoute === '/' ? 'var(--color-primary)' : 'var(--color-text)',
                backgroundColor: currentRoute === '/' ? 'var(--color-soft)' : 'transparent'
              }}
            >
              Home
            </button>
            <button
              onClick={() => { onNavigate('/how-it-works'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                color: currentRoute === '/how-it-works' ? 'var(--color-primary)' : 'var(--color-text)',
                backgroundColor: currentRoute === '/how-it-works' ? 'var(--color-soft)' : 'transparent'
              }}
            >
              How It Works
            </button>
            <button
              onClick={() => { onNavigate('/pricing'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                color: currentRoute === '/pricing' ? 'var(--color-primary)' : 'var(--color-text)',
                backgroundColor: currentRoute === '/pricing' ? 'var(--color-soft)' : 'transparent'
              }}
            >
              Business Model
            </button>
            <button
              onClick={() => { onNavigate('/discover'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: 'var(--color-text)' }}
            >
              Browse Campus Skills
            </button>
            <div className="pt-2 mt-1 flex flex-col gap-2" style={{ borderTop: '1px solid var(--color-soft)' }}>
              <button
                type="button"
                onClick={() => { onOpenAuthModal('login'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-text)', border: '1px solid var(--color-soft)' }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { onOpenAuthModal('register'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff'
                }}
              >
                Join SkillSwap — It's Free
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
