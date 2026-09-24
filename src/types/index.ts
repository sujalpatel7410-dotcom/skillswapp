export type SkillCategory =
  | 'Programming'
  | 'Web Development'
  | 'AI / ML'
  | 'Cybersecurity'
  | 'Data Science'
  | 'Design'
  | 'Business'
  | 'Marketing'
  | 'Communication'
  | 'Finance'
  | 'Photography'
  | 'Video Editing'
  | 'Languages'
  | 'Academic Subjects'
  | 'Other';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  icon?: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  category: SkillCategory;
  type: 'teach' | 'learn';
  level: SkillLevel;
  experienceYears?: number;
  experienceMonths?: number;
  learningGoal?: string;
  createdAt: string;
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  collegeId: string;
  collegeName: string;
  course: string;
  graduationYear: number;
  bio: string;
  studentIdNumber?: string;
  badges?: string[];
  verificationStatus: VerificationStatus;
  verificationDocumentType?: 'college_email' | 'student_id';
  verificationDocumentValue?: string;
  rating: number;
  reviewCount: number;
  completedSessions: number;
  hoursLearned: number;
  hoursTaught: number;
  learningStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  availability: string[]; // e.g., ["Weekday Evenings", "Weekends", "Flexible"]
  isAvailableForLiveSession?: boolean; // Real-time toggle for instant live video/chat exchange
  interests: string[];
  isAdmin?: boolean;
  isSuspended?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MatchReason {
  label: string;
  scoreContribution: number;
}

export interface AIMatchResult {
  partner: User;
  score: number; // 0 - 100
  canTeachYou: UserSkill[];
  wantsFromYou: UserSkill[];
  reasons: string[];
  compatibilityBreakdown: {
    skillCompatibility: number;
    learningCompatibility: number;
    skillLevelCompatibility: number;
    collegeCompatibility: number;
    availabilityCompatibility: number;
    ratingWeight: number;
  };
}

export type MatchRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface MatchRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  senderCollege: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto: string;
  offeredSkillName: string;
  requestedSkillName: string;
  message: string;
  status: MatchRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  isCodeSnippet?: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants: {
    id: string;
    name: string;
    photoURL: string;
    collegeName: string;
    isOnline?: boolean;
  }[];
  unreadCount?: Record<string, number>;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
    read: boolean;
  };
  matchedSkillPair?: {
    offered: string;
    requested: string;
  };
  updatedAt: string;
}

export type SessionStatus =
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'scheduled'
  | 'active'
  | 'in-progress';

export interface LearningSession {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherPhoto: string;
  teacherCollege?: string;
  learnerId: string;
  learnerName: string;
  learnerPhoto: string;
  learnerCollege?: string;
  skillId: string;
  skillName: string;
  scheduledAt: string; // ISO date
  timeSlot: string;
  durationMinutes: number;
  meetingLink: string;
  status: SessionStatus;
  notes?: string;
  reviewRating?: number;
  reviewComment?: string;
  hasReviewByLearner?: boolean;
  hasReviewByTeacher?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerPhoto: string;
  recipientId: string;
  rating: number; // 1 - 5
  comment: string;
  skillName: string;
  role: 'teacher' | 'learner';
  createdAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'teaching' | 'learning' | 'streak' | 'community' | 'Teaching' | 'Learning' | 'Streaks' | 'Special';
  requirement: string;
  unlockedAt?: string;
  progress?: number; // 0 to 100
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'match' | 'request' | 'message' | 'session' | 'review' | 'badge' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  category: 'Harassment' | 'Spam' | 'Fake profile' | 'Inappropriate content' | 'Scam' | 'Other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  domain: string;
}
