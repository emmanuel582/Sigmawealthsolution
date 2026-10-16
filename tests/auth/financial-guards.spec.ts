import { test, expect } from '@playwright/test';
import { paymentAttemptKey, clearPaymentAttempt } from '../../lib/sigma/paymentAttempt';

test('payment retry keys survive retries, isolate accounts and plans, and clear only the confirmed attempt', () => {
  const values = new Map<string, string>();
  const storage = {
    get length() { return values.size; },
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index: number) => Array.from(values.keys())[index] ?? null,
  };
  const first = paymentAttemptKey(storage, 'owner', 64000, false);
  expect(paymentAttemptKey(storage, 'owner', 64000, false)).toBe(first);
  const other = paymentAttemptKey(storage, 'other', 64000, false);
  expect(other).not.toBe(first);
  expect(paymentAttemptKey(storage, 'owner', 98550, false)).not.toBe(first);
  expect(paymentAttemptKey(storage, 'owner', 64000, true)).not.toBe(first);
  clearPaymentAttempt(storage, 'other', first);
  expect(paymentAttemptKey(storage, 'owner', 64000, false)).toBe(first);
  clearPaymentAttempt(storage, 'owner', first);
  expect(paymentAttemptKey(storage, 'owner', 64000, false)).not.toBe(first);
  expect(paymentAttemptKey(storage, 'other', 64000, false)).toBe(other);
});

test('public paid API rejects cross-site calls and malformed or oversized bodies before external effects', async ({ request }) => {
  for (const route of ['/api/chat', '/api/feedback']) {
    expect((await request.post(route, { headers: { Origin: 'https://attacker.example' }, data: {} })).status()).toBe(403);
    expect((await request.post(route, { data: 'invalid json', headers: { 'Content-Type': 'application/json' } })).status()).toBe(400);
    expect((await request.post(route, { data: { message: 'x'.repeat(9000) } })).status()).toBe(400);
    expect((await request.post(route, { data: [] })).status()).toBe(400);
  }
});

test('public API abuse is rate limited without invoking an email or AI provider', async ({ request }) => {
  const responses = await Promise.all(Array.from({ length: 18 }, () => request.post('/api/chat', { data: { message: {} } })));
  expect(responses.every(response => [400, 429].includes(response.status()))).toBeTruthy();
  const rejected = responses.find(response => response.status() === 429);
  expect(rejected).toBeDefined();
  expect(rejected!.headers()['retry-after']).toBe('60');
});
