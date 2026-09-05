"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  HelpCircle,
  Send,
  MessageCircle,
  X,
  Zap,
  AlertTriangle,
  Phone,
  ShieldCheck,
  ChevronLeft
} from "lucide-react"

type ChatMsg = { role: "user" | "assistant"; content: string; time?: string }

const MessageBubble = ({ role, content, time }: { role: "user" | "assistant"; content: string; time?: string }) => (
  <div className={`flex flex-col ${role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
    <div
      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${role === "user"
          ? "bg-[#004324] text-white rounded-br-xs font-medium"
          : "bg-white text-gray-800 border border-[#004324]/10 rounded-bl-xs"
        }`}
    >
      {content}
    </div>
    {time && (
      <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
    )}
  </div>
)

export default function ChatWidget() {
  const pathname = usePathname()
  const hideChat =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth")

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: "Hello! Welcome to SigmawealthSolution support. How can we assist you with your investments, payouts, or account today?",
      time: "Just now"
    },
  ])
  const [loading, setLoading] = useState(false)
  const [showBugForm, setShowBugForm] = useState(false)
  const [bugName, setBugName] = useState("")
  const [bugEmail, setBugEmail] = useState("")
  const [bugDesc, setBugDesc] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll when messages change or open
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open, messages])

  // Lock body scroll when full-screen chat is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Escape key closes chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  useEffect(() => {
    const timer = setTimeout(() => setShowNudge(true), 2500)
    const autoHide = setTimeout(() => setShowNudge(false), 9000)
    return () => {
      clearTimeout(timer)
      clearTimeout(autoHide)
    }
  }, [])

  const send = async (text: string, intent?: string) => {
    if (!text.trim()) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: ChatMsg = { role: "user", content: text, time: now }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)

    const lowerText = text.toLowerCase()

    // Handle common questions instantly
    if (lowerText.includes("referral") || lowerText.includes("invite") || lowerText.includes("10%")) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "You earn a 10% instant commission on every investment made by someone you refer! You can find your unique referral link inside your investor dashboard under the 'Invite' section.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
        ])
        setLoading(false)
      }, 400)
      return
    }

    if (lowerText.includes("payout") || lowerText.includes("return") || lowerText.includes("schedule")) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "SigmawealthSolution offers disciplined payout schedules: automated returns are scheduled twice monthly or at full monthly completion directly into your verified bank account.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
        ])
        setLoading(false)
      }, 400)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || "/api/chat"
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          intent,
        }),
      })
      const data = await res.json()
      const reply = data?.reply || "Thanks for reaching out! A member of our support team will follow up if further assistance is needed."
      setMessages((m) => [...m, { role: "assistant", content: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "We received your inquiry! For instant account support, feel free to also reach out to our dedicated line or WhatsApp support team.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: "10% Referral Info", icon: Zap, prompt: "How does the 10% referral bonus work?" },
    { label: "Payout Schedule", icon: HelpCircle, prompt: "How do payouts and return schedules work?" },
    { label: "Report an Issue", icon: AlertTriangle, action: () => setShowBugForm(true) },
    { label: "Bank Security", icon: ShieldCheck, prompt: "How secure is my bank and investment data?" },
  ]

  if (hideChat) return null

  return (
    <>
      {/* Floating Trigger Button (When Chat is Closed) */}
      {!open && (
        <div className="fixed bottom-5 right-5 z-40">
          <div className="relative">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open support chat"
              className="h-14 w-14 rounded-full bg-[#004324] text-[#9fe870] hover:bg-[#003319] hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(0,67,36,0.35)] flex items-center justify-center transition-all duration-200 group cursor-pointer border border-[#9fe870]/30"
            >
              <MessageCircle className="h-6 w-6 text-[#9fe870] group-hover:rotate-6 transition-transform" />
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9fe870] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#9fe870] border-2 border-[#004324]" />
              </span>
            </button>

            {/* Optional Small Nudge Popup */}
            {showNudge && (
              <div className="absolute bottom-16 right-0 w-64 bg-white rounded-2xl p-3.5 shadow-2xl border border-[#004324]/10 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="bg-[#004324]/10 p-2 rounded-xl shrink-0">
                    <MessageCircle className="h-4 w-4 text-[#004324]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900">Need investment help?</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Chat with our team anytime!</p>
                  </div>
                  <button
                    onClick={() => setShowNudge(false)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL WIDTH & FULL HEIGHT CHAT APPLICATION MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="full-chat-app"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed inset-0 z-[9999] w-screen h-[100dvh] bg-[#f4f7f4] flex flex-col overflow-hidden"
          >
            {/* Top Navigation / App Header */}
            <header className="bg-[#004324] text-white px-4 sm:px-6 py-3.5 sm:py-4 shadow-md flex items-center justify-between border-b border-[#9fe870]/20 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="sm:hidden p-1.5 -ml-1.5 rounded-full hover:bg-white/10 active:scale-95 text-white"
                  aria-label="Back"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                    <MessageCircle className="w-5 h-5 text-[#9fe870]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#9fe870] border-2 border-[#004324] rounded-full" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">Sigma Wealth Support</h2>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-[#9fe870]/20 text-[#9fe870] px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9fe870]/80 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870] animate-pulse" />
                    Online · Ready to help
                  </p>
                </div>
              </div>

              {/* Close Button X with closing animation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Quick Suggestions Bar */}
            <div className="bg-white border-b border-gray-200/80 px-4 py-2.5 overflow-x-auto no-scrollbar shrink-0 shadow-xs">
              <div className="max-w-4xl mx-auto flex items-center gap-2">
                {quickActions.map((qa) => (
                  <button
                    key={qa.label}
                    onClick={() => {
                      if (qa.action) {
                        qa.action()
                      } else if (qa.prompt) {
                        send(qa.prompt)
                      }
                    }}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#f0f9f4] hover:bg-[#e0f2e9] text-[#004324] border border-[#d4edda] transition-all cursor-pointer active:scale-95"
                  >
                    <qa.icon className="w-3.5 h-3.5 text-[#004324]" />
                    <span>{qa.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Message Stream Container (Full Height) */}
            <main
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4"
            >
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="text-center py-2">
                  <span className="text-[11px] font-medium text-gray-400 bg-gray-200/50 px-3 py-1 rounded-full">
                    End-to-End Encrypted Support Channel
                  </span>
                </div>

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <MessageBubble role={msg.role} content={msg.content} time={msg.time} />
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 w-16 p-3 rounded-2xl rounded-bl-xs shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#004324] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#004324] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#004324] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}

                {/* Bug / Issue Reporting Card */}
                {showBugForm && (
                  <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-lg space-y-3.5 max-w-lg mx-auto">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Report Platform Issue</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBugForm(false)}
                        className="text-gray-400 hover:text-gray-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <Input
                        placeholder="Your full name"
                        value={bugName}
                        onChange={(e) => setBugName(e.target.value)}
                        className="bg-gray-50 border-gray-200 text-sm h-10 rounded-xl"
                      />
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={bugEmail}
                        onChange={(e) => setBugEmail(e.target.value)}
                        className="bg-gray-50 border-gray-200 text-sm h-10 rounded-xl"
                      />
                      <Textarea
                        placeholder="Describe the issue in detail..."
                        rows={3}
                        value={bugDesc}
                        onChange={(e) => setBugDesc(e.target.value)}
                        className="bg-gray-50 border-gray-200 text-sm rounded-xl"
                      />
                      <div className="flex items-center justify-between pt-1">
                        <label className="text-xs text-gray-600 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isUrgent}
                            onChange={(e) => setIsUrgent(e.target.checked)}
                            className="h-4 w-4 text-[#004324] rounded border-gray-300"
                          />
                          Urgent issue
                        </label>
                        <Button
                          onClick={async () => {
                            if (!bugName.trim() || !bugEmail.trim() || !bugDesc.trim()) return
                            try {
                              await fetch("/api/feedback", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  name: bugName,
                                  email: bugEmail,
                                  description: bugDesc,
                                  type: "issue",
                                  severity: isUrgent ? "urgent" : "normal",
                                }),
                              })
                              setShowBugForm(false)
                              setBugName("")
                              setBugEmail("")
                              setBugDesc("")
                              setIsUrgent(false)
                              setMessages((m) => [
                                ...m,
                                {
                                  role: "assistant",
                                  content: "Thank you! Your report has been dispatched to engineering. We will follow up immediately.",
                                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                },
                              ])
                            } catch {
                              setMessages((m) => [
                                ...m,
                                {
                                  role: "assistant",
                                  content: "Could not submit issue report. Please message our direct line.",
                                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                },
                              ])
                            }
                          }}
                          disabled={!bugName.trim() || !bugEmail.trim() || !bugDesc.trim()}
                          className="bg-[#004324] text-white hover:bg-[#003319] text-xs font-bold rounded-xl px-4 h-9"
                        >
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </main>

            {/* Bottom Chat Input Bar (Pinned at bottom, full width) */}
            <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 shrink-0 shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="max-w-3xl mx-auto">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (showBugForm) return
                    send(input)
                  }}
                >
                  <input
                    ref={inputRef}
                    placeholder={showBugForm ? "Close form to continue message chat…" : "Message Sigma Wealth support…"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={showBugForm}
                    className="flex-1 bg-[#edefeb]/60 focus:bg-white text-sm px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#004324] text-gray-900 transition placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim() || showBugForm}
                    aria-label="Send message"
                    className="w-11 h-11 rounded-2xl bg-[#004324] hover:bg-[#003319] text-[#9fe870] disabled:opacity-40 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
