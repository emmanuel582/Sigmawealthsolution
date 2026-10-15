import { test, expect } from '@playwright/test';
import { authErrorCode, authErrorMessage, authRedirectUrl } from '../../lib/sigma/authRedirects';

test('production uses the Supabase-allowlisted alias; local callbacks keep their origin', () => {
  expect(authRedirectUrl('/auth/callback', 'https://www.sigmawealthsolution.com')).toBe('https://sigmawealthsolution.com/auth/callback');
  expect(authRedirectUrl('/auth/reset-password', 'https://www.sigmawealthsolution.com')).toBe('https://sigmawealthsolution.com/auth/reset-password');
  expect(authRedirectUrl('/auth/callback', 'http://localhost:3000')).toBe('http://localhost:3000/auth/callback');
});

test('query and hash errors map to fixed messages, never reflected provider text', () => {
  expect(authErrorCode(new URL('https://www.sigmawealthsolution.com/?error_code=bad_oauth_state'))).toBe('oauth_expired');
  expect(authErrorCode(new URL('https://www.sigmawealthsolution.com/#error=access_denied&error_description=untrusted'))).toBe('oauth_failed');
  expect(authErrorMessage('untrusted')).toBeNull();
  expect(authErrorCode(new URL('https://www.sigmawealthsolution.com/?ref=SW123'))).toBeNull();
});
