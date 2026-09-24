import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Video,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Award,
  Users,
  Repeat,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { User, AIMatchResult, LearningSession, AppNotification } from '../../types';
import { matchingService } from '../../services/matchingService';
import { storageService } from '../../services/storageService';
import { SkillChip } from '../ui/SkillChip';
import { Rating } from '../ui/Rating';
import { Modal } from '../ui/Modal';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
  onRequestExchange: (partner: User, offeredSkill: string, requestedSkill: string) => void;
  onJoinCall: (session: LearningSession) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onRequestExchange,
  onJoinCall
}) => {
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AIMatchResult | null>(null);

  useEffect(() => {
    const update = () => {
      setMatches(matchingService.getTopMatches(currentUser.id).slice(0, 4));
      setSessions(storageService.getSessions(currentUser.id));
      setNotifications(storageService.getNotifications(currentUser.id).slice(0, 4));
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [currentUser.id]);

  const upcomingSession = sessions.find(s => s.status === 'scheduled');
  const userSkills = storageService.getUserSkills(currentUser.id);
  const teachingSkills = userSkills.filter(s => s.type === 'teach');
  const learningSkills = userSkills.filter(s => s.type === 'learn');

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            {greeting}, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Here is your daily learning snapshot and top recommended campus skill exchanges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/matches')}
            className="px-5 py-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 cursor-pointer hover:opacity-85"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
            <span>Find Skill Matches</span>
          </button>
        </div>
      </div>

      {/* Learning Snapshot 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
              Learning Streak
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
            >
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-medium" style={{ color: 'var(--color-text)' }}>
              {currentUser.learningStreak}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Days Active</span>
          </div>
          <span className="text-[11px] font-medium mt-1 inline-block" style={{ color: 'var(--color-primary)' }}>
            Longest streak: {currentUser.longestStreak} days
          </span>
        </div>

        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
              Sessions Completed
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
            >
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-medium" style={{ color: 'var(--color-text)' }}>
              {currentUser.completedSessions}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Sessions</span>
          </div>
          <span className="text-[11px] font-medium mt-1 inline-block" style={{ color: 'var(--color-muted)' }}>
            {currentUser.hoursTaught}h taught • {currentUser.hoursLearned}h learned
          </span>
        </div>

        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
              Skills Teaching
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
            >
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-medium" style={{ color: 'var(--color-text)' }}>
              {teachingSkills.length}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Active</span>
          </div>
          <span className="text-[11px] font-medium mt-1 truncate block" style={{ color: 'var(--color-primary)' }}>
            {teachingSkills.map(s => s.skillName).join(', ') || 'Add your skills'}
          </span>
        </div>

        <div
          className="p-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
              Peer Rating
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
            >
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-medium" style={{ color: 'var(--color-text)' }}>
              {currentUser.rating.toFixed(2)}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>/ 5.0</span>
          </div>
          <span className="text-[11px] font-medium mt-1 inline-block" style={{ color: 'var(--color-muted)' }}>
            Across {currentUser.reviewCount} peer reviews
          </span>
        </div>
      </div>

      {/* Upcoming Session Spotlight Card - Highlight card styling */}
      {upcomingSession && (
        <div
          className="p-6 text-white relative overflow-hidden"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)' }}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Next Exchange Session Scheduled</span>
              </div>
              <h3 className="text-xl font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                1:1 Exchange on {upcomingSession.skillName}
              </h3>
              <p className="text-xs text-white/85">
                Partner: <strong className="text-white">{upcomingSession.teacherId === currentUser.id ? upcomingSession.learnerName : upcomingSession.teacherName}</strong>
                {' '}• {new Date(upcomingSession.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {upcomingSession.timeSlot}
              </p>
              {upcomingSession.notes && (
                <p className="text-xs text-white/75 italic max-w-xl">
                  "{upcomingSession.notes}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onJoinCall(upcomingSession)}
                className="px-6 py-2.5 rounded-full font-medium text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary)'
                }}
              >
                <Video className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span>Enter Video Session Room</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/sessions')}
                className="px-4 py-2.5 rounded-full font-medium text-xs transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF'
                }}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-lg font-medium flex items-center gap-2"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              <span>Top AI Matches for You</span>
              <span className="text-xs font-normal" style={{ color: 'var(--color-muted)' }}>
                (Mutual skill exchange pairs)
              </span>
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/matches')}
            className="text-xs font-medium flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
            style={{ color: 'var(--color-primary)' }}
          >
            <span>View All Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map(m => (
            <div
              key={m.partner.id}
              className="p-5 transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.partner.photoURL}
                      alt={m.partner.name}
                      className="w-12 h-12 rounded-full object-cover"
                      style={{ border: '1px solid var(--color-soft)' }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                          {m.partner.name}
                        </h4>
                        {m.partner.verificationStatus === 'verified' && (
                          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {m.partner.collegeName}
                      </p>
                      <Rating value={m.partner.rating} size="sm" reviewCount={m.partner.reviewCount} />
                    </div>
                  </div>

                  <MatchScoreBadge score={m.score} size="sm" showBar={false} />
                </div>

                {/* The Skill Pair */}
                <div
                  className="grid grid-cols-2 gap-2 p-3 text-xs mb-3"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-soft)',
                    borderRadius: 'var(--radius-card)'
                  }}
                >
                  <div>
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider block"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Can Teach You:
                    </span>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {m.canTeachYou.map(s => s.skillName).join(', ') || 'Multiple skills'}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider block"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Wants From You:
                    </span>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {m.wantsFromYou.map(s => s.skillName).join(', ') || 'Your skills'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] line-clamp-1 mb-2" style={{ color: 'var(--color-muted)' }}>
                  ✨ {m.reasons[0] || 'High mutual synergy'}
                </div>
              </div>

              <div
                className="pt-3 flex items-center justify-between gap-2"
                style={{ borderTop: '1px solid var(--color-soft)' }}
              >
                <button
                  type="button"
                  onClick={() => onNavigate(`/profile?userId=${m.partner.id}`)}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer hover:bg-[var(--color-soft)]"
                  style={{
                    border: '1px solid var(--color-soft)',
                    color: 'var(--color-muted)'
                  }}
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const offered = m.wantsFromYou[0]?.skillName || teachingSkills[0]?.skillName || 'Programming';
                    const requested = m.canTeachYou[0]?.skillName || 'Design';
                    onRequestExchange(m.partner, offered, requested);
                  }}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer hover:opacity-85"
                  style={{
                    backgroundColor: 'var(--color-soft)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Request Swap</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Continue Learning & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning (2 cols) */}
        <div
          className="lg:col-span-2 p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-medium flex items-center gap-2"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Continue Learning</span>
            </h3>
            <button
              onClick={() => onNavigate('/skills')}
              className="text-xs font-medium hover:underline cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
            >
              Manage Skills
            </button>
          </div>

          <div className="space-y-3">
            {learningSkills.map((sk, i) => {
              const progressPercent = i === 0 ? 65 : i === 1 ? 40 : 25;
              return (
                <div
                  key={sk.id}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-soft)'
                  }}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {sk.skillName}
                    </span>
                    <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                      {progressPercent}% Complete
                    </span>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-soft)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: 'var(--color-primary)'
                      }}
                    />
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--color-muted)' }}>
                    {sk.learningGoal || 'Working toward intermediate mastery with peer sessions.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity (1 col) */}
        <div
          className="p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-medium"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Recent Activity
            </h3>
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Live</span>
          </div>

          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => n.link && onNavigate(n.link)}
                className="p-3 rounded-xl cursor-pointer transition-colors flex items-start gap-3 hover:opacity-85"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)'
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'var(--color-soft)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {n.type === 'match' && <Sparkles className="w-4 h-4" />}
                  {n.type === 'session' && <Calendar className="w-4 h-4" />}
                  {n.type === 'badge' && <Award className="w-4 h-4" />}
                  {n.type === 'review' && <Star className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {n.title}
                  </h5>
                  <p className="text-[11px] line-clamp-2 mt-0.5" style={{ color: 'var(--color-muted)' }}>
                    {n.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
