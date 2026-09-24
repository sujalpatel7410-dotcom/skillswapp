import React from 'react';
import { Flame, Clock, BookOpen, Trophy, Sparkles, TrendingUp, Award } from 'lucide-react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';

interface ProgressViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ currentUser, onNavigate }) => {
  const userSkills = storageService.getUserSkills(currentUser.id);
  const badges = storageService.getBadges().filter(b => currentUser.badges?.includes(b.id));

  // Category distributions
  const categoryCounts: Record<string, number> = {};
  userSkills.forEach(s => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const streakDays = [
    { day: 'Mon', active: true },
    { day: 'Tue', active: true },
    { day: 'Wed', active: true },
    { day: 'Thu', active: true },
    { day: 'Fri', active: true },
    { day: 'Sat', active: true },
    { day: 'Sun', active: true }
  ];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-medium tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          Learning Progress & Velocity
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Track your peer learning consistency, exchange hours, and milestone achievements.
        </p>
      </div>

      {/* Streak Hero Card */}
      <div
        className="p-8 text-white relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-primary)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)' }}
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Campus Learning Streak Active</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {currentUser.learningStreak} Days in a Row! 🔥
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-md">
              Keep exchanging skills weekly to maintain your streak and unlock the 30-Day Campus Legend badge.
            </p>
          </div>

          {/* Weekday streak badges */}
          <div
            className="flex items-center gap-2 p-3 rounded-2xl"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
          >
            {streakDays.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full font-medium text-xs flex items-center justify-center"
                  style={{ backgroundColor: '#FFFFFF', color: 'var(--color-primary)' }}
                >
                  ✓
                </div>
                <span className="text-[10px] font-medium text-white/80">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Metric Cards: Hours Taught vs Learned */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Hours Taught</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-medium" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
              {currentUser.hoursTaught}h
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>+2.5h this week</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--color-muted)' }}>
            Shared with 6 student peers across Python and C++.
          </p>
        </div>

        <div
          className="p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Hours Learned</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-medium" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
              {currentUser.hoursLearned}h
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>+3.0h this week</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--color-muted)' }}>
            Studied Photoshop and Machine Learning foundations.
          </p>
        </div>

        <div
          className="p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Exchange Ratio</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-medium" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              1.0 : 1.05
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>Balanced</span>
          </div>
          <p className="text-[11px] mt-2" style={{ color: 'var(--color-muted)' }}>
            Perfect adherence to "One skill in, one skill out".
          </p>
        </div>
      </div>

      {/* Skill Level Progression Bars */}
      <div
        className="p-6 space-y-5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <h3
          className="text-base font-medium flex items-center gap-2"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span>Skill Mastery Progressions</span>
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                Python (Advanced → Expert)
              </span>
              <span className="font-medium" style={{ color: 'var(--color-primary)' }}>82% Verified</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-soft)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: '82%', backgroundColor: 'var(--color-primary)' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                Photoshop & UI Design (Beginner → Intermediate)
              </span>
              <span className="font-medium" style={{ color: 'var(--color-primary)' }}>55% Verified</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-soft)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: '55%', backgroundColor: 'var(--color-primary)' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                Machine Learning (Beginner → Intermediate)
              </span>
              <span className="font-medium" style={{ color: 'var(--color-primary)' }}>40% Verified</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-soft)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: '40%', backgroundColor: 'var(--color-primary)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
