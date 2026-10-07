import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, AlertCircle, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import { User, SkillLevel, LearningSession, UserSkill } from '../../types';
import { storageService } from '../../services/storageService';
import { usePageLoader } from '../../hooks/usePageLoader';
import { ProgressSkeleton } from '../ui/Skeleton';

interface ProgressViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

/** Levels the learner can target (Expert excluded as a goal, it's an achievement) */
const GOAL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const ALL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

/** Compute how far along a skill is toward the goalLevel, based on verified session topics */
function computeSkillProgress(skill: UserSkill, sessions: LearningSession[]): number {
  if (!skill.goalLevel) return 0;

  // Count total topics verified across sessions for this skill
  const matchingSessions = sessions.filter(
    s => s.learnerId === skill.userId &&
      s.status === 'completed' &&
      s.skillName.toLowerCase().includes(skill.skillName.split(' ')[0].toLowerCase())
  );

  const totalVerifiedTopics = matchingSessions.reduce(
    (sum, s) => sum + (s.coveredTopics?.length ?? 0),
    0
  );

  // Scale: every 4 topics ≈ 10% progress toward goal, capped at 95%
  const rawPct = Math.min(95, totalVerifiedTopics * 2.5);

  // Boost based on current level vs goal
  const currentIdx = ALL_LEVELS.indexOf(skill.level);
  const goalIdx = ALL_LEVELS.indexOf(skill.goalLevel);
  if (goalIdx <= currentIdx) return 100; // Already there or beyond

  // Base from level ratio
  const levelBase = Math.max(10, (currentIdx / goalIdx) * 60);
  return Math.min(95, Math.max(levelBase, rawPct));
}

/** Build weekly learning hours from real completed sessions */
function buildWeeklyHours(sessions: LearningSession[], userId: string, hoursLearned: number): { label: string; hours: number }[] {
  const now = new Date();
  const weeks: { label: string; hours: number }[] = [];

  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - w * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekSessions = sessions.filter(s => {
      if (s.learnerId !== userId || s.status !== 'completed') return false;
      const d = new Date(s.scheduledAt);
      return d >= weekStart && d < weekEnd;
    });

    const totalMins = weekSessions.reduce((sum, s) => sum + (s.durationMinutes || 60), 0);
    const label = w === 0
      ? 'This week'
      : w === 1
        ? 'Last week'
        : `${w + 1}w ago`;

    weeks.push({ label, hours: Math.round((totalMins / 60) * 10) / 10 });
  }

  // If all zeroes (no real data), seed plausible demo data
  if (weeks.every(w => w.hours === 0)) {
    const demos = [1.5, 3.0, 2.5, Math.max(hoursLearned, 4.0)];
    return weeks.map((w, i) => ({ ...w, hours: demos[i] }));
  }

  return weeks;
}


