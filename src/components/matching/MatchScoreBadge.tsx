import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Flame, Check } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  showIcon?: boolean;
  showLabel?: boolean;
  label?: string;
  className?: string;
  animateCount?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  size = 'md',
  showBar = false,
  showIcon = true,
  showLabel = true,
  label = 'Match',
  className = '',
  animateCount = true
}) => {
  const [displayScore, setDisplayScore] = useState<number>(animateCount ? 0 : score);
  const [barWidth, setBarWidth] = useState<number>(0);

  useEffect(() => {
    if (!animateCount) {
      setDisplayScore(score);
      setBarWidth(score);
      return;
    }

    // Smooth count-up transition
    let startTimestamp: number | null = null;
    const duration = 750; // ms
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easedProgress * score);
      setDisplayScore(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayScore(score);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    // Slight delay for the progress bar fill transition
    const timer = setTimeout(() => {
      setBarWidth(score);
    }, 60);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, [score, animateCount]);

  const sizeClasses = {
    sm: {
      badge: 'px-2.5 py-0.5 text-[11px] gap-1',
      icon: 'w-3 h-3',
      barHeight: 'h-1'
    },
    md: {
      badge: 'px-3 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5',
      barHeight: 'h-1.5'
    },
    lg: {
      badge: 'px-4 py-1.5 text-sm gap-2',
      icon: 'w-4 h-4',
      barHeight: 'h-2'
    }
  }[size];

  return (
    <div className={`inline-flex flex-col items-end ${className}`}>
      {/* Target CSS selector .match-score-badge with .animate-match-score-fade-scale */}
      <div
        className={`match-score-badge animate-match-score-fade-scale flex flex-col items-center justify-center rounded-full font-medium ${sizeClasses.badge}`}
        style={{
          backgroundColor: 'var(--color-soft)',
          color: 'var(--color-primary)',
          border: '1px solid var(--color-soft)'
        }}
        title={`Compatibility: ${score}%`}
      >
        <div className="inline-flex items-center gap-1.5">
          {showIcon && <Sparkles className={`${sizeClasses.icon} shrink-0`} style={{ color: 'var(--color-primary)' }} />}
          <span className="tabular-nums tracking-tight font-medium">
            {displayScore}%{showLabel ? ` ${label}` : ''}
          </span>
        </div>

        {/* Progress bar inside .match-score-badge with CSS transition from 0% to calculated value */}
        {showBar && (
          <div
            className={`w-full rounded-full ${sizeClasses.barHeight} mt-1 overflow-hidden`}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
          >
            <div
              className="match-score-progress-bar h-full rounded-full"
              style={{
                width: `${barWidth}%`,
                backgroundColor: 'var(--color-primary)'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
