"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import {
  checkAdminAccess,
  adminLoginWithEmail,
  adminRegisterWithEmail,
  fetchAdminOverview,
  fetchAdminInvestors,
  deleteInvestorAccount,
  fetchAdminPayments,
  syncFlutterwaveTransactions,
  fetchAdminPayouts,
  togglePlatformPayoutMode,
  executeManualPayout,
  executeManualPayoutBatch,
  triggerScheduledPayoutRun,
  fetchAdminNotifications,
  sendBroadcastNotification,
  fetchAdminSupportConversations,
  fetchSupportConversation,
  sendSupportMessage,
  setSupportTyping,
  updateSupportConversationStatus,
  type SupportConversation,
  type SupportMessage,
} from "@/lib/sigma/api"
import {
  Profile,
  BankDetails,
  CardDetails,
  Investment,
  Payment,
  Payout,
  NotificationItem,
  ActivityLogItem,
  PayoutCronResult,
} from "@/lib/sigma/types"
import { formatNaira, formatDate } from "@/lib/sigma/utils"
import { SurfaceCard, PressableButton } from "@/components/sigma/ui/Pressable"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import {
  ShieldCheck,
  Users,
  CreditCard,
  Send,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Search,
  Trash2,
  Bell,
  Lock,
  Clock,
  X,
  LayoutDashboard,
  Settings,
  Menu,
  LogOut,
  TrendingUp,
  Wallet,
  ImagePlus,
  Megaphone,
  Gift,
  Info,
  Sparkles,
  Calendar,
  MessageSquare,
} from "lucide-react"
import { BrandLogo } from "@/components/BrandLogo"
import { BrandLoader } from "@/components/BrandLoader"

type AdminTab = "overview" | "investors" | "payments" | "payouts" | "notifications" | "support" | "settings"

interface AdminPortalProps {
  onNavigate: (view: string) => void
}

type InvestorRow = {
  profile: Profile
  bankDetails: BankDetails | null
  cardDetails: CardDetails | null
  investment: Investment | null
  paymentsCount: number
  payoutsCount: number
}

const ALERT_ICONS = [
  { id: "bell", label: "Bell", Icon: Bell },
  { id: "megaphone", label: "Announce", Icon: Megaphone },
  { id: "gift", label: "Gift", Icon: Gift },
  { id: "info", label: "Info", Icon: Info },
  { id: "sparkles", label: "Spark", Icon: Sparkles },
  { id: "calendar", label: "Schedule", Icon: Calendar },
] as const

