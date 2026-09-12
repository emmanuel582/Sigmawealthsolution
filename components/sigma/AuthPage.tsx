import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AppIcon } from '@/components/sigma/ui/AppIcon';
import { PressableButton } from '@/components/sigma/ui/Pressable';
import { BrandLogo } from '@/components/BrandLogo';
import { supabase, isSupabaseConfigured } from '@/lib/sigma/supabaseClient';

interface AuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
  onNavigate: (view: string) => void;
}

const pillInput =
  'w-full h-[48px] pl-11 pr-11 rounded-full bg-white text-[#163300] text-sm placeholder:text-[#163300]/40 border border-[#163300]/8 shadow-[0_2px_12px_rgba(22,51,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#9fe870] focus:border-[#9fe870]/50 transition-all duration-200';

/* ── Right Hero Panel ── */
function AuthHeroPanel() {
  return (
    <div className="relative w-full h-[calc(100vh-3rem)] max-h-[820px] min-h-[520px] rounded-[2rem] overflow-hidden shadow-2xl bg-[#163300]">
      <Image
        src="/images/auth-hero.jpeg"
        alt="Sigma Wealth Portal"
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      {/* Subtle modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#163300]/85 via-transparent to-black/10 pointer-events-none" />

      {/* Floating glass badge */}
      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#163300]/70 backdrop-blur-md border border-white/15 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#9fe870] animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9fe870]">Sigma Wealth Solution</p>
          </div>
          <p className="text-sm font-semibold text-white">Automated, transparent & secure wealth growth.</p>
        </div>
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-medium text-white/90">
          <AppIcon name="shield" className="w-3.5 h-3.5 text-[#9fe870]" />
          <span>Secured</span>
        </div>
      </div>
    </div>
  );
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onNavigate }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, isLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Google sign-in could not be initiated.');
      setSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setErrorMessage(null);
    setSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: { redirectTo: `${window.location.origin}/#/dashboard` },
        });
        if (error) throw error;
      } else {
        setErrorMessage('Apple sign-in requires Supabase configuration.');
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Apple sign-in is not available yet.');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          if (rememberMe) localStorage.setItem('apex_remember_email', email);
          else localStorage.removeItem('apex_remember_email');
          onNavigate('dashboard');
        } else {
          setErrorMessage(result.error || 'Invalid credentials. Please verify and try again.');
        }
      } else if (mode === 'signup') {
        if (!agreedToTerms) {
          setErrorMessage('You must agree to the Terms and Conditions.');
          setSubmitting(false);
          return;
        }
        if (!fullName.trim()) {
          setErrorMessage('Please enter your legal full name.');
          setSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match.');
          setSubmitting(false);
          return;
        }
        if (password.length < 8) {
          setErrorMessage('Password must be at least 8 characters.');
          setSubmitting(false);
          return;
        }
        const result = await signUpWithEmail(email, password, fullName, phone, agreedToTerms);
        if (result.success) onNavigate('dashboard');
        else setErrorMessage(result.error || 'Failed to create your account.');
      } else if (mode === 'forgot') {
        const result = await resetPassword(email);
        if (result.success) setSuccessMessage(result.message || 'Reset instructions sent to your email.');
        else setErrorMessage(result.error || 'Failed to send reset instructions.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (newMode === 'login') onNavigate('auth-login');
    else if (newMode === 'signup') onNavigate('auth-signup');
  };

  useEffect(() => {
    const saved = localStorage.getItem('apex_remember_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const headings = {
    login: { title: 'Welcome Back', sub: 'Access your portfolio and manage your structured investments.' },
    signup: { title: 'Create Your Account', sub: 'Join thousands of investors building wealth through disciplined cycles.' },
    forgot: { title: 'Reset Password', sub: "Enter your email and we'll send recovery instructions." },
  };

  const { title, sub } = headings[mode];

  /* ─────────────────────────── LOGIN FORM ─────────────────────────── */
  const loginForm = (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="relative">
        <AppIcon name="mail" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <input
          id="auth-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={pillInput}
          autoComplete="email"
        />
      </div>

      <div className="relative">
        <AppIcon name="lock" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <input
          id="auth-password"
          type={showPassword ? 'text' : 'password'}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={pillInput}
          autoComplete="current-password"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#163300]/35 hover:text-[#163300]"
        >
          <AppIcon name={showPassword ? 'eyeSlash' : 'eye'} className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="flex items-center justify-between px-1 pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded accent-[#163300]"
          />
          <span className="text-xs text-[#163300]/60 font-medium">Remember me</span>
        </label>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => switchMode('forgot')}
          className="text-xs font-semibold text-[#163300] hover:text-[#9fe870] transition-colors"
        >
          Forgot password?
        </motion.button>
      </div>

      <PressableButton
        type="submit"
        id="auth-submit-btn"
        disabled={submitting || isLoading}
        fullWidth
        className="!h-[48px] !rounded-full !text-[#9fe870] mt-1"
      >
        {submitting ? (
          <>
            <AppIcon name="refresh" className="w-4 h-4" spin />
            <span>Please wait...</span>
          </>
        ) : (
          <span>Login</span>
        )}
      </PressableButton>
    </form>
  );

  /* ──────────────────────── SIGNUP FORM (side-by-side) ──────────────────────── */
  const signupForm = (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Row 1: Full Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <AppIcon name="user" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <input
            id="signup-fullname"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full legal name"
            className={pillInput}
          />
        </div>
        <div className="relative">
          <AppIcon name="mail" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className={pillInput}
            autoComplete="email"
          />
        </div>
      </div>

      {/* Row 2: Phone (full width) */}
      <div className="relative">
        <AppIcon name="phone" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <input
          id="signup-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (optional)"
          className={pillInput}
        />
      </div>

      {/* Row 3: Password + Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <AppIcon name="lock" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <input
            id="auth-password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className={pillInput}
            autoComplete="new-password"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#163300]/35 hover:text-[#163300]"
          >
            <AppIcon name={showPassword ? 'eyeSlash' : 'eye'} className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="relative">
          <AppIcon name="lock" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className={pillInput}
            autoComplete="new-password"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#163300]/35 hover:text-[#163300]"
          >
            <AppIcon name={showConfirmPassword ? 'eyeSlash' : 'eye'} className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer px-1 pt-0.5">
        <input
          id="signup-terms-checkbox"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-[#163300]"
        />
        <span className="text-xs text-[#163300]/55 leading-relaxed">
          I agree to the{' '}
          <button type="button" onClick={() => onNavigate('terms')} className="font-bold text-[#163300] underline hover:text-[#9fe870]">
            Terms & Conditions
          </button>
        </span>
      </label>

      <PressableButton
        type="submit"
        id="auth-submit-btn"
        disabled={submitting || isLoading}
        fullWidth
        className="!h-[48px] !rounded-full !text-[#9fe870] mt-1"
      >
        {submitting ? (
          <>
            <AppIcon name="refresh" className="w-4 h-4" spin />
            <span>Please wait...</span>
          </>
        ) : (
          <span>Sign Up</span>
        )}
      </PressableButton>
    </form>
  );

  /* ──────────────────────── FORGOT FORM ──────────────────────── */
  const forgotForm = (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="relative">
        <AppIcon name="mail" className="w-4 h-4 text-[#163300]/35 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <input
          id="auth-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className={pillInput}
          autoComplete="email"
        />
      </div>

      <PressableButton
        type="submit"
        id="auth-submit-btn"
        disabled={submitting || isLoading}
        fullWidth
        className="!h-[48px] !rounded-full !text-[#9fe870] mt-1"
      >
        {submitting ? (
          <>
            <AppIcon name="refresh" className="w-4 h-4" spin />
            <span>Please wait...</span>
          </>
        ) : (
          <span>Send Reset Link</span>
        )}
      </PressableButton>
    </form>
  );

  /* Google OAuth — login & signup (Supabase) */
  const socialButtons = mode !== 'forgot' && (
    <>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#163300]/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#edefeb] px-4 text-xs text-[#163300]/40 font-medium">or</span>
        </div>
      </div>

      <motion.button
        type="button"
        id="auth-google-btn"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleGoogleSignIn}
        disabled={submitting || !isSupabaseConfigured}
        className="w-full h-[48px] rounded-full bg-white border border-[#163300]/10 shadow-sm flex items-center justify-center gap-2.5 text-sm font-semibold text-[#163300] hover:border-[#163300]/25 hover:shadow-md transition-all disabled:opacity-50"
      >
        <AppIcon name="google" className="w-5 h-5" />
        <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
      </motion.button>
      {!isSupabaseConfigured && (
        <p className="text-[10px] text-center text-[#163300]/40 mt-2">
          Google sign-in needs Supabase OAuth configured.
        </p>
      )}
    </>
  );

  /* ──────────────────────── Mode toggle link ──────────────────────── */
  const modeToggle = (
    <p className="text-center text-xs text-[#163300]/50 mt-5">
      {mode === 'login' && (
        <>
          Don&apos;t have an account?{' '}
          <button id="auth-toggle-signup" onClick={() => switchMode('signup')} className="font-bold text-[#163300] hover:text-[#9fe870] transition-colors">
            Sign up
          </button>
        </>
      )}
      {mode === 'signup' && (
        <>
          Already have an account?{' '}
          <button id="auth-toggle-login" onClick={() => switchMode('login')} className="font-bold text-[#163300] hover:text-[#9fe870] transition-colors">
            Login
          </button>
        </>
      )}
      {mode === 'forgot' && (
        <>
          Remembered your password?{' '}
          <button onClick={() => switchMode('login')} className="font-bold text-[#163300] hover:text-[#9fe870] transition-colors">
            Back to login
          </button>
        </>
      )}
    </p>
  );

  /* ──────────────────────── RENDER ──────────────────────── */
  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col lg:flex-row bg-[#edefeb] overflow-x-hidden">
      {/* ─── FORM PANEL ─── */}
      <div className="flex-1 flex flex-col justify-center lg:w-[48%] xl:w-[44%] min-h-full py-8 sm:py-10 px-5 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`w-full mx-auto lg:mx-0 ${mode === 'signup' ? 'max-w-[560px] lg:max-w-[520px]' : 'max-w-[420px] lg:max-w-[400px]'}`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-5 lg:mb-6">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-[#163300] flex items-center justify-center shadow-lg shrink-0 border border-[#9fe870]/20">
              <BrandLogo size={40} className="rounded-xl" />
            </div>
            <div>
              <p className="font-bold text-[#163300] text-lg leading-tight">Sigma Wealth</p>
              <p className="text-[10px] text-[#163300]/50 uppercase tracking-widest font-semibold">Investor Portal</p>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#163300] tracking-tight">{title}</h1>
          <p className="text-sm text-[#163300]/55 mt-1 mb-5 leading-relaxed">{sub}</p>

          {/* Alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2"
              >
                <AppIcon name="circleExclamation" className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 rounded-2xl bg-[#9fe870]/20 border border-[#9fe870]/40 text-[#163300] text-xs flex items-start gap-2"
            >
              <AppIcon name="circleCheck" className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          {mode === 'login' && loginForm}
          {mode === 'signup' && signupForm}
          {mode === 'forgot' && forgotForm}

          {/* Social */}
          {socialButtons}

          {/* Mode toggle */}
          {modeToggle}

          <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-[#163300]/35">
            <AppIcon name="shield" className="w-3.5 h-3.5 text-[#9fe870]" />
            <span>Secured by Supabase with Row Level Security</span>
          </div>
        </motion.div>
      </div>

      {/* ─── HERO PANEL (desktop) ─── */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-6 xl:p-8 bg-[#edefeb]">
        <AuthHeroPanel />
      </div>
    </div>
  );
};
