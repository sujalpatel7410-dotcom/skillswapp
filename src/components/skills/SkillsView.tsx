import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Sparkles, Check, ArrowRight } from 'lucide-react';
import { User, UserSkill, SkillLevel, SkillCategory } from '../../types';
import { storageService } from '../../services/storageService';
import { SkillChip } from '../ui/SkillChip';
import { Modal } from '../ui/Modal';

interface SkillsViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({ currentUser, onNavigate }) => {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'teach' | 'learn'>('teach');

  // New skill form fields
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<SkillCategory>('Programming');
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [experienceYears, setExperienceYears] = useState('1');
  const [learningGoal, setLearningGoal] = useState('');

  useEffect(() => {
    const update = () => {
      setSkills(storageService.getUserSkills(currentUser.id));
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [currentUser.id]);

  const teachingSkills = skills.filter(s => s.type === 'teach');
  const learningSkills = skills.filter(s => s.type === 'learn');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    storageService.addUserSkill({
      userId: currentUser.id,
      skillId: `sk-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      skillName: skillName.trim(),
      category,
      type: modalType,
      level,
      experienceYears: parseInt(experienceYears, 10) || 1,
      learningGoal: modalType === 'learn' ? learningGoal : undefined
    });

    setSkillName('');
    setLearningGoal('');
    setIsAddModalOpen(false);
  };

  const handleRemoveSkill = (skillId: string) => {
    storageService.removeUserSkill(skillId);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            My Skills & Exchange Inventory
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Keep your skills up to date to sharpen the AI matching algorithm and unlock higher campus compatibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setModalType('teach');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Teaching Skill</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setModalType('learn');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Learning Goal</span>
          </button>
        </div>
      </div>

      {/* Philosophy banner */}
      <div
        className="p-4 rounded-2xl flex items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-soft)'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm"
            style={{
              backgroundColor: 'var(--color-soft)',
              color: 'var(--color-primary)'
            }}
          >
            ⇄
          </div>
          <div>
            <h4
              className="text-xs font-medium"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              The SkillSwap Core Rule: One Skill In, One Skill Out
            </h4>
            <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
              For every skill you want to learn, offer at least one skill you can comfortably teach peers.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('/matches')}
          className="hidden sm:flex items-center gap-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity shrink-0"
          style={{ color: 'var(--color-primary)' }}
        >
          <span>Find Matches</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Teaching Skills Section */}
      <div
        className="p-6 space-y-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            <h3
              className="text-base font-medium"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Skills I Can Teach ({teachingSkills.length})
            </h3>
          </div>
          <button
            onClick={() => {
              setModalType('teach');
              setIsAddModalOpen(true);
            }}
            className="text-xs font-medium hover:underline cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
          >
            + Add Another
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teachingSkills.map(sk => (
            <div
              key={sk.id}
              className="p-4 rounded-xl flex items-start justify-between gap-3"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)'
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className="font-medium text-sm"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {sk.skillName}
                  </h4>
                  <span
                    className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    {sk.level}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Category: {sk.category} • {sk.experienceYears || 1} year(s)
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveSkill(sk.id)}
                className="p-1.5 rounded-full cursor-pointer hover:opacity-75 transition-opacity"
                style={{ color: 'var(--color-muted)' }}
                title="Remove skill"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Goals Section */}
      <div
        className="p-6 space-y-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            <h3
              className="text-base font-medium"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Skills I Want to Learn ({learningSkills.length})
            </h3>
          </div>
          <button
            onClick={() => {
              setModalType('learn');
              setIsAddModalOpen(true);
            }}
            className="text-xs font-medium hover:underline cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
          >
            + Add Another
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {learningSkills.map(sk => (
            <div
              key={sk.id}
              className="p-4 rounded-xl flex items-start justify-between gap-3"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)'
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className="font-medium text-sm"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    {sk.skillName}
                  </h4>
                  <span
                    className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    Goal
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  {sk.learningGoal || 'Working toward foundational knowledge & hands-on practice.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveSkill(sk.id)}
                className="p-1.5 rounded-full cursor-pointer hover:opacity-75 transition-opacity"
                style={{ color: 'var(--color-muted)' }}
                title="Remove skill"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={modalType === 'teach' ? 'Add a Skill You Can Teach' : 'Add a Skill You Want to Learn'}
        subtitle="Expands your campus matching opportunities"
      >
        <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Skill Name
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={e => setSkillName(e.target.value)}
              placeholder="e.g. Next.js, Rust, Figma, Linear Algebra, Public Speaking"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field / Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as SkillCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Data Science">Data Science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Design">Design</option>
                <option value="Business">Business</option>
                <option value="Languages">Languages</option>
                <option value="Academic Subjects">Academic Subjects</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Level
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as SkillLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {modalType === 'teach' ? (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                What is your learning goal?
              </label>
              <textarea
                rows={2}
                value={learningGoal}
                onChange={e => setLearningGoal(e.target.value)}
                placeholder="e.g. Build a portfolio project, prep for campus placements, learn fundamentals"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-500 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              Save Skill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
