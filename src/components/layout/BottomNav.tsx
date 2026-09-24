import React from 'react';
import { Home, Compass, Sparkles, MessageSquare, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  unreadMessagesCount?: number;
  pendingRequestsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentRoute,
  onNavigate,
  unreadMessagesCount = 0,
  pendingRequestsCount = 0
}) => {
  const tabs = [
    { id: '/dashboard', label: 'Home', icon: Home },
    { id: '/discover', label: 'Discover', icon: Compass },
    {
      id: '/matches',
      label: 'Matches',
      icon: Sparkles,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined
    },
    {
      id: '/messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? (unreadMessagesCount > 99 ? '99+' : unreadMessagesCount) : undefined
    },
    { id: '/profile', label: 'Profile', icon: UserIcon }
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-1.5 flex items-center justify-around safe-bottom transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-soft)'
      }}
    >
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive =
          currentRoute === tab.id ||
          (tab.id === '/dashboard' && currentRoute === '/') ||
          (tab.id === '/profile' && currentRoute.startsWith('/profile'));

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all"
            style={{
              color: isActive ? 'var(--color-primary)' : 'var(--color-muted)',
              fontWeight: isActive ? 500 : 400
            }}
          >
            <div className="relative">
              <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted)' }} />
              {tab.badge && (
                <span
                  className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
