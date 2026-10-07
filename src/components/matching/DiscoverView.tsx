import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Building,
  Star,
  Repeat,
  Sparkles,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Zap,
  Clock,
  ChevronDown,
  Users,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { User, SkillCategory, UserSkill } from '../../types';
import { storageService } from '../../services/storageService';
import { matchingService } from '../../services/matchingService';
import { Rating } from '../ui/Rating';
import { SkillChip } from '../ui/SkillChip';
import { EmptyState } from '../ui/EmptyState';
import { ExchangeRequestModal } from './ExchangeRequestModal';
import { MatchScoreBadge } from './MatchScoreBadge';
import { usePageLoader } from '../../hooks/usePageLoader';
import { DiscoverSkeleton } from '../ui/Skeleton';

interface DiscoverViewProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

type SortMode = 'best_match' | 'highest_rated' | 'newest';

const CATEGORIES: SkillCategory[] = [
  'Programming', 'Web Development', 'AI / ML', 'Cybersecurity',
  'Data Science', 'Design', 'Business', 'Marketing',
  'Communication', 'Finance', 'Photography', 'Video Editing',
  'Languages', 'Academic Subjects', 'Other'
];

const AVAILABILITY_SLOTS = [
  'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
  'Weekend Mornings', 'Weekend Afternoons', 'Weekends', 'Flexible'
];

const SORT_OPTIONS: { value: SortMode; label: string; icon: React.ReactNode }[] = [
  { value: 'best_match', label: 'Best Match', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { value: 'highest_rated', label: 'Highest Rated', icon: <Star className="w-3.5 h-3.5" /> },
  { value: 'newest', label: 'Newest First', icon: <Clock className="w-3.5 h-3.5" /> },
];

/** Highlight matching substring in a string */
function highlight(text: string, term: string): React.ReactNode {
  if (!term.trim()) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
          color: 'var(--color-primary)',
          borderRadius: '2px',
          padding: '0 1px'
        }}
      >
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
}

