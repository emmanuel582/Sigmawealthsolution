import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Normalize URL (auto-prepend https:// if omitted by user)
const normalizedUrl = rawUrl
  ? rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`
  : '';

export const isSupabaseConfigured = Boolean(
  normalizedUrl &&
  rawKey &&
  !normalizedUrl.includes('your-project') &&
  !rawKey.includes('your-supabase-anon-key') &&
  normalizedUrl !== 'https://'
);

export const supabaseConfigStatus = {
  isConfigured: isSupabaseConfigured,
  hasUrl: Boolean(normalizedUrl && normalizedUrl !== 'https://'),
  hasAnonKey: Boolean(rawKey && rawKey.length > 20),
  urlPreview: normalizedUrl ? `${normalizedUrl.substring(0, 16)}...` : 'Not set',
  keyLength: rawKey ? rawKey.length : 0,
};

// Create real Supabase client if configured, or a fallback client
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(normalizedUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://mock-instance.supabase.co', 'mock-anon-key-placeholder', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

export default supabase;
