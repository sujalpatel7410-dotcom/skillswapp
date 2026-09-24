import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Outlet,
  Navigate
} from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { User, LearningSession } from './types';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { ProblemSection } from './components/landing/ProblemSection';
import { HowItWorks } from './components/landing/HowItWorks';
import { PricingSection } from './components/landing/PricingSection';
import { FutureFeatures } from './components/landing/FutureFeatures';
import { DashboardView } from './components/dashboard/DashboardView';
import { MatchingView } from './components/matching/MatchingView';
import { DiscoverView } from './components/matching/DiscoverView';
import { ProfileView } from './components/profile/ProfileView';
import { ChatView } from './components/chat/ChatView';
import { SessionsView } from './components/sessions/SessionsView';
import { VideoCallRoom } from './components/sessions/VideoCallRoom';
import { SkillsView } from './components/skills/SkillsView';
import { ProgressView } from './components/progress/ProgressView';
import { LeaderboardView } from './components/progress/LeaderboardView';
import { BadgesView } from './components/badges/BadgesView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { ExchangeRequestModal } from './components/matching/ExchangeRequestModal';
import { NotFoundView } from './components/ui/NotFoundView';

// Wrapper for ProfileView to extract userId from URL parameters
const ProfileRoute: React.FC<{
  currentUser: User;
  onNavigate: (route: string) => void;
  onOpenChatWith: (partnerId: string) => void;
}> = ({ currentUser, onNavigate, onOpenChatWith }) => {
  const { userId } = useParams<{ userId?: string }>();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('userId');
  const targetId = userId || queryUserId || currentUser.id;

  return (
    <ProfileView
      currentUser={currentUser}
      targetUserId={targetId}
      onNavigate={onNavigate}
      onOpenChatWith={onOpenChatWith}
    />
  );
};

// Wrapper for ChatView to support query partner param
const MessagesRoute: React.FC<{
  currentUser: User;
  activeChatPartnerId: string | null;
  onNavigate: (route: string) => void;
  onStartVideoSession: (session: Partial<LearningSession>) => void;
}> = ({ currentUser, activeChatPartnerId, onNavigate, onStartVideoSession }) => {
  const [searchParams] = useSearchParams();
  const queryPartner = searchParams.get('partner');
  const partnerId = activeChatPartnerId || queryPartner || null;

  return (
    <ChatView
      currentUser={currentUser}
      activePartnerId={partnerId}
      onNavigate={onNavigate}
      onStartVideoSession={onStartVideoSession}
    />
  );
};

// Access Denied card for non-admin students on /admin
const AccessDeniedAdminView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => (
  <div
    className="max-w-md mx-auto my-12 p-8 text-center"
    style={{
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-soft)',
      borderRadius: 'var(--radius-card)'
    }}
  >
    <div
      className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
    >
      <ShieldAlert className="w-6 h-6" />
    </div>
    <h2
      className="text-lg font-medium mb-2"
      style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
    >
      You don't have access to this page
    </h2>
    <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
      The campus administrative console and staff verification portal are restricted to verified university staff and authorized campus coordinators.
    </p>
    <button
      onClick={() => onNavigate('/dashboard')}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-white transition-all cursor-pointer hover:opacity-90 active:scale-95"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Back to Dashboard</span>
    </button>
  </div>
);

