import React, { useState } from 'react';
import { UserCheck, BookPlus, Sparkles, Video, TrendingUp, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      step: '01',
      title: 'Register & Verify',
      subtitle: 'Verified Campus Identity',
      icon: UserCheck,
      description:
        'Sign up using your college email or student ID. Instant verification ensures safety, accountability, and real peer trust across campus.',
      details: 'Universities like IIT Bombay, GTU, DTU, VIT, BITS, and NITs.'
    },
    {
      step: '02',
      title: 'Add Your Skills',
      subtitle: 'One In, One Out',
      icon: BookPlus,
      description:
        'Specify the skills you can comfortably teach (e.g. Python, C++, Figma) and the subjects you want to master (e.g. AI/ML, Cloud, Premiere Pro).',
      details: 'Set your experience level (Beginner to Expert) and your weekly availability slots.'
    },
    {
      step: '03',
      title: 'AI Match Engine',
      subtitle: 'Pairing Synergies',
      icon: Sparkles,
      description:
        'Our algorithm identifies mutual learning pairs where student A teaches what student B wants, while student B teaches what student A needs.',
      details: 'Scores are weighted by availability overlap, campus proximity, ratings, and skill levels.'
    },
    {
      step: '04',
      title: 'Learn Live 1-on-1',
      subtitle: 'In-App Video & Chat',
      icon: Video,
      description:
        'Meet your peer inside SkillSwap with integrated video calling, screen sharing, live code walk-throughs, and collaborative notes.',
      details: 'No Zoom links or sketchy third-party apps needed — zero friction from chat to call.'
    },
    {
      step: '05',
      title: 'Grow & Level Up',
      subtitle: 'Streaks & Portfolio Proof',
      icon: TrendingUp,
      description:
        'Submit mutual ratings, unlock achievement badges, and build a verified teaching record that hiring managers and recruiters love.',
      details: 'Every review sharpens the matching engine to pair you with even better partners.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-primary)' }}
          >
            5 Simple Steps
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            How SkillSwap Works
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            From registration to your first completed skill exchange — built for effortless peer learning.
          </p>
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden lg:block relative mb-12">
          {/* Continuous progress connector line */}
          <div
            className="absolute top-1/2 left-8 right-8 -translate-y-7 h-0.5 -z-0"
            style={{ backgroundColor: 'var(--color-soft)' }}
          />
          <div
            className="absolute top-1/2 left-8 -translate-y-7 h-0.5 transition-all duration-500 -z-0"
            style={{
              backgroundColor: 'var(--color-primary)',
              width: `${(activeStep / (steps.length - 1)) * 88}%`
            }}
          />

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = activeStep === idx;
              const isPast = idx < activeStep;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center text-center cursor-pointer group"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-300"
                    style={{
                      backgroundColor: isCurrent
                        ? 'var(--color-primary)'
                        : isPast
                        ? 'var(--color-soft)'
                        : 'var(--color-surface)',
                      color: isCurrent
                        ? '#FFFFFF'
                        : isPast
                        ? 'var(--color-primary)'
                        : 'var(--color-muted)',
                      border: isCurrent || isPast ? 'none' : '1px solid var(--color-soft)'
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className="text-[11px] font-medium mt-4 uppercase tracking-wider"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Step {s.step}
                  </span>
                  <h4
                    className="text-sm font-medium mt-1 transition-colors"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {s.title}
                  </h4>
                  <p className="text-xs mt-1 line-clamp-2 px-1" style={{ color: 'var(--color-muted)' }}>
                    {s.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Step Details Card (Desktop) */}
        <div
          className="hidden lg:block max-w-3xl mx-auto p-6 transition-all"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="flex items-start gap-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {steps[activeStep].step}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3
                  className="text-lg font-medium"
                  style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                >
                  {steps[activeStep].title} — {steps[activeStep].subtitle}
                </h3>
                <span
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Step {activeStep + 1} of 5
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {steps[activeStep].description}
              </p>
              <div
                className="mt-3 text-xs font-medium px-3.5 py-2 rounded-full"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                💡 {steps[activeStep].details}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden space-y-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative pl-12 pb-2 last:pb-0"
              >
                <div
                  className="absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div
                  className="p-5"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-soft)',
                    borderRadius: 'var(--radius-card)'
                  }}
                >
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Step {s.step}
                  </span>
                  <h3
                    className="text-base font-medium mt-0.5"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {s.description}
                  </p>
                  <p className="text-[11px] mt-2 font-medium" style={{ color: 'var(--color-primary)' }}>
                    💡 {s.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback Loop Callout - Highlight card style: background var(--color-primary), text white */}
        <div
          className="mt-14 p-6 text-white max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-card)'
          }}
        >
          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-medium uppercase tracking-wider text-white/90 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-white" />
              Continuous Feedback Loop
            </div>
            <h4 className="text-lg font-medium text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Better Reviews → Sharper Matching Precision
            </h4>
            <p className="text-xs text-white/80 max-w-xl">
              Every completed session, mutual rating, and earned badge feeds back into your student profile —
              boosting your campus trust score and pairing you with motivated peers.
            </p>
          </div>
          <div
            className="px-5 py-3 rounded-full text-xs font-medium text-white text-center shrink-0"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
          >
            Register → Add Skills → Match → Learn Live → Grow ↺
          </div>
        </div>
      </div>
    </section>
  );
};
