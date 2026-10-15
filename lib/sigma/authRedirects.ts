export const OAUTH_EXPIRED_MESSAGE = 'Your Google sign-in expired or was already used. Please select Google again to start a fresh sign-in.';
export const OAUTH_FAILED_MESSAGE = 'Google sign-in could not be completed. Please try again or sign in with your email.';

/** Supabase currently allowlists the apex domain. Hosting redirects its
 * callback to www, where the production browser's PKCE verifier is stored. */
export function authRedirectUrl(path: '/auth/callback' | '/auth/reset-password', origin = window.location.origin) {
  const target = new URL(origin);
  if (target.hostname === 'www.sigmawealthsolution.com') target.hostname = 'sigmawealthsolution.com';
  return new URL(path, target).toString();
}

export function authErrorCode(url: URL): string | null {
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  if (!url.searchParams.has('error') && !url.searchParams.has('error_code') && !hash.has('error') && !hash.has('error_code')) return null;
  const code = url.searchParams.get('error_code') || hash.get('error_code');
  return ['bad_oauth_state', 'flow_state_expired', 'flow_state_not_found', 'bad_code_verifier'].includes(code || '') ? 'oauth_expired' : 'oauth_failed';
}

export function authErrorMessage(code: string | null): string | null {
  if (code === 'oauth_expired') return OAUTH_EXPIRED_MESSAGE;
  if (code === 'oauth_failed') return OAUTH_FAILED_MESSAGE;
  return null;
}
