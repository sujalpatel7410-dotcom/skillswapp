-- ============================================================================
-- SkillSwap Campus Database Schema (Supabase / PostgreSQL)
-- Matches schema definitions in src/types/index.ts
-- Includes Row Level Security (RLS) policies and security triggers
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Helper function to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TABLES DEFINITION
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES (Users)
-- Corresponds to User in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  college_id TEXT NOT NULL DEFAULT '',
  college_name TEXT NOT NULL DEFAULT '',
  course TEXT NOT NULL DEFAULT '',
  graduation_year INT NOT NULL DEFAULT 2026,
  bio TEXT DEFAULT '',
  student_id_number TEXT DEFAULT NULL,
  badges TEXT[] DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_document_type TEXT DEFAULT NULL
    CHECK (verification_document_type IN ('college_email', 'student_id') OR verification_document_type IS NULL),
  verification_document_value TEXT DEFAULT NULL,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  review_count INT NOT NULL DEFAULT 0,
  completed_sessions INT NOT NULL DEFAULT 0,
  hours_learned NUMERIC(6, 1) NOT NULL DEFAULT 0,
  hours_taught NUMERIC(6, 1) NOT NULL DEFAULT 0,
  learning_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  availability TEXT[] DEFAULT '{}',
  is_available_for_live_session BOOLEAN NOT NULL DEFAULT FALSE,
  interests TEXT[] DEFAULT '{}',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Secure Public Profiles View (hides sensitive verification documents and ID numbers from peers)
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  name,
  photo_url,
  college_id,
  college_name,
  course,
  graduation_year,
  bio,
  badges,
  verification_status,
  rating,
  review_count,
  completed_sessions,
  hours_learned,
  hours_taught,
  learning_streak,
  longest_streak,
  last_active_date,
  availability,
  is_available_for_live_session,
  interests,
  created_at
FROM profiles
WHERE is_suspended = FALSE;

-- ----------------------------------------------------------------------------
-- SKILLS (Campus Skill Catalog)
-- Corresponds to Skill in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (
    category IN (
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
      'Academic Subjects',
      'Other'
    )
  ),
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- USER_SKILLS (Skills a user can teach or wants to learn)
-- Corresponds to UserSkill in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('teach', 'learn')),
  level TEXT NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  experience_years INT DEFAULT 0,
  experience_months INT DEFAULT 0,
  learning_goal TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_type ON user_skills(type);
CREATE INDEX IF NOT EXISTS idx_user_skills_name ON user_skills(skill_name);

-- ----------------------------------------------------------------------------
-- MATCH_REQUESTS (Peer skill exchange proposals)
-- Corresponds to MatchRequest in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_photo TEXT DEFAULT '',
  sender_college TEXT DEFAULT '',
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_name TEXT NOT NULL,
  receiver_photo TEXT DEFAULT '',
  offered_skill_name TEXT NOT NULL,
  requested_skill_name TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_match_requests_modtime
  BEFORE UPDATE ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_match_requests_sender ON match_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_receiver ON match_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);

-- ----------------------------------------------------------------------------
-- CONVERSATIONS (Peer messaging threads)
-- Corresponds to Conversation in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::JSONB,
  unread_count JSONB NOT NULL DEFAULT '{}'::JSONB,
  last_message JSONB DEFAULT NULL,
  matched_skill_pair JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_conversations_modtime
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participant_ids);

-- ----------------------------------------------------------------------------
-- MESSAGES (Chat messages inside conversations)
-- Corresponds to Message in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  is_code_snippet BOOLEAN NOT NULL DEFAULT FALSE,
  attachment_url TEXT DEFAULT NULL,
  attachment_type TEXT DEFAULT NULL CHECK (attachment_type IN ('image', 'file') OR attachment_type IS NULL),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- ----------------------------------------------------------------------------
-- SESSIONS (1-on-1 Peer learning video & swap sessions)
-- Corresponds to LearningSession in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  teacher_photo TEXT DEFAULT '',
  teacher_college TEXT DEFAULT '',
  learner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learner_name TEXT NOT NULL,
  learner_photo TEXT DEFAULT '',
  learner_college TEXT DEFAULT '',
  skill_id TEXT DEFAULT '',
  skill_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  meeting_link TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled', 'no-show', 'scheduled', 'active', 'in-progress')),
  notes TEXT DEFAULT '',
  review_rating NUMERIC(3, 2) DEFAULT NULL,
  review_comment TEXT DEFAULT NULL,
  has_review_by_learner BOOLEAN NOT NULL DEFAULT FALSE,
  has_review_by_teacher BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_learner_id ON sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- ----------------------------------------------------------------------------
