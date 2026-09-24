import React from 'react';
import { ShieldX, IndianRupee, EyeOff, Users2 } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: ShieldX,
      tag: 'Lack of Trust',
      title: 'No trusted platform',
      description:
        'Students have immense skills across programming, design, and math, but have no verified, secure environment to safely teach or learn from real peers.'
    },
    {
      icon: IndianRupee,
      tag: 'Cost Barrier',
      title: 'Courses are expensive',
      description:
        'Commercial bootcamps and certifications charge ₹15,000–₹50,000. For budget-conscious college students, high costs restrict hands-on practical upskilling.'
    },
    {
      icon: EyeOff,
      tag: 'Invisible Skills',
      title: 'Hidden talent',
      description:
        'Talented coders, designers, and 3D artists in the very same campus hostel or department often never know each other exists until after graduation.'
    },
    {
      icon: Users2,
      tag: 'Isolation',
      title: 'Weak collaboration',
      description:
        'Traditional classes enforce lecture-only learning with very limited opportunities for deep peer-to-peer collaboration, code review, and project building.'
    }
  ];

  return (
    <section
      className="py-20"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderTop: '1px solid var(--color-soft)',
        borderBottom: '1px solid var(--color-soft)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-primary)' }}
          >
            The Campus Reality
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Why College Students Are Stuck
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Talent already exists on every campus — but students lack a structured, trusted platform to exchange it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 transition-all flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-soft)',
                  borderRadius: 'var(--radius-card)'
                }}
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
                  </div>

                  <span
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {p.tag}
                  </span>

                  <h3
                    className="text-lg font-medium mt-1 mb-2.5"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {p.description}
                  </p>
                </div>

                <div
                  className="mt-6 pt-4 flex items-center justify-between text-[11px] font-medium"
                  style={{
                    borderTop: '1px solid var(--color-soft)',
                    color: 'var(--color-muted)'
                  }}
                >
                  <span>Issue #0{idx + 1}</span>
                  <span style={{ color: 'var(--color-primary)' }}>
                    Solved by SkillSwap →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
