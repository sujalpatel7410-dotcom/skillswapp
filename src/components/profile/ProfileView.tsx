import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  Flame,
  Star,
  Video,
  Clock,
  Award,
  Edit3,
  Repeat,
  MessageSquare,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { User, UserSkill, Review, Badge } from '../../types';
import { storageService } from '../../services/storageService';
import { matchingService } from '../../services/matchingService';
import { SkillChip } from '../ui/SkillChip';
import { Rating } from '../ui/Rating';
import { Modal } from '../ui/Modal';
import { ExchangeRequestModal } from '../matching/ExchangeRequestModal';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';

interface ProfileViewProps {
  currentUser: User;
  targetUserId?: string | null;
  onNavigate: (route: string) => void;
  onOpenChatWith: (partnerId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  targetUserId,
  onNavigate,
  onOpenChatWith
}) => {
  const isOwnProfile = !targetUserId || targetUserId === currentUser.id;
  const user = isOwnProfile ? currentUser : storageService.getUserById(targetUserId!) || currentUser;

  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  // Edit form state
  const [bio, setBio] = useState(user.bio || '');
  const [course, setCourse] = useState(user.course || '');
  const [collegeName, setCollegeName] = useState(user.collegeName || '');
  const [gradYear, setGradYear] = useState(user.graduationYear?.toString() || '2027');

  // Verify form state
  const [idNumber, setIdNumber] = useState(user.studentIdNumber || '');
  const [idSubmitted, setIdSubmitted] = useState(false);

  const peerCompatibility = useMemo(() => {
    if (isOwnProfile) return null;
    return matchingService.calculateCompatibility(currentUser, user);
  }, [isOwnProfile, currentUser, user]);

  useEffect(() => {
    const update = () => {
      setSkills(storageService.getUserSkills(user.id));
      setReviews(storageService.getReviews(user.id));
      const allBadges = storageService.getBadges();
      const userBadgeIds = user.badges || [];
      setBadges(allBadges.filter(b => userBadgeIds.includes(b.id)));
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [user.id, user.badges]);

  const teachingSkills = skills.filter(s => s.type === 'teach');
  const learningSkills = skills.filter(s => s.type === 'learn');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      bio,
      course,
      collegeName,
      graduationYear: parseInt(gradYear, 10) || 2027
    };
    storageService.saveUser(updated);
    setIsEditing(false);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.requestVerification(user.id, idNumber || '2414406022');
    setIdSubmitted(true);
    setTimeout(() => {
      setIdSubmitted(false);
      setIsVerifying(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Banner & Header */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        {/* Cover Header */}
        <div
          className="h-32 sm:h-40 relative"
          style={{ backgroundColor: 'var(--color-soft)' }}
        />

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="relative">
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover shadow-sm"
                style={{
                  border: '4px solid var(--color-surface)',
                  backgroundColor: 'var(--color-surface)'
                }}
              />
              {user.verificationStatus === 'verified' && (
                <div
                  className="absolute bottom-1 right-1 p-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    border: '2px solid var(--color-surface)'
                  }}
                  title="Verified Student Identity"
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
              {isOwnProfile ? (
                <>
                  {user.verificationStatus !== 'verified' && (
                    <button
                      type="button"
                      onClick={() => setIsVerifying(true)}
                      className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                      style={{
                        backgroundColor: 'var(--color-soft)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Student ID</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setBio(user.bio || '');
                      setCourse(user.course || '');
                      setCollegeName(user.collegeName || '');
                      setGradYear(user.graduationYear?.toString() || '2027');
                      setIsEditing(true);
                    }}
                    className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
                    style={{
                      border: '1px solid var(--color-soft)',
                      color: 'var(--color-muted)'
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenChatWith(user.id)}
                    className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
                    style={{
                      border: '1px solid var(--color-soft)',
                      color: 'var(--color-muted)'
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExchangeModalOpen(true)}
                    className="px-5 py-2 rounded-full text-xs font-medium active:scale-95 flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                    style={{
                      backgroundColor: 'var(--color-soft)',
                      color: 'var(--color-primary)'
                    }}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Request Skill Swap</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Name & Meta */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="text-2xl sm:text-3xl font-medium tracking-tight"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                {user.name}
              </h1>
              {peerCompatibility && (
                <MatchScoreBadge score={peerCompatibility.score} size="md" showBar={false} label="Compatibility" />
              )}
              {user.verificationStatus === 'verified' ? (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs"
                  style={{
                    backgroundColor: 'var(--color-soft)',
                    color: 'var(--color-primary)'
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Student
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-soft)',
                    color: 'var(--color-muted)'
                  }}
                >
                  Pending Verification
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--color-muted)' }}>
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {user.collegeName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                {user.course} (Class of {user.graduationYear})
              </span>
            </div>

            {user.bio && (
              <p className="text-xs sm:text-sm leading-relaxed pt-2 max-w-3xl" style={{ color: 'var(--color-text)' }}>
                {user.bio}
              </p>
            )}

            {/* Live Session Availability Setting (Own Profile) */}
            {isOwnProfile && (
              <div
                className="mt-4 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)'
                }}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="relative flex h-3 w-3 mt-1 sm:mt-0 shrink-0">
                    {user.isAvailableForLiveSession && (
                      <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      />
                    )}
                    <span
                      className="relative inline-flex rounded-full h-3 w-3"
                      style={{
                        backgroundColor: user.isAvailableForLiveSession
                          ? 'var(--color-primary)'
                          : 'var(--color-muted)'
                      }}
                    />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
                      >
                        Status: {user.isAvailableForLiveSession ? 'Available for Live Session' : 'Offline for Instant Swaps'}
                      </h4>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--color-soft)',
                          color: user.isAvailableForLiveSession ? 'var(--color-primary)' : 'var(--color-muted)'
                        }}
                      >
                        {user.isAvailableForLiveSession ? 'Visible to Peers' : 'Hidden from Live Discovery'}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {user.isAvailableForLiveSession
                        ? 'Students across your campus and AI Matching can see you are ready for instant live exchanges right now.'
                        : 'Turn this on when you have free time to teach or learn live with campus peers.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(user.isAvailableForLiveSession)}
                    onClick={() => {
                      storageService.toggleLiveSessionAvailability(user.id);
                    }}
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{
                      backgroundColor: user.isAvailableForLiveSession
                        ? 'var(--color-primary)'
                        : 'var(--color-soft)'
                    }}
                    title={
                      user.isAvailableForLiveSession
                        ? 'Available for Live Session (Active) - Click to turn off'
                        : 'Offline for live sessions - Click to mark available'
                    }
                  >
                    <span
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out mt-0.5 ml-0.5"
                      style={{
                        backgroundColor: user.isAvailableForLiveSession ? '#FFFFFF' : 'var(--color-muted)',
                        transform: user.isAvailableForLiveSession ? 'translateX(20px)' : 'translateX(0)'
                      }}
                    />
                  </button>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    {user.isAvailableForLiveSession ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            )}

            {/* Peer Live Status (Other Student's Profile) */}
            {!isOwnProfile && (
              <div
                className="mt-3 px-3.5 py-2 rounded-xl inline-flex items-center gap-2 text-xs"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)'
                }}
              >
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {user.isAvailableForLiveSession && (
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                  <span
                    className="relative inline-flex rounded-full h-2.5 w-2.5"
                    style={{
                      backgroundColor: user.isAvailableForLiveSession
                        ? 'var(--color-primary)'
                        : 'var(--color-muted)'
                    }}
                  />
                </span>
                <span style={{ color: 'var(--color-text)' }}>
                  {user.isAvailableForLiveSession
                    ? 'Currently Available for Live Session'
                    : 'Currently Offline for Live Sessions (Scheduled Only)'}
                </span>
              </div>
            )}
          </div>

          {/* Key Metric Highlights */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6"
            style={{ borderTop: '1px solid var(--color-soft)' }}
          >
            <div
              className="p-3"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Rating</span>
              <div className="mt-1 flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" style={{ color: 'var(--color-primary)' }} />
                <span className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
                  {user.rating.toFixed(2)}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>({user.reviewCount})</span>
              </div>
            </div>

            <div
              className="p-3"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Exchange Streak</span>
              <div className="mt-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                <Flame className="w-4 h-4" />
                <span className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
                  {user.learningStreak}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>days</span>
              </div>
            </div>

            <div
              className="p-3"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Sessions Taught</span>
              <div className="mt-1 flex items-center gap-1">
                <Video className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
                  {user.completedSessions}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>({user.hoursTaught}h)</span>
              </div>
            </div>

            <div
              className="p-3"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                borderRadius: 'var(--radius-card)'
              }}
            >
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>Earned Badges</span>
              <div className="mt-1 flex items-center gap-1">
                <Award className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span className="text-base font-medium" style={{ color: 'var(--color-text)' }}>
                  {badges.length}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Badges</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Skills & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Teaching & Learning Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Can Teach */}
          <div
            className="p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-medium flex items-center gap-2"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <span>Skills I Can Teach</span>
              </h3>
              {isOwnProfile && (
                <button
                  onClick={() => onNavigate('/skills')}
                  className="text-xs font-medium hover:underline cursor-pointer"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Manage Skills
                </button>
              )}
            </div>

            <div className="space-y-3">
              {teachingSkills.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No teaching skills listed yet.</p>
              ) : (
                teachingSkills.map(s => (
                  <div
                    key={s.id}
                    className="p-3.5 flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)'
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {s.skillName}
                        </span>
                        <span
                          className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--color-soft)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          {s.level}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        Category: {s.category} • {s.experienceYears || 1} year(s) experience
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skills Want to Learn */}
          <div
            className="p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-medium flex items-center gap-2"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <span>Skills I Want to Learn</span>
              </h3>
            </div>

            <div className="space-y-3">
              {learningSkills.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No learning skills added yet.</p>
              ) : (
                learningSkills.map(s => (
                  <div
                    key={s.id}
                    className="p-3.5 flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)'
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                          {s.skillName}
                        </span>
                        <span
                          className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--color-soft)',
                            color: 'var(--color-primary)'
                          }}
                        >
                          Goal
                        </span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        {s.learningGoal || 'Looking for hands-on project guidance and syntax review.'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Reviews Received */}
          <div
            className="p-6 space-y-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-medium"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                Peer Reviews ({reviews.length})
              </h3>
              <Rating value={user.rating} size="sm" />
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  No reviews yet. Complete your first session to earn feedback!
                </p>
              ) : (
                reviews.map(r => (
                  <div
                    key={r.id}
                    className="p-4 space-y-2"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-soft)',
                      borderRadius: 'var(--radius-card)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.reviewerPhoto}
                          alt={r.reviewerName}
                          className="w-7 h-7 rounded-full object-cover"
                          style={{ border: '1px solid var(--color-soft)' }}
                        />
                        <div>
                          <h5 className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                            {r.reviewerName}
                          </h5>
                          <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                            Exchange on {r.skillName}
                          </span>
                        </div>
                      </div>
                      <Rating value={r.rating} size="sm" showNumber={false} />
                    </div>
                    <p className="text-xs leading-relaxed italic" style={{ color: 'var(--color-muted)' }}>
                      "{r.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Availability & Badges */}
        <div className="space-y-6">
          {/* Availability */}
          <div
            className="p-6 space-y-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <h4
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <span>Exchange Availability</span>
            </h4>
            <div className="space-y-2">
              {user.availability?.map((slot, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-soft)',
                    color: 'var(--color-text)'
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                  <span>{slot}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Earned */}
          <div
            className="p-6 space-y-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-soft)',
              borderRadius: 'var(--radius-card)'
            }}
          >
            <div className="flex items-center justify-between">
              <h4
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
              >
                <Award className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                <span>Earned Badges</span>
              </h4>
              <button
                onClick={() => onNavigate('/badges')}
                className="text-xs hover:underline font-medium cursor-pointer"
                style={{ color: 'var(--color-primary)' }}
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {badges.map(b => (
                <div
                  key={b.id}
                  className="p-3 text-center"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-soft)',
                    borderRadius: 'var(--radius-card)'
                  }}
                >
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <h5 className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {b.title}
                  </h5>
                  <span className="text-[9px] block truncate" style={{ color: 'var(--color-muted)' }}>
                    {b.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Student Profile"
        subtitle="Keep your campus information up to date"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Bio / Learning Goals
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              College Name
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={e => setCollegeName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-soft)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Course
              </label>
              <input
                type="text"
                value={course}
                onChange={e => setCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Graduation Year
              </label>
              <input
                type="number"
                value={gradYear}
                onChange={e => setGradYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-medium rounded-full cursor-pointer hover:opacity-85 transition-opacity"
              style={{
                backgroundColor: 'var(--color-soft)',
                color: 'var(--color-primary)'
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Verify Student ID Modal */}
      <Modal
        isOpen={isVerifying}
        onClose={() => setIsVerifying(false)}
        title="Verify College Identity"
        subtitle="Earn the verified student badge and build instant trust"
      >
        {idSubmitted ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" style={{ color: 'var(--color-primary)' }} />
            <h3
              className="font-medium text-base"
              style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
            >
              Student ID Submitted!
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              Your college ID has been sent to campus admin for quick approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Enrollment / Student ID Number
              </label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="e.g. 2414406022"
                className="w-full px-3 py-2 rounded-xl outline-none"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-soft)',
                  color: 'var(--color-text)'
                }}
              />
            </div>

            <div
              className="border border-dashed p-6 rounded-2xl text-center space-y-2"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-soft)'
              }}
            >
              <Upload className="w-8 h-8 mx-auto" style={{ color: 'var(--color-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                Upload College ID Card Image or Admission Letter
              </p>
              <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                PNG, JPG or PDF up to 5MB (Sample student ID will be verified)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifying(false)}
                className="px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--color-soft)] transition-colors"
                style={{ color: 'var(--color-muted)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-medium rounded-full cursor-pointer hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: 'var(--color-soft)',
                  color: 'var(--color-primary)'
                }}
              >
                Submit ID for Verification
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Exchange Request Modal */}
      <ExchangeRequestModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        partner={user}
      />
    </div>
  );
};