-- REVIEWS (Post-session mutual peer ratings and feedback)
-- Corresponds to Review in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_photo TEXT DEFAULT '',
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'learner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_recipient_id ON reviews(recipient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- ----------------------------------------------------------------------------
-- BADGES (Campus achievement milestone badges)
-- Corresponds to Badge in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('teaching', 'learning', 'streak', 'community', 'Teaching', 'Learning', 'Streaks', 'Special')
  ),
  requirement TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User badge progress and unlocks
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  unlocked_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS (In-app notifications)
-- Corresponds to AppNotification in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match', 'request', 'message', 'session', 'review', 'badge', 'system')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ----------------------------------------------------------------------------
-- REPORTS (Campus safety and content moderation reports)
-- Corresponds to SafetyReport in src/types/index.ts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reporter_name TEXT NOT NULL,
  reported_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Harassment', 'Spam', 'Fake profile', 'Inappropriate content', 'Scam', 'Other')
  ),
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);


-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS: PROFILES
-- Users can read public profile info of others, and read/write their own profile
-- ----------------------------------------------------------------------------
-- Public reading of profiles (non-suspended users)
CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  USING (is_suspended = FALSE);

-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- RLS: SKILLS
-- Everyone can view skills catalog; authenticated users can suggest/add skills
-- ----------------------------------------------------------------------------
CREATE POLICY "Skills are readable by everyone"
  ON skills FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- RLS: USER_SKILLS
-- Users can view other users' skills for matching; can only modify own skills
-- ----------------------------------------------------------------------------
CREATE POLICY "User skills are viewable by authenticated users"
  ON user_skills FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own skills"
  ON user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON user_skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON user_skills FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS: MATCH_REQUESTS
-- Users can only read or write their own requests (as sender or receiver)
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own match requests"
  ON match_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create match requests as sender"
  ON match_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update requests they are involved in"
  ON match_requests FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Senders can delete/cancel their match requests"
  ON match_requests FOR DELETE
  USING (auth.uid() = sender_id);

-- ----------------------------------------------------------------------------
-- RLS: CONVERSATIONS
-- Users can only access conversations they participate in
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create conversations they are part of"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update conversations they are part of"
  ON conversations FOR UPDATE
  USING (auth.uid() = ANY(participant_ids))
  WITH CHECK (auth.uid() = ANY(participant_ids));

-- ----------------------------------------------------------------------------
-- RLS: MESSAGES
-- Users can only read or write their own messages within their conversations
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

CREATE POLICY "Users can insert their own messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

CREATE POLICY "Users can update their own messages or mark messages as read"
  ON messages FOR UPDATE
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- ----------------------------------------------------------------------------
-- RLS: SESSIONS
-- Users can only read or write their own sessions (teacher or learner)
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view sessions they participate in"
  ON sessions FOR SELECT
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can insert sessions they participate in"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can update sessions they participate in"
  ON sessions FOR UPDATE
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id)
  WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Users can delete sessions they participate in"
  ON sessions FOR DELETE
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- ----------------------------------------------------------------------------
-- RLS: REVIEWS
-- Reviews are publicly readable to showcase student reputations; only the
-- designated reviewer can create or edit their review.
-- ----------------------------------------------------------------------------
CREATE POLICY "Reviews are viewable by all authenticated users"
  ON reviews FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own review"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own review"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- ----------------------------------------------------------------------------
-- RLS: BADGES & USER_BADGES
-- Badges catalog and user earned badges are viewable by all
-- ----------------------------------------------------------------------------
CREATE POLICY "Badges catalog viewable by all"
  ON badges FOR SELECT
  USING (TRUE);

CREATE POLICY "User badge progress viewable by all"
  ON user_badges FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update their own badge progress"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can alter their own badge records"
  ON user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS: NOTIFICATIONS
-- Users can only read and manage their own notifications
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view only their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users or triggers can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update only their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS: REPORTS
-- Reporters can view their reports; admins can view and resolve all reports
-- ----------------------------------------------------------------------------
CREATE POLICY "Reporters can view their own reports"
  ON reports FOR SELECT
  USING (
    auth.uid() = reporter_id
    OR (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update report status"
  ON reports FOR UPDATE
  USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE)
  WITH CHECK ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- ============================================================================
-- 5. INITIAL SEED DATA (CORE BADGES & SKILL CATEGORIES)
-- ============================================================================

INSERT INTO badges (id, title, description, icon, category, requirement) VALUES
  ('badge-first-swap', 'First Exchange', 'Completed your first 1-on-1 peer skill swap session.', 'Award', 'learning', 'Complete 1 learning or teaching session'),
  ('badge-super-mentor', 'Campus Mentor', 'Taught over 5 hours of skills to other university peers.', 'GraduationCap', 'teaching', 'Teach 5 or more total hours'),
  ('badge-week-streak', '7-Day Streak', 'Maintained an active learning streak for 7 consecutive days.', 'Flame', 'streak', 'Keep a 7-day learning streak'),
  ('badge-top-rated', 'Top Rated', 'Maintained an average student peer rating of 4.9 or higher.', 'Star', 'community', 'Maintain a 4.9+ rating across 3+ reviews'),
  ('badge-polyglot', 'Multi-Discipline', 'Learned or taught skills across 3 different skill categories.', 'Layers', 'learning', 'Exchange skills in 3 distinct domains'),
  ('badge-hackathon', 'Hackathon Ready', 'Exchanged development and design skills for campus project sprints.', 'Code', 'Special', 'Engage in collaborative code walk-throughs')
ON CONFLICT (id) DO NOTHING;
