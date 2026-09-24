import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Sparkles, BookOpen, Clock, Heart, Award } from 'lucide-react';
import { User, SkillLevel } from '../../types';
import { storageService } from '../../services/storageService';
import confetti from 'canvas-confetti';

interface OnboardingWizardProps {
  user: User;
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const allSkills = storageService.getSkills();

  // Step 1 & 3: Teaching skills & levels
  const [teachSkills, setTeachSkills] = useState<{ name: string; level: SkillLevel; id: string }[]>([
    { name: 'Python', level: 'Advanced', id: 'sk-1' },
    { name: 'Web Development', level: 'Intermediate', id: 'sk-3' }
  ]);

  // Step 2: Learning skills
  const [learnSkills, setLearnSkills] = useState<{ name: string; id: string }[]>([
    { name: 'Machine Learning', id: 'sk-4' },
    { name: 'Photoshop', id: 'sk-7' }
  ]);

  // Step 4: Availability
  const [availability, setAvailability] = useState<string[]>([
    'Weekday Evenings (6 PM - 9 PM)',
    'Weekends (10 AM - 4 PM)'
  ]);

  // Step 5: Interests
  const [interests, setInterests] = useState<string[]>([
    'Generative AI',
    'Hackathons',
    'Open Source'
  ]);

  // Step 6: Bio & Goal
  const [bio, setBio] = useState<string>(user.bio || '');

  const availabilityOptions = [
    'Weekday Mornings (8 AM - 12 PM)',
    'Weekday Afternoons (12 PM - 5 PM)',
    'Weekday Evenings (6 PM - 9 PM)',
    'Weekends (10 AM - 4 PM)',
    'Flexible Schedule'
  ];

  const interestOptions = [
    'Generative AI',
    'Competitive Programming',
    'Hackathons',
    'Open Source',
    'UI/UX Design',
    'System Design',
    'Startup Building',
    'Academic Research',
    'Campus Clubs'
  ];

  const toggleTeachSkill = (skillId: string, skillName: string) => {
    const existing = teachSkills.find(s => s.id === skillId);
    if (existing) {
      setTeachSkills(teachSkills.filter(s => s.id !== skillId));
    } else {
      setTeachSkills([...teachSkills, { id: skillId, name: skillName, level: 'Intermediate' }]);
    }
  };

  const updateTeachLevel = (skillId: string, level: SkillLevel) => {
    setTeachSkills(
      teachSkills.map(s => (s.id === skillId ? { ...s, level } : s))
    );
  };

  const toggleLearnSkill = (skillId: string, skillName: string) => {
    const existing = learnSkills.find(s => s.id === skillId);
    if (existing) {
      setLearnSkills(learnSkills.filter(s => s.id !== skillId));
    } else {
      setLearnSkills([...learnSkills, { id: skillId, name: skillName }]);
    }
  };

  const toggleAvailability = (opt: string) => {
    if (availability.includes(opt)) {
      setAvailability(availability.filter(a => a !== opt));
    } else {
      setAvailability([...availability, opt]);
    }
  };

  const toggleInterest = (opt: string) => {
    if (interests.includes(opt)) {
      setInterests(interests.filter(i => i !== opt));
    } else {
      setInterests([...interests, opt]);
    }
  };

  const handleFinish = () => {
    // 1. Save user profile updates
    const updatedUser: User = {
      ...user,
      bio: bio || user.bio,
      availability,
      interests
    };
    storageService.saveUser(updatedUser);

    // 2. Clear old user skills and re-populate with selections
    teachSkills.forEach(ts => {
      storageService.addUserSkill({
        userId: user.id,
        skillId: ts.id,
        skillName: ts.name,
        category: 'Programming',
        type: 'teach',
        level: ts.level,
        experienceYears: 1
      });
    });

    learnSkills.forEach(ls => {
      storageService.addUserSkill({
        userId: user.id,
        skillId: ls.id,
        skillName: ls.name,
        category: 'AI / ML',
        type: 'learn',
        level: 'Beginner'
      });
    });

    // 3. Unlock welcome badge
    storageService.unlockBadge('badge-1');

    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        {/* Top Progress bar */}
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-soft)' }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(step / 6) * 100}%`,
              backgroundColor: 'var(--color-primary)'
            }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                {step}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                Step {step} of 6
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              Welcome, {user.name} 👋
            </span>
          </div>

          {/* STEP 1: Skills You Can Teach */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  What skills can you teach?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Pick at least 1 skill you're comfortable helping a fellow student with.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                {allSkills.map(skill => {
                  const isSelected = teachSkills.some(s => s.id === skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleTeachSkill(skill.id, skill.name)}
                      className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{skill.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Skills You Want to Learn */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  What skills do you want to learn?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  SkillSwap's AI will match you with peers who excel in these exact areas.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                {allSkills.map(skill => {
                  const isSelected = learnSkills.some(s => s.id === skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleLearnSkill(skill.id, skill.name)}
                      className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-800 dark:text-indigo-300 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{skill.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Set Skill Levels */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  How experienced are you in what you teach?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Helps peers find the right pacing for tutoring sessions.
                </p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto p-1">
                {teachSkills.map(s => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as SkillLevel[]).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => updateTeachLevel(s.id, lvl)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            s.level === lvl
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Availability */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  When are you free for skill swaps?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  We match you with students who share similar study hours.
                </p>
              </div>

              <div className="space-y-2.5">
                {availabilityOptions.map(opt => {
                  const isSelected = availability.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleAvailability(opt)}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-800 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span>{opt}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Learning Interests */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  What are your learning interests?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select topics you'd love to collaborate on or build hackathon projects around.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {interestOptions.map(opt => {
                  const isSelected = interests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterest(opt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Complete Profile */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  You're all set! Complete your student bio
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  A short bio helps peers understand your goals and say hello.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  About Me / Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g. 2nd year IT student passionate about fullstack coding. Looking for someone to swap ML knowledge for Web Dev!"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Summary Card */}
              <div
                className="p-4 rounded-2xl text-xs space-y-2"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Teaching:</span>
                  <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                    {teachSkills.map(s => s.name).join(', ') || 'None selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>Learning:</span>
                  <span className="font-medium" style={{ color: 'var(--color-primary)' }}>
                    {learnSkills.map(s => s.name).join(', ') || 'None selected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--color-muted)' }}>College:</span>
                  <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {user.collegeName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div
            className="mt-8 pt-4 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--color-soft)' }}
          >
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
                style={{
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-muted)'
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-full text-xs font-medium flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                Launch My SkillSwap
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
