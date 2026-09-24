import React from 'react';
import { Check, Sparkles, Building, Briefcase, Award, ShieldCheck, Zap } from 'lucide-react';

interface PricingSectionProps {
  onJoinFree: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onJoinFree }) => {
  const plans = [
    {
      name: 'Free Campus Tier',
      price: '₹0',
      period: '/month forever',
      badge: 'Student Essential',
      description: 'Everything you need to exchange skills and learn with college peers for zero fees.',
      features: [
        'Peer-to-peer skill matching',
        'Verified student profile & college badge',
        'In-app real-time messaging & chat',
        '1-on-1 video sessions with screen sharing',
        'Streaks, reviews & achievement badges',
        'Campus discover directory access'
      ],
      cta: 'Start Free Today',
      popular: false
    },
    {
      name: 'SkillSwap Pro',
      price: 'Coming soon',
      period: '',
      badge: 'Coming Soon',
      description: 'Power tools for students building serious portfolio projects and interview readiness.',
      features: [
        'Unlimited AI matching recommendations',
        'Priority skill exchange queue placement',
        'Recorded sessions with AI study notes & summaries',
        'Verified Skill Mastery credentials for LinkedIn',
        'Detailed learning velocity & skill analytics',
        'Direct intro to campus hackathon team captains'
      ],
      cta: 'Coming Soon',
      popular: false,
      isComingSoon: true
    }
  ];

  const futureModels = [
    {
      icon: Building,
      title: 'College Subscriptions',
      description: 'University departments license SkillSwap to track student peer tutoring hours and boost campus placement percentages.'
    },
    {
      icon: Briefcase,
      title: 'Hiring & Recruiter Partnerships',
      description: 'Top tech employers directly scout verified students who have proven their mastery by actively teaching difficult concepts.'
    },
    {
      icon: Sparkles,
      title: 'Sponsored Learning Tracks',
      description: 'Cloud and developer tool brands (AWS, GitHub, Supabase) sponsor hands-on tracks with swags and cloud credits.'
    },
    {
      icon: Award,
      title: 'Verified Certificates',
      description: 'Cryptographically verifiable completion certificates endorsed by student peers and campus mentors.'
    }
  ];

  return (
    <section
      id="pricing"
      className="py-20"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderTop: '1px solid var(--color-soft)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-primary)' }}
          >
            Transparent Campus Pricing
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Free to Learn. Scaled for Real Growth.
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Our philosophy is <strong style={{ color: 'var(--color-text)' }}>One skill in, one skill out</strong>. The core peer exchange is and always will be 100% free for students.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className="relative p-8 transition-all flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: p.popular ? '2px solid var(--color-primary)' : '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              {p.popular && (
                <span
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Most Popular for Serious Learners
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3
                    className="text-xl font-medium"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {p.name}
                  </h3>
                  <span
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    {p.badge}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className="text-3xl sm:text-4xl font-medium"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {p.price}
                  </span>
                  {p.period && (
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {p.period}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {p.description}
                </p>

                <div
                  className="mt-6 pt-6 space-y-3"
                  style={{ borderTop: '1px solid var(--color-soft)' }}
                >
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3 text-xs" style={{ color: 'var(--color-text)' }}>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          backgroundColor: 'var(--color-soft)',
                          color: 'var(--color-primary)'
                        }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                {p.isComingSoon ? (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="w-full py-3 rounded-full font-medium text-xs cursor-not-allowed opacity-60"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-muted)',
                      border: '1px solid var(--color-soft)'
                    }}
                  >
                    {p.cta}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onJoinFree}
                    className="w-full py-3 rounded-full font-medium text-xs transition-all active:scale-95 cursor-pointer hover:opacity-90"
                    style={{
                      backgroundColor: p.popular ? 'var(--color-primary)' : 'var(--color-soft)',
                      color: p.popular ? '#FFFFFF' : 'var(--color-primary)'
                    }}
                  >
                    {p.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Staged Revenue Layers */}
        <div className="max-w-5xl mx-auto pt-10" style={{ borderTop: '1px solid var(--color-soft)' }}>
          <div className="text-center mb-10">
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-muted)' }}
            >
              Future Business Model & Expansion
            </span>
            <h3
              className="text-2xl font-medium mt-1"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Six Staged Layers of Campus Monetization
            </h3>
            <p className="text-xs sm:text-sm mt-1 max-w-xl mx-auto" style={{ color: 'var(--color-muted)' }}>
              Free first to win the campus, followed by institutional and enterprise partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {futureModels.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-5 transition-all"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-soft)',
                    borderRadius: 'var(--radius-card)'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {m.title}
                  </h4>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {m.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
