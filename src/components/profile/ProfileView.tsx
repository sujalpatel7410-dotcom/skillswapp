import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  CheckCircle2,
  Ban,
  Flag,
  Bell,
  Sparkles,
  Camera,
  Link2,
  Plus,
  X,
  Save
} from 'lucide-react';
import { useNotificationPrefs, NotifType } from '../../hooks/useNotificationPrefs';
import { User, UserSkill, Review, Badge } from '../../types';
import { storageService } from '../../services/storageService';
import { usePageLoader } from '../../hooks/usePageLoader';
import { ProfileSkeleton } from '../ui/Skeleton';
import { matchingService } from '../../services/matchingService';
import { Rating } from '../ui/Rating';
import { Modal } from '../ui/Modal';
import { ReportModal } from '../ui/ReportModal';
import { ExchangeRequestModal } from '../matching/ExchangeRequestModal';
import { MatchScoreBadge } from '../matching/MatchScoreBadge';

interface ProfileViewProps {
  currentUser: User;
  targetUserId?: string | null;
  onNavigate: (route: string) => void;
  onOpenChatWith: (partnerId: string) => void;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['Morning (8–12)', 'Afternoon (12–5)', 'Evening (5–9)', 'Night (9–12)'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  targetUserId,
  onNavigate,
  onOpenChatWith
}) => {
  // --- ALL hooks first, before any conditional return ---
  const isOwnProfile = !targetUserId || targetUserId === currentUser.id;
  const resolvedUser = isOwnProfile
    ? currentUser
    : storageService.getUserById(targetUserId!) || currentUser;

  const isLoadingPage = usePageLoader(450);

  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [user, setUser] = useState<User>(resolvedUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isBlocked, setIsBlocked] = useState(
    !isOwnProfile ? storageService.isBlocked(currentUser.id, resolvedUser.id) : false
  );

  // Edit form state
  const [editName, setEditName] = useState(resolvedUser.name || '');
  const [editBio, setEditBio] = useState(resolvedUser.bio || '');
  const [editCourse, setEditCourse] = useState(resolvedUser.course || '');
  const [editCollege, setEditCollege] = useState(resolvedUser.collegeName || '');
  const [editGradYear, setEditGradYear] = useState(resolvedUser.graduationYear?.toString() || '2027');
  const [editPortfolio, setEditPortfolio] = useState((resolvedUser as any).portfolioUrl || '');
  const [editAvailability, setEditAvailability] = useState<string[]>(resolvedUser.availability || []);
  const [newSlot, setNewSlot] = useState('');
  const [editDay, setEditDay] = useState('Mon');
  const [editTime, setEditTime] = useState('Morning (8–12)');

  // Photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Banner upload
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>((resolvedUser as any).bannerURL || null);

  // Notification preferences
  const { prefs, toggle } = useNotificationPrefs();

  // Verify form
  const [idNumber, setIdNumber] = useState(resolvedUser.studentIdNumber || '');
  const [idSubmitted, setIdSubmitted] = useState(false);

  const peerCompatibility = useMemo(() => {
    if (isOwnProfile) return null;
    return matchingService.calculateCompatibility(currentUser, user);
  }, [isOwnProfile, currentUser, user]);

  useEffect(() => {
    const update = () => {
      const freshUser = isOwnProfile
        ? storageService.getUserById(currentUser.id) || currentUser
        : storageService.getUserById(resolvedUser.id) || resolvedUser;
      setUser(freshUser);
      setSkills(storageService.getUserSkills(freshUser.id));
      setReviews(storageService.getReviews(freshUser.id));
      const allBadges = storageService.getBadges();
      const userBadgeIds = freshUser.badges || [];
      setBadges(allBadges.filter(b => userBadgeIds.includes(b.id)));
      if (!isOwnProfile) {
        setIsBlocked(storageService.isBlocked(currentUser.id, freshUser.id));
      }
    };
    update();
    const unsub = storageService.subscribe(update);
    return () => unsub();
  }, [resolvedUser.id, isOwnProfile, currentUser.id]);

  // --- Conditional early return AFTER all hooks ---
  if (isLoadingPage) return <ProfileSkeleton />;

  const teachingSkills = skills.filter(s => s.type === 'teach');
  const learningSkills = skills.filter(s => s.type === 'learn');

  const openEditModal = () => {
    setEditName(user.name || '');
    setEditBio(user.bio || '');
    setEditCourse(user.course || '');
    setEditCollege(user.collegeName || '');
    setEditGradYear(user.graduationYear?.toString() || '2027');
    setEditPortfolio((user as any).portfolioUrl || '');
    setEditAvailability(user.availability || []);
    setPhotoPreview(null);
    setIsEditing(true);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setBannerPreview(dataUrl);
      // Immediately persist banner to user record
      const updated: User = { ...user, ...({ bannerURL: dataUrl } as any) };
      storageService.saveUser(updated);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const addSlot = () => {
    const slot = `${editDay} – ${editTime}`;
    if (!editAvailability.includes(slot)) {
      setEditAvailability(prev => [...prev, slot]);
    }
  };

  const removeSlot = (slot: string) => {
    setEditAvailability(prev => prev.filter(s => s !== slot));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name: editName,
      bio: editBio,
      course: editCourse,
      collegeName: editCollege,
      graduationYear: parseInt(editGradYear, 10) || 2027,
      availability: editAvailability,
      ...(photoPreview ? { photoURL: photoPreview } : {}),
      ...({ portfolioUrl: editPortfolio } as any),
      ...((bannerPreview && bannerPreview !== (resolvedUser as any).bannerURL) ? { bannerURL: bannerPreview } as any : {})
    };
    storageService.saveUser(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1200);
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
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* =========================================================
          PROFILE HERO CARD
      ========================================================= */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-soft)',
          borderRadius: 'var(--radius-card)'
        }}
      >
        {/* Cover Banner – clickable on own profile */}
        <div
          className={`h-36 sm:h-48 relative overflow-hidden group ${isOwnProfile ? 'cursor-pointer' : ''}`}
          style={bannerPreview
            ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 50%, #9333ea 100%)' }
          }
          onClick={() => isOwnProfile && bannerInputRef.current?.click()}
          title={isOwnProfile ? 'Click to change banner image' : undefined}
        >
          {/* Decorative orbs (only when no custom banner) */}
          {!bannerPreview && (
            <>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }} />
            </>
          )}

          {/* Hover edit overlay (own profile only) */}
          {isOwnProfile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.45)' }}>
              <Camera className="w-7 h-7 text-white" />
              <span className="text-white text-xs font-semibold tracking-wide">Change Banner</span>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="hidden"
          />
        </div>

        {/* Profile Content */}
        <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover"
                style={{
                  border: '4px solid var(--color-surface)',
                  backgroundColor: 'var(--color-surface)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
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
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={openEditModal}
                  title="Change photo"
                  className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.45)' }}
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
              {isOwnProfile ? (
                <>
                  {user.verificationStatus !== 'verified' && (
                    <button
                      type="button"
                      onClick={() => setIsVerifying(true)}
                      className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-85"
                      style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify ID</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}
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
                    disabled={isBlocked}
                    className="px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ border: '1px solid var(--color-soft)', color: 'var(--color-muted)' }}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExchangeModalOpen(true)}
                    disabled={isBlocked}
                    className="px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Request Swap</span>
                  </button>
                  <div className="w-px h-6" style={{ backgroundColor: 'var(--color-soft)' }} />
                  <button
                    type="button"
                    onClick={() => {
                      if (isBlocked) {
                        storageService.unblockUser(currentUser.id, user.id);
                      } else {
                        storageService.blockUser(currentUser.id, user.id);
                      }
                      setIsBlocked(!isBlocked);
                    }}
                    className="px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-80"
                    style={{ border: '1px solid var(--color-soft)', color: isBlocked ? '#ef4444' : 'var(--color-muted)' }}
                    title={isBlocked ? 'Unblock this user' : 'Block this user'}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all hover:opacity-80"
                    style={{ border: '1px solid var(--color-soft)', color: 'var(--color-muted)' }}
                    title="Report this user"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name, Badges, Meta */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight"
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
                  style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Student
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-xs"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-muted)' }}
                >
                  Unverified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: 'var(--color-muted)' }}>
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                {user.collegeName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                {user.course} · Class of {user.graduationYear}
              </span>
              {(user as any).portfolioUrl && (
                <>
                  <span>•</span>
                  <a
                    href={(user as any).portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Portfolio
                  </a>
                </>
              )}
            </div>

            {user.bio && (
              <p className="text-sm leading-relaxed max-w-3xl pt-1" style={{ color: 'var(--color-muted)' }}>
                {user.bio}
              </p>
            )}

            {/* Live Session Toggle (own profile) */}
            {isOwnProfile && (
              <div
                className="mt-4 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
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
                      style={{ backgroundColor: user.isAvailableForLiveSession ? 'var(--color-primary)' : 'var(--color-muted)' }}
                    />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        {user.isAvailableForLiveSession ? 'Available for Live Session' : 'Offline for Instant Swaps'}
                      </h4>
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--color-soft)', color: user.isAvailableForLiveSession ? 'var(--color-primary)' : 'var(--color-muted)' }}
                      >
                        {user.isAvailableForLiveSession ? 'Visible to Peers' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      {user.isAvailableForLiveSession
                        ? 'Campus peers and AI Matching can see you are ready for live exchanges.'
                        : 'Turn this on when you have free time to teach or learn live.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(user.isAvailableForLiveSession)}
                    onClick={() => storageService.toggleLiveSessionAvailability(user.id)}
                    className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out"
                    style={{ backgroundColor: user.isAvailableForLiveSession ? 'var(--color-primary)' : 'var(--color-soft)' }}
                  >
                    <span
                      className="pointer-events-none inline-block h-5 w-5 transform rounded-full mt-0.5 ml-0.5 transition duration-200 ease-in-out"
                      style={{
                        backgroundColor: user.isAvailableForLiveSession ? '#FFFFFF' : 'var(--color-muted)',
                        transform: user.isAvailableForLiveSession ? 'translateX(20px)' : 'translateX(0)'
                      }}
                    />
                  </button>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                    {user.isAvailableForLiveSession ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            )}

            {/* Peer Live Status (visitor view) */}
            {!isOwnProfile && (
              <div
                className="mt-3 px-3.5 py-2 rounded-xl inline-flex items-center gap-2 text-xs"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
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
                    style={{ backgroundColor: user.isAvailableForLiveSession ? 'var(--color-primary)' : 'var(--color-muted)' }}
                  />
                </span>
                <span style={{ color: 'var(--color-text)' }}>
                  {user.isAvailableForLiveSession ? 'Available for Live Session' : 'Offline for Live Sessions'}
                </span>
              </div>
            )}
          </div>

          {/* Stat Cards */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6"
            style={{ borderTop: '1px solid var(--color-soft)' }}
          >
            {[
              { label: 'Rating', icon: <Star className="w-4 h-4 fill-current" style={{ color: 'var(--color-primary)' }} />, value: user.rating.toFixed(1), sub: `(${user.reviewCount} reviews)` },
              { label: 'Streak', icon: <Flame className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />, value: user.learningStreak, sub: 'days' },
              { label: 'Sessions', icon: <Video className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />, value: user.completedSessions, sub: `${user.hoursTaught}h taught` },
              { label: 'Badges', icon: <Award className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />, value: badges.length, sub: 'earned' },
            ].map(({ label, icon, value, sub }) => (
              <div
                key={label}
                className="p-3.5 rounded-2xl flex flex-col gap-1 transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{label}</span>
                <div className="flex items-center gap-1.5">
                  {icon}
                  <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{value}</span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT GRID
      ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Skills + Reviews */}
        <div className="lg:col-span-2 space-y-6">

          {/* Skills I Can Teach */}
          <SectionCard title="Skills I Can Teach" dotColor="var(--color-primary)" action={isOwnProfile ? { label: 'Manage', onClick: () => onNavigate('/skills') } : undefined}>
            {teachingSkills.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No teaching skills listed yet.</p>
            ) : (
              <div className="space-y-2.5">
                {teachingSkills.map(s => (
                  <SkillRow key={s.id} skill={s} type="teach" />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Skills I Want to Learn */}
          <SectionCard title="Skills I Want to Learn" dotColor="#a78bfa">
            {learningSkills.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No learning skills added yet.</p>
            ) : (
              <div className="space-y-2.5">
                {learningSkills.map(s => (
                  <SkillRow key={s.id} skill={s} type="learn" />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Reviews */}
          <SectionCard title={`Peer Reviews (${reviews.length})`} extra={<Rating value={user.rating} size="sm" />}>
            {reviews.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No reviews yet. Complete your first session to earn feedback!</p>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div
                    key={r.id}
                    className="p-4 space-y-2 rounded-2xl"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={r.reviewerPhoto} alt={r.reviewerName} className="w-8 h-8 rounded-full object-cover" style={{ border: '1px solid var(--color-soft)' }} />
                        <div>
                          <h5 className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{r.reviewerName}</h5>
                          <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>Exchange on {r.skillName}</span>
                        </div>
                      </div>
                      <Rating value={r.rating} size="sm" showNumber={false} />
                    </div>
                    <p className="text-xs leading-relaxed italic" style={{ color: 'var(--color-muted)' }}>"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* RIGHT: Availability + Badges + Notifications */}
        <div className="space-y-6">
          {/* Availability */}
          <SectionCard title="Exchange Availability" icon={<Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}>
            {(!user.availability || user.availability.length === 0) ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                No schedule set. {isOwnProfile && 'Edit your profile to add availability slots.'}
              </p>
            ) : (
              <div className="space-y-2">
                {user.availability.map((slot, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Badges */}
          <SectionCard title="Earned Badges" icon={<Award className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />} action={{ label: 'View all', onClick: () => onNavigate('/badges') }}>
            {badges.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>No badges earned yet. Complete sessions to unlock achievements!</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {badges.map(b => (
                  <div
                    key={b.id}
                    className="p-3 text-center rounded-2xl transition-all hover:scale-105"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
                  >
                    <div className="text-2xl mb-1">{b.icon}</div>
                    <h5 className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{b.title}</h5>
                    <span className="text-[9px] block truncate" style={{ color: 'var(--color-muted)' }}>{b.category}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Notification Preferences (own profile only) */}
          {isOwnProfile && (
            <SectionCard title="Notification Preferences" icon={<Bell className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />}>
              <p className="text-xs mb-3" style={{ color: 'var(--color-muted)' }}>
                Control which events trigger a notification.
              </p>
              <div className="space-y-2.5">
                {([
                  { key: 'request' as NotifType, label: 'Match Requests' },
                  { key: 'match' as NotifType, label: 'Match Suggestions' },
                  { key: 'message' as NotifType, label: 'New Messages' },
                  { key: 'session' as NotifType, label: 'Session Reminders' },
                  { key: 'badge' as NotifType, label: 'Badge Unlocks' },
                  { key: 'review' as NotifType, label: 'Peer Reviews' },
                  { key: 'system' as NotifType, label: 'System & Admin' },
                ]).map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[key]}
                      onClick={() => toggle(key)}
                      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200"
                      style={{ backgroundColor: prefs[key] ? 'var(--color-primary)' : 'var(--color-soft)' }}
                    >
                      <span
                        className="pointer-events-none inline-block h-4 w-4 transform rounded-full mt-0.5 ml-0.5 transition duration-200"
                        style={{
                          backgroundColor: prefs[key] ? '#FFFFFF' : 'var(--color-muted)',
                          transform: prefs[key] ? 'translateX(16px)' : 'translateX(0)'
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {/* =========================================================
          EDIT PROFILE MODAL
      ========================================================= */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile" subtitle="Keep your information up to date">
        {saveSuccess ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" style={{ color: 'var(--color-primary)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Profile saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            {/* Photo Upload */}
            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={photoPreview || user.photoURL}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: '2px solid var(--color-soft)' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.45)' }}
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>Profile Photo</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 text-[11px] hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Click photo to change
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 text-sm"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Bio / Learning Goals</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Tell peers what you are passionate about..."
                className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 text-sm resize-none"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
              />
            </div>

            {/* College + Course */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>College</label>
                <input
                  type="text"
                  value={editCollege}
                  onChange={e => setEditCollege(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 text-sm"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Course / Major</label>
                <input
                  type="text"
                  value={editCourse}
                  onChange={e => setEditCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 text-sm"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            {/* Grad Year + Portfolio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Graduation Year</label>
                <input
                  type="number"
                  value={editGradYear}
                  onChange={e => setEditGradYear(e.target.value)}
                  min="2024" max="2035"
                  className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 text-sm"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Portfolio / GitHub URL</label>
                <input
                  type="url"
                  value={editPortfolio}
                  onChange={e => setEditPortfolio(e.target.value)}
                  placeholder="https://github.com/you"
                  className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 text-sm"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
                />
              </div>
            </div>

            {/* Availability Slots */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Availability Slots</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editAvailability.map(slot => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                  >
                    {slot}
                    <button type="button" onClick={() => removeSlot(slot)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {editAvailability.length === 0 && (
                  <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>No slots added yet.</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={editDay}
                  onChange={e => setEditDay(e.target.value)}
                  className="rounded-xl px-2 py-1.5 text-xs outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)', minHeight: 'unset' }}
                >
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  className="rounded-xl px-2 py-1.5 text-xs outline-none flex-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)', minHeight: 'unset' }}
                >
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
                <button
                  type="button"
                  onClick={addSlot}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1 cursor-pointer hover:opacity-85"
                  style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full cursor-pointer hover:opacity-70 transition-opacity text-xs"
                style={{ color: 'var(--color-muted)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-full cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Verify Student ID Modal */}
      <Modal isOpen={isVerifying} onClose={() => setIsVerifying(false)} title="Verify College Identity" subtitle="Earn the verified badge and build trust">
        {idSubmitted ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>Student ID Submitted!</h3>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Your college ID has been sent to campus admin for approval.</p>
          </div>
        ) : (
          <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Enrollment / Student ID Number</label>
              <input
                type="text"
                required
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="e.g. 2414406022"
                className="w-full px-3 py-2 rounded-xl outline-none focus:ring-2 text-sm"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)', color: 'var(--color-text)' }}
              />
            </div>
            <div
              className="border border-dashed p-6 rounded-2xl text-center space-y-2"
              style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-soft)' }}
            >
              <Upload className="w-8 h-8 mx-auto" style={{ color: 'var(--color-muted)' }} />
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>Upload College ID Card or Admission Letter</p>
              <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>PNG, JPG or PDF up to 5MB</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsVerifying(false)} className="px-4 py-2 rounded-full cursor-pointer hover:opacity-70 text-xs" style={{ color: 'var(--color-muted)' }}>Cancel</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-full cursor-pointer transition-all hover:scale-105" style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
                Submit for Verification
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

      {/* Report Modal */}
      {!isOwnProfile && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          reporter={currentUser}
          reported={user}
        />
      )}

      {/* Blocked Banner */}
      {!isOwnProfile && isBlocked && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl flex items-center gap-2.5 text-sm font-medium pointer-events-none"
          style={{ backgroundColor: '#ef4444', color: '#FFFFFF', boxShadow: '0 8px 20px rgba(239,68,68,0.4)' }}
        >
          <Ban className="w-4 h-4" />
          <span>You have blocked {user.name}. They can't message or match with you.</span>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   HELPER SUB-COMPONENTS
========================================================= */

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  dotColor?: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, dotColor, icon, extra, action }) => (
  <div
    className="p-6 space-y-4"
    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-soft)', borderRadius: 'var(--radius-card)' }}
  >
    <div className="flex items-center justify-between">
      <h3
        className="text-sm font-semibold flex items-center gap-2"
        style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
      >
        {icon ?? (dotColor && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />)}
        {title}
      </h3>
      <div className="flex items-center gap-3">
        {extra}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="text-xs font-medium hover:underline cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
    {children}
  </div>
);

interface SkillRowProps {
  skill: UserSkill;
  type: 'teach' | 'learn';
}

const SkillRow: React.FC<SkillRowProps> = ({ skill, type }) => (
  <div
    className="p-3.5 rounded-2xl flex items-center justify-between gap-3"
    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-soft)' }}
  >
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{skill.skillName}</span>
        <span
          className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
        >
          {type === 'teach' ? skill.level : 'Goal'}
        </span>
      </div>
      <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
        {type === 'teach'
          ? `${skill.category} · ${skill.experienceYears || 1} yr${(skill.experienceYears || 1) > 1 ? 's' : ''} experience`
          : skill.learningGoal || 'Looking for guidance and practice sessions.'}
      </p>
    </div>
  </div>
);
