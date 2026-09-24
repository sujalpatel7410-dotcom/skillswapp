import {
  User,
  Skill,
  UserSkill,
  MatchRequest,
  Conversation,
  Message,
  LearningSession,
  Review,
  Badge,
  AppNotification,
  SafetyReport,
  College
} from '../types';
import {
  SEED_COLLEGES,
  SEED_SKILLS,
  SEED_BADGES
} from '../data/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Listener = () => void;

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function runAsyncMutation(fn: () => PromiseLike<any>, description: string) {
  try {
    const res = await fn();
    if (res && typeof res === 'object' && 'error' in res && res.error) {
      console.warn(`Supabase ${description} error:`, res.error.message);
    }
  } catch (err: any) {
    console.warn(`Supabase ${description} failed:`, err?.message || err);
  }
}

function mapProfileToUser(p: any): User {
  return {
    id: p.id,
    name: p.name || 'Student',
    email: p.email || '',
    photoURL: p.photo_url || p.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    collegeId: p.college_id || p.collegeId || 'col-custom',
    collegeName: p.college_name || p.collegeName || 'Campus Student',
    course: p.course || 'Undergraduate',
    graduationYear: Number(p.graduation_year ?? p.graduationYear) || 2027,
    bio: p.bio || '',
    studentIdNumber: p.student_id_number || p.studentIdNumber || undefined,
    badges: Array.isArray(p.badges) ? p.badges : [],
    verificationStatus: p.verification_status || p.verificationStatus || 'unverified',
    verificationDocumentType: p.verification_document_type || p.verificationDocumentType || undefined,
    verificationDocumentValue: p.verification_document_value || p.verificationDocumentValue || undefined,
    rating: Number(p.rating) || 5.0,
    reviewCount: Number(p.review_count ?? p.reviewCount) || 0,
    completedSessions: Number(p.completed_sessions ?? p.completedSessions) || 0,
    hoursLearned: Number(p.hours_learned ?? p.hoursLearned) || 0,
    hoursTaught: Number(p.hours_taught ?? p.hoursTaught) || 0,
    learningStreak: Number(p.learning_streak ?? p.learningStreak) || 0,
    longestStreak: Number(p.longest_streak ?? p.longestStreak) || 0,
    lastActiveDate: p.last_active_date || p.lastActiveDate || new Date().toISOString(),
    availability: Array.isArray(p.availability) ? p.availability : [],
    isAvailableForLiveSession: Boolean(p.is_available_for_live_session ?? p.isAvailableForLiveSession),
    interests: Array.isArray(p.interests) ? p.interests : [],
    isAdmin: Boolean(p.is_admin ?? p.isAdmin),
    isSuspended: Boolean(p.is_suspended ?? p.isSuspended),
    createdAt: p.created_at || p.createdAt || new Date().toISOString(),
    updatedAt: p.updated_at || p.updatedAt || new Date().toISOString()
  };
}

function mapUserToProfile(u: Partial<User>): Record<string, any> {
  const profile: Record<string, any> = {};
  if (u.id !== undefined) profile.id = u.id;
  if (u.name !== undefined) profile.name = u.name;
  if (u.email !== undefined) profile.email = u.email;
  if (u.photoURL !== undefined) profile.photo_url = u.photoURL;
  if (u.collegeId !== undefined) profile.college_id = u.collegeId;
  if (u.collegeName !== undefined) profile.college_name = u.collegeName;
  if (u.course !== undefined) profile.course = u.course;
  if (u.graduationYear !== undefined) profile.graduation_year = u.graduationYear;
  if (u.bio !== undefined) profile.bio = u.bio;
  if (u.studentIdNumber !== undefined) profile.student_id_number = u.studentIdNumber;
  if (u.badges !== undefined) profile.badges = u.badges;
  if (u.verificationStatus !== undefined) profile.verification_status = u.verificationStatus;
  if (u.verificationDocumentType !== undefined) profile.verification_document_type = u.verificationDocumentType;
  if (u.verificationDocumentValue !== undefined) profile.verification_document_value = u.verificationDocumentValue;
  if (u.rating !== undefined) profile.rating = u.rating;
  if (u.reviewCount !== undefined) profile.review_count = u.reviewCount;
  if (u.completedSessions !== undefined) profile.completed_sessions = u.completedSessions;
  if (u.hoursLearned !== undefined) profile.hours_learned = u.hoursLearned;
  if (u.hoursTaught !== undefined) profile.hours_taught = u.hoursTaught;
  if (u.learningStreak !== undefined) profile.learning_streak = u.learningStreak;
  if (u.longestStreak !== undefined) profile.longest_streak = u.longestStreak;
  if (u.lastActiveDate !== undefined) profile.last_active_date = u.lastActiveDate;
  if (u.availability !== undefined) profile.availability = u.availability;
  if (u.isAvailableForLiveSession !== undefined) profile.is_available_for_live_session = u.isAvailableForLiveSession;
  if (u.interests !== undefined) profile.interests = u.interests;
  if (u.isAdmin !== undefined) profile.is_admin = u.isAdmin;
  if (u.isSuspended !== undefined) profile.is_suspended = u.isSuspended;
  profile.updated_at = new Date().toISOString();
  return profile;
}

function mapRowToSkill(row: any): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || '',
    icon: row.icon || undefined
  };
}

function mapSkillToRow(s: Partial<Skill>): Record<string, any> {
  const row: Record<string, any> = {};
  if (s.id) row.id = s.id;
  if (s.name) row.name = s.name;
  if (s.category) row.category = s.category;
  if (s.description !== undefined) row.description = s.description;
  if (s.icon !== undefined) row.icon = s.icon;
  return row;
}

