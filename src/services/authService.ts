import { User } from '../types';
import { storageService } from './storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  collegeName: string;
  course: string;
  graduationYear: number;
  photoURL?: string;
  bio?: string;
}

export interface RegisterResult {
  user: User;
  requiresEmailConfirmation: boolean;
}

function mapSupabaseProfileToUser(profile: any, fallbackAuth?: Partial<SupabaseAuthUser>): User {
  const metadata = (fallbackAuth as any)?.user_metadata || {};
  return {
    id: profile.id || fallbackAuth?.id || `usr-${Date.now()}`,
    name: profile.name || metadata.name || metadata.full_name || profile.email?.split('@')[0] || 'Student',
    email: profile.email || fallbackAuth?.email || '',
    photoURL:
      profile.photo_url ||
      profile.photoURL ||
      metadata.avatar_url ||
      metadata.picture ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
    collegeId: profile.college_id || profile.collegeId || 'col-custom',
    collegeName: profile.college_name || profile.collegeName || metadata.college_name || 'Campus Student',
    course: profile.course || metadata.course || 'Undergraduate',
    graduationYear: Number(profile.graduation_year || profile.graduationYear || metadata.graduation_year) || 2026,
    bio: profile.bio || metadata.bio || 'Excited to share what I know and learn new skills on SkillSwap.',
    studentIdNumber: profile.student_id_number || profile.studentIdNumber,
    badges: Array.isArray(profile.badges) ? profile.badges : [],
    verificationStatus: profile.verification_status || profile.verificationStatus || 'unverified',
    verificationDocumentType: profile.verification_document_type || profile.verificationDocumentType,
    verificationDocumentValue: profile.verification_document_value || profile.verificationDocumentValue,
    rating: Number(profile.rating) || 5.0,
    reviewCount: Number(profile.review_count || profile.reviewCount) || 0,
    completedSessions: Number(profile.completed_sessions || profile.completedSessions) || 0,
    hoursLearned: Number(profile.hours_learned || profile.hoursLearned) || 0,
    hoursTaught: Number(profile.hours_taught || profile.hoursTaught) || 0,
    learningStreak: Number(profile.learning_streak || profile.learningStreak) || 1,
    longestStreak: Number(profile.longest_streak || profile.longestStreak) || 1,
    lastActiveDate: profile.last_active_date || profile.lastActiveDate || new Date().toISOString(),
    availability: Array.isArray(profile.availability) ? profile.availability : ['Weekday Evenings (6 PM - 9 PM)'],
    isAvailableForLiveSession: Boolean(profile.is_available_for_live_session ?? profile.isAvailableForLiveSession),
    interests: Array.isArray(profile.interests) ? profile.interests : ['Peer Learning', 'Tech Projects'],
    isAdmin: Boolean(profile.is_admin ?? profile.isAdmin),
    isSuspended: Boolean(profile.is_suspended ?? profile.isSuspended),
    createdAt: profile.created_at || profile.createdAt || new Date().toISOString(),
    updatedAt: profile.updated_at || profile.updatedAt || new Date().toISOString()
  };
}

class AuthService {
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    if (!isSupabaseConfigured) {
      // If Supabase is not configured yet and localStorage still has a legacy demo id, clear it
      const currentId = storageService.getCurrentUserId();
      if (currentId === 'usr-sujal') {
        storageService.clearCurrentUser();
      }
      return;
    }

    try {
      // Check current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Supabase auth session fetch error:', error.message);
        return;
      }

      if (session?.user) {
        await this.syncUserFromSession(session.user);
      } else {
        // No active session in Supabase, ensure we don't hold a phantom login
        const currentId = storageService.getCurrentUserId();
        if (currentId) {
          storageService.clearCurrentUser();
        }
      }

