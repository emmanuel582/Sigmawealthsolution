import { supabase, isSupabaseConfigured } from '@/lib/sigma/supabaseClient';
import { paymentAttemptKey, clearPaymentAttempt } from './paymentAttempt';
import { 
  Profile, 
  Investment, 
  Payment, 
  Payout, 
  BankDetails, 
  CardDetails, 
  NotificationItem, 
  ActivityLogItem, 
  PlatformSettings,
  BankItem,
  PayoutCronResult
} from '@/lib/sigma/types';

const API_BASE = '/api';

// Attach the signed-in Supabase session to protected payment and admin requests.
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (isSupabaseConfigured && !headers.has('Authorization')) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) headers.set('Authorization', 'Bearer ' + data.session.access_token);
  }
  return fetch(input, { ...init, headers, signal: init.signal || AbortSignal.timeout(30_000) });
}

export async function fetchAppConfig(): Promise<{
  bachsConfigured: boolean; bachsSandbox: boolean; bachsWebhookConfigured: boolean;
  isSupabaseLive: boolean; minDepositNgn?: number; referralRate?: number; payoutHint?: string;
}> {
  try {
    const response = await fetch(API_BASE + '/config');
    if (!response.ok) throw new Error('Configuration unavailable');
    return await response.json();
  } catch {
    return { bachsConfigured: false, bachsSandbox: true, bachsWebhookConfigured: false, isSupabaseLive: false };
  }
}


export async function fetchNigerianBanks(): Promise<BankItem[]> {
  try {
    const res = await apiFetch(`${API_BASE}/banks`);
    if (!res.ok) {
      // Soft-fail when Bachs is offline/unconfigured — bank picker stays empty
      return [];
    }
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function verifyBankAccount(accountNumber: string, bankCode: string): Promise<{ account_name: string; account_number: string } | null> {
  const res = await apiFetch(`${API_BASE}/verify-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_number: accountNumber, account_bank: bankCode }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Could not verify bank account details.');
  }
  const data = await res.json();
  return data.data;
}

export async function saveBankDetails(details: {
  userId: string;
  accountNumber?: string;
  bankCode?: string;
  bankName?: string;
  accountName: string;
  country?: string;
  currency?: string;
  routingNumber?: string;
  iban?: string;
  bic?: string;
  bachsAccountId?: string;
}): Promise<BankDetails> {
  const res = await apiFetch(`${API_BASE}/investor/bank-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to save bank details');
  }
  return await res.json();
}

/** Bachs recipient onboarding for verified Nigerian bank payouts. */
export async function startBachsConnectOnboarding(payload: {
  userId: string;
  email: string;
  country?: string;
  accountName?: string;
}): Promise<{ success: boolean; onboardingUrl: string; bachsAccountId: string; message?: string }> {
  const res = await apiFetch(`${API_BASE}/investor/connect/onboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to start Bachs Connect onboarding');
  }
  return res.json();
}

export async function initiateBachsPayment(payload: {
  userId: string;
  email: string;
  name?: string;
  phone?: string;
  amount: number;
  phase: string;
  isRecurringPlan?: boolean;
  monthlyPlanAmount?: number;
  saveCard?: boolean;
  paymentType?: 'card' | 'opay';
  currency?: string;
}): Promise<{
  success: boolean;
  chargeId: string;
  sessionId?: string;
  reference: string;
  status: string;
  redirectUrl: string | null;
  completed: boolean;
  simulated?: boolean;
  amountCharged?: number;
  monthlyPlanAmount?: number | null;
  payment?: Payment;
  investment?: Investment;
  nextAction?: unknown;
}> {
  // Reuse the same durable key after a timeout, refresh, or second tab.
  const getKey = () => paymentAttemptKey(localStorage, payload.userId, payload.amount, Boolean(payload.isRecurringPlan));
  const attemptKey = navigator.locks
    ? await navigator.locks.request(`sigma-checkout:${payload.userId}`, getKey)
    : getKey();
  const res = await apiFetch(`${API_BASE}/bachs/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, currency: 'ngn', idempotencyKey: attemptKey }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to initiate payment' }));
    if (['CHECKOUT_EXPIRED', 'ALREADY_CREDITED'].includes(error.code)) clearPaymentAttempt(localStorage, payload.userId, attemptKey);
    throw new Error(error.message);
  }
  const result = await res.json();
  if (result.reference) localStorage.setItem(`sigma_checkout_reference:${result.reference}`, attemptKey);
  if (result.completed && result.success) clearPaymentAttempt(localStorage, payload.userId, attemptKey);
  return result;
}

export async function verifyBachsPayment(payload: {
  chargeId?: string;
  sessionId?: string;
  transactionId?: string | number;
  txRef?: string;
  checkoutId?: string;

  userId: string;
  email?: string;
  name?: string;
  amount: number;
  phase: string;
  isRecurringPlan?: boolean;
  monthlyPlanAmount?: number;
}): Promise<{ success: boolean; message: string; payment: Payment; investment: Investment; profile?: Profile }> {
  const res = await apiFetch(`${API_BASE}/bachs/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Payment verification failed' }));
    throw new Error(error.message);
  }
  const result = await res.json();
  if (result.success && payload.txRef) {
    const slot = `sigma_checkout_reference:${payload.txRef}`;
    const attemptKey = localStorage.getItem(slot);
    if (attemptKey) clearPaymentAttempt(localStorage, payload.userId, attemptKey);
    localStorage.removeItem(slot);
  }
  return result;
}

export async function syncBachsTransactions(all = false): Promise<{ success: boolean; syncedCount: number; totalPayments: number; message?: string }> {
  const res = await apiFetch(`${API_BASE}/bachs/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ all }),
  });
  if (!res.ok) throw new Error('Failed to sync Bachs transactions');
  return await res.json();
}

