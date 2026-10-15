"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/sigma/supabaseClient';
import { UserRole, Profile } from '@/lib/sigma/types';
import { apiFetch } from '@/lib/sigma/api';
import { authRedirectUrl } from '@/lib/sigma/authRedirects';

const NOT_CONFIGURED_ERROR = 'Authentication is not configured. Please contact support.';

interface UserSession { id: string; email: string; name: string; }
interface AuthContextType {
  user: UserSession | null;
  role: UserRole;
  profile: Profile | null;
  isLoading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signUpWithEmail: (email: string, pass: string, fullName: string, phone: string, agreedToTerms: boolean) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readReferralCode(): string | undefined {
  try {
    const raw = document.cookie.split('; ').find(c => c.startsWith('sigma_ref='))?.split('=')[1];
    return raw ? decodeURIComponent(raw) : localStorage.getItem('sigma_ref') || undefined;
  } catch { return undefined; }
}

function friendlyAuthError(message?: string): string {
  const msg = (message || '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Invalid email or password.';
  if (msg.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for the confirmation link.';
  if (msg.includes('already') && msg.includes('registered')) return 'An account with this email already exists. Please log in.';
  if (msg.includes('rate limit')) return 'Too many attempts. Please wait a minute and try again.';
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('aborted')) return 'Could not reach the sign-in service. Check your connection and try again.';
  return message || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRole] = useState<UserRole>('investor');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activeUser = useRef<string | null>(null);
  const generation = useRef(0);
  const metadataRequest = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const oauthStarting = useRef(false);

  // Auth is ready as soon as Supabase supplies a session. Backend metadata is
  // independent, deduplicated, and cannot restore a user after they sign out.
  const syncSession = useCallback((session: Session | null, force = false) => {
    if (!mounted.current) return;
    const sessionUser = session?.user;
    setIsLoading(false);
    if (!session || !sessionUser) {
      activeUser.current = null;
      generation.current++;
      metadataRequest.current?.abort();
      setUser(null);
      setProfile(null);
      setRole('investor');
      return;
    }
    if (activeUser.current === sessionUser.id && !force) return;
    activeUser.current = sessionUser.id;
    const version = ++generation.current;
    metadataRequest.current?.abort();
    const controller = new AbortController();
    metadataRequest.current = controller;
    const current = () => mounted.current && version === generation.current && !controller.signal.aborted;
    const userData = {
      id: sessionUser.id,
      email: (sessionUser.email || '').toLowerCase().trim(),
      name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'Investor',
    };
    setUser(userData);
    setRole('investor');
    setProfile(null);
    const headers = { Authorization: `Bearer ${session.access_token}` };
    const timeout = setTimeout(() => controller.abort(), 30000);
    const roleRequest = apiFetch(`/api/admin/check-role/${userData.id}`, { headers, signal: controller.signal })
      .then(async response => {
        if (!response.ok) return;
        const data = await response.json();
        if (current()) setRole(data.isAdmin === true ? 'admin' : 'investor');
      });
    // A read-only owner-scoped query cannot race the dashboard's first-time
    // profile provisioning. Defer SDK access until the auth listener returns.
    const profileRequest = Promise.resolve().then(async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userData.id).abortSignal(controller.signal).maybeSingle();
      if (!error && data && current()) setProfile(data);
    });
    void Promise.allSettled([roleRequest, profileRequest]).finally(() => clearTimeout(timeout));
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!isSupabaseConfigured) { setIsLoading(false); return; }
    let receivedEvent = false;
    let cancelled = false;
    const startupTimeout = setTimeout(() => {
      if (!cancelled && mounted.current) setIsLoading(false);
    }, 10000);
    // Role fetches use an explicit bearer token; SDK profile reads are deferred.
    // The listener never awaits or reenters the SDK session lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      clearTimeout(startupTimeout);
      receivedEvent = true;
      syncSession(session, event === 'USER_UPDATED');
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled || !mounted.current || receivedEvent) return;
      if (error) setIsLoading(false);
      else syncSession(data.session);
    }).catch(() => { if (!cancelled && mounted.current) setIsLoading(false); })
      .finally(() => clearTimeout(startupTimeout));
    return () => {
      cancelled = true;
      clearTimeout(startupTimeout);
      mounted.current = false;
      activeUser.current = null;
      generation.current++;
      metadataRequest.current?.abort();
      subscription.unsubscribe();
    };
  }, [syncSession]);

  useEffect(() => {
    const resume = () => { oauthStarting.current = false; };
    window.addEventListener('pageshow', resume);
    return () => window.removeEventListener('pageshow', resume);
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const version = generation.current;
    try {
      const response = await apiFetch(`/api/investor/profile/${user.id}`, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) return;
      const data = await response.json();
      if (mounted.current && version === generation.current) setProfile(data);
    } catch { /* Dashboard reads can retry metadata independently. */ }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) return { success: false, error: NOT_CONFIGURED_ERROR };
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass });
      if (error || !data.session) return { success: false, error: friendlyAuthError(error?.message) };
      syncSession(data.session);
      return { success: true };
    } catch (error: any) { return { success: false, error: friendlyAuthError(error?.message) }; }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string, phone: string, agreedToTerms: boolean) => {
    if (!agreedToTerms) return { success: false, error: 'You must agree to the Terms and Conditions to register.' };
    if (!isSupabaseConfigured) return { success: false, error: NOT_CONFIGURED_ERROR };
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password: pass,
        options: {
          data: { referral_code: readReferralCode(), full_name: fullName, phone },
          emailRedirectTo: authRedirectUrl('/auth/callback'),
        },
      });
      if (error) return { success: false, error: friendlyAuthError(error.message) };
      if (!data.user || data.user.identities?.length === 0) return { success: false, error: 'An account with this email already exists. Please log in.' };
      // Confirmation-only signup has no bearer token. Authenticated profile
      // provisioning happens on the first session/dashboard load instead.
      if (data.session) syncSession(data.session);
      return { success: true, needsConfirmation: !data.session };
    } catch (error: any) { return { success: false, error: friendlyAuthError(error?.message) }; }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED_ERROR);
    if (oauthStarting.current) return;
    oauthStarting.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: authRedirectUrl('/auth/callback'), skipBrowserRedirect: true, queryParams: { prompt: 'select_account' } },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Google sign-in is unavailable. Please try again.');
      // Always create a new authorization URL; never reuse a provider callback.
      window.location.assign(data.url);
    } catch (error) { oauthStarting.current = false; throw error; }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) return { success: false, error: NOT_CONFIGURED_ERROR };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: authRedirectUrl('/auth/reset-password') });
      if (error) throw error;
      return { success: true, message: 'If an account exists for that email, password reset instructions have been sent.' };
    } catch (error: any) { return { success: false, error: friendlyAuthError(error?.message) }; }
  };

  const signOut = async () => {
    // Clear private UI immediately and invalidate in-flight metadata updates.
    syncSession(null);
    if (isSupabaseConfigured) await supabase.auth.signOut({ scope: 'local' });
  };

  return <AuthContext.Provider value={{ user, role, profile, isLoading, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, signOut, refreshProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
