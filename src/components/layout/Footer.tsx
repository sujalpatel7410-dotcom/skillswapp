import React from 'react';
import { Sparkles, ShieldCheck, Heart, Github, GraduationCap } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      className="pt-16 pb-12 transition-colors"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-soft)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12"
          style={{ borderBottom: '1px solid var(--color-soft)' }}
        >
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-lg font-medium tracking-tight"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                SkillSwap
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              The peer-to-peer skill exchange platform for college students. One skill in, one skill out.
            </p>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium"
              style={{
                backgroundColor: 'var(--color-soft)',
                color: 'var(--color-primary)'
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
              <span>Verified Campus Community</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-3">
            <h4
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Platform
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--color-muted)' }}>
              <li>
                <button onClick={() => onNavigate('/discover')} className="hover:opacity-75 transition-opacity cursor-pointer">
                  Campus Discover
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/matches')} className="hover:opacity-75 transition-opacity cursor-pointer">
                  AI Matching Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/leaderboard')} className="hover:opacity-75 transition-opacity cursor-pointer">
                  College Leaderboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/badges')} className="hover:opacity-75 transition-opacity cursor-pointer">
                  Achievement Badges
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: About & Model */}
          <div className="space-y-3">
            <h4
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Concept & Vision
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--color-muted)' }}>
              <li>
                <button onClick={() => onNavigate('/how-it-works')} className="hover:opacity-75 transition-opacity cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pricing')} className="hover:opacity-75 transition-opacity cursor-pointer">
                  Business Model & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:opacity-75 transition-opacity cursor-pointer">
                  Student Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Network */}
          <div className="space-y-3">
            <h4
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Supported Universities
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Connecting students across Gujarat Technological University (GTU), IIT Bombay, DTU Delhi, VIT Vellore, BITS Pilani, and 50+ institutes.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-muted)' }}>
              <GraduationCap className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Free student access with verified ID</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'var(--color-muted)' }}>
          <div>
            © {new Date().getFullYear()} SkillSwap — Learn by Teaching. Built for collegiate peer learning.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              One skill in, one skill out 🎓
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