function mapRowToUserSkill(row: any): UserSkill {
  return {
    id: row.id,
    userId: row.user_id,
    skillId: row.skill_id || row.id,
    skillName: row.skill_name,
    category: row.category,
    type: row.type,
    level: row.level,
    experienceYears: row.experience_years ?? undefined,
    experienceMonths: row.experience_months ?? undefined,
    learningGoal: row.learning_goal || undefined,
    createdAt: row.created_at || new Date().toISOString()
  };
}

function mapUserSkillToRow(us: Partial<UserSkill>): Record<string, any> {
  const row: Record<string, any> = {};
  if (us.id) row.id = us.id;
  if (us.userId) row.user_id = us.userId;
  if (us.skillId && !us.skillId.startsWith('sk-')) row.skill_id = us.skillId;
  if (us.skillName) row.skill_name = us.skillName;
  if (us.category) row.category = us.category;
  if (us.type) row.type = us.type;
  if (us.level) row.level = us.level;
  if (us.experienceYears !== undefined) row.experience_years = us.experienceYears;
  if (us.experienceMonths !== undefined) row.experience_months = us.experienceMonths;
  if (us.learningGoal !== undefined) row.learning_goal = us.learningGoal;
  return row;
}

function mapRowToMatchRequest(row: any): MatchRequest {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderPhoto: row.sender_photo || '',
    senderCollege: row.sender_college || '',
    receiverId: row.receiver_id,
    receiverName: row.receiver_name,
    receiverPhoto: row.receiver_photo || '',
    offeredSkillName: row.offered_skill_name,
    requestedSkillName: row.requested_skill_name,
    message: row.message || '',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at
  };
}

function mapMatchRequestToRow(r: Partial<MatchRequest>): Record<string, any> {
  const row: Record<string, any> = {};
  if (r.id) row.id = r.id;
  if (r.senderId) row.sender_id = r.senderId;
  if (r.senderName) row.sender_name = r.senderName;
  if (r.senderPhoto !== undefined) row.sender_photo = r.senderPhoto;
  if (r.senderCollege !== undefined) row.sender_college = r.senderCollege;
  if (r.receiverId) row.receiver_id = r.receiverId;
  if (r.receiverName) row.receiver_name = r.receiverName;
  if (r.receiverPhoto !== undefined) row.receiver_photo = r.receiverPhoto;
  if (r.offeredSkillName) row.offered_skill_name = r.offeredSkillName;
  if (r.requestedSkillName) row.requested_skill_name = r.requestedSkillName;
  if (r.message !== undefined) row.message = r.message;
  if (r.status) row.status = r.status;
  row.updated_at = new Date().toISOString();
  return row;
}

function mapRowToConversation(row: any): Conversation {
  return {
    id: row.id,
    participantIds: Array.isArray(row.participant_ids) ? row.participant_ids : [],
    participants: Array.isArray(row.participants) ? row.participants : [],
    unreadCount: typeof row.unread_count === 'object' && row.unread_count ? row.unread_count : {},
    lastMessage: row.last_message || undefined,
    matchedSkillPair: row.matched_skill_pair || undefined,
    updatedAt: row.updated_at || row.created_at || new Date().toISOString()
  };
}

function mapConversationToRow(c: Partial<Conversation>): Record<string, any> {
  const row: Record<string, any> = {};
  if (c.id) row.id = c.id;
  if (c.participantIds) row.participant_ids = c.participantIds;
  if (c.participants) row.participants = c.participants;
  if (c.unreadCount) row.unread_count = c.unreadCount;
  if (c.lastMessage !== undefined) row.last_message = c.lastMessage;
  if (c.matchedSkillPair !== undefined) row.matched_skill_pair = c.matchedSkillPair;
  row.updated_at = new Date().toISOString();
  return row;
}

function mapRowToMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    text: row.text,
    isCodeSnippet: Boolean(row.is_code_snippet),
    attachmentUrl: row.attachment_url || undefined,
    attachmentType: row.attachment_type || undefined,
    read: Boolean(row.read),
    createdAt: row.created_at
  };
}

function mapMessageToRow(m: Partial<Message>): Record<string, any> {
  const row: Record<string, any> = {};
  if (m.id) row.id = m.id;
  if (m.conversationId) row.conversation_id = m.conversationId;
  if (m.senderId) row.sender_id = m.senderId;
  if (m.senderName) row.sender_name = m.senderName;
  if (m.text !== undefined) row.text = m.text;
  if (m.isCodeSnippet !== undefined) row.is_code_snippet = m.isCodeSnippet;
  if (m.attachmentUrl !== undefined) row.attachment_url = m.attachmentUrl;
  if (m.attachmentType !== undefined) row.attachment_type = m.attachmentType;
  if (m.read !== undefined) row.read = m.read;
  return row;
}

function mapRowToSession(row: any): LearningSession {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name,
    teacherPhoto: row.teacher_photo || '',
    teacherCollege: row.teacher_college || '',
    learnerId: row.learner_id,
    learnerName: row.learner_name,
    learnerPhoto: row.learner_photo || '',
    learnerCollege: row.learner_college || '',
    skillId: row.skill_id || '',
    skillName: row.skill_name,
    scheduledAt: row.scheduled_at,
    timeSlot: row.time_slot,
    durationMinutes: Number(row.duration_minutes) || 60,
    meetingLink: row.meeting_link || '',
    status: row.status,
    notes: row.notes || '',
    reviewRating: row.review_rating ? Number(row.review_rating) : undefined,
    reviewComment: row.review_comment || undefined,
    hasReviewByLearner: Boolean(row.has_review_by_learner),
    hasReviewByTeacher: Boolean(row.has_review_by_teacher),
    createdAt: row.created_at
  };
}

