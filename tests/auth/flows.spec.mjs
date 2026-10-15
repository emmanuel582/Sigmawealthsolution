import { test, expect } from '@playwright/test';

const user = {
  id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated',
  email: 'auth-test@example.com', email_confirmed_at: '2026-01-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z', app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { full_name: 'Auth Test', phone: '08000000000' }, identities: [{ provider: 'email', id: 'test-identity' }],
};
const jwt = () => `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: user.id, role: 'authenticated', email: user.email, aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.test-signature`;
const session = () => ({ access_token: jwt(), refresh_token: 'test-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user });
const profile = { id: user.id, email: user.email, name: 'Auth Test', phone: '', total_invested: 0, current_phase: 'None', payment_plan_id: null, created_at: user.created_at };
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

// Every Supabase/API call is intercepted. These tests cannot create a real
// account, send a confirmation email, or charge any payment method.
async function mockServices(page, { metadataDelay = 0, rejectCode = false, rejectPassword = false } = {}) {
  const calls = { roles: 0, profiles: 0, profileReads: 0, registrations: 0, codes: 0, authorizations: [], signup: null, unauthorized: 0 };
  await page.route('**/*.supabase.co/**', async route => {
    const request = route.request(); const url = new URL(request.url());
    const respond = (json, status = 200) => route.fulfill({ status, json, headers: cors });
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (url.pathname === '/rest/v1/profiles') {
      calls.profileReads++;
      if (!request.headers().authorization?.startsWith('Bearer ')) calls.unauthorized++;
      expect(url.searchParams.get('id')).toBe(`eq.${user.id}`);
      return respond([profile]);
    }
    if (url.pathname.endsWith('/authorize')) {
      calls.authorizations.push(url);
      return route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>Mock provider</h1>' });
    }
    if (url.pathname.endsWith('/signup')) { calls.signup = request.postDataJSON(); return respond({ user, session: null }); }
    if (url.pathname.endsWith('/token')) {
      if (url.searchParams.get('grant_type') === 'pkce') {
        calls.codes++;
        if (rejectCode) return respond({ error_code: 'flow_state_not_found', msg: 'Code was already consumed.' }, 400);
      } else if (rejectPassword) return respond({ error_code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
      return respond(session());
    }
    if (url.pathname.endsWith('/user')) return respond(user);
    return respond({});
  });
  await page.route('**/api/**', async route => {
    const request = route.request(); const path = new URL(request.url()).pathname;
    if (path.includes('/register-profile')) calls.registrations++;
    const metadata = path.includes('/check-role/') || path.includes('/investor/profile/');
    if (metadata && !request.headers().authorization?.startsWith('Bearer ')) calls.unauthorized++;
    if (path.includes('/check-role/')) calls.roles++;
    if (path.includes('/investor/profile/')) calls.profiles++;
    if (metadata && metadataDelay) await new Promise(resolve => setTimeout(resolve, metadataDelay));
    if (page.isClosed()) return;
    const json = path.includes('/check-role/') ? { isAdmin: false }
      : path.includes('/investor/profile/') ? profile
      : path.includes('/dashboard/') ? { profile, payments: [], payouts: [], notifications: [] }
      : path.endsWith('/banks') ? { data: [] } : {};
    await route.fulfill({ json });
  });
  return calls;
}

async function login(page) {
  await page.goto('/auth/login');
  await page.getByPlaceholder('Enter your email').fill(user.email);
  await page.getByPlaceholder('Password', { exact: true }).fill('Test-password-123');
  await page.locator('#auth-submit-btn').click();
}

async function startGoogle(page) {
  await page.goto('/auth/login');
  await page.locator('#auth-google-btn').click();
  await expect(page).toHaveURL(/\/auth\/v1\/authorize/);
}

test('reported stale OAuth URL goes to a clean login page with a fresh retry', async ({ page }) => {
  const calls = await mockServices(page);
  await page.goto('/?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+state+not+found+or+expired');
  await expect(page).toHaveURL(/\/auth\/login\?auth_error=oauth_expired$/);
  await expect(page.getByRole('alert', { name: 'Sign-in error' })).toContainText('start a fresh sign-in');
  const origin = new URL(page.url()).origin;
  await page.locator('#auth-google-btn').click();
  await expect(page).toHaveURL(/\/auth\/v1\/authorize/);
  expect(calls.authorizations).toHaveLength(1);
  expect(calls.authorizations[0].searchParams.get('code_challenge')).toBeTruthy();
  expect(calls.authorizations[0].searchParams.get('redirect_to')).toBe(origin + '/auth/callback');
});

test('email login finishes before slow metadata and does not duplicate it', async ({ page }) => {
  const calls = await mockServices(page, { metadataDelay: 5000 });
  await login(page);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 2000 });
  await expect.poll(() => calls.profileReads).toBe(1);
  expect(calls.roles).toBe(1); expect(calls.profileReads).toBe(1); expect(calls.profiles).toBe(0);
  expect(calls.unauthorized).toBe(0); expect(calls.registrations).toBe(0);
});

test('confirmation signup responds without any unauthenticated profile request', async ({ page }) => {
  const calls = await mockServices(page, { metadataDelay: 5000 });
  await page.goto('/auth/signup?ref=SWTEST');
  await page.getByPlaceholder('Full legal name').fill('Auth Test');
  await page.getByPlaceholder('Enter your email').fill(user.email);
  await page.getByPlaceholder('Create a password').fill('Test-password-123');
  await page.getByPlaceholder('Confirm password').fill('Test-password-123');
  await page.locator('#signup-terms-checkbox').check();
  await page.locator('#auth-submit-btn').click();
  await expect(page.getByText('Account created. Check your email to confirm it, then log in.')).toBeVisible({ timeout: 2000 });
  expect(calls.roles + calls.profiles + calls.registrations + calls.profileReads).toBe(0);
  expect(calls.signup.data.referral_code).toBe('SWTEST');
  await expect(page).not.toHaveURL(/\/dashboard/);
});

test('PKCE callback exchanges once and skips the old blocking registration', async ({ page }) => {
  const calls = await mockServices(page, { metadataDelay: 5000 });
  await startGoogle(page);
  await page.goto('/auth/callback?code=fresh-test-code');
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 2000 });
  await expect.poll(() => calls.profileReads).toBe(1);
  expect(calls.codes).toBe(1); expect(calls.registrations).toBe(0);
  expect(calls.roles).toBe(1); expect(calls.profileReads).toBe(1); expect(calls.profiles).toBe(0); expect(calls.unauthorized).toBe(0);
});

