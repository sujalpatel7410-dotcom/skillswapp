import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Repeat, Code, Palette, Zap } from 'lucide-react';

interface HeroSectionProps {
  onFindMatch: () => void;
  onExploreHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onFindMatch,
  onExploreHowItWorks
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge Pill */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-soft)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
            <span>The College Skill Exchange Network • One Skill In, One Skill Out</span>
          </div>

          {/* Main Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15]"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Learn What You Want.{' '}
            <span style={{ color: 'var(--color-primary)' }}>
              Teach What You Know.
            </span>
          </h1>

          {/* Supporting Text */}
          <p
            className="mt-6 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: 'var(--color-muted)' }}
          >
            SkillSwap connects students with campus peers who can teach the skills they want to learn —
            turning raw student talent into a collaborative learning network with zero course fees.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onFindMatch}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-medium text-sm flex items-center justify-center gap-2.5 transition-all group cursor-pointer"
              style={{
                backgroundColor: 'var(--color-soft)',
                color: 'var(--color-primary)'
              }}
            >
              <span>Find My Skill Match</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onExploreHowItWorks}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-medium text-sm transition-all cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-soft)'
              }}
            >
              Explore How It Works
            </button>
          </div>

          {/* College stats snippet */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs font-normal" style={{ color: 'var(--color-muted)' }}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Student Verification
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Smart Skill Matching
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Repeat className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              1:1 Live Video Exchange
            </span>
          </div>
        </div>

        {/* HERO VISUAL: Two Student Profiles Connected Through Skill Exchange */}
        <div className="mt-14 max-w-4xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Student A (Sujal) */}
            <div
              className="md:col-span-5 p-6 relative overflow-hidden transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                  alt="Sujal Patel"
                  className="w-14 h-14 rounded-full object-cover"
                  style={{ border: '1px solid var(--color-soft)' }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-base" style={{ color: 'var(--color-text)' }}>
                      Sujal Patel
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                    >
                      Verified
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    B.Sc. IT • Gujarat Tech Univ
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-primary)' }}>
                    ★ 4.95 (14 reviews)
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-text)' }}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5" style={{ color: 'var(--color-primary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" />
                      Teaches:
                    </span>
                    <span className="text-[10px] uppercase font-medium">
                      Advanced
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    Python, C++, Web Development
                  </p>
                </div>

                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                      Wants to Learn:
                    </span>
                    <span className="text-[10px] uppercase font-medium">
                      Goal
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    Photoshop, Machine Learning
                  </p>
                </div>
              </div>
            </div>

            {/* Central Animated Connector */}
            <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
              >
                <Repeat className="w-5 h-5" />
              </div>
              <div
                className="text-[10px] font-medium tracking-wider uppercase mt-2 text-center"
                style={{ color: 'var(--color-primary)' }}
              >
                94% Match
              </div>
            </div>

            {/* Student B (Rahul Sharma) */}
            <div
              className="md:col-span-5 p-6 relative overflow-hidden transition-all"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80"
                  alt="Rahul Sharma"
                  className="w-14 h-14 rounded-full object-cover"
                  style={{ border: '1px solid var(--color-soft)' }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-base" style={{ color: 'var(--color-text)' }}>
                      Rahul Sharma
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                    >
                      Verified
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                    B.Tech Design • DTU Delhi
                  </p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-primary)' }}>
                    ★ 4.92 (18 reviews)
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-text)' }}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5" style={{ color: 'var(--color-primary)' }}>
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5" />
                      Teaches:
                    </span>
                    <span className="text-[10px] uppercase font-medium">
                      Expert
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    Photoshop, Figma & UI/UX
                  </p>
                </div>

                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                >
                  <div className="flex items-center justify-between text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
                    <span className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                      Wants to Learn:
                    </span>
                    <span className="text-[10px] uppercase font-medium">
                      Goal
                    </span>
                  </div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    Python (Automating design scripts)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Underneath floating exchange bar */}
          <div
            className="mt-4 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
              <span className="font-medium" style={{ color: 'var(--color-primary)' }}>The Swap:</span> Sujal teaches Rahul Python scripting ⇄ Rahul teaches Sujal Photoshop graphic design.
            </div>
            <button
              onClick={onFindMatch}
              className="text-xs font-medium inline-flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
            >
              Simulate Match Request →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
