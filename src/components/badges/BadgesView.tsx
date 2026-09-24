import React from 'react';
import { Award, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { User, Badge } from '../../types';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

interface BadgesViewProps {
  currentUser: User;
}

export const BadgesView: React.FC<BadgesViewProps> = ({ currentUser }) => {
  const allBadges = storageService.getBadges();
  const userBadgeIds = currentUser.badges || [];

  const handleCelebrate = (badgeTitle: string) => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const categories = ['Teaching', 'Learning', 'Streaks', 'Special'];

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          <h1
            className="text-2xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Badges & Peer Achievements
          </h1>
        </div>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Earn recognition as you teach, learn, and maintain consistency. Unlocked badges display on your public campus profile.
        </p>
      </div>

      {/* Summary Banner */}
      <div
        className="p-6 text-white flex items-center justify-between"
        style={{
          backgroundColor: 'var(--color-primary)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div>
          <span className="text-xs uppercase font-medium tracking-wider text-white/80">
            Achievement Score
          </span>
          <h2 className="text-3xl font-medium mt-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            {userBadgeIds.length} of {allBadges.length} Unlocked
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Complete peer sessions to unlock the remaining credentials.
          </p>
        </div>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          🏆
        </div>
      </div>

      {/* Categorized Badges */}
      {categories.map(cat => {
        const catBadges = allBadges.filter(b => b.category === cat);
        if (catBadges.length === 0) return null;

        return (
          <div key={cat} className="space-y-4">
            <h3
              className="text-base font-medium flex items-center gap-2"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
              <span>{cat} Badges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catBadges.map(badge => {
                const isUnlocked = userBadgeIds.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className="p-5 flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)',
                      opacity: isUnlocked ? 1 : 0.75
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{
                            backgroundColor: 'var(--color-soft)',
                            filter: isUnlocked ? 'none' : 'grayscale(100%)'
                          }}
                        >
                          {badge.icon}
                        </div>

                        {isUnlocked ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-soft)',
                              color: 'var(--color-primary)'
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Unlocked
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-bg)',
                              color: 'var(--color-muted)'
                            }}
                          >
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        )}
                      </div>

                      <h4
                        className="font-medium text-sm"
                        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                      >
                        {badge.title}
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        {badge.description}
                      </p>

                      {!isUnlocked && (
                        <div
                          className="mt-3 p-2.5 rounded-xl text-[11px] font-medium"
                          style={{
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-muted)',
                            border: '1px solid var(--color-soft)'
                          }}
                        >
                          🎯 Requirement: {badge.requirement}
                        </div>
                      )}
                    </div>

                    {isUnlocked && (
                      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--color-soft)' }}>
                        <button
                          type="button"
                          onClick={() => handleCelebrate(badge.title)}
                          className="w-full py-1.5 rounded-full text-xs font-medium cursor-pointer transition-opacity flex items-center justify-center gap-1 hover:opacity-85"
                          style={{
                            backgroundColor: 'var(--color-soft)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Celebrate Badge</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