// Authenticated layout with sidebar and main view container
const AuthenticatedLayout: React.FC<{
  currentUser: User;
  unreadMessages: number;
  pendingRequestsCount: number;
  onNavigate: (route: string) => void;
}> = ({ currentUser, unreadMessages, pendingRequestsCount, onNavigate }) => {
  const location = useLocation();

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto">
      {/* Authenticated Desktop Sidebar */}
      <Sidebar
        currentRoute={location.pathname}
        onNavigate={onNavigate}
        currentUser={currentUser}
        unreadMessagesCount={unreadMessages}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Core App View Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getCurrentUser());
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skillswap_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    }
    return false;
  });

  // Modals & Overlays
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeVideoSession, setActiveVideoSession] = useState<LearningSession | null>(null);
  const [quickSwapPartner, setQuickSwapPartner] = useState<User | null>(null);
  const [quickSwapOffered, setQuickSwapOffered] = useState('');
  const [quickSwapRequested, setQuickSwapRequested] = useState('');

  // Unread badge counts
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Sync dark mode class, data-theme and colorScheme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('skillswap_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('skillswap_theme', 'light');
    }
  }, [isDarkMode]);

  // Subscribe to storage changes
  useEffect(() => {
    const update = () => {
      const user = storageService.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const totalUnread = storageService.getUnreadMessagesCount(user.id);
        setUnreadMessages(totalUnread);

        const requests = storageService.getMatchRequests(user.id);
        const pending = requests.filter(r => r.receiverId === user.id && r.status === 'pending').length;
        setPendingRequestsCount(pending);
      } else {
        setUnreadMessages(0);
        setPendingRequestsCount(0);
      }
    };

    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, []);

  const handleNavigate = (route: string) => {
    if (route.startsWith('/profile?userId=')) {
      const userIdParam = route.split('/profile?userId=')[1];
      navigate(`/profile/${userIdParam}`);
    } else {
      navigate(route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenChatWith = (partnerId: string) => {
    setActiveChatPartnerId(partnerId);
    navigate(`/messages?partner=${partnerId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSwap = (partner: User, offered: string, requested: string) => {
    setQuickSwapPartner(partner);
    setQuickSwapOffered(offered);
    setQuickSwapRequested(requested);
  };

  const handleStartVideoSession = (sessionData: Partial<LearningSession>) => {
    if (!currentUser) return;
    const fullSession: LearningSession = {
      id: sessionData.id || `sess-live-${Date.now()}`,
      teacherId: sessionData.teacherId || currentUser.id,
      teacherName: sessionData.teacherName || currentUser.name,
      teacherPhoto: sessionData.teacherPhoto || currentUser.photoURL,
      teacherCollege: sessionData.teacherCollege || currentUser.collegeName,
      learnerId: sessionData.learnerId || 'stu-2',
      learnerName: sessionData.learnerName || 'Rahul Sharma',
      learnerPhoto: sessionData.learnerPhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      learnerCollege: sessionData.learnerCollege || 'Delhi Technological University (DTU)',
      skillId: sessionData.skillId || 'sk-exchange',
      skillName: sessionData.skillName || 'Python & Design Swap',
      timeSlot: sessionData.timeSlot || 'Live Exchange',
      durationMinutes: sessionData.durationMinutes || 60,
      meetingLink: sessionData.meetingLink || 'https://skillswap.campus/meet/live',
      scheduledAt: sessionData.scheduledAt || new Date().toISOString(),
      status: 'in-progress',
      notes: sessionData.notes || '1-on-1 collaborative walk-through & project review',
      createdAt: sessionData.createdAt || new Date().toISOString()
    };
    setActiveVideoSession(fullSession);
  };

  const isKnownAuthRoute =
    [
      '/dashboard',
      '/matches',
      '/discover',
      '/messages',
      '/sessions',
      '/skills',
      '/progress',
      '/leaderboard',
      '/badges',
      '/admin'
    ].includes(location.pathname) || location.pathname.startsWith('/profile');

  return (
    <div
      className="min-h-screen flex flex-col transition-colors"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-heading)'
      }}
    >
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentRoute={location.pathname}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenAuthModal={mode => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
      />

      {/* Routes Switch */}
      <Routes>
        {/* Public Landing Pages */}
        <Route
          path="/"
          element={
            <main className="flex-1">
              <HeroSection
                onFindMatch={() => {
                  if (currentUser) {
                    handleNavigate('/matches');
                  } else {
                    setAuthModalMode('register');
                    setAuthModalOpen(true);
                  }
                }}
                onExploreHowItWorks={() => handleNavigate('/how-it-works')}
              />
              <ProblemSection />
              <HowItWorks />
              <PricingSection
                onJoinFree={() => {
                  if (currentUser) {
                    handleNavigate('/dashboard');
                  } else {
                    setAuthModalMode('register');
                    setAuthModalOpen(true);
                  }
                }}
              />
              <FutureFeatures />
              <Footer onNavigate={handleNavigate} />
            </main>
          }
        />

        <Route
          path="/how-it-works"
          element={
            <main className="flex-1">
              <div className="py-8">
                <HowItWorks />
                <ProblemSection />
              </div>
              <Footer onNavigate={handleNavigate} />
            </main>
          }
        />

        <Route
          path="/pricing"
          element={
            <main className="flex-1">
              <div className="py-8">
                <PricingSection
                  onJoinFree={() => {
                    if (currentUser) {
                      handleNavigate('/dashboard');
                    } else {
                      setAuthModalMode('register');
                      setAuthModalOpen(true);
                    }
                  }}
                />
                <FutureFeatures />
              </div>
              <Footer onNavigate={handleNavigate} />
            </main>
          }
        />

        {/* Authenticated Campus Flow Pages */}
        <Route
          element={
            currentUser ? (
              <AuthenticatedLayout
                currentUser={currentUser}
                unreadMessages={unreadMessages}
                pendingRequestsCount={pendingRequestsCount}
                onNavigate={handleNavigate}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route
            path="/dashboard"
            element={
              <DashboardView
                currentUser={currentUser!}
                onNavigate={handleNavigate}
                onRequestExchange={handleQuickSwap}
                onJoinCall={sess => setActiveVideoSession(sess)}
              />
            }
          />

          <Route
            path="/matches"
            element={
              <MatchingView
                currentUser={currentUser!}
                onNavigate={handleNavigate}
                onOpenChatWith={handleOpenChatWith}
              />
            }
          />

          <Route
            path="/discover"
            element={
              <DiscoverView
                currentUser={currentUser!}
                onNavigate={handleNavigate}
              />
            }
          />

          <Route
            path="/messages"
            element={
              <MessagesRoute
                currentUser={currentUser!}
                activeChatPartnerId={activeChatPartnerId}
                onNavigate={handleNavigate}
                onStartVideoSession={handleStartVideoSession}
              />
            }
          />

          <Route
            path="/sessions"
            element={
              <SessionsView
                currentUser={currentUser!}
                onJoinCall={sess => setActiveVideoSession(sess)}
                onOpenChatWith={handleOpenChatWith}
                onNavigate={handleNavigate}
              />
            }
          />

          <Route
            path="/skills"
            element={
              <SkillsView
                currentUser={currentUser!}
                onNavigate={handleNavigate}
              />
            }
          />

          <Route
            path="/progress"
            element={
              <ProgressView
                currentUser={currentUser!}
                onNavigate={handleNavigate}
              />
            }
          />

          <Route
            path="/leaderboard"
            element={
              <LeaderboardView
                onNavigate={handleNavigate}
              />
            }
          />

          <Route
            path="/badges"
            element={
              <BadgesView
                currentUser={currentUser!}
              />
            }
          />

          <Route
            path="/profile"
            element={
              <ProfileRoute
                currentUser={currentUser!}
                onNavigate={handleNavigate}
                onOpenChatWith={handleOpenChatWith}
              />
            }
          />

          <Route
            path="/profile/:userId"
            element={
              <ProfileRoute
                currentUser={currentUser!}
                onNavigate={handleNavigate}
                onOpenChatWith={handleOpenChatWith}
              />
            }
          />

          <Route
            path="/admin"
            element={
              currentUser?.isAdmin ? (
                <AdminDashboardView currentUser={currentUser!} />
              ) : (
                <AccessDeniedAdminView onNavigate={handleNavigate} />
              )
            }
          />
        </Route>

        {/* Friendly 404 Page */}
        <Route
          path="*"
          element={
            <main className="flex-1 flex flex-col">
              <NotFoundView onNavigate={handleNavigate} />
              <Footer onNavigate={handleNavigate} />
            </main>
          }
        />
      </Routes>

      {/* Mobile Bottom Navigation for Authenticated Routes */}
      {currentUser && isKnownAuthRoute && (
        <BottomNav
          currentRoute={location.pathname}
          onNavigate={handleNavigate}
          unreadMessagesCount={unreadMessages}
          pendingRequestsCount={pendingRequestsCount}
        />
      )}

      {/* Live Video Room Modal / Overlay */}
      {currentUser && activeVideoSession && (
        <VideoCallRoom
          session={activeVideoSession}
          currentUser={currentUser}
          onLeaveCall={() => setActiveVideoSession(null)}
        />
      )}

      {/* Auth Modal (Login / Register / Forgot Password) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={(user, isNewRegistration) => {
          setCurrentUser(user);
          if (isNewRegistration) {
            setShowOnboarding(true);
          } else {
            handleNavigate('/dashboard');
          }
        }}
      />

      {/* Onboarding Wizard (Step 1-6) */}
      {currentUser && showOnboarding && (
        <OnboardingWizard
          user={currentUser}
          onComplete={() => {
            setShowOnboarding(false);
            handleNavigate('/dashboard');
          }}
        />
      )}

      {/* Quick Swap Proposal Modal */}
      {quickSwapPartner && (
        <ExchangeRequestModal
          isOpen={true}
          onClose={() => setQuickSwapPartner(null)}
          partner={quickSwapPartner}
          defaultOfferedSkill={quickSwapOffered}
          defaultRequestedSkill={quickSwapRequested}
          onSuccess={() => handleNavigate('/matches')}
        />
      )}
    </div>
  );
}

export default App;