/** Build query string from a filter map, omitting defaults */
function buildParams(filters: Record<string, string>): URLSearchParams {
  const p = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val && val !== 'all' && val !== '0' && val !== 'best_match' && val !== 'false') {
      p.set(key, val);
    }
  }
  return p;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ currentUser, onNavigate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPartnerForSwap, setSelectedPartnerForSwap] = useState<User | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') || '');

  // Read all filter values from URL
  const searchTerm = searchParams.get('q') || '';
  const skillFilter = searchParams.get('skill') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedCollege = searchParams.get('college') || 'all';
  const minRating = parseFloat(searchParams.get('rating') || '0');
  const availSlot = searchParams.get('avail') || 'all';
  const verifiedOnly = searchParams.get('verified') === 'true';
  const liveOnly = searchParams.get('live') === 'true';
  const sortMode = (searchParams.get('sort') || 'best_match') as SortMode;

  // Sync text input with URL debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams({ q: inputValue });
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Keep input in sync if URL changes externally
  useEffect(() => {
    setInputValue(searchParams.get('q') || '');
  }, [searchParams.get('q')]);

  const setParam = useCallback((key: string, value: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!value || value === 'all' || value === '0' || value === 'false' || value === 'best_match') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setParams = useCallback((updates: Record<string, string>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === 'all' || value === '0' || value === 'false' || value === 'best_match') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAll = () => {
    setInputValue('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }).catch(() => {
      // fallback: select URL bar
    });
  };

  const allUsers = storageService.getUsers().filter(u => u.id !== currentUser.id && !u.isSuspended);
  const colleges = storageService.getColleges();
  const allUserSkills = storageService.getUserSkills();

  // Precompute match scores
  const matchScores = useMemo(() => {
    const map: Record<string, number> = {};
    allUsers.forEach(u => {
      const m = matchingService.calculateMatchScore(
        currentUser, u,
        allUserSkills.filter(s => s.userId === currentUser.id),
        allUserSkills.filter(s => s.userId === u.id)
      );
      map[u.id] = m ? m.score : 40;
    });
    return map;
  }, [currentUser, allUsers, allUserSkills]);

  // Filtering
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const uSkills: UserSkill[] = allUserSkills.filter(s => s.userId === u.id);

      // Full-text search (name, college, skills)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const nameOk = u.name.toLowerCase().includes(term);
        const collegeOk = u.collegeName.toLowerCase().includes(term);
        const skillOk = uSkills.some(s => s.skillName.toLowerCase().includes(term) || s.category.toLowerCase().includes(term));
        if (!nameOk && !collegeOk && !skillOk) return false;
      }

      // Skill keyword filter (separate from main search)
      if (skillFilter.trim()) {
        const kw = skillFilter.toLowerCase();
        const hasSkill = uSkills.some(s =>
          s.skillName.toLowerCase().includes(kw) ||
          s.category.toLowerCase().includes(kw)
        );
        if (!hasSkill) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        if (!uSkills.some(s => s.category === selectedCategory)) return false;
      }

      // College
      if (selectedCollege !== 'all' && u.collegeName !== selectedCollege) return false;

      // Rating
      if (minRating > 0 && u.rating < minRating) return false;

      // Availability slot
      if (availSlot !== 'all') {
        const hasSlot = u.availability?.some(a =>
          a.toLowerCase().includes(availSlot.toLowerCase())
        );
        if (!hasSlot) return false;
      }

      // Verified only
      if (verifiedOnly && u.verificationStatus !== 'verified') return false;

      // Live only
      if (liveOnly && !u.isAvailableForLiveSession) return false;

      return true;
    });
  }, [allUsers, searchTerm, skillFilter, selectedCategory, selectedCollege,
    minRating, availSlot, verifiedOnly, liveOnly, allUserSkills]);

  // Sorting
  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    switch (sortMode) {
      case 'highest_rated':
        return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case 'newest':
        return list.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'best_match':
      default:
        return list.sort((a, b) => (matchScores[b.id] || 0) - (matchScores[a.id] || 0));
    }
  }, [filteredUsers, sortMode, matchScores]);

  // Active filter chips (for the "pills" strip)
  const activeFilters: { key: string; label: string }[] = [];
  if (searchTerm) activeFilters.push({ key: 'q', label: `"${searchTerm}"` });
  if (skillFilter) activeFilters.push({ key: 'skill', label: `Skill: ${skillFilter}` });
  if (selectedCategory !== 'all') activeFilters.push({ key: 'category', label: selectedCategory });
  if (selectedCollege !== 'all') activeFilters.push({ key: 'college', label: selectedCollege });
  if (minRating > 0) activeFilters.push({ key: 'rating', label: `${minRating}+ ★` });
  if (availSlot !== 'all') activeFilters.push({ key: 'avail', label: availSlot });
  if (verifiedOnly) activeFilters.push({ key: 'verified', label: 'Verified Only' });
  if (liveOnly) activeFilters.push({ key: 'live', label: 'Live Ready' });

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-5 pb-16 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-medium tracking-tight"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            Discover Peers
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Find students to learn from and teach.
          </p>
        </div>
        <button
          onClick={handleShare}
          title="Copy shareable link"
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-all hover:opacity-80 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-soft)',
            color: 'var(--color-muted)'
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share Search</span>
          {shareToast && (
            <span
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-semibold pointer-events-none"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
            >
              Link copied!
            </span>
          )}
        </button>
      </div>

      {/* ===== SEARCH + FILTER PANEL ===== */}
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        {/* Main search row */}
        <div className="p-4 flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--color-muted)' }}
            />
            <input
              id="discover-search"
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search by student name, skill, or college…"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-soft)'
              }}
            />
            {inputValue && (
              <button
                onClick={() => { setInputValue(''); setParam('q', ''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--color-muted)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              id="discover-sort"
              value={sortMode}
              onChange={e => setParam('sort', e.target.value)}
              className="appearance-none pl-8 pr-7 py-2.5 rounded-xl text-xs font-medium cursor-pointer focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-soft)'
              }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ArrowUpDown
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
              style={{ color: 'var(--color-primary)' }}
            />
            <ChevronDown
              className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
              style={{ color: 'var(--color-muted)' }}
            />
          </div>

          {/* Filter toggle button */}
          <button
            id="discover-filter-toggle"
            onClick={() => setShowFilters(v => !v)}
            className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0"
            style={{
              backgroundColor: showFilters || hasActiveFilters ? 'var(--color-primary)' : 'var(--color-bg)',
              color: showFilters || hasActiveFilters ? '#fff' : 'var(--color-muted)',
              border: `1px solid ${showFilters || hasActiveFilters ? 'transparent' : 'var(--color-soft)'}`
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span
                className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
              >
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filter rows */}
        {showFilters && (
          <div
            className="px-4 pb-4 space-y-4"
            style={{ borderTop: '1px solid var(--color-soft)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
              {/* Skill Keyword */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Skill Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-muted)' }} />
                  <input
                    id="filter-skill"
                    type="text"
                    value={skillFilter}
                    onChange={e => setParam('skill', e.target.value)}
                    placeholder="e.g. Python, Figma, Machine Learning…"
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-soft)'
                    }}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Skill Category
                </label>
                <div className="relative">
                  <select
                    id="filter-category"
                    value={selectedCategory}
                    onChange={e => setParam('category', e.target.value)}
                    className="appearance-none w-full px-3 pr-7 py-2 rounded-xl text-xs font-medium cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-soft)'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                </div>
              </div>

              {/* College */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  College / Campus
                </label>
                <div className="relative">
                  <select
                    id="filter-college"
                    value={selectedCollege}
                    onChange={e => setParam('college', e.target.value)}
                    className="appearance-none w-full px-3 pr-7 py-2 rounded-xl text-xs font-medium cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-soft)'
                    }}
                  >
                    <option value="all">All Campuses</option>
                    {colleges.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                </div>
              </div>

              {/* Min Rating */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Minimum Rating
                </label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                  <select
                    id="filter-rating"
                    value={minRating}
                    onChange={e => setParam('rating', e.target.value)}
                    className="appearance-none w-full pl-8 pr-7 py-2 rounded-xl text-xs font-medium cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-soft)'
                    }}
                  >
                    <option value={0}>Any Rating</option>
                    <option value={3}>3.0+ Stars</option>
                    <option value={4}>4.0+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Availability
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-muted)' }} />
                  <select
                    id="filter-avail"
                    value={availSlot}
                    onChange={e => setParam('avail', e.target.value)}
                    className="appearance-none w-full pl-8 pr-7 py-2 rounded-xl text-xs font-medium cursor-pointer focus:outline-none"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-soft)'
                    }}
                  >
                    <option value="all">Any Time</option>
                    {AVAILABILITY_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--color-muted)' }} />
                </div>
              </div>

              {/* Toggle flags */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                  Extra Filters
                </label>
                <div className="flex flex-col gap-2">
                  {/* Live Only */}
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={liveOnly}
                      onClick={() => setParam('live', liveOnly ? 'false' : 'true')}
                      className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
                      style={{ backgroundColor: liveOnly ? 'var(--color-primary)' : 'var(--color-soft)' }}
                    >
                      <span
                        className="pointer-events-none inline-block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 mt-0.5 ml-0.5"
                        style={{
                          backgroundColor: liveOnly ? '#fff' : 'var(--color-muted)',
                          transform: liveOnly ? 'translateX(16px)' : 'translateX(0)'
                        }}
                      />
                    </button>
                    <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--color-primary)' }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--color-primary)' }} />
                      </span>
                      Live Session Ready
                    </span>
                  </label>

                  {/* Verified Only */}
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={verifiedOnly}
                      onClick={() => setParam('verified', verifiedOnly ? 'false' : 'true')}
                      className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none"
                      style={{ backgroundColor: verifiedOnly ? 'var(--color-primary)' : 'var(--color-soft)' }}
                    >
                      <span
                        className="pointer-events-none inline-block h-4 w-4 rounded-full shadow-sm transition-transform duration-200 mt-0.5 ml-0.5"
                        style={{
                          backgroundColor: verifiedOnly ? '#fff' : 'var(--color-muted)',
                          transform: verifiedOnly ? 'translateX(16px)' : 'translateX(0)'
                        }}
                      />
                    </button>
                    <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
                      <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                      Verified Students Only
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Clear all inside panel */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearAll}
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:opacity-80 cursor-pointer"
                  style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-soft)' }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active filter chips strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
            Active:
          </span>
          {activeFilters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'q') setInputValue('');
                setParam(key, key === 'verified' || key === 'live' ? 'false' : 'all');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer hover:opacity-80 transition-all"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                color: 'var(--color-primary)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)'
              }}
            >
              {label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="text-[11px] font-medium hover:underline ml-1"
            style={{ color: 'var(--color-muted)' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results bar */}
      <div className="flex items-center justify-between text-xs px-0.5">
        <div className="flex items-center gap-2" style={{ color: 'var(--color-muted)' }}>
          <Users className="w-3.5 h-3.5" />
          <span>
            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{sortedUsers.length}</span>
            {' '}student{sortedUsers.length !== 1 ? 's' : ''} found
            {hasActiveFilters && ` (filtered from ${allUsers.length})`}
          </span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--color-muted)' }}>
          <ArrowUpDown className="w-3 h-3" />
          <span>
            {SORT_OPTIONS.find(o => o.value === sortMode)?.label}
          </span>
        </div>
      </div>

      {/* Students Grid */}
      {sortedUsers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No students matched your filters"
          description="Try clearing some filters or broadening your skill keyword."
          actionLabel="Clear All Filters"
          onAction={clearAll}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortedUsers.map(student => {
            const studentSkills = allUserSkills.filter(s => s.userId === student.id);
            const teachSkills = studentSkills.filter(s => s.type === 'teach');
            const learnSkills = studentSkills.filter(s => s.type === 'learn');
            const score = matchScores[student.id] || 40;
            const effectiveTerm = skillFilter || searchTerm || '';

            return (
              <div
                key={student.id}
                className="flex flex-col justify-between transition-all group"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-soft)',
                  borderRadius: 'var(--radius-card)',
                }}
              >
                {/* Card top */}
                <div className="p-5">
                  {/* User header row */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={student.photoURL}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform"
                          style={{ border: '1px solid var(--color-soft)' }}
                        />
                        {student.isAvailableForLiveSession && (
                          <span
                            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-surface)' }}
                            title="Available for Live Session"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full animate-pulse"
                              style={{ backgroundColor: '#22c55e' }}
                            />
                          </span>
                        )}
                      </div>

                      {/* Name + meta */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className="font-semibold text-sm"
                            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                          >
                            {highlight(student.name, searchTerm)}
                          </h4>
                          {student.verificationStatus === 'verified' && (
                            <span title="Verified Student">
                              <ShieldCheck
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: 'var(--color-primary)' }}
                              />
                            </span>
                          )}
                        </div>

                        {student.isAvailableForLiveSession && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Zap className="w-3 h-3" style={{ color: '#22c55e' }} />
                            <span className="text-[10px] font-semibold" style={{ color: '#22c55e' }}>
                              Live Ready
                            </span>
                          </div>
                        )}

                        <p className="text-[11px] line-clamp-1 mt-0.5" style={{ color: 'var(--color-muted)' }}>
                          {student.course} · {student.graduationYear}
                        </p>
                        <Rating value={student.rating} size="sm" reviewCount={student.reviewCount} />
                      </div>
                    </div>

                    <MatchScoreBadge score={score} size="sm" showBar={false} label="Match" />
                  </div>

                  {/* College */}
                  <div
                    className="flex items-center gap-1.5 text-[11px] mb-3.5 px-2.5 py-1.5 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-muted)' }}
                  >
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">
                      {highlight(student.collegeName, searchTerm)}
                    </span>
                  </div>

                  {/* Teaches */}
                  {teachSkills.length > 0 && (
                    <div className="mb-3">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Teaches:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {teachSkills.slice(0, 3).map(ts => (
                          <SkillChip
                            key={ts.id}
                            name={ts.skillName}
                            level={ts.level}
                            type="teach"
                            size="sm"
                          />
                        ))}
                        {teachSkills.length > 3 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-muted)' }}
                          >
                            +{teachSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wants to Learn */}
                  {learnSkills.length > 0 && (
                    <div className="mb-1">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        Wants to Learn:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {learnSkills.slice(0, 2).map(ls => (
                          <SkillChip key={ls.id} name={ls.skillName} type="learn" size="sm" />
                        ))}
                        {learnSkills.length > 2 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-muted)' }}
                          >
                            +{learnSkills.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability slots (up to 2) */}
                  {student.availability?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {student.availability.slice(0, 2).map((slot, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[9px] font-medium flex items-center gap-1"
                          style={{
                            backgroundColor: availSlot !== 'all' && slot.toLowerCase().includes(availSlot.toLowerCase())
                              ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)'
                              : 'var(--color-bg)',
                            color: availSlot !== 'all' && slot.toLowerCase().includes(availSlot.toLowerCase())
                              ? 'var(--color-primary)'
                              : 'var(--color-muted)',
                            border: '1px solid var(--color-soft)'
                          }}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {slot}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card footer actions */}
                <div
                  className="px-5 py-3.5 flex items-center justify-between gap-2"
                  style={{ borderTop: '1px solid var(--color-soft)' }}
                >
                  <button
                    type="button"
                    onClick={() => onNavigate(`/profile?userId=${student.id}`)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
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