      // Listen for auth state changes (e.g. sign in, sign out, token refresh)
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession?.user) {
          await this.syncUserFromSession(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          storageService.clearCurrentUser();
        }
      });
    } catch (e) {
      console.warn('Failed to initialize Supabase auth session:', e);
    }
  }

  public getCurrentUser(): User | null {
    return storageService.getCurrentUser();
  }

  public async syncUserFromSession(authUser: SupabaseAuthUser): Promise<User> {
    try {
      // Query profiles table for existing profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        const user = mapSupabaseProfileToUser(profile, authUser);
        storageService.saveUser(user);
        storageService.setCurrentUserId(user.id);
        return user;
      }
    } catch (e) {
      console.warn('Error reading profile from Supabase table:', e);
    }

    // Check if we have a locally cached user
    const existingLocal = storageService.getUserById(authUser.id);
    if (existingLocal) {
      storageService.setCurrentUserId(existingLocal.id);
      return existingLocal;
    }

    // Build default profile from auth session metadata
    const user = mapSupabaseProfileToUser({ id: authUser.id, email: authUser.email }, authUser);

    // Try to save to Supabase profiles table
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        photo_url: user.photoURL,
        college_id: user.collegeId,
        college_name: user.collegeName,
        course: user.course,
        graduation_year: user.graduationYear,
        bio: user.bio,
        verification_status: user.verificationStatus,
        rating: user.rating,
        review_count: user.reviewCount,
        completed_sessions: user.completedSessions,
        hours_learned: user.hoursLearned,
        hours_taught: user.hoursTaught,
        learning_streak: user.learningStreak,
        longest_streak: user.longestStreak,
        last_active_date: user.lastActiveDate,
        availability: user.availability,
        is_available_for_live_session: user.isAvailableForLiveSession,
        interests: user.interests,
        is_admin: user.isAdmin,
        is_suspended: user.isSuspended
      });
    } catch (e) {
      console.warn('Failed to insert new profile to Supabase:', e);
    }

    storageService.saveUser(user);
    storageService.setCurrentUserId(user.id);
    return user;
  }

  public async loginWithEmail(email: string, password: string): Promise<User> {
    if (!email.trim() || !password) {
      throw new Error('Please provide both your college email and password.');
    }

    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Your email has not been confirmed yet. Please check your inbox for the confirmation email.');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Unable to retrieve user account details from Supabase.');
    }

    return await this.syncUserFromSession(data.user);
  }

  public async register(data: RegisterData): Promise<RegisterResult> {
    if (!data.name.trim()) throw new Error('Please enter your full name.');
    if (!data.email.trim()) throw new Error('Please enter your college email address.');
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      );
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          name: data.name.trim(),
          college_name: data.collegeName,
          course: data.course,
          graduation_year: data.graduationYear
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      throw new Error(signUpError.message);
    }

    if (!authData.user) {
      throw new Error('Sign up failed. Please try again.');
    }

    const requiresEmailConfirmation = !authData.session;

    const newUser: User = {
      id: authData.user.id,
      name: data.name.trim(),
      email: data.email.trim(),
      photoURL:
        data.photoURL ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
      collegeId: 'col-custom',
      collegeName: data.collegeName,
      course: data.course,
      graduationYear: data.graduationYear,
      bio: data.bio || 'Excited to share what I know and learn new skills on SkillSwap.',
      verificationStatus: 'unverified',
      rating: 5.0,
      reviewCount: 0,
      completedSessions: 0,
      hoursLearned: 0,
      hoursTaught: 0,
      learningStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString(),
      availability: ['Weekday Evenings (6 PM - 9 PM)', 'Weekends (10 AM - 4 PM)'],
      interests: ['Peer Learning', 'Tech Projects'],
      isAdmin: false,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save profile to Supabase database
    try {
      await supabase.from('profiles').upsert({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        photo_url: newUser.photoURL,
        college_id: newUser.collegeId,
        college_name: newUser.collegeName,
        course: newUser.course,
        graduation_year: newUser.graduationYear,
        bio: newUser.bio,
        verification_status: newUser.verificationStatus,
        rating: newUser.rating,
        review_count: newUser.reviewCount,
        completed_sessions: newUser.completedSessions,
        hours_learned: newUser.hoursLearned,
        hours_taught: newUser.hoursTaught,
        learning_streak: newUser.learningStreak,
        longest_streak: newUser.longestStreak,
        last_active_date: newUser.lastActiveDate,
        availability: newUser.availability,
        is_available_for_live_session: false,
        interests: newUser.interests,
        is_admin: false,
        is_suspended: false
      });
    } catch (e) {
      console.warn('Could not insert profile record into Supabase:', e);
    }

    storageService.saveUser(newUser);

    if (authData.session) {
      storageService.setCurrentUserId(newUser.id);
    }

    return {
      user: newUser,
      requiresEmailConfirmation
    };
  }

  public async loginWithGoogle(): Promise<void> {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      );
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  public async resetPassword(email: string): Promise<void> {
    if (!email.trim()) {
      throw new Error('Please enter the email address associated with your account.');
    }

    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
      );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/`
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  public async submitCollegeVerification(
    userId: string,
    docType: 'college_email' | 'student_id',
    docValue: string
  ): Promise<User> {
    const user = storageService.getUserById(userId);
    if (!user) throw new Error('User not found');

    const updated: User = {
      ...user,
      verificationStatus: 'pending',
      verificationDocumentType: docType,
      verificationDocumentValue: docValue
    };
    storageService.saveUser(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            verification_status: 'pending',
            verification_document_type: docType,
            verification_document_value: docValue
          })
          .eq('id', userId);
      } catch (e) {
        console.warn('Failed to update verification status in Supabase:', e);
      }
    }

    storageService.createNotification({
      userId: user.id,
      title: 'Verification Under Review 🎓',
      description: 'Your college student verification has been submitted to campus administrators for review.',
      type: 'system'
    });

    return updated;
  }

  public async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error during Supabase signOut:', e);
      }
    }
    storageService.clearCurrentUser();
  }
}

export const authService = new AuthService();
