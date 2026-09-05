import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSkeleton } from '@/components/sigma/ui/Skeleton';
import { UserAvatar } from '@/components/sigma/ui/UserAvatar';
import { InvestorBottomNav, InvestorTab } from '@/components/sigma/InvestorBottomNav';
import { AppIcon } from '@/components/sigma/ui/AppIcon';
import { IconCircleButton, PressableButton, SurfaceCard, IconBadge } from '@/components/sigma/ui/Pressable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchInvestorDashboardData, 
  fetchAppConfig, 
  fetchNigerianBanks, 
  verifyBankAccount, 
  saveBankDetails,
  initiateFlutterwavePayment,
  verifyFlutterwavePayment,
  syncFlutterwaveTransactions,
  saveAutoDebitPlan,
  type ReferralItem,
  type AutoDebitPlan,
} from '@/lib/sigma/api';
import { 
  Profile, 
  BankDetails, 
  CardDetails, 
  Investment, 
  Payment, 
  Payout,
  NotificationItem,
  BankItem
} from '@/lib/sigma/types';
import { formatNaira, formatDate, maskCardNumber } from '@/lib/sigma/utils';
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Plus,
  RefreshCw, 
  ShieldCheck, 
  Bell, 
  X,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Home,
  History,
  Eye,
  EyeOff,
  LogOut,
  Send,
  Wallet
} from 'lucide-react';

interface InvestorDashboardProps {
  onNavigate: (view: string) => void;
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({ onNavigate }) => {
  const { user, profile: authProfile, refreshProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<InvestorTab>('home');
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [autoDebitPlan, setAutoDebitPlan] = useState<AutoDebitPlan | null>(null);
  const [monthlyDebitAmount, setMonthlyDebitAmount] = useState('');
  const [savingAutoDebit, setSavingAutoDebit] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Config & Banks
  const [flutterwaveConfigured, setFlutterwaveConfigured] = useState(false);
  const [flutterwaveSandbox, setFlutterwaveSandbox] = useState(true);
  const [banksList, setBanksList] = useState<BankItem[]>([]);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotificationPopover, setShowNotificationPopover] = useState(false);
  const [selectedPhase] = useState('Active Plan');
  const [customAmount, setCustomAmount] = useState<string>('');

  // Bank Setup Modal
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankSuccess, setBankSuccess] = useState<string | null>(null);

