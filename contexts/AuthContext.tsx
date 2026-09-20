"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/sigma/supabaseClient';
import { UserRole, Profile } from '@/lib/sigma/types';
import { checkAdminAccess } from '@/lib/sigma/api';

// Server-side fallback auth (/api/auth/*) is for local development only.
// In production, Supabase is the single source of truth so accounts persist.
const ALLOW_SERVER_FALLBACK = process.env.NODE_ENV !== 'production';
const NOT_CONFIGURED_ERROR = 'Authentication is not configured. Please contact support.';

interface UserSession {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: UserSession | null;
  role: UserRole;
  profile: Profile | null;
  isLoading: boolean;
  signInWithEmail: (
    email: string,
    pass: string
  ) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signUpWithEmail: (
    email: string,
    pass: string,
    fullName: string,
    phone: string,
    agreedToTerms: boolean
  ) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readReferralCode(): string | undefined {
  try {
    if (typeof document !== 'undefined') {
      const raw = document.cookie
        .split('; ')
        .find((c) => c.startsWith('sigma_ref='))
        ?.split('=')[1];
      if (raw) return decodeURIComponent(raw);
    }
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('sigma_ref');
      if (stored) return stored;
    }
  } catch {
    // ignore storage/cookie access errors
  }
  return undefined;
}

function friendlyAuthError(message?: string): string {
  const msg = (message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Invalid email or password.';
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox for the confirmation link.';
  }
  if (msg.includes('already') && msg.includes('registered')) {
    return 'An account with this email already exists. Please log in.';
  }
  if (msg.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.';
  return message || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRole] = useState<UserRole>('investor');
  const [profile, setProfile] = useState<Profile | null>(null);
  // Global loading is for app startup and sign-out only.
  // Form submits use their own local "submitting" state in AuthPage.
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize state with Supabase Auth or Session
  const syncUserState = async (sessionUser: any, explicitRole?: UserRole) => {
    if (!sessionUser) {
      setUser(null);
      setProfile(null);
      setRole('investor');
      setIsLoading(false);
      return;
    }

    const userData: UserSession = {
      id: sessionUser.id,
      email: (sessionUser.email || '').toLowerCase().trim(),
      name:
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        sessionUser.name ||
        sessionUser.email?.split('@')[0] ||
        'Investor',
    };
    setUser(userData);

    try {
      // 1. Determine role
      let determinedRole: UserRole = explicitRole || 'investor';
      if (!explicitRole) {
        const isAdmin = await checkAdminAccess(sessionUser.id, userData.email);
        determinedRole = isAdmin ? 'admin' : 'investor';
      }
      setRole(determinedRole);

      // 2. Fetch profile
      const profileParams = new URLSearchParams();
      if (userData.email) profileParams.set('email', userData.email);
      if (userData.name) profileParams.set('name', userData.name);
      const res = await fetch(`/api/investor/profile/${sessionUser.id}?${profileParams.toString()}`);
      if (res.ok) {
        const prof = await res.json();
        setProfile(prof);
      } else {
        setProfile({
          id: sessionUser.id,
          name: userData.name,
          email: userData.email,
          phone: null,
          total_invested: 0,
          current_phase: 'None',
          payment_plan_id: null,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error fetching user metadata and role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    // Failsafe only — keep loader up until real auth init finishes
    const timeoutId = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 10000);

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!mounted) return;

          if (session?.user) {
            await syncUserState(session.user);
          } else {
            setIsLoading(false);
          }

          const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
            if (!mounted) return;
            // INITIAL_SESSION is already handled by getSession above.
            // TOKEN_REFRESHED does not change who the user is.
            if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
            // Defer so we never await other Supabase calls inside the callback (can deadlock).
            setTimeout(() => {
              if (mounted) syncUserState(nextSession?.user ?? null);
            }, 0);
          });
          authSubscription = authListener?.subscription ?? null;
        } else if (ALLOW_SERVER_FALLBACK) {
          const res = await fetch('/api/auth/current-session');
          if (!mounted) return;
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              await syncUserState(data.user);
            } else {
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
        } else {
          console.error(NOT_CONFIGURED_ERROR);
          setIsLoading(false);
        }
      } catch (e) {
        console.warn('Auth init check error:', e);
        if (mounted) setIsLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    initAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      authSubscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/investor/profile/${user.id}`);
      if (res.ok) {
        const prof = await res.json();
        setProfile(prof);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });
        if (error || !data?.user) {
          return { success: false, error: friendlyAuthError(error?.message) };
        }

        let userRole: UserRole = 'investor';
        try {
          const isAdmin = await checkAdminAccess(data.user.id, cleanEmail);
          userRole = isAdmin ? 'admin' : 'investor';
        } catch (e) {
          console.warn('Admin check failed, defaulting to investor:', e);
        }
        await syncUserState(data.user, userRole);
        return { success: true, role: userRole };
      }

      // Not configured: dev-only server fallback
      if (!ALLOW_SERVER_FALLBACK) {
        return { success: false, error: NOT_CONFIGURED_ERROR };
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      await syncUserState(data.user, data.role as UserRole);
      return { success: true, role: data.role as UserRole };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    phone: string,
    agreedToTerms: boolean
  ) => {
    if (!agreedToTerms) {
      return { success: false, error: 'You must agree to the Terms and Conditions to register.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    const referralCode = readReferralCode();

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: pass,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
          },
        });

        if (error) {
          return { success: false, error: friendlyAuthError(error.message) };
        }

        // With email confirmation on, Supabase does NOT return an error for an
        // existing email. It returns a fake user with an empty identities array.
        if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
          return {
            success: false,
            error: 'An account with this email already exists. Please log in.',
          };
        }

        // Create the investor profile (non-fatal if it fails; profile is also created on first load)
        try {
          await fetch('/api/investor/register-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email || cleanEmail,
              name: fullName,
              phone: phone,
              referralCode,
            }),
          });
        } catch (e) {
          console.warn('register-profile failed:', e);
        }

        if (data.session?.user) {
          await syncUserState(data.session.user, 'investor');
          return { success: true };
        }

        // Email confirmation is enabled: no session until they confirm.
        return { success: true, needsConfirmation: true };
      }

      // Not configured: dev-only server fallback
      if (!ALLOW_SERVER_FALLBACK) {
        return { success: false, error: NOT_CONFIGURED_ERROR };
      }
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: pass,
          fullName,
          phone,
          agreedToTerms,
          referralCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      await syncUserState(data.user, 'investor');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Google sign-in requires Supabase. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
          access_type: 'offline',
        },
      },
    });
    if (error) {
      console.error('Supabase Google OAuth Error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        if (error) throw error;
      }
      return {
        success: true,
        message: `If an account exists for ${cleanEmail}, password reset instructions have been sent.`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset link.' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      setUser(null);
      setProfile(null);
      setRole('investor');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        resetPassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
