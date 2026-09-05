import { NextRequest, NextResponse } from "next/server"
export const runtime = "nodejs"

function detectIntent(text: string, hint?: string) {
  const t = `${hint ?? ""} ${text}`.toLowerCase()
  if (t.includes("feedback")) return "feedback"
  if (t.includes("bug") || t.includes("issue") || t.includes("problem")) return "issue"
  if (t.includes("contact") || t.includes("owner") || t.includes("urgent")) return "contact"
  if (t.includes("guide") || t.includes("how") || t.includes("help")) return "guide"
  if (t.includes("lead") || t.includes("demo") || t.includes("pricing") || t.includes("invest")) return "lead"
  return "faq"
}

async function callGemini(systemPrompt: string, userText: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_UNAVAILABLE")
  }

  try {
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview:generateContent"

    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser: ${userText}` }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
        },
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response."
  } catch (e: any) {
    console.error("Gemini error", e?.message || e)
    return "I had trouble generating a response just now. Please try again."
  }
}

export async function POST(req: NextRequest) {
  const { message, intent: hinted } = await req.json()
  const text: string = String(message ?? "").slice(0, 4000)
  const enhancedText = `${hinted || ""} ${text}`.toLowerCase()
  let intent = detectIntent(enhancedText, hinted)

  if (enhancedText.includes("how to") || enhancedText.includes("how do i") || enhancedText.includes("tutorial")) {
    intent = "guide"
  } else if (enhancedText.match(/price|plan|pricing|invest|return|payout/)) {
    intent = "pricing"
  } else if (enhancedText.match(/feature|functionality|tool|capabilit|dashboard|paystack|opay/)) {
    intent = "feature"
  } else if (enhancedText.match(/new|start|begin|onboard/)) {
    intent = "onboarding"
  }

  const CONTACT_PAGE = "/contact"

  const siteMap = [
    { label: "Home", path: "/", description: "SigmawealthSolution landing page and investment overview" },
    { label: "About", path: "/about", description: "Learn about SigmawealthSolution" },
    { label: "Contact", path: CONTACT_PAGE, description: "Get help from our team" },
    { label: "Terms", path: "/terms", description: "Terms and conditions for investing" },
    { label: "Privacy", path: "/privacy", description: "Privacy policy" },
    { label: "Login", path: "/auth/login", description: "Sign in to your investor account" },
    { label: "Sign Up", path: "/auth/signup", description: "Create a new investor account" },
  ]

  const knowledge = `
  SigmawealthSolution is an investment platform.
  - Minimum investment: $100; maximum: unlimited
  - Full return of investment within one month
  - Payouts twice monthly: 50% in the first two weeks, 50% at month end
  - Payments: Paystack debit card, monthly auto-debit, or Opay transfer
  - Investor dashboard: total invested, next payment date, card details
  `

  const system = `You are the SigmawealthSolution AI assistant. Help users understand investing on the platform.
  Be concise (under 150 words), polite, and accurate.
  Knowledge:
  ${knowledge}
  Pages:
  ${siteMap.map((s) => `- ${s.label}: ${s.path}`).join("\n")}
  `

  const prefaceMap: Record<string, string> = {
    feedback: "The user wants to provide feedback about SigmawealthSolution. Be appreciative.",
    issue: "The user is reporting an issue. Ask for useful details.",
    contact: "The user wants to contact support. Point them to /contact.",
    guide: "The user needs guidance on investing with SigmawealthSolution.",
    faq: "Answer clearly about investments, payouts, and funding options.",
    lead: "The user may want to invest. Explain $100 minimum and twice-monthly payouts, then point to /auth/signup.",
    feature: "Explain relevant investment features clearly.",
    pricing: "Explain minimum $100, unlimited max, and the 50%/50% monthly payout schedule.",
    onboarding: "Welcome new investors and guide them to sign up.",
  }

  const preface = prefaceMap[intent] || prefaceMap.faq
  let reply: string
  try {
    reply = await callGemini(`${system}\n\nContext: ${preface}`, text)
  } catch (err: any) {
    if (String(err?.message) === "GEMINI_UNAVAILABLE") {
      return NextResponse.json(
        { intent, reply: "The assistant is temporarily unavailable. Please try again later or contact us at /contact." },
        { status: 200 }
      )
    }
    reply = "Something went wrong. Please try again or visit /contact."
  }

  return NextResponse.json({ intent, reply })
}
