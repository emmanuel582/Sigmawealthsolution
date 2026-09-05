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

export async function fetchAppConfig(): Promise<{
  flutterwaveConfigured: boolean;
  flutterwaveSandbox: boolean;
  opayAccountName: string;
  opayAccountNumber: string;
  opayBankName: string;
  isSupabaseLive: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return await res.json();
  } catch (error) {
    console.error('Error loading config:', error);
    return {
      flutterwaveConfigured: false,
      flutterwaveSandbox: true,
      opayAccountName: '',
      opayAccountNumber: '',
      opayBankName: '',
      isSupabaseLive: false,
    };
  }
}

export async function fetchNigerianBanks(): Promise<BankItem[]> {
  try {
    const res = await fetch(`${API_BASE}/banks`);
    if (!res.ok) {
      // Soft-fail when Flutterwave is offline/unconfigured — bank picker stays empty
      return [];
    }
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export async function verifyBankAccount(accountNumber: string, bankCode: string): Promise<{ account_name: string; account_number: string } | null> {
  const res = await fetch(`${API_BASE}/verify-account`, {
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
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
}): Promise<BankDetails> {
  const res = await fetch(`${API_BASE}/investor/bank-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  if (!res.ok) throw new Error('Failed to save bank details');
  return await res.json();
}

export async function initiateFlutterwavePayment(payload: {
  userId: string;
  email: string;
  name?: string;
  phone?: string;
  amount: number;
  phase: string;
  isRecurringPlan?: boolean;
  paymentType?: 'card' | 'opay';
}): Promise<{
  success: boolean;
  chargeId: string;
  reference: string;
  status: string;
  redirectUrl: string | null;
  completed: boolean;
  nextAction?: unknown;
}> {
  const res = await fetch(`${API_BASE}/flutterwave/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to initiate payment' }));
    throw new Error(error.message);
  }
  return await res.json();
}

export async function verifyFlutterwavePayment(payload: {
  chargeId?: string;
  transactionId?: string | number;
  txRef?: string;
  flwRef?: string;
  userId: string;
  email?: string;
  name?: string;
  amount: number;
  phase: string;
  isRecurringPlan?: boolean;
}): Promise<{ success: boolean; message: string; payment: Payment; investment: Investment; profile?: Profile }> {
  const res = await fetch(`${API_BASE}/flutterwave/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Payment verification failed' }));
    throw new Error(error.message);
  }
  return await res.json();
}

export async function syncFlutterwaveTransactions(): Promise<{ success: boolean; syncedCount: number; totalPayments: number; message?: string }> {
  const res = await fetch(`${API_BASE}/flutterwave/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to sync Flutterwave transactions');
  return await res.json();
}

export async function cancelAutoDebitPlan(userId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/investor/cancel-subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to cancel auto-debit subscription');
  return await res.json();
}

export async function saveAutoDebitPlan(userId: string, amount: number) {
  const res = await fetch(`${API_BASE}/investor/auto-debit-plan`, {
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
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load investor dashboard');
  return await res.json();
}

// ---------------- ADMIN API CALLS ----------------

export async function adminLoginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: any; role?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Admin authentication failed' };
    }
    return { success: true, user: data.user, role: data.role || 'admin' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Admin network authentication failure' };
  }
}

export async function adminRegisterWithEmail(email: string, pass: string, fullName?: string): Promise<{ success: boolean; user?: any; role?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/admin-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password: pass, fullName }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Admin registration failed' };
    }
    return { success: true, user: data.user, role: data.role || 'admin' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Admin network registration failure' };
  }
}

export async function checkAdminAccess(userId: string, email?: string): Promise<boolean> {
  try {
    const url = email 
      ? `${API_BASE}/admin/check-role/${userId}?email=${encodeURIComponent(email)}`
      : `${API_BASE}/admin/check-role/${userId}`;
    const res = await fetch(url);
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
  const res = await fetch(`${API_BASE}/admin/overview`);
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
  const res = await fetch(`${API_BASE}/admin/investors?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch investors');
  return await res.json();
}

export async function deleteInvestorAccount(userId: string, adminName: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/admin/investors/${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminName }),
  });
  if (!res.ok) throw new Error('Failed to delete investor account');
  return await res.json();
}

export async function updateInvestorRecord(userId: string, updates: Partial<Profile>, adminName: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/admin/investors/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates, adminName }),
  });
  if (!res.ok) throw new Error('Failed to update investor record');
  return await res.json();
}

export async function fetchAdminPayments(): Promise<Payment[]> {
  const res = await fetch(`${API_BASE}/admin/payments`);
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
  const res = await fetch(`${API_BASE}/admin/payouts`);
  if (!res.ok) throw new Error('Failed to fetch payouts');
  return await res.json();
}

export async function togglePlatformPayoutMode(newMode: 'automatic' | 'manual', adminName: string): Promise<{ success: boolean; mode: 'automatic' | 'manual' }> {
  const res = await fetch(`${API_BASE}/admin/payout-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: newMode, adminName }),
  });
  if (!res.ok) throw new Error('Failed to toggle payout mode');
  return await res.json();
}

export async function executeManualPayout(payload: {
  userId: string;
  amount: number;
  adminName: string;
  referenceNote: string;
}): Promise<Payout> {
  const res = await fetch(`${API_BASE}/admin/payouts/manual-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to process manual payout');
  return await res.json();
}

export async function triggerScheduledPayoutRun(adminName: string): Promise<PayoutCronResult> {
  const res = await fetch(`${API_BASE}/payouts/run-cron`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ triggeredBy: adminName }),
  });
  if (!res.ok) throw new Error('Failed to execute automated payout cycle');
  return await res.json();
}

export async function fetchAdminNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/admin/notifications`);
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
  const res = await fetch(`${API_BASE}/admin/notifications/send`, {
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