test('a rejected or reused PKCE code leads to a usable retry page', async ({ page }) => {
  const calls = await mockServices(page, { rejectCode: true });
  await startGoogle(page);
  await page.goto('/auth/callback?code=already-used-code');
  await expect(page).toHaveURL(/\/auth\/login\?auth_error=oauth_expired$/);
  await expect(page.getByRole('alert', { name: 'Sign-in error' })).toContainText('expired or was already used');
  await expect(page.locator('#auth-submit-btn')).toBeEnabled();
  expect(calls.codes).toBe(1);
});

test('password recovery lets the SDK consume its code once', async ({ page }) => {
  const calls = await mockServices(page);
  await startGoogle(page);
  await page.goto('/auth/reset-password?code=recovery-test-code');
  await expect(page.getByPlaceholder('New password', { exact: true })).toBeVisible();
  expect(calls.codes).toBe(1);
});

test('incorrect credentials show an error and release the submit button', async ({ page }) => {
  await mockServices(page, { rejectPassword: true });
  await login(page);
  await expect(page.getByRole('alert', { name: 'Sign-in error' })).toContainText('Invalid email or password.');
  await expect(page.locator('#auth-submit-btn')).toBeEnabled();
  await expect(page).toHaveURL(/\/auth\/login$/);
});

test('double-clicking Google starts only one fresh authorization', async ({ page }) => {
  const calls = await mockServices(page);
  await page.goto('/auth/login');
  await page.locator('#auth-google-btn').evaluate(button => { button.click(); button.click(); });
  await expect(page).toHaveURL(/\/auth\/v1\/authorize/);
  expect(calls.authorizations).toHaveLength(1);
});

test('older implicit return links still complete a session', async ({ page }) => {
  const calls = await mockServices(page);
  const tokens = new URLSearchParams({ access_token: jwt(), refresh_token: 'test-refresh-token', expires_in: '3600', token_type: 'bearer' });
  await page.goto(`/auth/callback#${tokens}`);
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(calls.codes).toBe(0); expect(calls.unauthorized).toBe(0);
});

test('signing out discards late metadata without restoring private UI', async ({ page }) => {
  await mockServices(page, { metadataDelay: 4000 });
  await login(page);
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 2000 });
  await page.getByRole('button', { name: 'Profile', exact: true }).click();
  await page.getByRole('button', { name: 'Sign Out', exact: true }).click();
  await expect(page).not.toHaveURL(/\/dashboard/);
  await page.waitForTimeout(4500);
  await expect(page).not.toHaveURL(/\/dashboard/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/login$/);
});
