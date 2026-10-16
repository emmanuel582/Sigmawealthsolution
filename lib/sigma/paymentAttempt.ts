const PREFIX = 'sigma_checkout_attempt:';

export function paymentAttemptKey(storage: Storage, userId: string, amount: number, recurring: boolean): string {
  const slot = `${PREFIX}${userId}:${amount}:${recurring}`;
  const existing = storage.getItem(slot);
  if (existing && /^[a-zA-Z0-9_-]{16,100}$/.test(existing)) return existing;
  const key = crypto.randomUUID();
  storage.setItem(slot, key);
  return key;
}

export function clearPaymentAttempt(storage: Storage, userId: string, key: string): void {
  const prefix = `${PREFIX}${userId}:`;
  for (let i = storage.length - 1; i >= 0; i--) {
    const slot = storage.key(i);
    if (slot?.startsWith(prefix) && storage.getItem(slot) === key) storage.removeItem(slot);
  }
}
