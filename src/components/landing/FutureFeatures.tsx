import React, { useState } from 'react';
import { Briefcase, Trophy, Sparkles, MapPin, DollarSign, ArrowUpRight } from 'lucide-react';
import { Modal } from '../ui/Modal';

export const FutureFeatures: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modules = [
    {
      id: 'hackathon',
      icon: Trophy,
      tag: 'Collaboration',
      title: 'Hackathon Team Finder',
      status: 'Beta Available',
      description: 'Find complementary teammates (e.g. 1 Frontend + 1 ML + 1 Designer) in minutes for upcoming collegiate hackathons.',
      previewText: 'Pairs your skills with complementary teammates across GTU, IIT Bombay, DTU, and BITS for SIH and campus hackathons.'
    },
    {
      id: 'mentor',
      icon: Sparkles,
      tag: 'AI Guidance',
      title: 'AI Learning Mentor',
      status: 'Live Prototype',
      description: 'A personal AI guide that analyzes your skill gaps, suggests what to learn next, and curates tailored peer exchange syllabi.',
      previewText: 'Dynamically structures peer tutoring sessions into 4-week milestones with project deliverables.'
    },
    {
      id: 'internship',
      icon: Briefcase,
      tag: 'Career',
      title: 'Internship Skill Matching',
      status: 'Coming Q1',
      description: 'Directly maps verified skills on your profile to internship openings with startup partners, bypassing ATS resume filters.',
      previewText: 'Show verified student review ratings and hours taught directly on your applicant profile.'
    },
    {
      id: 'groups',
      icon: MapPin,
      tag: 'Campus Life',
      title: 'Local Campus Study Groups',
      status: 'Coming Soon',
      description: 'Form physical study pods in campus libraries and hostels based on shared academic modules and exam preparation.',
      previewText: 'Discover students preparing for the same midterm or semester exam in your campus wing.'
    },
    {
      id: 'freelance',
      icon: DollarSign,
      tag: 'Monetization (Flagship)',
      title: 'Student Freelance Marketplace',
      status: 'Flagship Vision',
      description: 'Turn your taught skills into your first paid freelance gigs with trusted collegiate startups and alumni businesses.',
      previewText: 'Graduate from free peer skill swaps to paid micro-consulting and design commissions.'
    }
  ];

  return (
    <section className="py-20" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-primary)' }}
          >
            Roadmap & Architecture
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            The Campus Career Ecosystem
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            SkillSwap is designed to evolve from peer skill exchange into a comprehensive collegiate talent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => setActiveModal(mod.id)}
                className="group p-6 transition-all cursor-pointer flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-soft)',
                  borderRadius: 'var(--radius-card)'
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform"
                      style={{
                        backgroundColor: 'var(--color-soft)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className="text-[10px] font-medium px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--color-soft)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      {mod.status}
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {mod.tag}
                  </span>
                  <h3
                    className="text-base font-medium mt-0.5"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {mod.title}
                  </h3>
                  <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {mod.description}
                  </p>
                </div>

                <div
                  className="mt-6 pt-4 flex items-center justify-between text-xs font-medium"
                  style={{
                    borderTop: '1px solid var(--color-soft)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <span>View Module Spec</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Specification Details */}
        <Modal
          isOpen={activeModal !== null}
          onClose={() => setActiveModal(null)}
          title={modules.find(m => m.id === activeModal)?.title}
          subtitle={modules.find(m => m.id === activeModal)?.tag}
          maxWidth="lg"
        >
          {activeModal && (
            <div className="space-y-4 text-xs sm:text-sm" style={{ color: 'var(--color-text)' }}>
              <div
                className="p-3.5 rounded-xl font-normal"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                <span className="font-medium">Architecture Note:</span> This module integrates with the core SkillSwap user profile and verified skills graph without requiring schema migrations.
              </div>

              <p className="leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                {modules.find(m => m.id === activeModal)?.previewText}
              </p>

              <div
                className="p-4 space-y-2"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  borderRadius: 'var(--radius-card)'
                }}
              >
                <h4
                  className="font-medium text-xs uppercase tracking-wider"
                  style={{ color: 'var(--color-text)' }}
                >
                  Technical Specifications
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                  <li>Leverages Firestore <code style={{ color: 'var(--color-primary)' }}>userSkills</code> and mutual verification scores</li>
                  <li>Real-time push notifications for matched hackathons and job openings</li>
                  <li>Student identity protected through institutional verification checks</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-full font-medium text-xs cursor-pointer hover:opacity-85 transition-opacity"
                  style={{
                    backgroundColor: 'var(--color-soft)',
                    color: 'var(--color-primary)'
                  }}
                >
                  Close Spec
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </section>
  );
};