  // Feedback notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [syncingFlw, setSyncingFlw] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [configData, banks, dashData] = await Promise.all([
        fetchAppConfig(),
        fetchNigerianBanks(),
        fetchInvestorDashboardData(user.id, user.email),
      ]);

      setFlutterwaveConfigured(configData.flutterwaveConfigured);
      setFlutterwaveSandbox(configData.flutterwaveSandbox);
      setBanksList(banks);

      setProfile(dashData.profile);
      setBankDetails(dashData.bankDetails);
      setCardDetails(dashData.cardDetails);
      setInvestment(dashData.investment);
      setPayments(dashData.payments || []);
      setPayouts(dashData.payouts || []);
      setNotifications(dashData.notifications || []);
      setReferralCode(dashData.referralCode || '');
      setReferralEarnings(Number(dashData.referralEarnings || 0));
      setReferralCount(Number(dashData.referralCount || 0));
      setReferrals(dashData.referrals || []);
      setAutoDebitPlan(dashData.autoDebitPlan || null);
      if (dashData.autoDebitPlan?.amount) {
        setMonthlyDebitAmount(String(dashData.autoDebitPlan.amount));
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTransactions = async () => {
    setSyncingFlw(true);
    try {
      const res = await syncFlutterwaveTransactions();
      setActionSuccess(res.message || 'Synced transactions successfully');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadData();
      await refreshProfile();
    } catch (err: any) {
      setActionError(err.message || 'Failed to sync Flutterwave');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setSyncingFlw(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  // Capture referral cookie (30 days) from ?ref= or existing storage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const hashQ = window.location.hash.includes('?')
      ? window.location.hash.split('?')[1]
      : '';
    const hashParams = new URLSearchParams(hashQ);
    const ref = (params.get('ref') || hashParams.get('ref') || '').trim().toUpperCase();
    const existing =
      localStorage.getItem('sigma_ref') ||
      document.cookie.split('; ').find((c) => c.startsWith('sigma_ref='))?.split('=')[1] ||
      '';
    const code = ref || existing;
    if (!code) return;
    localStorage.setItem('sigma_ref', code);
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `sigma_ref=${encodeURIComponent(code)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }, []);

  const inviteLink =
    typeof window !== 'undefined' && referralCode
      ? `${window.location.origin}/auth/signup?ref=${referralCode}`
      : referralCode
        ? `/auth/signup?ref=${referralCode}`
        : '';

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    } catch {
      setActionError('Could not copy link');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const handleSaveAutoDebit = async () => {
    if (!user) return;
    const amount = Number(monthlyDebitAmount);
    if (!amount || amount <= 0) {
      setActionError('Enter a valid monthly amount');
      setTimeout(() => setActionError(null), 3000);
      return;
    }
    setSavingAutoDebit(true);
    try {
      const plan = await saveAutoDebitPlan(user.id, amount);
      setAutoDebitPlan(plan);
      setActionSuccess(`Auto-debit of ${formatNaira(amount)} activated. You’ll get a reminder a day before each charge.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Could not save auto-debit plan');
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setSavingAutoDebit(false);
    }
  };

  const finalizePayment = async (params: {
    chargeId: string;
    reference: string;
    amount: number;
    isRecurring: boolean;
    phase?: string;
  }) => {
    if (!user) return;
    const verified = await verifyFlutterwavePayment({
      chargeId: params.chargeId,
      txRef: params.reference,
      userId: user.id,
      email: user.email,
      name: user.name,
      amount: params.amount,
      phase: params.phase || selectedPhase,
      isRecurringPlan: params.isRecurring,
    });

    if (verified.success) {
      setActionSuccess(`Payment of ${formatNaira(params.amount)} confirmed. Investment credited.`);
      setTimeout(() => setActionSuccess(null), 5000);
      await refreshProfile();
      await loadData();
    }
  };

  useEffect(() => {
    if (!user) return;
    const fromHash = window.location.hash.split('?')[1];
    const fromSearch = window.location.search.replace(/^\?/, '');
    const hashQuery = fromHash || fromSearch;
    if (!hashQuery) return;

    const params = new URLSearchParams(hashQuery);
    if (params.get('flw_return') !== '1') return;

    const stored = sessionStorage.getItem('apex_pending_payment');
    const pending = stored ? JSON.parse(stored) : null;
    const reference = params.get('reference') || pending?.reference;
    const chargeId = params.get('charge_id') || params.get('chargeId') || pending?.chargeId;

    if (!reference && !chargeId) return;

    (async () => {
      setProcessingPayment(true);
      try {
        await finalizePayment({
          chargeId: chargeId || '',
          reference: reference || '',
          amount: Number(pending?.amount) || 0,
          isRecurring: Boolean(pending?.isRecurring),
          phase: pending?.phase,
        });
        sessionStorage.removeItem('apex_pending_payment');
      } catch (err: any) {
        setActionError(err.message || 'Payment verification failed');
        setTimeout(() => setActionError(null), 5000);
      } finally {
        setProcessingPayment(false);
        window.history.replaceState(null, '', '/dashboard');
      }
    })();
  }, [user?.id]);

  const handleFlutterwavePayment = async () => {
    if (!user) return;
    const amount = Number(customAmount);
    if (!amount || amount <= 0) {
      setActionError('Enter a valid investment amount.');
      setTimeout(() => setActionError(null), 4000);
      return;
    }
    if (!flutterwaveConfigured) {
      setActionError('Card payments are not configured. Contact support.');
      setTimeout(() => setActionError(null), 4000);
      return;
    }

    const isRecurring = false;
    setProcessingPayment(true);

    try {
      const initiated = await initiateFlutterwavePayment({
        userId: user.id,
        email: user.email,
        name: user.name,
        phone: profile?.phone || '00000000000',
        amount,
        phase: selectedPhase,
        isRecurringPlan: isRecurring,
        paymentType: 'card',
      });

      sessionStorage.setItem(
        'apex_pending_payment',
        JSON.stringify({
          chargeId: initiated.chargeId,
          reference: initiated.reference,
          amount,
          isRecurring,
          phase: selectedPhase,
        })
      );

      if (initiated.redirectUrl) {
        window.location.href = initiated.redirectUrl;
        return;
      }

      if (initiated.completed || initiated.status === 'succeeded') {
        setShowPaymentModal(false);
        await finalizePayment({
          chargeId: initiated.chargeId,
          reference: initiated.reference,
          amount,
          isRecurring,
        });
        return;
      }

      setActionError('Payment requires additional authorization. Try again or contact support.');
      setTimeout(() => setActionError(null), 5000);
    } catch (err: any) {
      setActionError(err.message || 'Payment could not be started');
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setProcessingPayment(false);
    }
  };


  const dashboardStats = useMemo(() => {
    const successfulPaymentsTotal = payments
      .filter((p) => p.status === 'successful')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalInvested = Math.max(
      Number(profile?.total_invested || 0),
      Number(investment?.amount || 0),
      successfulPaymentsTotal
    );
    const planLabel = totalInvested > 0 || investment?.status === 'active' ? 'Active plan' : 'No active plan';
    const isPlanActive = totalInvested > 0 || investment?.status === 'active';
    const nextPaymentDate = investment?.next_payment_date;
    return { totalInvested, planLabel, isPlanActive, nextPaymentDate };
  }, [payments, profile, investment]);

  // Track read notification IDs so opening alerts removes the unread badge
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`sigma_read_notifs_${user?.id || 'guest'}`);
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const markAllNotificationsAsRead = useCallback(() => {
    if (notifications.length === 0) return;
    setReadNotifIds((prev) => {
      const next = new Set([...Array.from(prev), ...notifications.map((n) => n.id)]);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`sigma_read_notifs_${user?.id || 'guest'}`, JSON.stringify(Array.from(next)));
        } catch {}
      }
      return next;
    });
  }, [notifications, user?.id]);

  useEffect(() => {
    if (activeTab === 'notifications' || showNotificationPopover) {
      markAllNotificationsAsRead();
    }
  }, [activeTab, showNotificationPopover, markAllNotificationsAsRead]);

  const unreadNotifCount = notifications.filter((n) => !readNotifIds.has(n.id)).length;

  if (loading && !profile) {
    return <DashboardSkeleton />;
  }

  const { totalInvested, planLabel, isPlanActive, nextPaymentDate } = dashboardStats;

  return (
    <div className="min-h-screen bg-[#edefeb] text-[#163300] pb-24">
      
      {/* Hero Header */}
      <header className="bg-[#163300] text-white wave-header relative pt-4 pb-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <UserAvatar name={user?.name} email={user?.email} size="md" />
              <div>
                <p className="text-[#9fe870] text-xs font-medium">Hello,</p>
                <p className="font-bold text-sm truncate max-w-[200px] sm:max-w-[320px] lg:max-w-none">{user?.name || 'Investor'}</p>
              </div>
            </div>
            
            <div className="relative">
              <motion.button
                onClick={() => setShowNotificationPopover(!showNotificationPopover)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition press-ring"
              >
                <AppIcon name="bell" className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-pulse">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </motion.button>
              
              <AnimatePresence>
                {showNotificationPopover && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#163300]/10 z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-[#163300]/5 flex justify-between items-center bg-[#edefeb]">
                      <span className="text-xs font-bold text-[#163300]">Latest Alerts</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 4).map((n) => (
                          <div
                            key={n.id}
                            className="p-3 hover:bg-[#edefeb]/50 cursor-pointer border-b border-[#163300]/5 transition"
                            onClick={() => {
                              setShowNotificationPopover(false);
                              setActiveTab('notifications');
                            }}
                          >
                            <p className="text-xs font-bold text-[#163300] truncate">{n.title}</p>
                            <p className="text-[10px] text-[#163300]/50 line-clamp-2 mt-0.5">{n.body}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-[#163300]/50">No new alerts</div>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        setShowNotificationPopover(false);
                        setActiveTab('notifications');
                      }}
                      className="w-full p-2 text-center text-xs font-bold text-[#163300] hover:bg-[#edefeb]/80 transition"
                    >
                      View All Notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 space-y-5 animate-fade-slide-up">
        
        {/* Total Invested */}
        <div className="text-center space-y-1">
          <p className="text-[#163300]/60 text-xs font-bold uppercase tracking-wider">Total Invested</p>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-[#163300]">
              {showBalance ? formatNaira(totalInvested) : '₦ ••••••'}
            </h1>
            <motion.button
              onClick={() => setShowBalance(!showBalance)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-black/5 transition icon-glow-hover text-[#163300]/60"
            >
              <AppIcon name={showBalance ? 'eyeSlash' : 'eye'} className="w-4 h-4" />
            </motion.button>
          </div>
          {referralEarnings > 0 && (
            <p className="text-xs text-[#163300]/55">
              Referral wallet: <strong className="text-[#163300]">{formatNaira(referralEarnings)}</strong>
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-6 mt-4 pb-2">
          <IconCircleButton icon="plus" label="Fund" onClick={() => setShowPaymentModal(true)} />
          <IconCircleButton icon="gift" label="Invite" onClick={() => setShowInviteModal(true)} />
        </div>
        
        {/* Action feedback toasts */}
        <AnimatePresence>
          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3.5 rounded-xl bg-[#9fe870]/30 border border-[#9fe870] text-[#163300] text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionSuccess}</span>
              </div>
              <button onClick={() => setActionSuccess(null)}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {actionError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
              <SurfaceCard className="p-4 space-y-1" interactive>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#163300]/50 uppercase">Referral earnings</span>
                  <AppIcon name="wallet" className="w-4 h-4 text-[#9fe870]" />
                </div>
                <p className="text-sm font-bold truncate">{formatNaira(referralEarnings)}</p>
                <p className="text-[10px] text-[#163300]/45">10% of invitee investments</p>
              </SurfaceCard>
              <SurfaceCard className="p-4 space-y-1" interactive>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#163300]/50 uppercase">Referrals</span>
                  <AppIcon name="users" className="w-4 h-4 text-[#9fe870]" />
                </div>
                <p className="text-sm font-bold">{referralCount}</p>
                <p className="text-[10px] text-[#163300]/45">People who signed up via your link</p>
              </SurfaceCard>
              <SurfaceCard className="p-4 space-y-1 sm:col-span-2 lg:col-span-1" interactive>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#163300]/50 uppercase">Next payout</span>
                  <AppIcon name="calendar" className="w-4 h-4 text-[#9fe870]" />
                </div>
                <p className="text-sm font-bold">
                  {nextPaymentDate ? formatDate(nextPaymentDate) : isPlanActive ? 'Scheduled' : '—'}
                </p>
              </SurfaceCard>
            </div>

            <SurfaceCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3" interactive>
              <div>
                <span className="text-[10px] font-bold text-[#163300]/50 uppercase">Referral</span>
                <p className="text-sm font-bold mt-1">Earn 10% when someone you invite invests</p>
                <p className="text-xs text-[#163300]/50 mt-0.5">
                  Wallet: {formatNaira(referralEarnings)} · {referralCount} invitees
                </p>
              </div>
              <PressableButton size="sm" onClick={() => setShowInviteModal(true)}>
                <AppIcon name="gift" className="w-4 h-4" />
                Invite
              </PressableButton>
            </SurfaceCard>

            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => setShowInviteModal(true)}
              className="p-4 rounded-2xl bg-[#9fe870]/25 border border-[#9fe870]/50 flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#163300] flex items-center justify-center shrink-0">
                <AppIcon name="gift" className="w-5 h-5 text-[#9fe870]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#163300]">Share your invite link</p>
                <p className="text-xs text-[#163300]/60">Cookie tracks signups for 30 days — you earn 10%.</p>
              </div>
            </motion.div>

            <SurfaceCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold">Your referrals</h3>
                <span className="text-[11px] text-[#163300]/45">{referralCount} total</span>
              </div>
              {referrals.length === 0 ? (
                <p className="text-xs text-[#163300]/45 py-4 text-center">
                  No referrals yet. Share your invite link to start earning.
                </p>
              ) : (
                <div className="divide-y divide-[#163300]/8 max-h-64 overflow-y-auto">
                  {referrals.map((r) => (
                    <div key={r.id} className="py-2.5 flex justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{r.referred_name || r.referred_email || 'Investor'}</p>
                        <p className="text-[10px] text-[#163300]/45 truncate">{r.referred_email}</p>
                      </div>
                      <span className="text-xs font-bold text-[#163300] shrink-0">
                        {formatNaira(r.earned_total || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard className="overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-[#163300]/5">
                <h3 className="text-sm font-bold">Recent Activity</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs font-semibold text-[#163300]/60 flex items-center gap-1 icon-glow-hover">
                  View All <AppIcon name="arrowRight" className="w-3 h-3" />
                </button>
              </div>
              {payments.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-[#163300]/50">No transactions yet. Make your first contribution!</p>
                </div>
              ) : (
                <div className="divide-y divide-[#163300]/5">
                  {payments.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                      <IconBadge icon="creditCard" />
                        <div>
                          <p className="text-sm font-semibold">{'Card Payment'}</p>
                          <p className="text-[10px] text-[#163300]/50">{formatDate(p.created_at, true)}</p>
                        </div>
                      </div>
                      <span className="font-bold font-mono text-sm">{formatNaira(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </SurfaceCard>
          </motion.div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="bg-white border border-[#163300]/8 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#163300]/5">
              <h3 className="text-sm font-bold">Payment History</h3>
              <p className="text-[10px] text-[#163300]/50">All confirmed deposits</p>
            </div>
            {payments.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-xs text-[#163300]/50">No payment records yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#163300]/5">
                {payments.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#edefeb] flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-[#163300]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{formatNaira(p.amount)}</p>
                        <p className="text-[10px] text-[#163300]/50">{formatDate(p.created_at, true)}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9fe870]/30 text-[#163300]">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#163300]/8 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#163300]/5">
              <h3 className="text-sm font-bold">Payout History</h3>
            </div>
            {payouts.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-xs text-[#163300]/50">No disbursements yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[#163300]/5">
                {payouts.map((po) => (
                  <div key={po.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#9fe870]">{formatNaira(po.amount)}</p>
                      <p className="text-[10px] text-[#163300]/50">{formatDate(po.processed_at, true)}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase">{po.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          </motion.div>
        )}

        {/* ME TAB — bank + monthly debit */}
        {activeTab === 'me' && (
          <motion.div key="me" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white border border-[#163300]/8 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#163300]/8 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#163300]" />
                    <h3 className="text-sm font-bold text-[#163300]">Payout bank</h3>
                  </div>
                  {bankDetails ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9fe870]/40 text-[#163300]">
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => setShowBankModal(true)}
                      className="text-xs font-bold text-[#163300] hover:text-[#9fe870]"
                    >
                      Add bank
                    </button>
                  )}
                </div>

                {bankDetails ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#edefeb] space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#163300]/50">Bank</span>
                        <strong>{bankDetails.bank_name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#163300]/50">Account</span>
                        <strong className="font-mono">{bankDetails.account_number}</strong>
                      </div>
                      <div className="flex justify-between border-t border-[#163300]/8 pt-2">
                        <span className="text-[#163300]/50">Name</span>
                        <span className="font-semibold uppercase text-[11px]">{bankDetails.account_name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBankModal(true)}
                      className="text-xs font-bold underline text-[#163300]/60"
                    >
                      Update bank
                    </button>
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-[#163300]/15 rounded-xl text-center space-y-3">
                    <Building2 className="w-8 h-8 text-[#163300]/25 mx-auto" />
                    <p className="text-xs font-semibold">Add your Nigerian bank for payouts</p>
                    <button
                      onClick={() => setShowBankModal(true)}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-[#163300] text-[#9fe870]"
                    >
                      Configure payout bank
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#163300]/8 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#163300]/8 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#163300]" />
                    <h3 className="text-sm font-bold text-[#163300]">Monthly debit card</h3>
                  </div>
                  {autoDebitPlan?.active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9fe870]/40 text-[#163300]">
                      ACTIVE
                    </span>
                  ) : null}
                </div>

                {cardDetails ? (
                  <div className="p-4 rounded-2xl bg-[#163300] text-white space-y-2">
                    <p className="text-[10px] text-[#9fe870]">Saved on Flutterwave</p>
                    <p className="font-mono tracking-wider text-sm">
                      {maskCardNumber(cardDetails.card_last4, cardDetails.card_brand)}
                    </p>
                    <p className="text-[10px] text-white/50">{cardDetails.card_brand}</p>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-[#163300]/15 rounded-xl text-center space-y-2">
                    <p className="text-xs font-semibold">No card saved yet</p>
                    <p className="text-[11px] text-[#163300]/50">
                      Make a Fund payment once — Flutterwave will save your card for monthly debit.
                    </p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-[#163300] text-[#9fe870]"
                    >
                      Pay & save card
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-[#163300]/45">
                    Monthly auto-debit amount (₦)
                  </label>
                  <input
                    type="number"
                    value={monthlyDebitAmount}
                    onChange={(e) => setMonthlyDebitAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full h-11 px-3 rounded-xl border border-[#163300]/10 text-sm"
                  />
                  <p className="text-[11px] text-[#163300]/45">
                    We’ll charge this amount monthly and send you a notification one day before.
                  </p>
                  <PressableButton
                    size="sm"
                    fullWidth
                    disabled={savingAutoDebit || !cardDetails}
                    onClick={handleSaveAutoDebit}
                  >
                    {savingAutoDebit
                      ? 'Saving…'
                      : autoDebitPlan?.active
                        ? 'Update auto-debit'
                        : 'Activate auto-debit'}
                  </PressableButton>
                  {autoDebitPlan?.active && (
                    <p className="text-[11px] text-[#163300]/55">
                      Next charge: {autoDebitPlan.next_charge_date ? formatDate(autoDebitPlan.next_charge_date) : '—'} ·{' '}
                      {formatNaira(autoDebitPlan.amount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#163300]/8 p-12 text-center">
                <Bell className="w-10 h-10 text-[#163300]/20 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#163300]/70">No notifications yet</p>
                <p className="text-xs text-[#163300]/40 mt-1">Updates from Sigma Wealth will appear here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="bg-white rounded-2xl border border-[#163300]/8 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#edefeb] flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-[#163300]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#163300]">{n.title}</h4>
                        <span className="text-[10px] text-[#163300]/40 shrink-0">
                          {formatDate(n.sent_at || n.created_at, true)}
                        </span>
                      </div>
                      <p className="text-xs text-[#163300]/60 leading-relaxed mt-1">{n.body}</p>
                    </div>
                  </div>
                  {n.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.image_url}
                      alt=""
                      className="w-full max-h-48 object-cover rounded-xl border border-[#163300]/8"
                    />
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#163300]/8 p-6 text-center space-y-3">
              <UserAvatar name={user?.name} email={user?.email} size="xl" className="mx-auto" />
              <div>
                <h3 className="text-lg font-bold">{user?.name || 'Investor'}</h3>
                <p className="text-sm text-[#163300]/60">{user?.email}</p>
              </div>
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-[#9fe870]/30 text-[#163300]">
                Verified Investor
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#163300]/8 divide-y divide-[#163300]/5">
              {[
                { label: 'Phone', value: profile?.phone || authProfile?.phone || 'Not set' },
                { label: 'Plan', value: planLabel },
                { label: 'Total Invested', value: formatNaira(totalInvested) },
                { label: 'Referral wallet', value: formatNaira(referralEarnings) },
                { label: 'Next Payment', value: nextPaymentDate ? formatDate(nextPaymentDate) : '—' },
              ].map((item) => (
                <div key={item.label} className="p-4 flex justify-between items-center">
                  <span className="text-xs text-[#163300]/50 font-medium">{item.label}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                await signOut();
                onNavigate('landing');
              }}
              className="w-full py-3.5 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </motion.div>
        )}

      </div>

      <InvestorBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notificationCount={unreadNotifCount}
      />

      {/* ---------------- PAYMENT / CONTRIBUTION MODAL ---------------- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-[#163300]/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-8 space-y-5 shadow-2xl border border-[#163300]/10 my-8 sm:my-auto shrink-0"
          >
            
            <div className="flex items-center justify-between border-b border-[#163300]/8 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#163300]">Make a Contribution</h3>
                <p className="text-xs text-[#163300]/50">Pay securely with Flutterwave</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong>One-time contribution:</strong> Pay securely via Flutterwave checkout for your deposit.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Deposit Amount (₦)
                </label>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={processingPayment}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="Enter amount"
                />
              </div>

              <button
                onClick={handleFlutterwavePayment}
                disabled={processingPayment || !flutterwaveConfigured}
                className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>
                  {processingPayment
                    ? 'Processing…'
                    : `Pay ${customAmount ? formatNaira(customAmount) : 'now'} via Flutterwave`}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>



          </motion.div>
        </div>
      )}

      {/* ---------------- INVITE MODAL ---------------- */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-[#163300]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#163300]/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#163300]">Your invite link</h3>
                <p className="text-xs text-[#163300]/50">Share this — you earn 10% when they invest</p>
              </div>
              <button type="button" onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg hover:bg-[#edefeb]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#edefeb] break-all text-xs font-mono text-[#163300]">
              {inviteLink || 'Loading your link…'}
            </div>
            <PressableButton fullWidth variant="lime" onClick={handleCopyInvite} disabled={!inviteLink}>
              {inviteCopied ? 'Copied!' : 'Copy invite link'}
            </PressableButton>
            <p className="text-[11px] text-[#163300]/45 text-center">
              Referral cookie lasts 30 days after someone opens your link.
            </p>
          </motion.div>
        </div>
      )}

      {/* ---------------- BANK SETUP MODAL ---------------- */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Payout Bank Details</h3>
                <p className="text-xs text-slate-500">For automated yield disbursements</p>
              </div>
              <button
                onClick={() => setShowBankModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bankError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {bankError}
              </div>
            )}

            {bankSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {bankSuccess}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Bank
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => {
                    setBankCode(e.target.value);
                    setAccountName('');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">-- Choose Commercial Bank --</option>
                  {banksList.map((b, idx) => (
                    <option key={`${b.code}-${idx}`} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  10-Digit NUBAN Account Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value.replace(/\D/g, ''));
                      setAccountName('');
                    }}
                    placeholder="0123456789"
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyBank}
                    disabled={verifyingAccount || accountNumber.length !== 10 || !bankCode}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-40 shrink-0"
                  >
                    {verifyingAccount ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>

              {accountName && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">Verified Account Name:</span>
                  <span className="font-bold text-sm text-slate-900 uppercase">{accountName}</span>
                </div>
              )}

              <button
                onClick={handleSaveBank}
                disabled={savingBank || !accountName}
                className="w-full py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-40"
              >
                {savingBank ? 'Saving Bank Details...' : 'Save Payout Bank Destination'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
