import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { User } from '../../types';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  KeyRound,
  ArrowLeft
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess: (user: User, isNewRegistration?: boolean) => void;
}

const GoogleIcon: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.35 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.65 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('Gujarat Technological University (GTU)');
  const [course, setCourse] = useState('B.Sc. Information Technology');
  const [gradYear, setGradYear] = useState('2027');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const colleges = storageService.getColleges();

  const handleResetForm = () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(false);
    setGoogleLoading(false);
  };

  const handleModeSwitch = (newMode: 'login' | 'register' | 'forgot-password') => {
    handleResetForm();
    setMode(newMode);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setGoogleLoading(true);

    try {
      await authService.loginWithGoogle();
      // Browser will redirect to Google OAuth flow
    } catch (err: any) {
      setError(err.message || 'Google sign-in could not be initiated. Please check your Supabase configuration.');
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive password reset instructions.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await authService.resetPassword(email.trim());
      setSuccessMessage('Password reset link sent! Please check your email inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await authService.loginWithEmail(email, password);
        onSuccess(user, false);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter your college email address.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');

        const result = await authService.register({
          name: name.trim(),
          email: email.trim(),
          password: password,
          collegeName,
          course,
          graduationYear: parseInt(gradYear, 10) || 2027
        });

        if (result.requiresEmailConfirmation) {
          setSuccessMessage(
            'Account created! A confirmation link has been sent to your email. Please verify your account before logging in.'
          );
          setMode('login');
        } else {
          onSuccess(result.user, true);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-soft)', color: 'var(--color-primary)' }}
          >
            {mode === 'forgot-password' ? <KeyRound className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <span
            className="text-lg font-medium"
            style={{ color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}
          >
            {mode === 'login'
              ? 'Sign In to SkillSwap'
              : mode === 'register'
              ? 'Create Student Account'
              : 'Reset Your Password'}
          </span>
        </div>
      }
      subtitle={
        mode === 'login'
          ? 'Enter your verified campus account to continue'
          : mode === 'register'
          ? 'Join your campus skill exchange network with Supabase Auth'
          : 'Enter your registered email and we will send you a password recovery link'
      }
      maxWidth="md"
    >
      <div>
        {/* Error Alert Banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 transition-all animate-in fade-in"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success Alert Banner */}
        {successMessage && (
          <div
            role="status"
            className="mb-4 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 transition-all animate-in fade-in"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
          </div>
        )}

        {/* Forgot Password Flow */}
        {mode === 'forgot-password' ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="block text-xs font-semibold mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Email...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline cursor-pointer"
                style={{ color: 'var(--color-primary)' }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        ) : (
          /* Login & Register Forms */
          <>
            {/* Google One-Click Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2.5 mb-4 hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-soft)'
              }}
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div
                className="w-full border-t"
                style={{ borderColor: 'var(--color-soft)' }}
              />
              <span
                className="absolute px-3 text-[11px] font-medium"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-muted)'
                }}
              >
                or with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <>
                  <div>
                    <label
                      htmlFor="register-name"
                      className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Full Name
                    </label>
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Maya Chen"
                      disabled={loading}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="register-college"
                        className="block text-xs font-semibold mb-1"
                        style={{ color: 'var(--color-text)' }}
                      >
                        College / University
                      </label>
                      <select
                        id="register-college"
                        value={collegeName}
                        onChange={e => setCollegeName(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                      >
                        {colleges.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="register-gradyear"
                        className="block text-xs font-semibold mb-1"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Graduation Year
                      </label>
                      <select
                        id="register-gradyear"
                        value={gradYear}
                        onChange={e => setGradYear(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                      >
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="register-course"
                      className="block text-xs font-semibold mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      Course / Major
                    </label>
                    <input
                      id="register-course"
                      type="text"
                      required
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      disabled={loading}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                    />
                  </div>
                </>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  Campus Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={mode === 'login' ? 'student@college.edu' : 'yourname@college.edu'}
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot-password')}
                      className="text-[11px] font-medium hover:underline cursor-pointer"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
                {mode === 'register' && (
                  <p className="mt-1 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                    Minimum 6 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-2.5 px-4 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-2 mt-4 hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Create Campus Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="font-medium cursor-pointer hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="font-medium cursor-pointer hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Sign in
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
