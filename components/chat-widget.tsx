"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"
import { BrandLogo } from "@/components/BrandLogo"

type ChatMsg = {
  id: string
  role: "user" | "assistant"
  content: string
  time?: string
  status?: string
}

type SupportMessage = {
  id: string
  conversation_id: string
  sender: "user" | "admin"
  sender_name?: string
  content: string
  status?: string
  created_at: string
}

function formatMsgTime(iso?: string) {
  if (!iso) return "Just now"
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch {
    return "Just now"
  }
}

function getStoredConversationId() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("sigma_support_conversation_id")
}

function setStoredConversationId(id: string) {
  if (typeof window === "undefined") return
  localStorage.setItem("sigma_support_conversation_id", id)
}

function getOrCreateGuestId() {
  if (typeof window === "undefined") return ""
  const key = "sigma_support_guest_id"
  let id = localStorage.getItem(key)
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(key, id)
  }
  return id
}

const MessageBubble = ({
  role,
  content,
  time,
  status,
}: {
  role: "user" | "assistant"
  content: string
  time?: string
  status?: string
}) => (
  <div className={`flex flex-col ${role === "user" ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[75%]`}>
    <div
      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
        role === "user"
          ? "bg-[#004324] text-white rounded-br-sm font-medium"
          : "bg-white text-gray-800 border border-[#004324]/10 rounded-bl-sm"
      }`}
    >
      {content}
    </div>
    <div className="flex items-center gap-2 mt-1 px-1">
      {time && <span className="text-[10px] text-gray-400">{time}</span>}
      {role === "user" && status === "pending" && (
        <span className="text-[10px] text-amber-600 font-medium">Pending</span>
      )}
    </div>
  </div>
)

const TypingDots = () => (
  <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 w-16 p-3 rounded-2xl rounded-bl-sm shadow-sm">
    <span className="w-2 h-2 rounded-full bg-[#004324] animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="w-2 h-2 rounded-full bg-[#004324] animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="w-2 h-2 rounded-full bg-[#004324] animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
)

export default function ChatWidget() {
  const pathname = usePathname()
  const hideChat =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/sws-ops-k9m2x") ||
    pathname?.startsWith("/auth")

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const [showNudge, setShowNudge] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const knownIds = useRef<Set<string>>(new Set())

  const mapServerMessages = useCallback((list: SupportMessage[]): ChatMsg[] => {
    return list.map((m) => ({
      id: m.id,
      role: m.sender === "admin" ? "assistant" : "user",
      content: m.content,
      time: formatMsgTime(m.created_at),
      status: m.status,
    }))
  }, [])

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId
    setConnecting(true)
    try {
      const guestId = getOrCreateGuestId()
      const storedId = getStoredConversationId()
      const res = await fetch("/api/support/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          name: "Website Guest",
          conversationId: storedId || undefined,
        }),
      })
      if (!res.ok) throw new Error("Could not start support chat")
      const data = await res.json()
      const id = data.conversation?.id as string
      setConversationId(id)
      if (id) setStoredConversationId(id)
      const mapped = mapServerMessages(data.messages || [])
      knownIds.current = new Set(mapped.map((m) => m.id))
      setMessages(mapped)
      return id
    } finally {
      setConnecting(false)
    }
  }, [conversationId, mapServerMessages])

  // Live poll for admin replies + typing
  useEffect(() => {
    if (!open || !conversationId) return

    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch(`/api/support/conversations/${conversationId}?as=user`)
        if (!res.ok || cancelled) return
        const data = await res.json()
        const mapped = mapServerMessages(data.messages || [])
        setMessages(mapped)
        knownIds.current = new Set(mapped.map((m) => m.id))
        const typing = data.typing
        setPeerTyping(Boolean(typing && typing.role === "admin"))
      } catch {
        /* ignore transient poll errors */
      }
    }

    poll()
    const interval = setInterval(poll, 1500)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [open, conversationId, mapServerMessages])

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [open, messages, peerTyping])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("sigma-chat-open")
      window.dispatchEvent(new CustomEvent("sigma-chat-open", { detail: { open: true } }))
    } else {
      document.body.style.overflow = ""
      document.body.classList.remove("sigma-chat-open")
      window.dispatchEvent(new CustomEvent("sigma-chat-open", { detail: { open: false } }))
    }
    return () => {
      document.body.style.overflow = ""
      document.body.classList.remove("sigma-chat-open")
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false)
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

  const openChat = async () => {
    setOpen(true)
    try {
      await ensureConversation()
    } catch {
      setMessages([
        {
          id: "local-fallback",
          role: "assistant",
          content: "Support is temporarily unavailable. Please try again in a moment.",
          time: "Just now",
        },
      ])
    }
  }

  const sendTyping = (typing: boolean) => {
    if (!conversationId) return
    fetch(`/api/support/conversations/${conversationId}/typing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", typing, name: "Website Guest" }),
    }).catch(() => {})
  }

  const onInputChange = (value: string) => {
    setInput(value)
    if (!conversationId) return
    sendTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => sendTyping(false), 1200)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setLoading(true)
    setInput("")
    sendTyping(false)

    const optimistic: ChatMsg = {
      id: `local-${Date.now()}`,
      role: "user",
      content: text,
      time: formatMsgTime(new Date().toISOString()),
      status: "pending",
    }
    setMessages((m) => [...m, optimistic])

    try {
      const id = (await ensureConversation()) || conversationId
      if (!id) throw new Error("No conversation")

      const res = await fetch(`/api/support/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: "user", senderName: "Website Guest" }),
      })
      if (!res.ok) throw new Error("Failed to send")
      const data = await res.json()
      const saved = data.message as SupportMessage
      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => m.id !== optimistic.id)
        if (withoutOptimistic.some((m) => m.id === saved.id)) return withoutOptimistic
        return [
          ...withoutOptimistic,
          {
            id: saved.id,
            role: "user",
            content: saved.content,
            time: formatMsgTime(saved.created_at),
            status: saved.status || "pending",
          },
        ]
      })
      knownIds.current.add(saved.id)
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimistic.id),
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Message could not be delivered. Please check your connection and try again.",
          time: formatMsgTime(new Date().toISOString()),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (hideChat) return null

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            key="chat-fab"
            initial={{ opacity: 0, scale: 0.7, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed bottom-5 right-5 z-[50]"
          >
            <div className="relative">
              <button
                onClick={openChat}
                aria-label="Open support chat"
                className="h-14 w-14 rounded-full bg-[#004324] text-[#9fe870] hover:bg-[#003319] hover:scale-105 active:scale-95 shadow-[0_8px_30px_rgba(0,67,36,0.35)] flex items-center justify-center transition-all duration-200 group cursor-pointer border border-[#9fe870]/30 touch-manipulation"
              >
                <MessageCircle className="h-6 w-6 text-[#9fe870] group-hover:rotate-6 transition-transform" />
                <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9fe870] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#9fe870] border-2 border-[#004324]" />
                </span>
              </button>

              <AnimatePresence>
                {showNudge && (
                  <motion.div
                    initial={{ opacity: 0, x: 12, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.96 }}
                    className="absolute bottom-16 right-0 w-64 bg-white rounded-2xl p-3.5 shadow-2xl border border-[#004324]/10"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="full-chat-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] w-screen h-[100dvh] overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-[#004324]/35 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: "110%", scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "60%", scale: 0.98 }}
              transition={{ type: "spring", damping: 32, stiffness: 280, mass: 0.9 }}
              className="absolute inset-0 sm:inset-4 md:inset-8 lg:left-auto lg:right-8 lg:top-8 lg:bottom-8 lg:w-[440px] bg-[#f4f7f4] flex flex-col overflow-hidden sm:rounded-3xl shadow-[0_25px_80px_rgba(0,67,36,0.35)] border border-white/40"
            >
              <header className="bg-[#004324] text-white px-4 sm:px-6 py-3.5 sm:py-4 shadow-md flex items-center justify-between border-b border-[#9fe870]/20 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-black/30 flex items-center justify-center">
                      <BrandLogo size={36} className="rounded-lg" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#9fe870] border-2 border-[#004324] rounded-full" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">Sigmawealth</h2>
                    <p className="text-[11px] text-[#9fe870]/80 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870] animate-pulse" />
                      {peerTyping ? "Support is typing…" : connecting ? "Connecting…" : "Online · Live support"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-white/10 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="text-center py-2">
                    <span className="text-[11px] font-medium text-gray-400 bg-gray-200/50 px-3 py-1 rounded-full">
                      End-to-End Encrypted Support Channel
                    </span>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <MessageBubble
                        role={msg.role}
                        content={msg.content}
                        time={msg.time}
                        status={msg.status}
                      />
                    </div>
                  ))}

                  {(loading || peerTyping) && (
                    <div className="flex justify-start">
                      <TypingDots />
                    </div>
                  )}
                </div>
              </main>

              <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 py-3 shrink-0 shadow-lg pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <form
                  className="flex items-center gap-2 max-w-3xl mx-auto"
                  onSubmit={(e) => {
                    e.preventDefault()
                    send()
                  }}
                >
                  <input
                    ref={inputRef}
                    placeholder="Message Sigma Wealth support…"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    className="flex-1 bg-[#edefeb]/60 focus:bg-white text-sm px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#004324] text-gray-900 transition placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    className="w-11 h-11 rounded-2xl bg-[#004324] hover:bg-[#003319] text-[#9fe870] disabled:opacity-40 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