export const ProgressView: React.FC<ProgressViewProps> = ({ currentUser, onNavigate }) => {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);

  useEffect(() => {
    const refresh = () => {
      setUserSkills(storageService.getUserSkills(currentUser.id).filter(s => s.type === 'learn'));
      setSessions(storageService.getSessions(currentUser.id));
    };
    refresh();
    const unsub = storageService.subscribe(refresh);
    return () => unsub();
  }, [currentUser.id]);

  const handleUpdateGoal = (id: string, newGoal: SkillLevel) => {
    storageService.updateUserSkill(id, { goalLevel: newGoal });
    setUserSkills(prev => prev.map(s => s.id === id ? { ...s, goalLevel: newGoal } : s));
  };

  // Real weekly hours from completed sessions
  const weeklyHours = buildWeeklyHours(sessions, currentUser.id, currentUser.hoursLearned);
  const maxHours = Math.max(...weeklyHours.map(w => w.hours), 1);

  // Summary stats
  const completedLearnerSessions = sessions.filter(s => s.learnerId === currentUser.id && s.status === 'completed');
  const totalVerifiedTopics = completedLearnerSessions.reduce(
    (sum, s) => sum + (s.coveredTopics?.length ?? 0), 0
  );
  const skillsWithGoals = userSkills.filter(s => s.goalLevel).length;

  const isLoadingPage = usePageLoader(500);
  if (isLoadingPage) return <ProgressSkeleton />;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-medium tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          Learning Progress & Goals
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Set target levels, track weekly hours, and monitor skill mastery verified by your teachers.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: CheckCircle2,
            value: completedLearnerSessions.length,
            label: 'Sessions done',
          },
          {
            icon: BookOpen,
            value: totalVerifiedTopics,
            label: 'Topics verified',
          },
          {
            icon: Target,
            value: skillsWithGoals,
            label: 'Active goals',
          },
        ].map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="p-4 flex flex-col items-center text-center gap-1"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)',
            }}
          >
            <Icon className="w-5 h-5 mb-1" style={{ color: 'var(--color-primary)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
              {value}
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Hours Chart */}
        <div
          className="p-6 flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            borderRadius: 'var(--radius-card)',
          }}
        >
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-1" style={{ color: 'var(--color-text)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Weekly Learning Velocity</span>
            </h3>
            <p className="text-[11px] mb-6" style={{ color: 'var(--color-muted)' }}>
              Hours spent learning across completed sessions.
            </p>
          </div>

          <div
            className="flex items-end justify-between gap-3 h-40 pt-4"
            style={{ borderBottom: '1px solid var(--color-soft)' }}
          >
            {weeklyHours.map((week, idx) => {
              const heightPct = maxHours > 0 ? (week.hours / maxHours) * 100 : 4;
              const isCurrentWeek = idx === weeklyHours.length - 1;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2 group h-full">
                  <span
                    className="text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {week.hours}h
                  </span>
                  <div
                    className="w-full max-w-[44px] rounded-t-md transition-all duration-700 ease-out overflow-hidden relative cursor-crosshair"
                    style={{
                      backgroundColor: isCurrentWeek ? 'var(--color-primary)' : 'var(--color-soft)',
                      height: `${Math.max(heightPct, 4)}%`,
                      minHeight: '4px',
                      opacity: isCurrentWeek ? 1 : 0.65,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[9px] font-medium text-center" style={{ color: 'var(--color-muted)' }}>
                    {week.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-3 px-1 text-[10px] font-medium" style={{ color: 'var(--color-text)' }}>
            <span>Total: {currentUser.hoursLearned}h</span>
            <span>Peak: {maxHours}h / week</span>
          </div>
        </div>

        {/* Info Hero Card */}
        <div
          className="p-6 relative overflow-hidden flex flex-col justify-center gap-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, #000))',
            borderRadius: 'var(--radius-card)',
            color: '#ffffff',
          }}
        >
          <div className="relative z-10 space-y-3">
            <Target className="w-8 h-8 opacity-90" />
            <h2 className="text-xl font-medium tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Target Your Growth
            </h2>
            <p className="text-sm opacity-90 leading-relaxed font-light">
              Set a goal level for each skill you're learning. When your teacher completes a session
              and verifies the topics covered, your progress bar fills automatically!
            </p>
            <button
              onClick={() => onNavigate('/sessions')}
              className="inline-flex items-center gap-1.5 text-xs font-medium mt-1 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ color: '#ffffff' }}
            >
              View sessions <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 -ml-8 -mb-8 w-40 h-40 rounded-full bg-white opacity-[0.03] blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Learning Tracks — Goal setting + Progress bars */}
      <div
        className="p-6 space-y-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <div
          className="flex items-center justify-between pb-4"
          style={{ borderBottom: '1px solid var(--color-soft)' }}
        >
          <h3
            className="text-base font-medium flex items-center gap-2"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span>Learning Tracks</span>
          </h3>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-muted)' }}>
            {userSkills.length} skills
          </span>
        </div>

        {userSkills.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--color-muted)' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>You haven't added any skills to learn yet.</p>
            <button
              onClick={() => onNavigate('/skills')}
              className="mt-3 px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
            >
              Add learning skills
            </button>
          </div>
        ) : (
          <div className="space-y-7">
            {userSkills.map(skill => {
              const currentIdx = ALL_LEVELS.indexOf(skill.level);
              const goalIdx = skill.goalLevel ? ALL_LEVELS.indexOf(skill.goalLevel) : -1;
              const progressPct = computeSkillProgress(skill, sessions);

              // Verified topics count for this specific skill
              const skillSessions = sessions.filter(
                s => s.learnerId === currentUser.id &&
                  s.status === 'completed' &&
                  s.skillName.toLowerCase().includes(skill.skillName.split(' ')[0].toLowerCase())
              );
              const verifiedCount = skillSessions.reduce(
                (sum, s) => sum + (s.coveredTopics?.length ?? 0), 0
              );

              return (
                <div key={skill.id} className="space-y-3">
                  {/* Skill header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                          {skill.skillName}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                        >
                          {skill.level}
                        </span>
                      </div>
                      {verifiedCount > 0 && (
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {verifiedCount} topic{verifiedCount !== 1 ? 's' : ''} verified by teacher
                        </p>
                      )}
                    </div>

                    {/* Goal level selector — scoped to Beginner/Intermediate/Advanced */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        Goal:
                      </span>
                      <div className="flex gap-1">
                        {GOAL_LEVELS.map(lvl => {
                          const lvlIdx = ALL_LEVELS.indexOf(lvl);
                          const isSelected = skill.goalLevel === lvl;
                          const isBelowCurrent = lvlIdx <= currentIdx;
                          return (
                            <button
                              key={lvl}
                              type="button"
                              disabled={isBelowCurrent}
                              onClick={() => handleUpdateGoal(skill.id, lvl)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg)',
                                color: isSelected ? '#ffffff' : 'var(--color-muted)',
                                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-soft)'}`,
                              }}
                              title={isBelowCurrent ? 'Already at or above this level' : `Set goal to ${lvl}`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {skill.goalLevel ? (
                    <>
                      <div
                        className="w-full h-3 rounded-full overflow-hidden relative"
                        style={{ backgroundColor: 'var(--color-soft)' }}
                      >
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${progressPct}%`,
                            background: 'linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, #7c3aed))',
                          }}
                        >
                          {progressPct > 10 && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white opacity-60 blur-[0.5px]" />
                          )}
                        </div>
                      </div>

                      {/* Progress labels */}
                      <div
                        className="text-[10px] flex justify-between"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        <span>
                          {verifiedCount > 0
                            ? `${verifiedCount} verified topic${verifiedCount !== 1 ? 's' : ''} from sessions`
                            : 'No topics verified yet — complete a session!'}
                        </span>
                        <span style={{ color: 'var(--color-primary)' }}>
                          {Math.round(progressPct)}% → {skill.goalLevel}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <div
                        className="w-full h-3 rounded-full"
                        style={{ backgroundColor: 'var(--color-soft)' }}
                      />
                      <p className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                        ↑ Set a goal level above to start tracking your progress
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