export async function cancelAutoDebitPlan(userId: string): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch(`${API_BASE}/investor/cancel-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to cancel auto-debit subscription');
  return await res.json();
}

export async function saveAutoDebitPlan(userId: string, amount: number) {
  const res = await apiFetch(`${API_BASE}/investor/auto-debit-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message || 'Failed');
  }
  return res.json();
}

export type ReferralItem = {
  id: string;
  referrer_id?: string;
  referred_id?: string;
  referred_name?: string;
  referred_email?: string;
  earned_total?: number;
  created_at?: string;
};

export type AutoDebitPlan = {
  user_id: string;
  amount: number;
  active: boolean;
  next_charge_date?: string;
  reminder_date?: string;
  last_reminder_sent?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function fetchInvestorDashboardData(userId: string, email?: string): Promise<{
  profile: Profile | null;
  bankDetails: BankDetails | null;
  cardDetails: CardDetails | null;
  investment: Investment | null;
  payments: Payment[];
  payouts: Payout[];
  opayReceipts?: unknown[];
  notifications: NotificationItem[];
  referralCode?: string | null;
  referralEarnings?: number;
  referralCount?: number;
  referrals?: ReferralItem[];
  autoDebitPlan?: AutoDebitPlan | null;
}> {
  const url = email 
    ? `${API_BASE}/investor/dashboard/${userId}?email=${encodeURIComponent(email)}` 
    : `${API_BASE}/investor/dashboard/${userId}`;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error('Failed to load investor dashboard');
  return await res.json();
}

// ---------------- ADMIN API CALLS ----------------

export async function adminLoginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: any; role?: string; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Authentication is not configured.' };
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass });
  if (error || !data.user) return { success: false, error: error?.message || 'Sign-in failed.' };
  if (!await checkAdminAccess(data.user.id)) { await supabase.auth.signOut(); return { success: false, error: 'Administrator access is not approved for this account.' }; }
  return { success: true, user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.full_name || data.user.email }, role: 'admin' };
}

