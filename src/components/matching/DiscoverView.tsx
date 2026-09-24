import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Building,
  Star,
  Repeat,
  Sparkles,
  BookOpen,
  ArrowUpDown
} from 'lucide-react';
import { User, SkillCategory, SkillLevel } from '../../types';
import { storageService } from '../../services/storageService';
import { matchingService } from '../../services/matchingService';
import { Rating } from '../ui/Rating';
import { SkillChip } from '../ui/SkillChip';
import { EmptyState } from '../ui/EmptyState';
import { ExchangeRequestModal } from './ExchangeRequestModal';
import { MatchScoreBadge } from './MatchScoreBadge';

interface DiscoverViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ currentUser, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [liveOnly, setLiveOnly] = useState<boolean>(false);
  const [selectedPartnerForSwap, setSelectedPartnerForSwap] = useState<User | null>(null);

  const allUsers = storageService.getUsers().filter(u => u.id !== currentUser.id && !u.isSuspended);
  const colleges = storageService.getColleges();
  const allUserSkills = storageService.getUserSkills();

  const categories: SkillCategory[] = [
    'Programming',
    'Web Development',
    'AI / ML',
    'Cybersecurity',
    'Data Science',
    'Design',
    'Business',
    'Marketing',
    'Communication',
    'Finance',
    'Photography',
    'Video Editing',
    'Languages',
    'Academic Subjects'
  ];

  // Precalculate matches for score badge
  const userMatches = useMemo(() => {
    const matchMap: Record<string, number> = {};
    allUsers.forEach(candidate => {
      const match = matchingService.calculateMatchScore(
        currentUser,
        candidate,
        allUserSkills,
        allUserSkills
      );
      matchMap[candidate.id] = match ? match.score : 40;
    });
    return matchMap;
  }, [currentUser, allUsers, allUserSkills]);

  // Filtered students list
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const userSkillsForThisUser = allUserSkills.filter(s => s.userId === u.id);
        const nameMatch = u.name.toLowerCase().includes(term);
        const collegeMatch = u.collegeName.toLowerCase().includes(term);
        const skillMatch = userSkillsForThisUser.some(s => s.skillName.toLowerCase().includes(term));
        if (!nameMatch && !collegeMatch && !skillMatch) return false;
      }

      // College
      if (selectedCollege !== 'all' && u.collegeName !== selectedCollege) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        const uSkills = allUserSkills.filter(s => s.userId === u.id);
        const hasCat = uSkills.some(s => s.category === selectedCategory);
        if (!hasCat) return false;
      }

      // Rating
      if (minRating > 0 && u.rating < minRating) {
        return false;
      }

      // Verified only
      if (verifiedOnly && u.verificationStatus !== 'verified') {
        return false;
      }

      // Live Session Availability
      if (liveOnly && !u.isAvailableForLiveSession) {
        return false;
      }

      return true;
    });
  }, [allUsers, searchTerm, selectedCollege, selectedCategory, minRating, verifiedOnly, liveOnly, allUserSkills]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-medium tracking-tight"
          style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
        >
          Campus Talent Discovery
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
          Explore students across Indian universities eager to exchange their expertise.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div
        className="p-4 space-y-3.5"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search students, skills (e.g. Python, Photoshop, C++, Deep Learning), or colleges..."
            className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-soft)'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
          {/* College Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>College:</span>
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              className="px-2.5 py-1.5 rounded-full font-medium text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-soft)'
              }}
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Skill Field:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-full font-medium text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-soft)'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Min Rating:</span>
            <select
              value={minRating}
              onChange={e => setMinRating(parseFloat(e.target.value))}
              className="px-2.5 py-1.5 rounded-full font-medium text-xs focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-soft)'
              }}
            >
              <option value={0}>Any Rating</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.8}>4.8+ Stars</option>
              <option value={4.9}>4.9+ Stars</option>
            </select>
          </div>

          {/* Live Only toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={liveOnly}
              onChange={e => setLiveOnly(e.target.checked)}
              className="rounded"
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-primary)' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--color-primary)' }} />
              </span>
              Live Session Ready
            </span>
          </label>

          {/* Verified toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={e => setVerifiedOnly(e.target.checked)}
              className="rounded"
              style={{ accentColor: 'var(--color-primary)' }}
            />
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--color-text)' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
              Verified Only
            </span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--color-muted)' }}>
        <span>Showing {filteredUsers.length} student profiles</span>
        <span>Sorted by Campus Compatibility</span>
      </div>

      {/* Students Grid */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No students matched your criteria"
          description="Try clearing some filters or searching for broader skills like Python, Design, or C++."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedCollege('all');
            setSelectedCategory('all');
            setMinRating(0);
            setVerifiedOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(student => {
            const studentSkills = allUserSkills.filter(s => s.userId === student.id);
            const teachSkills = studentSkills.filter(s => s.type === 'teach');
            const learnSkills = studentSkills.filter(s => s.type === 'learn');
            const score = userMatches[student.id] || 60;

            return (
              <div
                key={student.id}
                className="p-5 transition-all flex flex-col justify-between group"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-soft)',
                  borderRadius: 'var(--radius-card)'
                }}
              >
                <div>
                  {/* Top user snapshot */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={student.photoURL}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform"
                          style={{ border: '1px solid var(--color-soft)' }}
                        />
                        {student.isAvailableForLiveSession && (
                          <span
                            className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-surface)' }}
                            title="Available for Live Session"
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4
                            className="font-medium text-sm"
                            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                          >
                            {student.name}
                          </h4>
                          {student.verificationStatus === 'verified' && (
                            <span title="Verified Student">
                              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                            </span>
                          )}
                        </div>
                        {student.isAvailableForLiveSession && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-primary)' }} />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: 'var(--color-primary)' }} />
                            </span>
                            <span className="text-[10px] font-medium" style={{ color: 'var(--color-primary)' }}>
                              Live Available
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] line-clamp-1" style={{ color: 'var(--color-muted)' }}>
                          {student.course}
                        </p>
                        <Rating value={student.rating} size="sm" reviewCount={student.reviewCount} />
                      </div>
                    </div>

                    <MatchScoreBadge score={score} size="sm" showBar={false} label="Swap" />
                  </div>

                  {/* College name & availability */}
                  <div className="flex items-center gap-1 text-[11px] mb-3 line-clamp-1" style={{ color: 'var(--color-muted)' }}>
                    <Building className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-muted)' }} />
                    <span>{student.collegeName}</span>
                  </div>

                  {/* Skills Taught */}
                  <div className="mb-2.5">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider block mb-1"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Teaches:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {teachSkills.slice(0, 3).map(ts => (
                        <SkillChip key={ts.id} name={ts.skillName} level={ts.level} type="teach" size="sm" />
                      ))}
                    </div>
                  </div>

                  {/* Skills Wanted */}
                  <div className="mb-4">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider block mb-1"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      Wants to Learn:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {learnSkills.slice(0, 2).map(ls => (
                        <SkillChip key={ls.id} name={ls.skillName} type="learn" size="sm" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  className="pt-3.5 flex items-center justify-between gap-2"
                  style={{ borderTop: '1px solid var(--color-soft)' }}
                >
                  <button
                    type="button"
                    onClick={() => onNavigate(`/profile?userId=${student.id}`)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
                    style={{
                      border: '1px solid var(--color-soft)',
                      color: 'var(--color-muted)'
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPartnerForSwap(student)}
                    className="px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Request Swap</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exchange Request Modal */}
      <ExchangeRequestModal
        isOpen={selectedPartnerForSwap !== null}
        onClose={() => setSelectedPartnerForSwap(null)}
        partner={selectedPartnerForSwap}
      />
    </div>
  );
};