function AlertIconGlyph({ name, className }: { name?: string | null; className?: string }) {
  const found = ALERT_ICONS.find((i) => i.id === name) || ALERT_ICONS[0]
  const Icon = found.Icon
  return <Icon className={className} />
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onNavigate }) => {
  const { user, role, signOut, signInWithEmail } = useAuth()

  const [isAdminVerified, setIsAdminVerified] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<AdminTab>("overview")
  const [loading, setLoading] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [overviewData, setOverviewData] = useState<{
    attention: {
      payoutsDueTodayCount: number
      failedPayoutsCount: number
      scheduledPayoutsCount?: number
    }
    kpis: {
      totalInvestors: number
      investorWeeklyDelta: number
      totalAUM: number
      payoutMode: "automatic" | "manual"
      totalPayoutsDisbursed: number
      totalPaymentsVolume?: number
      successfulPaymentsCount?: number
    }
    charts?: {
      paymentsByDay: Array<{ date: string; amount: number; count: number }>
      paymentsByStatus: Array<{ status: string; amount: number; count: number }>
    }
    scheduledPayouts?: Array<{
      userId: string
      investorName: string
      investorEmail: string
      amount: number
      nextPaymentDate: string
      hasBeneficiary: boolean
    }>
    activityFeed: ActivityLogItem[]
  } | null>(null)

  const [investors, setInvestors] = useState<InvestorRow[]>([])
  const [investorSearch, setInvestSearch] = useState("")
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorRow | null>(null)
  const [investorToDelete, setInvestorToDelete] = useState<InvestorRow | null>(null)
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [deletingInvestor, setDeletingInvestor] = useState(false)

  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")

  const [payoutsData, setPayoutsData] = useState<{
    payouts: Payout[]
    dueToday: any[]
    upcoming: any[]
    payoutMode: "automatic" | "manual"
    lastRunTimestamp: string | null
    batchHistory: any[]
  } | null>(null)
  const [showModeToggleModal, setShowModeToggleModal] = useState(false)
  const [togglingMode, setTogglingMode] = useState(false)
  const [manualPayTarget, setManualPayTarget] = useState<any | null>(null)
  const [manualPayReferenceNote, setManualPayReferenceNote] = useState("")
  const [processingManualPay, setProcessingManualPay] = useState(false)
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<string[]>([])
  const [batchPaying, setBatchPaying] = useState(false)
  const [cronRunning, setCronRunning] = useState(false)
  const [cronResult, setCronResult] = useState<PayoutCronResult | null>(null)
  const [syncingFlw, setSyncingFlw] = useState(false)

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notifTitle, setNotifTitle] = useState("")
  const [notifBody, setNotifBody] = useState("")
  const [notifAudience, setNotifAudience] = useState<"all" | "single">("all")
  const [notifTargetUserId, setNotifTargetUserId] = useState("")
  const [notifIcon, setNotifIcon] = useState<string>("bell")
  const [notifImageUrl, setNotifImageUrl] = useState<string | null>(null)
  const [sendingNotification, setSendingNotification] = useState(false)

  const [isVerifying, setIsVerifying] = useState(true)
  const [adminAuthMode, setAdminAuthMode] = useState<"login" | "register">("login")
  const [adminNameInput, setAdminNameInput] = useState("")
  const [adminEmailInput, setAdminEmailInput] = useState("")
  const [adminPasswordInput, setAdminPasswordInput] = useState("")
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null)
  const [adminAuthenticating, setAdminAuthenticating] = useState(false)

  const [supportConversations, setSupportConversations] = useState<SupportConversation[]>([])
  const [supportPendingCount, setSupportPendingCount] = useState(0)
  const [selectedSupportId, setSelectedSupportId] = useState<string | null>(null)
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([])
  const [supportReply, setSupportReply] = useState("")
  const [supportSending, setSupportSending] = useState(false)
  const [visitorTyping, setVisitorTyping] = useState(false)
  const supportTypingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadAllAdminData = async () => {
    setLoading(true)
    try {
      const [overview, invRes, pays, paysOut, notifs, support] = await Promise.all([
        fetchAdminOverview(),
        fetchAdminInvestors(),
        fetchAdminPayments(),
        fetchAdminPayouts(),
        fetchAdminNotifications(),
        fetchAdminSupportConversations().catch(() => ({ conversations: [], pendingCount: 0 })),
      ])
      setOverviewData(overview)
      setInvestors(invRes.investors || [])
      setPayments(pays || [])
      setPayoutsData(paysOut)
      setNotifications(notifs || [])
      setSupportConversations(support.conversations || [])
      setSupportPendingCount(support.pendingCount || 0)
    } catch (err) {
      console.error("Failed to load admin datasets:", err)
      showToast("Could not load admin data. Check API connection.")
    } finally {
      setLoading(false)
    }
  }

  const refreshSupportInbox = async () => {
    try {
      const support = await fetchAdminSupportConversations()
      setSupportConversations(support.conversations || [])
      setSupportPendingCount(support.pendingCount || 0)
    } catch {
      /* soft fail */
    }
  }

  useEffect(() => {
    if (!isAdminVerified || activeTab !== "support") return
    let cancelled = false

    const tick = async () => {
      try {
        await refreshSupportInbox()
        if (selectedSupportId && !cancelled) {
          const data = await fetchSupportConversation(selectedSupportId, "admin")
          if (cancelled) return
          setSupportMessages(data.messages || [])
          setVisitorTyping(Boolean(data.typing && data.typing.role === "user"))
        }
      } catch {
        /* ignore */
      }
    }

    tick()
    const interval = setInterval(tick, 1500)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [isAdminVerified, activeTab, selectedSupportId])

  useEffect(() => {
    async function verifyAccess() {
      setIsVerifying(true)
      if (!user) {
        setIsVerifying(false)
        setIsAdminVerified(false)
        return
      }
      try {
        const ok = await checkAdminAccess(user.id, user.email)
        if (ok) {
          setIsAdminVerified(true)
          await loadAllAdminData()
        } else {
          setIsAdminVerified(false)
        }
      } catch {
        setIsAdminVerified(false)
      } finally {
        setIsVerifying(false)
      }
    }
    verifyAccess()
  }, [user, role])

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = adminEmailInput.trim().toLowerCase()
    if (!cleanEmail || !adminPasswordInput.trim()) {
      setAdminAuthError("Enter administrator email and password.")
      return
    }
    setAdminAuthError(null)
    setAdminAuthenticating(true)
    try {
      if (adminAuthMode === "login") {
        const result = await adminLoginWithEmail(cleanEmail, adminPasswordInput)
        if (result.success) {
          setIsAdminVerified(true)
          await loadAllAdminData()
        } else {
          const res = await signInWithEmail(cleanEmail, adminPasswordInput)
          if (res.success && res.role === "admin") {
            setIsAdminVerified(true)
            await loadAllAdminData()
          } else {
            setAdminAuthError(result.error || res.error || "Invalid admin credentials.")
          }
        }
      } else {
        const result = await adminRegisterWithEmail(
          cleanEmail,
          adminPasswordInput,
          adminNameInput.trim() || "System Administrator"
        )
        if (result.success) {
          setIsAdminVerified(true)
          await loadAllAdminData()
        } else {
          setAdminAuthError(result.error || "Admin registration failed.")
        }
      }
    } catch (err: any) {
      setAdminAuthError(err.message || "Authentication failed.")
    } finally {
      setAdminAuthenticating(false)
    }
  }

  const handleDeleteInvestor = async () => {
    if (!investorToDelete || !deleteConfirmed || !user) return
    setDeletingInvestor(true)
    try {
      await deleteInvestorAccount(investorToDelete.profile.id, user.name || user.email || "Admin")
      showToast(`Removed ${investorToDelete.profile.name || investorToDelete.profile.email}`)
      setInvestorToDelete(null)
      setSelectedInvestor(null)
      setDeleteConfirmed(false)
      await loadAllAdminData()
    } catch (err: any) {
      showToast(err.message || "Failed to delete investor")
    } finally {
      setDeletingInvestor(false)
    }
  }

  const handleTogglePayoutMode = async () => {
    if (!user || !payoutsData) return
    const targetMode = payoutsData.payoutMode === "automatic" ? "manual" : "automatic"
    setTogglingMode(true)
    try {
      const result = await togglePlatformPayoutMode(targetMode, user.name || user.email || "Admin")
      setPayoutsData((prev) => (prev ? { ...prev, payoutMode: result.mode } : prev))
      setOverviewData((prev) =>
        prev
          ? {
              ...prev,
              kpis: { ...prev.kpis, payoutMode: result.mode },
            }
          : prev
      )
      showToast(`Payout mode → ${result.mode}`)
      setShowModeToggleModal(false)
      await loadAllAdminData()
    } catch (err: any) {
      showToast(err.message || "Failed to toggle payout mode")
    } finally {
      setTogglingMode(false)
    }
  }

  const handleExecuteManualPay = async () => {
    if (!user || !manualPayTarget || !manualPayReferenceNote.trim()) {
      showToast("Add a transfer reference note first.")
      return
    }
    setProcessingManualPay(true)
    try {
      await executeManualPayout({
        userId: manualPayTarget.userId,
        amount: manualPayTarget.amount,
        adminName: user.name || user.email || "Admin",
        referenceNote: manualPayReferenceNote,
      })
      showToast(`Paid ${formatNaira(manualPayTarget.amount)}`)
      setManualPayTarget(null)
      setManualPayReferenceNote("")
      setSelectedPayoutIds((ids) => ids.filter((id) => id !== manualPayTarget.userId))
      await loadAllAdminData()
    } catch (err: any) {
      showToast(err.message || "Manual payout failed")
    } finally {
      setProcessingManualPay(false)
    }
  }

  const handleBatchManualPay = async (payAllDue = false) => {
    if (!user) return
    const note = window.prompt(
      payAllDue
        ? "Reference note for mass payout to ALL due investors:"
        : "Reference note for selected investors:"
    )
    if (!note?.trim()) {
      showToast("Reference note required")
      return
    }
    if (!payAllDue && selectedPayoutIds.length === 0) {
      showToast("Select at least one investor")
      return
    }
    setBatchPaying(true)
    try {
      const result = await executeManualPayoutBatch({
        userIds: payAllDue ? undefined : selectedPayoutIds,
        payAllDue,
        adminName: user.name || user.email || "Admin",
        referenceNote: note.trim(),
      })
      showToast(`Batch done · ${result.paid} paid · ${result.failed} failed`)
      setSelectedPayoutIds([])
      await loadAllAdminData()
    } catch (err: any) {
      showToast(err.message || "Batch payout failed")
    } finally {
      setBatchPaying(false)
    }
  }

  const handleTriggerCronRun = async () => {
    if (!user) return
    setCronRunning(true)
    try {
      const result = await triggerScheduledPayoutRun(user.name || user.email || "Admin")
      setCronResult(result)
      showToast(`Payout run done · ${result.successfulTransfers} successful`)
      await loadAllAdminData()
    } catch (err: any) {
      showToast(err.message || "Payout run failed")
    } finally {
      setCronRunning(false)
    }
  }

  const handleSyncFlutterwave = async () => {
    setSyncingFlw(true)
    try {
      const res = await syncFlutterwaveTransactions()
      showToast(res.message || "Synced with Flutterwave")
      await loadAllAdminData()
    } catch (err: any) {
      showToast(err.message || "Sync failed")
    } finally {
      setSyncingFlw(false)
    }
  }

  const [compressingImage, setCompressingImage] = useState(false)

  const handleImagePick = (file: File | null) => {
    if (!file) {
      setNotifImageUrl(null)
      return
    }
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (PNG, JPG, WebP)")
      return
    }

    setCompressingImage(true)
    const reader = new FileReader()
    reader.onerror = () => {
      showToast("Could not read image file")
      setCompressingImage(false)
    }
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => {
        showToast("Invalid image file")
        setCompressingImage(false)
      }
      img.onload = () => {
        try {
          const MAX_WIDTH = 1024
          const MAX_HEIGHT = 1024
          let width = img.width
          let height = img.height
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height)
              height = MAX_HEIGHT
            }
          }
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL("image/jpeg", 0.78)
          setNotifImageUrl(compressed)
        } catch {
          setNotifImageUrl(String(reader.result || ""))
        } finally {
          setCompressingImage(false)
        }
      }
      img.src = String(e.target?.result || "")
    }
    reader.readAsDataURL(file)
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedBody = notifBody.trim()
    if (!trimmedBody) {
      showToast("Please write a message to send")
      return
    }
    if (notifAudience === "single" && !notifTargetUserId) {
      showToast("Please select an investor to receive this alert")
      return
    }

    const resolvedTitle = notifTitle.trim() || (trimmedBody.length > 30 ? `${trimmedBody.slice(0, 27)}...` : trimmedBody) || "Announcement"
    setSendingNotification(true)
    try {
      await sendBroadcastNotification({
        title: resolvedTitle,
        body: trimmedBody,
        audience: notifAudience,
        targetUserId: notifTargetUserId || undefined,
        adminName: user?.name || user?.email || "Admin",
        icon: notifIcon,
        imageUrl: notifImageUrl || undefined,
      })
      showToast(notifAudience === "all" ? "Alert sent to all investors" : "Alert sent to investor")
      setNotifTitle("")
      setNotifBody("")
      setNotifTargetUserId("")
      setNotifImageUrl(null)
      setNotifIcon("bell")
      await loadAllAdminData()
    } catch (err: any) {
      showToast(err.message || "Failed to send notification")
    } finally {
      setSendingNotification(false)
    }
  }

  const filteredInvestors = useMemo(() => {
    const q = investorSearch.trim().toLowerCase()
    return investors.filter((row) => {
      if (!q) return true
      const hay = `${row.profile.name || ""} ${row.profile.email || ""} ${row.profile.phone || ""}`.toLowerCase()
      return hay.includes(q)
    })
  }, [investors, investorSearch])

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => paymentStatusFilter === "all" || p.status === paymentStatusFilter)
  }, [payments, paymentStatusFilter])

  const chartDayData = useMemo(() => {
    return (overviewData?.charts?.paymentsByDay || []).map((d) => ({
      ...d,
      label: d.date.slice(5),
    }))
  }, [overviewData])

  const statusColors: Record<string, string> = {
    successful: "#9fe870",
    pending: "#fbbf24",
    failed: "#f87171",
  }

  const navItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "investors", label: "Investors", icon: Users, badge: String(investors.length) },
    { id: "payments", label: "Payments", icon: CreditCard, badge: String(payments.length) },
    {
      id: "payouts",
      label: "Payouts",
      icon: Send,
      badge: (payoutsData?.payoutMode || "auto").slice(0, 4).toUpperCase(),
    },
    { id: "notifications", label: "Alerts", icon: Bell, badge: String(notifications.length) },
    { id: "support", label: "Support", icon: MessageSquare, badge: String(supportPendingCount) },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  if (isVerifying) {
    return <BrandLoader label="Verifying secure ops access…" />
  }

  if (!isAdminVerified) {
    return (
      <div className="min-h-screen bg-[#edefeb] flex items-center justify-center p-4">
        <SurfaceCard className="max-w-md w-full p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#163300] text-[#9fe870] flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-[#163300]">Admin access</h2>
            <p className="text-sm text-[#163300]/60">Sign in with an allowlisted administrator account.</p>
          </div>

          <div className="flex bg-[#edefeb] p-1 rounded-xl">
            {(["login", "register"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setAdminAuthMode(mode)
                  setAdminAuthError(null)
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  adminAuthMode === mode ? "bg-[#163300] text-[#9fe870]" : "text-[#163300]/50"
                }`}
              >
                {mode === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdminAuth} className="space-y-3">
            {adminAuthMode === "register" && (
              <input
                value={adminNameInput}
                onChange={(e) => setAdminNameInput(e.target.value)}
                placeholder="Full name"
                className="w-full h-11 px-4 rounded-full bg-white border border-[#163300]/10 text-sm text-[#163300] focus:outline-none focus:ring-2 focus:ring-[#9fe870]"
              />
            )}
            <input
              type="email"
              required
              value={adminEmailInput}
              onChange={(e) => setAdminEmailInput(e.target.value)}
              placeholder="Admin email"
              className="w-full h-11 px-4 rounded-full bg-white border border-[#163300]/10 text-sm text-[#163300] focus:outline-none focus:ring-2 focus:ring-[#9fe870]"
            />
            <input
              type="password"
              required
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              placeholder="Password"
              className="w-full h-11 px-4 rounded-full bg-white border border-[#163300]/10 text-sm text-[#163300] focus:outline-none focus:ring-2 focus:ring-[#9fe870]"
            />
            {adminAuthError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{adminAuthError}</p>
            )}
            <PressableButton type="submit" variant="lime" fullWidth disabled={adminAuthenticating}>
              {adminAuthenticating ? "Verifying…" : adminAuthMode === "login" ? "Continue" : "Create admin"}
            </PressableButton>
          </form>

          <div className="flex justify-between text-xs text-[#163300]/50 pt-2 border-t border-[#163300]/8">
            <button type="button" onClick={() => onNavigate("dashboard")} className="hover:text-[#163300]">
              Investor app
            </button>
            <button type="button" onClick={() => onNavigate("landing")} className="hover:text-[#163300]">
              Homepage
            </button>
          </div>
        </SurfaceCard>
      </div>
    )
  }

  const SidebarNav = (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setActiveTab(item.id)
              setIsMobileSidebarOpen(false)
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
              active ? "bg-[#9fe870] text-[#163300]" : "text-[#9fe870]/70 hover:bg-[#1e4200] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-3">
              <Icon className="w-4 h-4" />
              {item.label}
            </span>
            {item.badge && (
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  active ? "bg-[#163300]/15" : "bg-white/10"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#edefeb] text-[#163300] flex">
      <aside className="hidden lg:flex lg:flex-col w-64 bg-[#163300] shrink-0 h-screen sticky top-0">
        <div className="p-5 border-b border-[#9fe870]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/30 flex items-center justify-center border border-[#9fe870]/30">
              <BrandLogo size={36} className="rounded-lg" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight">Sigmawealth</p>
              <p className="text-[10px] text-[#9fe870] font-semibold uppercase tracking-wider">Ops console</p>
            </div>
          </div>
        </div>
        {SidebarNav}
        <div className="p-4 border-t border-[#9fe870]/15 space-y-2">
          <button
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="w-full text-left text-xs text-[#9fe870]/70 hover:text-white px-2 py-1.5"
          >
            Investor dashboard
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              onNavigate("landing")
            }}
            className="w-full flex items-center gap-2 text-xs text-[#9fe870]/70 hover:text-white px-2 py-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[280px] bg-[#163300] flex flex-col shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-[#9fe870]/15">
              <span className="text-white font-bold">Admin</span>
              <button type="button" onClick={() => setIsMobileSidebarOpen(false)} className="text-[#9fe870]">
                <X className="w-5 h-5" />
              </button>
            </div>
            {SidebarNav}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#edefeb]/90 backdrop-blur-md border-b border-[#163300]/8 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl bg-white border border-[#163300]/10"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black truncate capitalize">{activeTab}</h1>
              <p className="text-[11px] text-[#163300]/50 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncFlutterwave}
              disabled={syncingFlw || loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#163300]/10 text-xs font-semibold hover:border-[#163300]/25 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingFlw ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              type="button"
              onClick={() => loadAllAdminData()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#163300] text-[#9fe870] text-xs font-bold disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-5 max-w-6xl w-full mx-auto">
          {toastMessage && (
            <div className="rounded-2xl bg-white border border-[#9fe870] px-4 py-3 text-sm flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#163300]" />
                {toastMessage}
              </span>
              <button type="button" onClick={() => setToastMessage(null)}>
                <X className="w-4 h-4 text-[#163300]/40" />
              </button>
            </div>
          )}

          {loading && !overviewData ? (
            <div className="py-24 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#163300] border-t-[#9fe870] rounded-full animate-spin" />
              <span className="text-xs text-[#163300]/50">Loading live data…</span>
            </div>
          ) : (
            <>
              {activeTab === "overview" && overviewData && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Investors", value: String(overviewData.kpis.totalInvestors), icon: Users },
                      { label: "Total AUM", value: formatNaira(overviewData.kpis.totalAUM), icon: Wallet },
                      {
                        label: "Payments in",
                        value: formatNaira(overviewData.kpis.totalPaymentsVolume || 0),
                        icon: CreditCard,
                      },
                      {
                        label: "Paid out",
                        value: formatNaira(overviewData.kpis.totalPayoutsDisbursed),
                        icon: TrendingUp,
                      },
                    ].map((kpi) => (
                      <SurfaceCard key={kpi.label} className="p-4">
                        <div className="flex items-center gap-2 mb-2 text-[#163300]/45">
                          <kpi.icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">{kpi.label}</span>
                        </div>
                        <p className="text-lg sm:text-xl font-black truncate">{kpi.value}</p>
                      </SurfaceCard>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <SurfaceCard className="p-4 lg:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm">Payments (14 days)</h3>
                        <span className="text-[11px] text-[#163300]/40">
                          {overviewData.kpis.successfulPaymentsCount || 0} successful
                        </span>
                      </div>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartDayData}>
                            <defs>
                              <linearGradient id="payFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#9fe870" stopOpacity={0.55} />
                                <stop offset="100%" stopColor="#9fe870" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#16330015" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#16330080" }} />
                            <YAxis tick={{ fontSize: 10, fill: "#16330080" }} width={48} />
                            <Tooltip
                              formatter={(v: number) => formatNaira(v)}
                              contentStyle={{
                                borderRadius: 12,
                                border: "1px solid #16330020",
                                fontSize: 12,
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="amount"
                              stroke="#163300"
                              strokeWidth={2}
                              fill="url(#payFill)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </SurfaceCard>

                    <SurfaceCard className="p-4">
                      <h3 className="font-bold text-sm mb-3">By status</h3>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={overviewData.charts?.paymentsByStatus || []}>
                            <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#16330080" }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#16330080" }} width={28} />
                            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                              {(overviewData.charts?.paymentsByStatus || []).map((entry) => (
                                <Cell key={entry.status} fill={statusColors[entry.status] || "#163300"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </SurfaceCard>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <SurfaceCard className="p-4 lg:col-span-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Scheduled payouts
                        </h3>
                        <button
                          type="button"
                          className="text-[11px] font-bold underline"
                          onClick={() => setActiveTab("payouts")}
                        >
                          Manage
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-3 rounded-xl bg-[#edefeb]">
                          <p className="text-2xl font-black">{overviewData.attention.payoutsDueTodayCount}</p>
                          <p className="text-[10px] text-[#163300]/50">Due today</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#edefeb]">
                          <p className="text-2xl font-black">
                            {overviewData.attention.scheduledPayoutsCount ??
                              overviewData.scheduledPayouts?.length ??
                              0}
                          </p>
                          <p className="text-[10px] text-[#163300]/50">On schedule</p>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-[#163300]/8">
                        {(overviewData.scheduledPayouts || []).length === 0 ? (
                          <p className="text-xs text-[#163300]/45 py-6 text-center">No scheduled payouts yet.</p>
                        ) : (
                          (overviewData.scheduledPayouts || []).slice(0, 12).map((item) => (
                            <div key={`${item.userId}-${item.nextPaymentDate}`} className="py-2.5 text-xs">
                              <p className="font-semibold truncate">{item.investorName}</p>
                              <p className="text-[#163300]/50 flex justify-between gap-2">
                                <span>{formatNaira(item.amount)}</span>
                                <span>{formatDate(item.nextPaymentDate)}</span>
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            overviewData.kpis.payoutMode === "automatic"
                              ? "bg-[#9fe870]/40 text-[#163300]"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {overviewData.kpis.payoutMode}
                        </span>
                        {overviewData.attention.failedPayoutsCount > 0 && (
                          <span className="flex items-center gap-1 text-[10px] text-red-600 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {overviewData.attention.failedPayoutsCount} failed
                          </span>
                        )}
                      </div>
                    </SurfaceCard>

                    <SurfaceCard className="p-5 lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          <h3 className="font-bold text-sm">Live activity</h3>
                        </div>
                        <span className="text-[11px] text-[#163300]/40">
                          {overviewData.activityFeed.length} events
                        </span>
                      </div>
                      {overviewData.activityFeed.length === 0 ? (
                        <p className="text-sm text-[#163300]/45 py-8 text-center">
                          No activity yet — live events appear here.
                        </p>
                      ) : (
                        <div className="divide-y divide-[#163300]/8 max-h-80 overflow-y-auto">
                          {overviewData.activityFeed.map((item) => (
                            <div key={item.id} className="py-3 flex justify-between gap-3 text-xs">
                              <div>
                                <p className="font-semibold">
                                  <span className="text-[#163300]/45 mr-1">[{item.action}]</span>
                                  {item.details}
                                </p>
                                <p className="text-[#163300]/40 mt-0.5">{item.actor}</p>
                              </div>
                              <span className="text-[#163300]/40 whitespace-nowrap shrink-0">
                                {formatDate(item.created_at, true)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </SurfaceCard>
                  </div>
                </div>
              )}

              {activeTab === "investors" && (
                <div className="space-y-4">
                  <SurfaceCard className="p-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#163300]/35" />
                      <input
                        value={investorSearch}
                        onChange={(e) => setInvestSearch(e.target.value)}
                        placeholder="Search name, email, phone…"
                        className="w-full h-11 pl-9 pr-3 rounded-full bg-[#edefeb] border border-[#163300]/8 text-sm focus:outline-none focus:ring-2 focus:ring-[#9fe870]"
                      />
                    </div>
                  </SurfaceCard>

                  <div className="grid gap-3">
                    {filteredInvestors.length === 0 ? (
                      <SurfaceCard className="p-10 text-center text-sm text-[#163300]/45">
                        No investors yet. Signups appear here live.
                      </SurfaceCard>
                    ) : (
                      filteredInvestors.map((row) => (
                        <SurfaceCard
                          key={row.profile.id}
                          interactive
                          className="p-4"
                          onClick={() => setSelectedInvestor(row)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold truncate">{row.profile.name || "Investor"}</p>
                              <p className="text-xs text-[#163300]/50 truncate">{row.profile.email}</p>
                              <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                                <span className="px-2 py-0.5 rounded-full bg-[#edefeb] font-semibold">
                                  {formatNaira(row.profile.total_invested || 0)} invested
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#edefeb]">
                                  {row.investment?.status || "no plan"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-[#edefeb]">
                                  {row.paymentsCount} payments · {row.payoutsCount} payouts
                                </span>
                                {row.investment?.next_payment_date && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#9fe870]/25">
                                    Next: {formatDate(row.investment.next_payment_date)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="p-2 rounded-xl text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                setInvestorToDelete(row)
                                setDeleteConfirmed(false)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </SurfaceCard>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-4">
                  <SurfaceCard className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-bold">{filteredPayments.length} payments</p>
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="h-10 px-3 rounded-full bg-white border border-[#163300]/10 text-sm"
                    >
                      <option value="all">All statuses</option>
                      <option value="successful">Successful</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </SurfaceCard>

                  <SurfaceCard className="overflow-hidden">
                    {filteredPayments.length === 0 ? (
                      <p className="p-10 text-center text-sm text-[#163300]/45">No payments recorded yet.</p>
                    ) : (
                      <div className="divide-y divide-[#163300]/8 max-h-[32rem] overflow-y-auto">
                        {filteredPayments.map((p: any) => (
                          <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="font-semibold">{formatNaira(p.amount)}</p>
                              <p className="text-xs text-[#163300]/45 truncate">
                                {p.investor_name || p.investor_email || "Investor"} ·{" "}
                                {p.method?.replace(/_/g, " ") || "card"} · {p.flutterwave_tx_ref || p.id}
                              </p>
                              <p className="text-[11px] text-[#163300]/35">{formatDate(p.created_at, true)}</p>
                            </div>
                            <span
                              className={`shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                                p.status === "successful"
                                  ? "bg-[#9fe870]/30 text-[#163300]"
                                  : p.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </SurfaceCard>
                </div>
              )}

              {activeTab === "payouts" && payoutsData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SurfaceCard className="p-4">
                      <p className="text-[10px] font-bold uppercase text-[#163300]/45 mb-1">Mode</p>
                      <p className="text-xl font-black capitalize">{payoutsData.payoutMode}</p>
                      <button
                        type="button"
                        onClick={() => setShowModeToggleModal(true)}
                        className="mt-2 text-xs font-bold text-[#163300] underline"
                      >
                        Switch mode
                      </button>
                    </SurfaceCard>
                    <SurfaceCard className="p-4">
                      <p className="text-[10px] font-bold uppercase text-[#163300]/45 mb-1">Due today</p>
                      <p className="text-xl font-black">{payoutsData.dueToday?.length || 0}</p>
                      <p className="text-[11px] text-[#163300]/45 mt-1">
                        Upcoming: {payoutsData.upcoming?.length || 0}
                      </p>
                    </SurfaceCard>
                    <SurfaceCard className="p-4 flex flex-col justify-between">
                      <p className="text-[10px] font-bold uppercase text-[#163300]/45 mb-2">Actions</p>
                      <PressableButton
                        variant="lime"
                        size="sm"
                        onClick={handleTriggerCronRun}
                        disabled={cronRunning}
                        className="w-full"
                      >
                        <Play className="w-3.5 h-3.5 mr-1 inline" />
                        {cronRunning ? "Running…" : "Run payouts now"}
                      </PressableButton>
                    </SurfaceCard>
                  </div>

                  {cronResult && (
                    <SurfaceCard className="p-4 text-xs space-y-1">
                      <p className="font-bold text-sm mb-2">Last run summary</p>
                      <p>Checked: {cronResult.totalChecked}</p>
                      <p>Eligible: {cronResult.eligibleCount}</p>
                      <p>Successful: {cronResult.successfulTransfers}</p>
                      <p>Failed: {cronResult.failedTransfers}</p>
                      <p>Queued manual: {cronResult.queuedForManual}</p>
                    </SurfaceCard>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SurfaceCard className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h3 className="font-bold text-sm">Due / ready to pay</h3>
                        {payoutsData.payoutMode === "manual" && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={batchPaying || selectedPayoutIds.length === 0}
                              onClick={() => handleBatchManualPay(false)}
                              className="px-3 py-1.5 rounded-full bg-[#163300] text-[#9fe870] text-[11px] font-bold disabled:opacity-40"
                            >
                              Pay selected ({selectedPayoutIds.length})
                            </button>
                            <button
                              type="button"
                              disabled={batchPaying || !(payoutsData.dueToday?.length > 0)}
                              onClick={() => handleBatchManualPay(true)}
                              className="px-3 py-1.5 rounded-full bg-[#9fe870] text-[#163300] text-[11px] font-bold disabled:opacity-40"
                            >
                              Mass pay all due
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[#163300]/45 mb-3">
                        Mid-cycle = 50% of deposit · Month-end = remaining 50% + interest · Local banks (Opay, First Bank, etc.)
                      </p>
                      {(payoutsData.dueToday || []).length === 0 ? (
                        <p className="text-sm text-[#163300]/45 py-6 text-center">Nothing due today.</p>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {payoutsData.dueToday.map((item: any) => {
                            const checked = selectedPayoutIds.includes(item.userId)
                            return (
                              <div
                                key={`${item.userId}-${item.nextPaymentDate}`}
                                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#edefeb]"
                              >
                                <div className="flex items-start gap-2 min-w-0">
                                  {payoutsData.payoutMode === "manual" && (
                                    <input
                                      type="checkbox"
                                      className="mt-1"
                                      checked={checked}
                                      onChange={(e) => {
                                        setSelectedPayoutIds((prev) =>
                                          e.target.checked
                                            ? [...prev, item.userId]
                                            : prev.filter((id) => id !== item.userId)
                                        )
                                      }}
                                    />
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                      {item.investorName || item.investorEmail}
                                    </p>
                                    <p className="text-xs text-[#163300]/50">
                                      {formatNaira(item.amount)}
                                      {item.payoutLabel ? ` · ${item.payoutLabel}` : ""}
                                    </p>
                                    <p className="text-[10px] text-[#163300]/40 mt-0.5">
                                      {item.hasBeneficiary
                                        ? item.bankName || "Bank on file"
                                        : "⚠ Missing bank details"}
                                    </p>
                                  </div>
                                </div>
                                {payoutsData.payoutMode === "manual" && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setManualPayTarget(item)
                                      setManualPayReferenceNote("")
                                    }}
                                    className="shrink-0 px-3 py-1.5 rounded-full bg-[#163300] text-[#9fe870] text-xs font-bold"
                                  >
                                    Mark paid
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </SurfaceCard>

                    <SurfaceCard className="p-4">
                      <h3 className="font-bold text-sm mb-3">Upcoming schedule</h3>
                      {(payoutsData.upcoming || []).length === 0 ? (
                        <p className="text-sm text-[#163300]/45 py-6 text-center">No upcoming schedules.</p>
                      ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {payoutsData.upcoming.map((item: any) => (
                            <div
                              key={`${item.userId}-up-${item.nextPaymentDate}`}
                              className="p-3 rounded-xl bg-[#edefeb] text-sm"
                            >
                              <p className="font-semibold truncate">{item.investorName || item.investorEmail}</p>
                              <p className="text-xs text-[#163300]/50 flex justify-between mt-1">
                                <span>{formatNaira(item.amount)}</span>
                                <span>{formatDate(item.nextPaymentDate)}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </SurfaceCard>
                  </div>

                  <SurfaceCard className="overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#163300]/8 font-bold text-sm">Payout history</div>
                    {(payoutsData.payouts || []).length === 0 ? (
                      <p className="p-8 text-center text-sm text-[#163300]/45">No payouts yet.</p>
                    ) : (
                      <div className="divide-y divide-[#163300]/8 max-h-80 overflow-y-auto">
                        {payoutsData.payouts.map((p) => (
                          <div key={p.id} className="px-4 py-3 flex justify-between gap-3 text-sm">
                            <div>
                              <p className="font-semibold">{formatNaira(p.amount)}</p>
                              <p className="text-xs text-[#163300]/45">
                                {p.investor_name || p.investor_email || p.user_id} · {p.mode}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase self-center">{p.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </SurfaceCard>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <SurfaceCard className="p-5 lg:col-span-2 space-y-3">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Megaphone className="w-4 h-4" /> Compose alert
                    </h3>
                    <form onSubmit={handleSendNotification} className="space-y-3">
                      <select
                        value={notifAudience}
                        onChange={(e) => setNotifAudience(e.target.value as "all" | "single")}
                        className="w-full h-10 px-3 rounded-xl bg-[#edefeb] border border-[#163300]/8 text-sm"
                      >
                        <option value="all">All investors</option>
                        <option value="single">Single investor</option>
                      </select>
                      {notifAudience === "single" && (
                        <select
                          required
                          value={notifTargetUserId}
                          onChange={(e) => setNotifTargetUserId(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-white border border-[#163300]/10 text-sm"
                        >
                          <option value="">Select investor…</option>
                          {investors.map((row) => (
                            <option key={row.profile.id} value={row.profile.id}>
                              {row.profile.name || row.profile.email}
                            </option>
                          ))}
                        </select>
                      )}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#163300]/45">Header / title</label>
                        <input
                          required
                          value={notifTitle}
                          onChange={(e) => setNotifTitle(e.target.value)}
                          placeholder="Alert headline"
                          className="mt-1 w-full h-10 px-3 rounded-xl bg-white border border-[#163300]/10 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#163300]/45">Body</label>
                        <textarea
                          required
                          rows={4}
                          value={notifBody}
                          onChange={(e) => setNotifBody(e.target.value)}
                          placeholder="Write the message investors will see"
                          className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-[#163300]/10 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#163300]/45 mb-2 block">Icon</label>
                        <div className="grid grid-cols-3 gap-2">
                          {ALERT_ICONS.map(({ id, label, Icon }) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setNotifIcon(id)}
                              className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-semibold ${
                                notifIcon === id
                                  ? "bg-[#163300] text-[#9fe870] border-[#163300]"
                                  : "bg-white border-[#163300]/10 text-[#163300]"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[#163300]/45 mb-1 block">
                          Picture (optional)
                        </label>
                        <label className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#edefeb] border border-dashed border-[#163300]/20 text-xs font-semibold cursor-pointer hover:border-[#163300]/40">
                          <ImagePlus className="w-4 h-4" />
                          {compressingImage ? "Optimizing image…" : notifImageUrl ? "Change image" : "Add picture"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={compressingImage || sendingNotification}
                            className="hidden"
                            onChange={(e) => handleImagePick(e.target.files?.[0] || null)}
                          />
                        </label>
                        {notifImageUrl && (
                          <div className="relative mt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={notifImageUrl}
                              alt="Alert preview"
                              className="w-full h-28 object-cover rounded-xl border border-[#163300]/10"
                            />
                            <button
                              type="button"
                              onClick={() => setNotifImageUrl(null)}
                              className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-[#163300]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <PressableButton
                        type="submit"
                        variant="lime"
                        fullWidth
                        disabled={sendingNotification || compressingImage}
                      >
                        {compressingImage ? "Optimizing image…" : sendingNotification ? "Sending…" : "Send alert"}
                      </PressableButton>
                    </form>
                  </SurfaceCard>

                  <SurfaceCard className="p-5 lg:col-span-3">
                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Bell className="w-4 h-4" /> Sent alerts ({notifications.length})
                    </h3>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-[#163300]/45 py-10 text-center">
                        No alerts yet. Compose one to reach investors.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#163300]/8 max-h-[36rem] overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="py-3 text-sm space-y-2">
                            <div className="flex gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#edefeb] flex items-center justify-center shrink-0">
                                <AlertIconGlyph name={n.icon} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between gap-2">
                                  <strong className="truncate">{n.title}</strong>
                                  <span className="text-[10px] uppercase text-[#163300]/40 shrink-0">
                                    {n.audience}
                                  </span>
                                </div>
                                <p className="text-xs text-[#163300]/55 mt-1">{n.body}</p>
                                <p className="text-[11px] text-[#163300]/35 mt-1">
                                  {formatDate(n.sent_at || n.created_at, true)}
                                </p>
                              </div>
                            </div>
                            {n.image_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={n.image_url}
                                alt=""
                                className="w-full max-h-40 object-cover rounded-xl border border-[#163300]/8"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </SurfaceCard>
                </div>
              )}

              {activeTab === "support" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[520px]">
                  <SurfaceCard className="lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-[#163300]/8 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Live support inbox
                        </h3>
                        <p className="text-[11px] text-[#163300]/45">
                          {supportPendingCount} pending · updates live
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => refreshSupportInbox()}
                        className="p-2 rounded-lg hover:bg-[#edefeb]"
                        aria-label="Refresh inbox"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[480px] divide-y divide-[#163300]/8">
                      {supportConversations.length === 0 ? (
                        <p className="p-8 text-center text-sm text-[#163300]/45">
                          No visitor chats yet. Messages from the website chat appear here instantly.
                        </p>
                      ) : (
                        supportConversations.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={async () => {
                              setSelectedSupportId(c.id)
                              try {
                                const data = await fetchSupportConversation(c.id, "admin")
                                setSupportMessages(data.messages || [])
                                setVisitorTyping(Boolean(data.typing && data.typing.role === "user"))
                                await refreshSupportInbox()
                              } catch {
                                showToast("Could not open conversation")
                              }
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-[#edefeb]/80 transition ${
                              selectedSupportId === c.id ? "bg-[#edefeb]" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{c.visitor_name || "Guest"}</p>
                                <p className="text-xs text-[#163300]/50 truncate">
                                  {c.last_message_preview || "No messages"}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                {(c.unread_admin || 0) > 0 && (
                                  <span className="inline-flex min-w-[1.25rem] h-5 px-1.5 items-center justify-center rounded-full bg-[#163300] text-[#9fe870] text-[10px] font-bold">
                                    {c.unread_admin}
                                  </span>
                                )}
                                <p className="text-[10px] uppercase font-bold text-[#163300]/40 mt-1">
                                  {c.status}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </SurfaceCard>

                  <SurfaceCard className="lg:col-span-3 overflow-hidden flex flex-col min-h-[480px]">
                    {!selectedSupportId ? (
                      <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-[#163300]/45">
                        Select a conversation to reply in real time.
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-[#163300]/8 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-sm truncate">
                              {supportConversations.find((c) => c.id === selectedSupportId)?.visitor_name ||
                                "Visitor"}
                            </p>
                            <p className="text-[11px] text-[#163300]/45">
                              {visitorTyping ? "Visitor is typing…" : "Live conversation"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await updateSupportConversationStatus(selectedSupportId, "resolved")
                                  showToast("Conversation marked resolved")
                                  await refreshSupportInbox()
                                } catch {
                                  showToast("Could not update status")
                                }
                              }}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#edefeb] hover:bg-[#dfe6e1]"
                            >
                              Resolve
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f7faf7] max-h-[360px]">
                          {supportMessages.map((m) => (
                            <div
                              key={m.id}
                              className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                                  m.sender === "admin"
                                    ? "bg-[#163300] text-white rounded-br-sm"
                                    : "bg-white border border-[#163300]/10 text-[#163300] rounded-bl-sm"
                                }`}
                              >
                                <p>{m.content}</p>
                                <div className="flex items-center gap-2 mt-1 opacity-70 text-[10px]">
                                  <span>
                                    {new Date(m.created_at).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {m.sender === "user" && m.status === "pending" && (
                                    <span className="font-semibold text-amber-500">Pending</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {visitorTyping && (
                            <div className="flex justify-start">
                              <div className="bg-white border border-[#163300]/10 rounded-2xl px-3 py-2 flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#163300] animate-bounce" />
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-[#163300] animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                />
                                <span
                                  className="w-1.5 h-1.5 rounded-full bg-[#163300] animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <form
                          className="p-3 border-t border-[#163300]/8 flex gap-2"
                          onSubmit={async (e) => {
                            e.preventDefault()
                            if (!selectedSupportId || !supportReply.trim() || supportSending) return
                            setSupportSending(true)
                            try {
                              await sendSupportMessage(selectedSupportId, {
                                content: supportReply.trim(),
                                sender: "admin",
                                senderName: user?.name || "Sigma Wealth Support",
                              })
                              setSupportReply("")
                              await setSupportTyping(selectedSupportId, {
                                role: "admin",
                                typing: false,
                                name: user?.name || "Support",
                              })
                              const data = await fetchSupportConversation(selectedSupportId, "admin")
                              setSupportMessages(data.messages || [])
                              await refreshSupportInbox()
                            } catch (err: any) {
                              showToast(err.message || "Failed to send reply")
                            } finally {
                              setSupportSending(false)
                            }
                          }}
                        >
                          <input
                            value={supportReply}
                            onChange={(e) => {
                              setSupportReply(e.target.value)
                              if (!selectedSupportId) return
                              setSupportTyping(selectedSupportId, {
                                role: "admin",
                                typing: true,
                                name: user?.name || "Support",
                              })
                              if (supportTypingTimer.current) clearTimeout(supportTypingTimer.current)
                              supportTypingTimer.current = setTimeout(() => {
                                if (selectedSupportId) {
                                  setSupportTyping(selectedSupportId, {
                                    role: "admin",
                                    typing: false,
                                    name: user?.name || "Support",
                                  })
                                }
                              }, 1200)
                            }}
                            placeholder="Reply to visitor…"
                            className="flex-1 h-11 px-3 rounded-xl bg-[#edefeb] border border-[#163300]/8 text-sm outline-none focus:ring-2 focus:ring-[#163300]/20"
                          />
                          <PressableButton type="submit" variant="lime" disabled={supportSending || !supportReply.trim()}>
                            {supportSending ? "…" : "Send"}
                          </PressableButton>
                        </form>
                      </>
                    )}
                  </SurfaceCard>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-4">
                  <SurfaceCard className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" />
                      <h3 className="font-bold">Platform</h3>
                    </div>
                    <p className="text-sm text-[#163300]/60">
                      Live admin data loads from the Sigma API. Payments sync via Flutterwave. Payouts support
                      automatic runs or manual mark-paid. Mass alerts appear instantly on investor dashboards.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-[#edefeb]">
                        <p className="text-[10px] font-bold uppercase text-[#163300]/45">Admin session</p>
                        <p className="text-sm font-semibold truncate">{user?.email}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-[#edefeb]">
                        <p className="text-[10px] font-bold uppercase text-[#163300]/45">Payout mode</p>
                        <p className="text-sm font-semibold capitalize">
                          {payoutsData?.payoutMode || overviewData?.kpis.payoutMode || "—"}
                        </p>
                      </div>
                    </div>
                  </SurfaceCard>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {selectedInvestor && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedInvestor(null)} />
          <SurfaceCard className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:rounded-2xl rounded-t-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-lg">{selectedInvestor.profile.name || "Investor"}</h3>
                <p className="text-xs text-[#163300]/50">{selectedInvestor.profile.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedInvestor(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 rounded-xl bg-[#edefeb]">
                <p className="text-[10px] uppercase text-[#163300]/45">Invested</p>
                <p className="font-bold">{formatNaira(selectedInvestor.profile.total_invested || 0)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#edefeb]">
                <p className="text-[10px] uppercase text-[#163300]/45">Plan status</p>
                <p className="font-bold capitalize">{selectedInvestor.investment?.status || "none"}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#edefeb]">
                <p className="text-[10px] uppercase text-[#163300]/45">Bank</p>
                <p className="font-bold text-xs truncate">
                  {selectedInvestor.bankDetails
                    ? `${selectedInvestor.bankDetails.bank_name} · ${selectedInvestor.bankDetails.account_number}`
                    : "Not set"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#edefeb]">
                <p className="text-[10px] uppercase text-[#163300]/45">Card on file</p>
                <p className="font-bold text-xs">
                  {selectedInvestor.cardDetails
                    ? `${selectedInvestor.cardDetails.card_brand} ···· ${selectedInvestor.cardDetails.card_last4}`
                    : "None"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#edefeb] col-span-2">
                <p className="text-[10px] uppercase text-[#163300]/45">Next payout</p>
                <p className="font-bold text-xs">
                  {selectedInvestor.investment?.next_payment_date
                    ? formatDate(selectedInvestor.investment.next_payment_date)
                    : "—"}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#163300]/45">Phone: {selectedInvestor.profile.phone || "—"}</p>
            <p className="text-xs text-[#163300]/45">ID: {selectedInvestor.profile.id}</p>
          </SurfaceCard>
        </div>
      )}

      {investorToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInvestorToDelete(null)} />
          <SurfaceCard className="relative w-full max-w-md p-5 space-y-4">
            <h3 className="font-black text-lg">Delete investor?</h3>
            <p className="text-sm text-[#163300]/60">
              This permanently removes {investorToDelete.profile.name || investorToDelete.profile.email} and related
              records.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={deleteConfirmed} onChange={(e) => setDeleteConfirmed(e.target.checked)} />
              I understand this cannot be undone
            </label>
            <div className="flex gap-2">
              <PressableButton variant="secondary" fullWidth onClick={() => setInvestorToDelete(null)}>
                Cancel
              </PressableButton>
              <PressableButton
                variant="danger"
                fullWidth
                disabled={!deleteConfirmed || deletingInvestor}
                onClick={handleDeleteInvestor}
              >
                {deletingInvestor ? "Deleting…" : "Delete"}
              </PressableButton>
            </div>
          </SurfaceCard>
        </div>
      )}

      {showModeToggleModal && payoutsData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModeToggleModal(false)} />
          <SurfaceCard className="relative w-full max-w-md p-5 space-y-4">
            <h3 className="font-black text-lg">Switch payout mode?</h3>
            <p className="text-sm text-[#163300]/60">
              Currently <strong>{payoutsData.payoutMode}</strong>. Switch to{" "}
              <strong>{payoutsData.payoutMode === "automatic" ? "manual" : "automatic"}</strong>?
            </p>
            <div className="flex gap-2">
              <PressableButton variant="secondary" fullWidth onClick={() => setShowModeToggleModal(false)}>
                Cancel
              </PressableButton>
              <PressableButton variant="lime" fullWidth disabled={togglingMode} onClick={handleTogglePayoutMode}>
                {togglingMode ? "Updating…" : "Confirm"}
              </PressableButton>
            </div>
          </SurfaceCard>
        </div>
      )}

      {manualPayTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setManualPayTarget(null)} />
          <SurfaceCard className="relative w-full max-w-md p-5 space-y-4">
            <h3 className="font-black text-lg">Mark payout paid</h3>
            <p className="text-sm">
              {manualPayTarget.investorName || manualPayTarget.investorEmail} ·{" "}
              <strong>{formatNaira(manualPayTarget.amount)}</strong>
              {manualPayTarget.payoutLabel ? ` · ${manualPayTarget.payoutLabel}` : ""}
            </p>
            <p className="text-xs text-[#163300]/45">
              Local bank payout (Opay / First Bank / etc). Missing details notify the investor.
            </p>
            <input
              value={manualPayReferenceNote}
              onChange={(e) => setManualPayReferenceNote(e.target.value)}
              placeholder="Transfer reference / note"
              className="w-full h-11 px-4 rounded-xl border border-[#163300]/10 text-sm"
            />
            <div className="flex gap-2">
              <PressableButton variant="secondary" fullWidth onClick={() => setManualPayTarget(null)}>
                Cancel
              </PressableButton>
              <PressableButton
                variant="lime"
                fullWidth
                disabled={processingManualPay}
                onClick={handleExecuteManualPay}
              >
                {processingManualPay ? "Saving…" : "Confirm paid"}
              </PressableButton>
            </div>
          </SurfaceCard>
        </div>
      )}
    </div>
  )
}