function mapSessionToRow(s: Partial<LearningSession>): Record<string, any> {
  const row: Record<string, any> = {};
  if (s.id) row.id = s.id;
  if (s.teacherId) row.teacher_id = s.teacherId;
  if (s.teacherName) row.teacher_name = s.teacherName;
  if (s.teacherPhoto !== undefined) row.teacher_photo = s.teacherPhoto;
  if (s.teacherCollege !== undefined) row.teacher_college = s.teacherCollege;
  if (s.learnerId) row.learner_id = s.learnerId;
  if (s.learnerName) row.learner_name = s.learnerName;
  if (s.learnerPhoto !== undefined) row.learner_photo = s.learnerPhoto;
  if (s.learnerCollege !== undefined) row.learner_college = s.learnerCollege;
  if (s.skillId !== undefined) row.skill_id = s.skillId;
  if (s.skillName) row.skill_name = s.skillName;
  if (s.scheduledAt) row.scheduled_at = s.scheduledAt;
  if (s.timeSlot) row.time_slot = s.timeSlot;
  if (s.durationMinutes !== undefined) row.duration_minutes = s.durationMinutes;
  if (s.meetingLink !== undefined) row.meeting_link = s.meetingLink;
  if (s.status) row.status = s.status;
  if (s.notes !== undefined) row.notes = s.notes;
  if (s.reviewRating !== undefined) row.review_rating = s.reviewRating;
  if (s.reviewComment !== undefined) row.review_comment = s.reviewComment;
  if (s.hasReviewByLearner !== undefined) row.has_review_by_learner = s.hasReviewByLearner;
  if (s.hasReviewByTeacher !== undefined) row.has_review_by_teacher = s.hasReviewByTeacher;
  return row;
}

function mapRowToReview(row: any): Review {
  return {
    id: row.id,
    sessionId: row.session_id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer_name,
    reviewerPhoto: row.reviewer_photo || '',
    recipientId: row.recipient_id,
    rating: Number(row.rating) || 5,
    comment: row.comment || '',
    skillName: row.skill_name || '',
    role: row.role,
    createdAt: row.created_at
  };
}

function mapReviewToRow(r: Partial<Review>): Record<string, any> {
  const row: Record<string, any> = {};
  if (r.id) row.id = r.id;
  if (r.sessionId) row.session_id = r.sessionId;
  if (r.reviewerId) row.reviewer_id = r.reviewerId;
  if (r.reviewerName) row.reviewer_name = r.reviewerName;
  if (r.reviewerPhoto !== undefined) row.reviewer_photo = r.reviewerPhoto;
  if (r.recipientId) row.recipient_id = r.recipientId;
  if (r.rating !== undefined) row.rating = r.rating;
  if (r.comment !== undefined) row.comment = r.comment;
  if (r.skillName !== undefined) row.skill_name = r.skillName;
  if (r.role !== undefined) row.role = r.role;
  return row;
}

function mapRowToNotification(row: any): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    type: row.type,
    read: Boolean(row.read),
    link: row.link || undefined,
    createdAt: row.created_at
  };
}

function mapNotificationToRow(n: Partial<AppNotification>): Record<string, any> {
  const row: Record<string, any> = {};
  if (n.id) row.id = n.id;
  if (n.userId) row.user_id = n.userId;
  if (n.title) row.title = n.title;
  if (n.description) row.description = n.description;
  if (n.type) row.type = n.type;
  if (n.read !== undefined) row.read = n.read;
  if (n.link !== undefined) row.link = n.link;
  return row;
}

function mapRowToReport(row: any): SafetyReport {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    reporterName: row.reporter_name,
    reportedUserId: row.reported_user_id,
    reportedUserName: row.reported_user_name,
    category: row.category,
    details: row.details,
    status: row.status,
    createdAt: row.created_at
  };
}

function mapReportToRow(r: Partial<SafetyReport>): Record<string, any> {
  const row: Record<string, any> = {};
  if (r.id) row.id = r.id;
  if (r.reporterId) row.reporter_id = r.reporterId;
  if (r.reporterName) row.reporter_name = r.reporterName;
  if (r.reportedUserId) row.reported_user_id = r.reportedUserId;
  if (r.reportedUserName) row.reported_user_name = r.reportedUserName;
  if (r.category) row.category = r.category;
  if (r.details) row.details = r.details;
  if (r.status) row.status = r.status;
  return row;
}

class StorageService {
  private listeners: Set<Listener> = new Set();
  private users: User[] = [];
  private skills: Skill[] = SEED_SKILLS;
  private colleges: College[] = SEED_COLLEGES;
  private userSkills: UserSkill[] = [];
  private matchRequests: MatchRequest[] = [];
  private conversations: Conversation[] = [];
  private messages: Message[] = [];
  private sessions: LearningSession[] = [];
  private reviews: Review[] = [];
  private badges: Badge[] = SEED_BADGES.map(b => ({ ...b, progress: 0, unlockedAt: undefined }));
  private notifications: AppNotification[] = [];
  private reports: SafetyReport[] = [];
  private currentUserId: string | null = null;
  private isFetching = false;
  private realtimeChannel: any = null;
  private activeChannels: Map<string, any> = new Map();

  constructor() {
    this.init();
  }

