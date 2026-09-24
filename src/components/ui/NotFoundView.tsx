import React from 'react';
import { Compass, ArrowLeft, LayoutDashboard, Sparkles, Search } from 'lucide-react';

interface NotFoundViewProps {
  onNavigate: (route: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
      <div
        className="max-w-md w-full p-8 sm:p-10 text-center transition-all"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        {/* Animated Compass Icon */}
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-soft)',
            color: 'var(--color-primary)'
          }}
        >
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        {/* 404 Badge */}
        <span
          className="inline-block text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full mb-3"
          style={{
            backgroundColor: 'var(--color-soft)',
            color: 'var(--color-primary)'
          }}
        >
          404 • Page Not Found
        </span>

        {/* Title */}
        <h1
          className="text-2xl font-medium mb-2 tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          Lost on Campus?
        </h1>

        {/* Friendly explanation */}
        <p className="text-xs sm:text-sm mb-8 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The page or skill exchange you are looking for might have been moved, renamed, or doesn't exist. Let's get you back to learning and sharing skills.
        </p>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-medium text-white flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Go to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/matches')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-85 active:scale-95"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Find Matches</span>
          </button>
        </div>

        {/* Secondary Back Link */}
        <div className="pt-5 flex items-center justify-center gap-4 text-xs" style={{ borderTop: '1px solid var(--color-soft)' }}>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 cursor-pointer hover:underline"
            style={{ color: 'var(--color-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
          <span style={{ color: 'var(--color-soft)' }}>•</span>
          <button
            type="button"
            onClick={() => onNavigate('/discover')}
            className="inline-flex items-center gap-1.5 cursor-pointer hover:underline"
            style={{ color: 'var(--color-muted)' }}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Discover Peers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