export async function adminRegisterWithEmail(email: string, pass: string, fullName?: string): Promise<{ success: boolean; user?: any; role?: string; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Authentication is not configured.' };
  const { error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password: pass, options: { data: { full_name: fullName } } });
  return { success: false, error: error?.message || 'Confirm your email, then sign in. Administrator access requires the owner’s allowlist and assigned role.' };
}

export async function checkAdminAccess(userId: string, email?: string): Promise<boolean> {
  try {
    const url = email 
      ? `${API_BASE}/admin/check-role/${userId}?email=${encodeURIComponent(email)}`
      : `${API_BASE}/admin/check-role/${userId}`;
    const res = await apiFetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    return data.isAdmin === true;
  } catch {
    return false;
  }
}

export async function fetchAdminOverview(): Promise<{
  attention: {
    pendingOPayCount?: number;
    payoutsDueTodayCount: number;
    failedPayoutsCount: number;
    scheduledPayoutsCount: number;
  };
  kpis: {
    totalInvestors: number;
    investorWeeklyDelta: number;
    totalAUM: number;
    payoutMode: 'automatic' | 'manual';
    totalPayoutsDisbursed: number;
    totalPaymentsVolume: number;
    successfulPaymentsCount: number;
  };
  charts: {
    paymentsByDay: Array<{ date: string; amount: number; count: number }>;
    paymentsByStatus: Array<{ status: string; amount: number; count: number }>;
  };
  scheduledPayouts: Array<{
    userId: string;
    investorName: string;
    investorEmail: string;
    amount: number;
    nextPaymentDate: string;
    hasBeneficiary: boolean;
  }>;
  activityFeed: ActivityLogItem[];
}> {
  const res = await apiFetch(`${API_BASE}/admin/overview`);
  if (!res.ok) throw new Error('Failed to fetch admin overview');
  return await res.json();
}

export async function fetchAdminInvestors(query?: string, phaseFilter?: string): Promise<{
  investors: Array<{
    profile: Profile;
    bankDetails: BankDetails | null;
    cardDetails: CardDetails | null;
    investment: Investment | null;
    paymentsCount: number;
    payoutsCount: number;
  }>;
}> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (phaseFilter) params.append('phase', phaseFilter);
  const res = await apiFetch(`${API_BASE}/admin/investors?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch investors');
  return await res.json();
}

export async function deleteInvestorAccount(userId: string, adminName: string): Promise<{ success: boolean }> {
  const res = await apiFetch(`${API_BASE}/admin/investors/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName }),
  });
  if (!res.ok) throw new Error('Failed to delete investor account');
  return await res.json();
}

export async function updateInvestorRecord(userId: string, updates: Partial<Profile>, adminName: string): Promise<{ success: boolean }> {
  const res = await apiFetch(`${API_BASE}/admin/investors/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates, adminName }),
  });
  if (!res.ok) throw new Error('Failed to update investor record');
  return await res.json();
}

export async function fetchAdminPayments(): Promise<Payment[]> {
  const res = await apiFetch(`${API_BASE}/admin/payments`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return await res.json();
}

export async function fetchAdminPayouts(): Promise<{
  payouts: Payout[];
  dueToday: Array<{
    userId: string;
    investorName: string;
    investorEmail: string;
    amount: number;
    nextPaymentDate: string;
    hasBeneficiary: boolean;
    bankDetails: BankDetails | null;
  }>;
  upcoming: Array<{
    userId: string;
    investorName: string;
    amount: number;
    nextPaymentDate: string;
  }>;
  payoutMode: 'automatic' | 'manual';
  lastRunTimestamp: string | null;
  batchHistory: Array<{
    id: string;
    timestamp: string;
    total: number;
    success: number;
    failed: number;
  }>;
}> {
  const res = await apiFetch(`${API_BASE}/admin/payouts`);
  if (!res.ok) throw new Error('Failed to fetch payouts');
  return await res.json();
}

export async function togglePlatformPayoutMode(newMode: 'automatic' | 'manual', adminName: string): Promise<{ success: boolean; mode: 'automatic' | 'manual' }> {
  const res = await apiFetch(`${API_BASE}/admin/payout-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: newMode, adminName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to toggle payout mode. Is the Sigma API running?');
  }
  return await res.json();
}

