"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/sigma/supabaseClient';
import { UserRole, Profile } from '@/lib/sigma/types';
import { checkAdminAccess } from '@/lib/sigma/api';

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
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signUpWithEmail: (email: string, pass: string, fullName: string, phone: string, agreedToTerms: boolean) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [role, setRole] = useState<UserRole>('investor');
  const [profile, setProfile] = useState<Profile | null>(null);
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
      name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.name || sessionUser.email?.split('@')[0] || 'Investor',
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
    let mounted = true
    let authSubscription: { unsubscribe: () => void } | null = null

    // Failsafe only — keep loader up until real auth init finishes (avoids landing flash)
    const timeoutId = setTimeout(() => {
      if (mounted) setIsLoading(false)
    }, 10000)

    async function initAuth() {
      try {
        if (isSupabaseConfigured) {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (!mounted) return

          if (session?.user) {
            await syncUserState(session.user)
          } else {
            const res = await fetch("/api/auth/current-session")
            if (!mounted) return
            if (res.ok) {
              const data = await res.json()
              if (data.user) {
                await syncUserState(data.user)
              } else {
                setIsLoading(false)
              }
            } else {
              setIsLoading(false)
            }
          }

          const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
            if (mounted) {
              await syncUserState(nextSession?.user ?? null)
            }
          })
          authSubscription = authListener?.subscription ?? null
        } else {
          const res = await fetch("/api/auth/current-session")
          if (!mounted) return
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              await syncUserState(data.user)
            } else {
              setIsLoading(false)
            }
          } else {
            setIsLoading(false)
          }
        }
      } catch (e) {
        console.warn("Auth init check error:", e)
        if (mounted) setIsLoading(false)
      } finally {
        clearTimeout(timeoutId)
      }
    }

    initAuth()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      authSubscription?.unsubscribe()
    }
  }, [])

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
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      // 1. Try Supabase Auth if configured
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: pass,
          });
          if (!error && data?.user) {
            const isAdmin = await checkAdminAccess(data.user.id, cleanEmail);
            const userRole: UserRole = isAdmin ? 'admin' : 'investor';
            await syncUserState(data.user, userRole);
            return { success: true, role: userRole };
          }
        } catch (supaErr) {
          console.warn('Supabase sign in returned error, attempting server fallback:', supaErr);
        }
      }

      // 2. Seamless server fallback authentication
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
      setIsLoading(false);
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
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const referralCode =
      (typeof document !== 'undefined' &&
        document.cookie
          .split('; ')
          .find((c) => c.startsWith('sigma_ref='))
          ?.split('=')[1]) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('sigma_ref') : null) ||
      undefined;

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
          const msg = (error.message || '').toLowerCase();
          if (msg.includes('already') || msg.includes('registered')) {
            setIsLoading(false);
            return { success: false, error: 'An account with this email already exists. Please log in.' };
          }
          console.warn('Supabase sign up error, attempting server fallback:', error.message);
        } else if (data?.user) {
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

          if (data.session?.user) {
            await syncUserState(data.session.user, 'investor');
            return { success: true };
          }

          const { data: signedIn, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: pass,
          });
          if (!signInErr && signedIn?.user) {
            await syncUserState(signedIn.user, 'investor');
            return { success: true };
          }

          // Account created; allow server session so UX still works if email confirm is on
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
              supabaseUserId: data.user.id,
            }),
          });
          if (res.ok) {
            const payload = await res.json();
            await syncUserState(payload.user, 'investor');
            return { success: true };
          }

          setIsLoading(false);
          return {
            success: false,
            error: 'Account created. Confirm your email if required, then log in.',
          };
        }
      }

      // Fallback server signup
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
      setIsLoading(false);
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Google sign-in requires Supabase. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
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
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=update-password`,
        });
        if (error) throw error;
      }
      return { success: true, message: `Password reset instructions have been dispatched to ${email}.` };
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
