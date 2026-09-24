import React, { useState } from 'react';
import { Trophy, Star, Flame, Video, Building, Award, ShieldCheck } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Rating } from '../ui/Rating';

interface LeaderboardViewProps {
  onNavigate: (route: string) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<'teachers' | 'learners' | 'consistent' | 'helpful'>('teachers');
  const [selectedCollege, setSelectedCollege] = useState<string>('all');

  const users = storageService.getUsers().filter(u => !u.isSuspended);
  const colleges = storageService.getColleges();

  const filteredUsers = selectedCollege === 'all'
    ? users
    : users.filter(u => u.collegeName === selectedCollege);

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (tab === 'teachers') {
      return b.hoursTaught - a.hoursTaught || b.rating - a.rating;
    } else if (tab === 'learners') {
      return b.hoursLearned - a.hoursLearned;
    } else if (tab === 'consistent') {
      return b.learningStreak - a.learningStreak;
    } else {
      return b.reviewCount - a.reviewCount || b.rating - a.rating;
    }
  });

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            <h1
              className="text-2xl font-medium tracking-tight"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Campus Leaderboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            Celebrating the most generous student teachers and dedicated peer learners across Indian universities.
          </p>
        </div>

        {/* College Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium" style={{ color: 'var(--color-muted)' }}>Campus:</span>
          <select
            value={selectedCollege}
            onChange={e => setSelectedCollege(e.target.value)}
            className="px-3 py-1.5 rounded-xl outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              color: 'var(--color-text)'
            }}
          >
            <option value="all">All Campuses</option>
            {colleges.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center p-1 rounded-full max-w-xl"
        style={{
          backgroundColor: 'var(--color-bg)',
          border: '1px solid var(--color-soft)'
        }}
      >
        <button
          type="button"
          onClick={() => setTab('teachers')}
          className="flex-1 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{
            backgroundColor: tab === 'teachers' ? 'var(--color-surface)' : 'transparent',
            color: tab === 'teachers' ? 'var(--color-primary)' : 'var(--color-muted)',
            border: tab === 'teachers' ? '1px solid var(--color-soft)' : 'none'
          }}
        >
          Top Teachers
        </button>
        <button
          type="button"
          onClick={() => setTab('learners')}
          className="flex-1 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{
            backgroundColor: tab === 'learners' ? 'var(--color-surface)' : 'transparent',
            color: tab === 'learners' ? 'var(--color-primary)' : 'var(--color-muted)',
            border: tab === 'learners' ? '1px solid var(--color-soft)' : 'none'
          }}
        >
          Top Learners
        </button>
        <button
          type="button"
          onClick={() => setTab('consistent')}
          className="flex-1 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{
            backgroundColor: tab === 'consistent' ? 'var(--color-surface)' : 'transparent',
            color: tab === 'consistent' ? 'var(--color-primary)' : 'var(--color-muted)',
            border: tab === 'consistent' ? '1px solid var(--color-soft)' : 'none'
          }}
        >
          Most Consistent
        </button>
        <button
          type="button"
          onClick={() => setTab('helpful')}
          className="flex-1 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
          style={{
            backgroundColor: tab === 'helpful' ? 'var(--color-surface)' : 'transparent',
            color: tab === 'helpful' ? 'var(--color-primary)' : 'var(--color-muted)',
            border: tab === 'helpful' ? '1px solid var(--color-soft)' : 'none'
          }}
        >
          Most Helpful
        </button>
      </div>

      {/* Podium for Top 3 */}
      {sortedUsers.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 */}
          <div
            onClick={() => onNavigate(`/profile?userId=${sortedUsers[1].id}`)}
            className="p-6 flex flex-col items-center text-center cursor-pointer hover:opacity-90 transition-all sm:order-1"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span className="text-2xl mb-1">🥈</span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              Rank #2
            </span>
            <img
              src={sortedUsers[1].photoURL}
              alt={sortedUsers[1].name}
              className="w-16 h-16 rounded-full object-cover mt-2 mb-3"
              style={{ border: '1px solid var(--color-soft)' }}
            />
            <h4
              className="font-medium text-sm"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              {sortedUsers[1].name}
            </h4>
            <p className="text-xs truncate max-w-full" style={{ color: 'var(--color-muted)' }}>
              {sortedUsers[1].collegeName}
            </p>
            <div className="mt-3 text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              {tab === 'teachers' && `${sortedUsers[1].hoursTaught} hrs taught`}
              {tab === 'learners' && `${sortedUsers[1].hoursLearned} hrs learned`}
              {tab === 'consistent' && `🔥 ${sortedUsers[1].learningStreak}d streak`}
              {tab === 'helpful' && `★ ${sortedUsers[1].rating} (${sortedUsers[1].reviewCount} reviews)`}
            </div>
          </div>

          {/* Rank 1 (Featured) */}
          <div
            onClick={() => onNavigate(`/profile?userId=${sortedUsers[0].id}`)}
            className="p-7 flex flex-col items-center text-center cursor-pointer hover:opacity-95 transition-all sm:-mt-4 sm:order-2"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span className="text-3xl mb-1">🥇</span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
              Campus Champion • Rank #1
            </span>
            <img
              src={sortedUsers[0].photoURL}
              alt={sortedUsers[0].name}
              className="w-20 h-20 rounded-full object-cover mt-2 mb-3"
              style={{ border: '2px solid var(--color-primary)' }}
            />
            <h4
              className="font-medium text-base flex items-center gap-1"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              <span>{sortedUsers[0].name}</span>
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            </h4>
            <p className="text-xs truncate max-w-full" style={{ color: 'var(--color-muted)' }}>
              {sortedUsers[0].collegeName}
            </p>
            <div className="mt-3 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              {tab === 'teachers' && `${sortedUsers[0].hoursTaught} hrs taught`}
              {tab === 'learners' && `${sortedUsers[0].hoursLearned} hrs learned`}
              {tab === 'consistent' && `🔥 ${sortedUsers[0].learningStreak}d streak`}
              {tab === 'helpful' && `★ ${sortedUsers[0].rating} (${sortedUsers[0].reviewCount} reviews)`}
            </div>
          </div>

          {/* Rank 3 */}
          <div
            onClick={() => onNavigate(`/profile?userId=${sortedUsers[2].id}`)}
            className="p-6 flex flex-col items-center text-center cursor-pointer hover:opacity-90 transition-all sm:order-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <span className="text-2xl mb-1">🥉</span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
              Rank #3
            </span>
            <img
              src={sortedUsers[2].photoURL}
              alt={sortedUsers[2].name}
              className="w-16 h-16 rounded-full object-cover mt-2 mb-3"
              style={{ border: '1px solid var(--color-soft)' }}
            />
            <h4
              className="font-medium text-sm"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              {sortedUsers[2].name}
            </h4>
            <p className="text-xs truncate max-w-full" style={{ color: 'var(--color-muted)' }}>
              {sortedUsers[2].collegeName}
            </p>
            <div className="mt-3 text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              {tab === 'teachers' && `${sortedUsers[2].hoursTaught} hrs taught`}
              {tab === 'learners' && `${sortedUsers[2].hoursLearned} hrs learned`}
              {tab === 'consistent' && `🔥 ${sortedUsers[2].learningStreak}d streak`}
              {tab === 'helpful' && `★ ${sortedUsers[2].rating} (${sortedUsers[2].reviewCount} reviews)`}
            </div>
          </div>
        </div>
      )}

      {/* Ranks 4+ Table */}
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        <div
          className="px-6 py-4 text-xs font-medium uppercase tracking-wider"
          style={{
            borderBottom: '1px solid var(--color-soft)',
            color: 'var(--color-muted)'
          }}
        >
          All Ranked Students
        </div>
        <div>
          {sortedUsers.slice(3).map((u, idx) => (
            <div
              key={u.id}
              onClick={() => onNavigate(`/profile?userId=${u.id}`)}
              className="px-6 py-3.5 flex items-center justify-between cursor-pointer transition-colors hover:opacity-85"
              style={{ borderBottom: '1px solid var(--color-soft)' }}
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium w-6" style={{ color: 'var(--color-muted)' }}>
                  #{idx + 4}
                </span>
                <img
                  src={u.photoURL}
                  alt={u.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: '1px solid var(--color-soft)' }}
                />
                <div>
                  <h5
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                  >
                    <span>{u.name}</span>
                    {u.verificationStatus === 'verified' && (
                      <ShieldCheck className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                    )}
                  </h5>
                  <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                    {u.collegeName}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                {tab === 'teachers' && `${u.hoursTaught} hrs taught`}
                {tab === 'learners' && `${u.hoursLearned} hrs learned`}
                {tab === 'consistent' && `🔥 ${u.learningStreak}d`}
                {tab === 'helpful' && `★ ${u.rating} (${u.reviewCount})`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
