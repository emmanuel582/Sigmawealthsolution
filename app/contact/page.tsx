"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Mail, MapPin, Phone, User, Send, CheckCircle2 } from "lucide-react"

const CONTACT = {
  name: "Adetipe Adesanmi",
  phone: "+358 46 5560087",
  phoneHref: "tel:+358465560087",
  email: "hello@sigmawealthsolution.com",
  address: "Harmony Gold estate olonde, Lagos, Nigeria",
}

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSending(true)
    // Client-side only acknowledgement — form fields are not posted to third parties here
    await new Promise((r) => setTimeout(r, 600))
    setSending(false)
    setSent(true)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f4]">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0d1a12] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(159,232,112,0.12),_transparent_55%)]" />
          <div className="relative w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24">
            <p className="text-[#9fe870] text-sm font-semibold tracking-wide mb-3">Get in touch</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
              Contact SigmawealthSolution
            </h1>
            <p className="mt-4 text-white/65 text-base sm:text-lg max-w-xl leading-relaxed">
              Questions about investing, payouts, or your account? Reach our team directly — we respond promptly.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20">
          <div className="w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-2 space-y-4"
            >
              <div className="rounded-2xl bg-[#163300] text-white p-6 sm:p-8 space-y-6 shadow-xl">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Direct contact</h2>
                  <p className="text-white/55 text-sm mt-1">Primary support contact for investors</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-[#9fe870]" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold">Contact person</p>
                      <p className="font-semibold text-lg">{CONTACT.name}</p>
                    </div>
                  </div>

                  <a href={CONTACT.phoneHref} className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#9fe870]/20 transition">
                      <Phone className="w-5 h-5 text-[#9fe870]" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold">Phone / WhatsApp</p>
                      <p className="font-semibold text-lg group-hover:text-[#9fe870] transition">{CONTACT.phone}</p>
                    </div>
                  </a>

                  <a href={`mailto:${CONTACT.email}`} className="flex items-start gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#9fe870]/20 transition">
                      <Mail className="w-5 h-5 text-[#9fe870]" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold">Email</p>
                      <p className="font-medium break-all group-hover:text-[#9fe870] transition">{CONTACT.email}</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#9fe870]" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold">Office</p>
                      <p className="font-medium leading-relaxed">{CONTACT.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-[#163300]/8 p-5 text-sm text-[#163300]/70 leading-relaxed">
                Prefer live chat? Open the support bubble on any marketing page — messages reach our admin inbox in real time.
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="lg:col-span-3 rounded-2xl bg-white border border-[#163300]/8 p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#163300]">Send a message</h2>
                <p className="text-sm text-[#163300]/50 mt-1">We typically reply within one business day.</p>
              </div>

              {sent && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Message noted. For urgent matters call {CONTACT.phone}.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="Your full name" required maxLength={120} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required maxLength={180} className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="How can we help?" required maxLength={200} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Write your message…" rows={5} required maxLength={4000} className="rounded-xl" />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full h-12 rounded-xl bg-[#163300] hover:bg-[#0f2400] text-white font-semibold"
              >
                <Send className="w-4 h-4 mr-2" />
                {sending ? "Sending…" : "Send message"}
              </Button>
            </motion.form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
