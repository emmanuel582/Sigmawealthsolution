import { NextRequest, NextResponse } from "next/server"
import type { Transporter } from "nodemailer"
export const runtime = "nodejs"

// Lazy import nodemailer to avoid SSR issues if not installed yet
async function getTransporter(): Promise<Transporter | null> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env as Record<string, string>
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null
  const nodemailer = await import("nodemailer")
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, description, type, severity } = await req.json()
    if (!name || !email || !description) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 })
    }

    const payload = {
      type: (type || "issue") as string,
      severity: severity === "urgent" ? "urgent" : "normal",
      name: String(name),
      email: String(email),
      description: String(description).slice(0, 4000),
      ts: new Date().toISOString(),
    }

    // Log server-side for observability
    console.log("feedback_entry", payload)

    // Prepare email content
    const FEEDBACK_TO = process.env.FEEDBACK_TO || process.env.CONTACT_EMAIL || ""
    const subjectPrefix = payload.severity === "urgent" ? "[URGENT] " : ""
    const subject = `${subjectPrefix}SigmawealthSolution ${payload.type} report from ${payload.name}`
    const text = `New ${payload.type} report\nSeverity: ${payload.severity}\nName: ${payload.name}\nEmail: ${payload.email}\nTime: ${payload.ts}\n\nDescription:\n${payload.description}`

    const transporter = await getTransporter()
    if (transporter && FEEDBACK_TO) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || payload.email,
        to: FEEDBACK_TO,
        subject,
        text,
      })
      return NextResponse.json({ ok: true, delivered: true })
    }

    // No SMTP configured: return a preview so you can see the composed email
    return NextResponse.json({ ok: true, delivered: false, preview: { to: FEEDBACK_TO || "(not set)", subject, text } })
  } catch (e: any) {
    console.error("feedback_error", e?.message || e)
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