  private cleanupLegacyLocalStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Only keep dark mode and theme preferences in localStorage
        if (
          key &&
          key.startsWith('skillswap_') &&
          key !== 'skillswap_dark_mode' &&
          key !== 'skillswap_theme'
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Error clearing legacy localStorage:', e);
    }
  }

  private async init() {
    this.cleanupLegacyLocalStorage();
    if (typeof window === 'undefined') return;

    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          this.currentUserId = session.user.id;
        }

        supabase.auth.onAuthStateChange((event, newSession) => {
          if (newSession?.user) {
            this.currentUserId = newSession.user.id;
          } else {
            this.currentUserId = null;
          }
          this.fetchAllDataFromSupabase();
        });

        this.setupRealtimeSubscription();
      } catch (e) {
        console.warn('Supabase auth check failed in storageService:', e);
      }
    }

    await this.fetchAllDataFromSupabase();
  }

  private setupRealtimeSubscription() {
    if (!isSupabaseConfigured || this.realtimeChannel) return;
    try {
      this.realtimeChannel = supabase
        .channel('skillswap-realtime-global')
        // Instant handling for newly inserted messages
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
          if (payload?.new) {
            const newMsg = mapRowToMessage(payload.new);
            const exists = this.messages.some(m => m.id === newMsg.id);
            if (!exists) {
              this.messages.push(newMsg);
              const conv = this.conversations.find(c => c.id === newMsg.conversationId);
              if (conv) {
                conv.lastMessage = {
                  text: newMsg.text,
                  senderId: newMsg.senderId,
                  createdAt: newMsg.createdAt,
                  read: newMsg.read
                };
                conv.updatedAt = newMsg.createdAt;
                if (!conv.unreadCount) conv.unreadCount = {};
                if (this.currentUserId && newMsg.senderId !== this.currentUserId) {
                  conv.unreadCount[this.currentUserId] = (conv.unreadCount[this.currentUserId] || 0) + 1;
                }
              }
              this.notify();
            }
          }
        })
        // Instant handling for updated messages (e.g. read receipts from peers)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload: any) => {
          if (payload?.new) {
            const updated = mapRowToMessage(payload.new);
            const idx = this.messages.findIndex(m => m.id === updated.id);
            if (idx >= 0) {
              this.messages[idx] = updated;
              this.notify();
            }
          }
        })
        // Instant handling for conversation changes
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload: any) => {
          if (payload?.new) {
            const conv = mapRowToConversation(payload.new);
            const idx = this.conversations.findIndex(c => c.id === conv.id);
            if (idx >= 0) {
              this.conversations[idx] = { ...this.conversations[idx], ...conv };
            } else {
              this.conversations.unshift(conv);
            }
            this.notify();
          }
        })
        // Catch-all for other public tables (profiles, match_requests, sessions, reviews, etc.)
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload: any) => {
          if (payload?.table !== 'messages' && payload?.table !== 'conversations') {
            this.fetchAllDataFromSupabase();
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  public async fetchAllDataFromSupabase() {
    if (!isSupabaseConfigured || this.isFetching) return;
    this.isFetching = true;

    try {
      const [
        profilesRes,
        skillsRes,
        userSkillsRes,
        matchReqsRes,
        convosRes,
        messagesRes,
        sessionsRes,
        reviewsRes,
        badgesRes,
        userBadgesRes,
        notifsRes,
        reportsRes
      ] = await Promise.allSettled([
        supabase.from('profiles').select('*'),
        supabase.from('skills').select('*'),
        supabase.from('user_skills').select('*'),
        supabase.from('match_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('conversations').select('*').order('updated_at', { ascending: false }),
        supabase.from('messages').select('*').order('created_at', { ascending: true }),
        supabase.from('sessions').select('*').order('scheduled_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('badges').select('*'),
        supabase.from('user_badges').select('*'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('created_at', { ascending: false })
      ]);

      if (profilesRes.status === 'fulfilled' && profilesRes.value.data) {
        this.users = profilesRes.value.data.map(mapProfileToUser);
      }

      if (skillsRes.status === 'fulfilled' && skillsRes.value.data && skillsRes.value.data.length > 0) {
        this.skills = skillsRes.value.data.map(mapRowToSkill);
      }

      if (userSkillsRes.status === 'fulfilled' && userSkillsRes.value.data) {
        this.userSkills = userSkillsRes.value.data.map(mapRowToUserSkill);
      }

      if (matchReqsRes.status === 'fulfilled' && matchReqsRes.value.data) {
        this.matchRequests = matchReqsRes.value.data.map(mapRowToMatchRequest);
      }

      if (convosRes.status === 'fulfilled' && convosRes.value.data) {
        this.conversations = convosRes.value.data.map(mapRowToConversation);
      }

      if (messagesRes.status === 'fulfilled' && messagesRes.value.data) {
        this.messages = messagesRes.value.data.map(mapRowToMessage);
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data) {
        this.sessions = sessionsRes.value.data.map(mapRowToSession);
      }

      if (reviewsRes.status === 'fulfilled' && reviewsRes.value.data) {
        this.reviews = reviewsRes.value.data.map(mapRowToReview);
      }

      // Badges: Merge catalog with user_badges progress
      const baseBadges = (badgesRes.status === 'fulfilled' && badgesRes.value.data && badgesRes.value.data.length > 0)
        ? badgesRes.value.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            description: b.description,
            icon: b.icon,
            category: b.category,
            requirement: b.requirement
          }))
        : SEED_BADGES;

      const userBadgeMap = new Map<string, { progress: number; unlockedAt?: string }>();
      if (userBadgesRes.status === 'fulfilled' && userBadgesRes.value.data) {
        userBadgesRes.value.data.forEach((ub: any) => {
          if (!this.currentUserId || ub.user_id === this.currentUserId) {
            userBadgeMap.set(ub.badge_id, {
              progress: ub.progress ?? 0,
              unlockedAt: ub.unlocked_at || undefined
            });
          }
        });
      }

      this.badges = baseBadges.map(b => {
        const ub = userBadgeMap.get(b.id);
        return {
          ...b,
          progress: ub ? ub.progress : 0,
          unlockedAt: ub ? ub.unlockedAt : undefined
        };
      });

      if (notifsRes.status === 'fulfilled' && notifsRes.value.data) {
        this.notifications = notifsRes.value.data.map(mapRowToNotification);
      }

      if (reportsRes.status === 'fulfilled' && reportsRes.value.data) {
        this.reports = reportsRes.value.data.map(mapRowToReport);
      }

      this.notify();
    } catch (e) {
      console.warn('Failed to fetch data from Supabase:', e);
    } finally {
      this.isFetching = false;
    }
  }

  public resetToDefaults() {
    this.cleanupLegacyLocalStorage();
    this.fetchAllDataFromSupabase();
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // Users
  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public saveUser(user: User): User {
    const idx = this.users.findIndex(u => u.id === user.id);
    const updatedUser: User = { ...user, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      this.users[idx] = updatedUser;
    } else {
      this.users.push(updatedUser);
    }
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('profiles').upsert(mapUserToProfile(updatedUser)), 'saveUser');
    }

    return updatedUser;
  }

  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  public setCurrentUserId(id: string | null) {
    this.currentUserId = id;
    this.notify();
    if (id) {
      this.fetchAllDataFromSupabase();
    }
  }

  public clearCurrentUser() {
    this.currentUserId = null;
    this.notify();
  }

  public getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.getUserById(this.currentUserId) || null;
  }

  public setLiveSessionAvailability(isAvailable: boolean, userId?: string): User | undefined {
    const id = userId || this.getCurrentUserId();
    if (!id) return undefined;
    const user = this.getUserById(id);
    if (!user) return undefined;
    const updated: User = {
      ...user,
      isAvailableForLiveSession: isAvailable
    };
    this.saveUser(updated);
    return updated;
  }

  public toggleLiveSessionAvailability(userId?: string): boolean {
    const id = userId || this.getCurrentUserId();
    if (!id) return false;
    const user = this.getUserById(id);
    if (!user) return false;
    const nextStatus = !user.isAvailableForLiveSession;
    this.setLiveSessionAvailability(nextStatus, id);
    return nextStatus;
  }

  // Skills
  public getSkills(): Skill[] {
    return this.skills;
  }

  public addSkill(skill: Omit<Skill, 'id'>): Skill {
    const newSkill: Skill = {
      ...skill,
      id: generateUUID()
    };
    this.skills.push(newSkill);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('skills').insert(mapSkillToRow(newSkill)), 'addSkill');
    }

    return newSkill;
  }

  // Colleges
  public getColleges(): College[] {
    return this.colleges;
  }

  // User Skills
  public getUserSkills(userId?: string): UserSkill[] {
    return userId ? this.userSkills.filter(us => us.userId === userId) : this.userSkills;
  }

  public addUserSkill(userSkill: Omit<UserSkill, 'id' | 'createdAt'>): UserSkill {
    const newItem: UserSkill = {
      ...userSkill,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    this.userSkills.push(newItem);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('user_skills').insert(mapUserSkillToRow(newItem)), 'addUserSkill');
    }

    return newItem;
  }

  public removeUserSkill(id: string) {
    this.userSkills = this.userSkills.filter(s => s.id !== id);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('user_skills').delete().eq('id', id), 'removeUserSkill');
    }
  }

  public updateUserSkill(id: string, updates: Partial<UserSkill>) {
    const idx = this.userSkills.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.userSkills[idx] = { ...this.userSkills[idx], ...updates };
      this.notify();

      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('user_skills').update(mapUserSkillToRow(updates)).eq('id', id), 'updateUserSkill');
      }
    }
  }

  // Match Requests
  public getMatchRequests(userId?: string): MatchRequest[] {
    if (!userId) return this.matchRequests;
    return this.matchRequests.filter(r => r.senderId === userId || r.receiverId === userId);
  }

  public createMatchRequest(req: Omit<MatchRequest, 'id' | 'createdAt' | 'updatedAt'>): MatchRequest {
    const newReq: MatchRequest = {
      ...req,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.matchRequests.unshift(newReq);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('match_requests').insert(mapMatchRequestToRow(newReq)), 'createMatchRequest');
    }

    // Notify receiver
    this.createNotification({
      userId: req.receiverId,
      title: 'New Skill Exchange Request',
      description: `${req.senderName} proposed an exchange: Teach ${req.offeredSkillName} for ${req.requestedSkillName}`,
      type: 'request',
      link: '/matches'
    });

    return newReq;
  }

  public updateMatchRequestStatus(requestId: string, status: MatchRequest['status']) {
    const idx = this.matchRequests.findIndex(r => r.id === requestId);
    if (idx >= 0) {
      const updatedAt = new Date().toISOString();
      this.matchRequests[idx].status = status;
      this.matchRequests[idx].updatedAt = updatedAt;
      this.notify();

      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('match_requests').update({ status, updated_at: updatedAt }).eq('id', requestId), 'updateMatchRequestStatus');
      }

      const req = this.matchRequests[idx];
      // If accepted, auto create or find conversation
      if (status === 'accepted') {
        this.getOrCreateConversation(req.senderId, req.receiverId, {
          offered: req.offeredSkillName,
          requested: req.requestedSkillName
        });

        // Notify sender
        this.createNotification({
          userId: req.senderId,
          title: 'Skill Exchange Accepted! 🎉',
          description: `${req.receiverName} accepted your skill exchange request! Start chatting now.`,
          type: 'request',
          link: '/messages'
        });
      }
    }
  }

  // Conversations & Messages
  public getConversations(userId?: string): Conversation[] {
    if (!userId) return this.conversations;
    return this.conversations.filter(c => c.participantIds.includes(userId));
  }

  public getConversationById(id: string): Conversation | undefined {
    return this.conversations.find(c => c.id === id);
  }

  public getUnreadMessagesCount(userId?: string): number {
    const uId = userId || this.currentUserId;
    if (!uId) return 0;
    const userConvos = this.getConversations(uId);
    let total = 0;
    for (const c of userConvos) {
      const countFromObj = (c.unreadCount && typeof c.unreadCount[uId] === 'number') ? c.unreadCount[uId] : 0;
      const countFromMsgs = this.messages.filter(
        m => m.conversationId === c.id && m.senderId !== uId && !m.read
      ).length;
      total += Math.max(countFromObj, countFromMsgs);
    }
    return total;
  }

  public getOrCreateConversation(
    user1Id: string,
    user2Id: string,
    matchedSkills?: { offered: string; requested: string }
  ): Conversation {
    const existing = this.conversations.find(
      c => c.participantIds.includes(user1Id) && c.participantIds.includes(user2Id)
    );
    if (existing) return existing;

    const u1 = this.getUserById(user1Id);
    const u2 = this.getUserById(user2Id);

    const newConv: Conversation = {
      id: generateUUID(),
      participantIds: [user1Id, user2Id],
      participants: [
        {
          id: user1Id,
          name: u1?.name || 'User',
          photoURL: u1?.photoURL || '',
          collegeName: u1?.collegeName || '',
          isOnline: true
        },
        {
          id: user2Id,
          name: u2?.name || 'User',
          photoURL: u2?.photoURL || '',
          collegeName: u2?.collegeName || '',
          isOnline: true
        }
      ],
      matchedSkillPair: matchedSkills,
      unreadCount: {
        [user1Id]: 0,
        [user2Id]: 0
      },
      updatedAt: new Date().toISOString()
    };

    this.conversations.unshift(newConv);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('conversations').insert(mapConversationToRow(newConv)), 'getOrCreateConversation');
    }

    return newConv;
  }

  public getMessages(conversationId: string): Message[] {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  public getOrCreateConversationChannel(conversationId: string) {
    if (!isSupabaseConfigured) return null;
    const channelKey = `chat-room:${conversationId}`;
    let chan = this.activeChannels.get(channelKey);
    if (!chan) {
      chan = supabase.channel(channelKey, {
        config: {
          broadcast: { ack: false }
        }
      });
      this.activeChannels.set(channelKey, chan);
      chan.subscribe();
    }
    return chan;
  }

  public broadcastTyping(conversationId: string, userId: string, userName: string, isTyping: boolean) {
    // 1. Supabase Realtime broadcast channel
    if (isSupabaseConfigured) {
      const chan = this.getOrCreateConversationChannel(conversationId);
      if (chan) {
        chan.send({
          type: 'broadcast',
          event: 'typing',
          payload: { conversationId, userId, userName, isTyping }
        }).catch((err: any) => console.warn('Broadcast typing error:', err));
      }
    }

    // 2. Cross-tab BroadcastChannel for zero-latency multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(`skillswap_typing_${conversationId}`);
        bc.postMessage({ conversationId, userId, userName, isTyping });
        bc.close();
      } catch (e) {
        // ignore
      }
    }
  }

  public broadcastReadReceipt(conversationId: string, readerId: string) {
    // 1. Supabase Realtime broadcast channel
    if (isSupabaseConfigured) {
      const chan = this.getOrCreateConversationChannel(conversationId);
      if (chan) {
        chan.send({
          type: 'broadcast',
          event: 'read_receipt',
          payload: { conversationId, readerId }
        }).catch((err: any) => console.warn('Broadcast read receipt error:', err));
      }
    }

    // 2. Cross-tab BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(`skillswap_read_${conversationId}`);
        bc.postMessage({ conversationId, readerId });
        bc.close();
      } catch (e) {
        // ignore
      }
    }
  }

  public subscribeToConversationRealtime(
    conversationId: string,
    handlers: {
      onNewMessage?: (msg: Message) => void;
      onTyping?: (data: { userId: string; userName: string; isTyping: boolean }) => void;
      onReadReceipt?: (data: { conversationId: string; readerId: string }) => void;
    }
  ): () => void {
    const chan = this.getOrCreateConversationChannel(conversationId);

    const onTypingHandler = ({ payload }: any) => {
      if (payload?.conversationId === conversationId) {
        handlers.onTyping?.(payload);
      }
    };

    const onNewMessageHandler = ({ payload }: any) => {
      if (payload?.conversationId === conversationId) {
        handlers.onNewMessage?.(payload);
      }
    };

    const onReadReceiptHandler = ({ payload }: any) => {
      if (payload?.conversationId === conversationId) {
        handlers.onReadReceipt?.(payload);
      }
    };

    if (chan) {
      chan.on('broadcast', { event: 'typing' }, onTypingHandler);
      chan.on('broadcast', { event: 'new_message' }, onNewMessageHandler);
      chan.on('broadcast', { event: 'read_receipt' }, onReadReceiptHandler);
    }

    // Cross-tab BroadcastChannel
    let typingBc: BroadcastChannel | null = null;
    let readBc: BroadcastChannel | null = null;
    let msgBc: BroadcastChannel | null = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        typingBc = new BroadcastChannel(`skillswap_typing_${conversationId}`);
        typingBc.onmessage = (e) => {
          if (e.data?.conversationId === conversationId) {
            handlers.onTyping?.(e.data);
          }
        };

        readBc = new BroadcastChannel(`skillswap_read_${conversationId}`);
        readBc.onmessage = (e) => {
          if (e.data?.conversationId === conversationId) {
            handlers.onReadReceipt?.(e.data);
          }
        };

        msgBc = new BroadcastChannel(`skillswap_msg_${conversationId}`);
        msgBc.onmessage = (e) => {
          if (e.data?.conversationId === conversationId) {
            handlers.onNewMessage?.(e.data);
          }
        };
      } catch (e) {
        // ignore
      }
    }

    return () => {
      if (typingBc) typingBc.close();
      if (readBc) readBc.close();
      if (msgBc) msgBc.close();
    };
  }

  public markConversationAsRead(conversationId: string, userId: string) {
    let changed = false;
    this.messages.forEach(m => {
      if (m.conversationId === conversationId && m.senderId !== userId && !m.read) {
        m.read = true;
        changed = true;
      }
    });

    const convIdx = this.conversations.findIndex(c => c.id === conversationId);
    if (convIdx >= 0 && this.conversations[convIdx].unreadCount) {
      if ((this.conversations[convIdx].unreadCount![userId] || 0) > 0) {
        this.conversations[convIdx].unreadCount![userId] = 0;
        changed = true;
      }
    }

    if (changed) {
      this.notify();

      // Broadcast read receipt to peer so their screen immediately reflects "Read" status
      this.broadcastReadReceipt(conversationId, userId);

      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('messages').update({ read: true }).eq('conversation_id', conversationId).neq('sender_id', userId), 'markMessagesRead');

        if (convIdx >= 0) {
          runAsyncMutation(() => supabase.from('conversations').update({ unread_count: this.conversations[convIdx].unreadCount }).eq('id', conversationId), 'updateConversationUnreadCount');
        }
      }
    }
  }

  public sendMessage(
    conversationIdOrPayload: string | { conversationId: string; senderId: string; text: string; isCodeSnippet?: boolean; senderName?: string; attachmentUrl?: string },
    senderId?: string,
    senderName?: string,
    text?: string,
    attachmentUrl?: string
  ): Message {
    let convoId = '';
    let sId = '';
    let sName = '';
    let msgText = '';
    let isSnippet = false;
    let attach = attachmentUrl;

    if (typeof conversationIdOrPayload === 'object') {
      convoId = conversationIdOrPayload.conversationId;
      sId = conversationIdOrPayload.senderId;
      sName = conversationIdOrPayload.senderName || (sId ? this.getUserById(sId)?.name : 'Student') || 'Student';
      msgText = conversationIdOrPayload.text;
      isSnippet = !!conversationIdOrPayload.isCodeSnippet;
      attach = conversationIdOrPayload.attachmentUrl;
    } else {
      convoId = conversationIdOrPayload;
      sId = senderId || this.getCurrentUserId() || '';
      sName = senderName || (sId ? this.getUserById(sId)?.name : 'Student') || 'Student';
      msgText = text || '';
    }

    const newMessage: Message = {
      id: generateUUID(),
      conversationId: convoId,
      senderId: sId,
      senderName: sName,
      text: msgText,
      isCodeSnippet: isSnippet,
      attachmentUrl: attach,
      read: false,
      createdAt: new Date().toISOString()
    };

    this.messages.push(newMessage);

    // Update conversation lastMessage & unread count
    const convIdx = this.conversations.findIndex(c => c.id === convoId);
    if (convIdx >= 0) {
      const convo = this.conversations[convIdx];
      convo.lastMessage = {
        text: msgText,
        senderId: sId,
        createdAt: newMessage.createdAt,
        read: false
      };
      convo.updatedAt = newMessage.createdAt;
      if (!convo.unreadCount) convo.unreadCount = {};
      convo.participantIds.forEach(pId => {
        if (pId !== sId) {
          convo.unreadCount![pId] = (convo.unreadCount![pId] || 0) + 1;
        }
      });
    }

    this.notify();

    // Broadcast instant new message via Supabase Realtime channel
    if (isSupabaseConfigured) {
      const chan = this.getOrCreateConversationChannel(convoId);
      if (chan) {
        chan.send({
          type: 'broadcast',
          event: 'new_message',
          payload: newMessage
        }).catch((err: any) => console.warn('Broadcast new message error:', err));
      }
    }

    // Cross-tab broadcast for zero-latency local testing
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(`skillswap_msg_${convoId}`);
        bc.postMessage(newMessage);
        bc.close();
      } catch (e) {
        // ignore
      }
    }

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('messages').insert(mapMessageToRow(newMessage)), 'sendMessage');

      if (convIdx >= 0) {
        const convo = this.conversations[convIdx];
        runAsyncMutation(() => supabase.from('conversations').update({
          last_message: convo.lastMessage,
          unread_count: convo.unreadCount,
          updated_at: convo.updatedAt
        }).eq('id', convoId), 'updateConversationLastMessage');
      }
    }

    return newMessage;
  }

  public requestVerification(userId: string, documentValue: string) {
    const user = this.getUserById(userId);
    if (user) {
      user.verificationStatus = 'pending';
      user.studentIdNumber = documentValue;
      user.verificationDocumentType = 'student_id';
      user.verificationDocumentValue = documentValue;
      this.saveUser(user);
    }
  }

  public approveVerification(userId: string) {
    const user = this.getUserById(userId);
    if (user) {
      user.verificationStatus = 'verified';
      this.saveUser(user);
    }
  }

  public rejectVerification(userId: string) {
    const user = this.getUserById(userId);
    if (user) {
      user.verificationStatus = 'rejected';
      this.saveUser(user);
    }
  }

  public completeSession(sessionId: string, rating: number, comment: string) {
    const idx = this.sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      this.sessions[idx].status = 'completed';
      this.sessions[idx].reviewRating = rating;
      this.sessions[idx].reviewComment = comment;
      this.notify();

      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('sessions').update({
          status: 'completed',
          review_rating: rating,
          review_comment: comment
        }).eq('id', sessionId), 'completeSession');
      }

      const sess = this.sessions[idx];
      this.incrementUserStreak(sess.teacherId);
      this.incrementUserStreak(sess.learnerId);

      const reviewer = this.getCurrentUser();
      if (reviewer) {
        const recipientId = sess.teacherId === reviewer.id ? sess.learnerId : sess.teacherId;
        this.addReview({
          sessionId: sess.id,
          reviewerId: reviewer.id,
          reviewerName: reviewer.name,
          reviewerPhoto: reviewer.photoURL,
          recipientId: recipientId,
          rating: rating,
          comment: comment,
          skillName: sess.skillName,
          role: sess.teacherId === reviewer.id ? 'teacher' : 'learner'
        });
      }
    }
  }

  private incrementUserStreak(userId: string) {
    const user = this.getUserById(userId);
    if (user) {
      const updatedUser: User = {
        ...user,
        completedSessions: user.completedSessions + 1,
        learningStreak: user.learningStreak + 1,
        longestStreak: Math.max(user.longestStreak, user.learningStreak + 1),
        lastActiveDate: new Date().toISOString().split('T')[0]
      };
      this.saveUser(updatedUser);
    }
  }

  // Sessions
  public getSessions(userId?: string): LearningSession[] {
    if (!userId) return this.sessions;
    return this.sessions.filter(s => s.teacherId === userId || s.learnerId === userId);
  }

  public createSession(session: Omit<LearningSession, 'id' | 'createdAt' | 'hasReviewByLearner' | 'hasReviewByTeacher'>): LearningSession {
    const newSession: LearningSession = {
      ...session,
      id: generateUUID(),
      hasReviewByLearner: false,
      hasReviewByTeacher: false,
      createdAt: new Date().toISOString()
    };
    this.sessions.unshift(newSession);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('sessions').insert(mapSessionToRow(newSession)), 'createSession');
    }

    const otherId = session.teacherId === this.getCurrentUserId() ? session.learnerId : session.teacherId;
    this.createNotification({
      userId: otherId,
      title: 'New Skill Exchange Session Scheduled',
      description: `Session on ${session.skillName} scheduled for ${new Date(session.scheduledAt).toLocaleDateString()} at ${session.timeSlot}`,
      type: 'session',
      link: '/sessions'
    });

    return newSession;
  }

  public updateSessionStatus(sessionId: string, status: LearningSession['status']) {
    const idx = this.sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      this.sessions[idx].status = status;
      this.notify();

      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('sessions').update({ status }).eq('id', sessionId), 'updateSessionStatus');
      }

      if (status === 'completed') {
        const sess = this.sessions[idx];
        this.incrementUserStreak(sess.teacherId);
        this.incrementUserStreak(sess.learnerId);
      }
    }
  }

  // Reviews
  public getReviews(userId?: string): Review[] {
    if (!userId) return this.reviews;
    return this.reviews.filter(r => r.recipientId === userId);
  }

  public addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const newReview: Review = {
      ...review,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);

    // Update session review flags
    const sIdx = this.sessions.findIndex(s => s.id === review.sessionId);
    if (sIdx >= 0) {
      if (review.role === 'learner') {
        this.sessions[sIdx].hasReviewByLearner = true;
      } else {
        this.sessions[sIdx].hasReviewByTeacher = true;
      }
      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('sessions').update({
          has_review_by_learner: this.sessions[sIdx].hasReviewByLearner,
          has_review_by_teacher: this.sessions[sIdx].hasReviewByTeacher
        }).eq('id', review.sessionId), 'updateSessionReviewFlag');
      }
    }

    // Recalculate recipient rating
    const recipient = this.getUserById(review.recipientId);
    if (recipient) {
      const userReviews = this.reviews.filter(r => r.recipientId === review.recipientId);
      const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      recipient.rating = parseFloat(avg.toFixed(2));
      recipient.reviewCount = userReviews.length;
      this.saveUser(recipient);
    }

    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('reviews').insert(mapReviewToRow(newReview)), 'addReview');
    }

    this.createNotification({
      userId: review.recipientId,
      title: 'New Review Received! ⭐',
      description: `${review.reviewerName} gave you a ${review.rating}-star review for ${review.skillName}`,
      type: 'review',
      link: '/profile'
    });

    return newReview;
  }

  // Badges
  public getBadges(): Badge[] {
    return this.badges;
  }

  public unlockBadge(badgeId: string) {
    const idx = this.badges.findIndex(b => b.id === badgeId);
    if (idx >= 0 && !this.badges[idx].unlockedAt) {
      const unlockedAt = new Date().toISOString();
      this.badges[idx].unlockedAt = unlockedAt;
      this.badges[idx].progress = 100;
      this.notify();

      const currentId = this.getCurrentUserId();
      if (currentId && isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('user_badges').upsert({
          user_id: currentId,
          badge_id: badgeId,
          progress: 100,
          unlocked_at: unlockedAt
        }, { onConflict: 'user_id,badge_id' }), 'unlockBadge');

        this.createNotification({
          userId: currentId,
          title: `Badge Unlocked: ${this.badges[idx].title} 🏆`,
          description: this.badges[idx].description,
          type: 'badge',
          link: '/badges'
        });
      }
    }
  }

  // Notifications
  public getNotifications(userId?: string): AppNotification[] {
    if (!userId) return this.notifications;
    return this.notifications.filter(n => n.userId === userId);
  }

  public createNotification(notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: generateUUID(),
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('notifications').insert(mapNotificationToRow(newNotif)), 'createNotification');
    }

    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    const idx = this.notifications.findIndex(n => n.id === id);
    if (idx >= 0) {
      this.notifications[idx].read = true;
      this.notify();

      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('notifications').update({ read: true }).eq('id', id), 'markNotificationAsRead');
      }
    }
  }

  public markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('notifications').update({ read: true }).eq('user_id', userId), 'markAllNotificationsAsRead');
    }
  }

  // Reports
  public getReports(): SafetyReport[] {
    return this.reports;
  }

  public createReport(report: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>): SafetyReport {
    const newReport: SafetyReport = {
      ...report,
      id: generateUUID(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.reports.unshift(newReport);
    this.notify();

    if (isSupabaseConfigured) {
      runAsyncMutation(() => supabase.from('reports').insert(mapReportToRow(newReport)), 'createReport');
    }

    return newReport;
  }

  public updateReportStatus(reportId: string, status: SafetyReport['status']) {
    const idx = this.reports.findIndex(r => r.id === reportId);
    if (idx >= 0) {
      this.reports[idx].status = status;
      this.notify();

      if (isSupabaseConfigured) {
        runAsyncMutation(() => supabase.from('reports').update({ status }).eq('id', reportId), 'updateReportStatus');
      }
    }
  }
}

export const storageService = new StorageService();