export async function executeManualPayout(payload: {
  userId: string;
  amount: number;
  adminName: string;
  referenceNote: string;
}): Promise<Payout> {
  const res = await apiFetch(`${API_BASE}/admin/payouts/manual-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to process manual payout');
  }
  return await res.json();
}

export async function executeManualPayoutBatch(payload: {
  userIds?: string[];
  payAllDue?: boolean;
  adminName: string;
  referenceNote: string;
}): Promise<{
  success: boolean;
  paid: number;
  pending: number;
  failed: number;
  skipped: number;
  results: Array<{ userId: string; status: string; amount?: number; message?: string }>;
}> {
  const res = await apiFetch(`${API_BASE}/admin/payouts/manual-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to process batch payouts');
  }
  return await res.json();
}

export async function triggerScheduledPayoutRun(adminName: string): Promise<PayoutCronResult> {
  const res = await apiFetch(`${API_BASE}/payouts/run-cron`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ triggeredBy: adminName }),
  });
  if (!res.ok) throw new Error('Failed to execute automated payout cycle');
  return await res.json();
}

export async function fetchAdminNotifications(): Promise<NotificationItem[]> {
  const res = await apiFetch(`${API_BASE}/admin/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return await res.json();
}

export async function sendBroadcastNotification(payload: {
  title: string;
  body: string;
  audience: 'all' | 'single' | string;
  targetUserId?: string;
  adminName: string;
  icon?: string;
  imageUrl?: string;
}): Promise<NotificationItem> {
  const res = await apiFetch(`${API_BASE}/admin/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to send notification');
  }
  return await res.json();
}

// ---------------- LIVE SUPPORT CHAT ----------------

export type SupportConversation = {
  id: string;
  guest_id?: string | null;
  user_id?: string | null;
  visitor_name?: string;
  visitor_email?: string | null;
  status: string;
  unread_admin?: number;
  unread_user?: number;
  last_message_at?: string;
  last_message_preview?: string;
  created_at?: string;
  updated_at?: string;
};

export type SupportMessage = {
  id: string;
  conversation_id: string;
  sender: 'user' | 'admin';
  sender_name?: string;
  content: string;
  status?: string;
  created_at: string;
};

export async function fetchAdminSupportConversations(): Promise<{
  conversations: SupportConversation[];
  pendingCount: number;
}> {
  const res = await apiFetch(`${API_BASE}/support/admin/conversations`);
  if (!res.ok) throw new Error('Failed to load support conversations');
  return await res.json();
}

export async function fetchSupportConversation(
  id: string,
  as: 'admin' | 'user' = 'admin'
): Promise<{
  conversation: SupportConversation;
  messages: SupportMessage[];
  typing?: { role: string; name: string; at: number } | null;
}> {
  const res = await apiFetch(`${API_BASE}/support/conversations/${id}?as=${as}`);
  if (!res.ok) throw new Error('Failed to load conversation');
  return await res.json();
}

export async function sendSupportMessage(
  conversationId: string,
  payload: { content: string; sender: 'user' | 'admin'; senderName?: string }
) {
  const res = await apiFetch(`${API_BASE}/support/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to send message');
  }
  return await res.json();
}

export async function setSupportTyping(
  conversationId: string,
  payload: { role: 'user' | 'admin'; typing: boolean; name?: string }
) {
  await apiFetch(`${API_BASE}/support/conversations/${conversationId}/typing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

export async function updateSupportConversationStatus(conversationId: string, status: string) {
  const res = await apiFetch(`${API_BASE}/support/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update conversation');
  return await res.json();
}
