export type UserRole = 'investor' | 'admin';

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  total_invested: number;
  current_phase: string;
  payment_plan_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserRoleRecord {
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface BankDetails {
  user_id: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  account_name: string;
  flutterwave_beneficiary_id?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CardDetails {
  user_id: string;
  flutterwave_card_token: string;
  card_last4: string;
  card_brand: string;
  card_exp_month?: string | null;
  card_exp_year?: string | null;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  amount: number;
  phase: string;
  type: 'auto' | 'one-time' | 'opay';
  status: 'active' | 'completed' | 'paused' | 'cancelled' | 'pending';
  start_date: string;
  next_payment_date: string | null;
  cycle_count: number;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  method: 'card' | 'card_token' | 'auto_debit' | 'opay_transfer';
  flutterwave_tx_ref: string;
  status: 'successful' | 'pending' | 'failed';
  notes?: string | null;
  created_at: string;
}

export interface Payout {
  id: string;
  user_id: string;
  amount: number;
  mode: 'automatic' | 'manual';
  status: 'successful' | 'pending' | 'failed';
  flutterwave_transfer_id?: string | null;
  processed_at: string;
  processed_by?: string | null;
  notes?: string | null;
  investor_name?: string;
  investor_email?: string;
}

export interface OPayReceipt {
  id: string;
  user_id: string;
  user_email?: string;
  receipt_image_url: string;
  amount: number;
  target_phase?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string | null;
  admin_notes?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  investor_name?: string;
  investor_email?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'single' | string;
  target_user_id?: string | null;
  icon?: string | null;
  image_url?: string | null;
  sent_at: string;
  delivery_status: string;
  created_at?: string;
}

export interface ActivityLogItem {
  id: string;
  actor: string;
  action: string;
  details: string;
  amount?: number | null;
  created_at: string;
}

export interface PlatformSettings {
  payout_mode: 'automatic' | 'manual';
  updated_by?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  photo_url: string;
  quote: string;
  rating: number;
  created_at: string;
}

export interface BankItem {
  id: number | string;
  code: string;
  name: string;
}

export interface InvestmentPhase {
  id: string;
  phaseNumber: number;
  title: string;
  minimumDeposit: number;
  monthlyContribution: number;
  durationMonths: number;
  targetYieldEstimate: string;
  description: string;
  statusTag: 'Open' | 'Upcoming' | 'Closed';
}

export interface PayoutCronResult {
  runTimestamp: string;
  payoutMode: 'automatic' | 'manual';
  totalChecked: number;
  eligibleCount: number;
  successfulTransfers: number;
  failedTransfers: number;
  queuedForManual: number;
  logs: string[];
}
