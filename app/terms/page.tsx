import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Link from "next/link"

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use our services.",
  },
  {
    title: "2. Description of Service",
    body: "SigmawealthSolution is an investment platform. Investors may contribute from a minimum of $100 with no maximum limit. Full return of investment is structured over one month, paid twice: 50% within the first two weeks, and 50% at the end of the month.",
  },
  {
    title: "3. Investments & Payouts",
    bullets: [
      "Minimum investment: $100 USD (or equivalent).",
      "Maximum investment: unlimited.",
      "Payout schedule: 50% of deposit at ~2 weeks; remaining 50% plus interest at month end.",
      "Payment methods may include Flutterwave (debit card / monthly auto-debit) and Opay transfer.",
      "Automatic payouts are sent to the local bank account you save in your dashboard.",
    ],
  },
  {
    title: "4. User Accounts",
    body: "To invest, you may need an account. You are responsible for keeping your login credentials secure and for all activity under your account. Notify us immediately of any unauthorized use.",
  },
  {
    title: "5. User Conduct",
    body: "You agree not to use our services for unlawful purposes, including fraud, unauthorized access, or abuse of payment systems.",
  },
  {
    title: "6. Intellectual Property",
    body: "All content and materials on our services are the property of SigmawealthSolution or its licensors and are protected by applicable intellectual property laws.",
  },
  {
    title: "7. Payments",
    body: "By funding an investment, you authorize the selected payment method. Auto-debit plans continue monthly until you cancel them from your dashboard or by contacting support. You must keep accurate bank details on file for payouts.",
  },
  {
    title: "8. Disclaimer",
    body: 'Services are provided "as is." Investing involves risk. Past or illustrated returns do not guarantee future results. Review all details carefully before investing.',
  },
  {
    title: "9. Limitation of Liability",
    body: "To the fullest extent permitted by law, SigmawealthSolution shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the services.",
  },
  {
    title: "10. Changes to Terms",
    body: "We may update these Terms from time to time. Continued use of the services after changes are posted constitutes acceptance of the updated Terms.",
  },
]

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f4]">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0d1a12] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(159,232,112,0.12),_transparent_55%)]" />
          <div className="relative w-[95%] max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <p className="text-[#9fe870] text-sm font-semibold tracking-wide mb-3">Legal</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Terms & Conditions</h1>
            <p className="mt-4 text-white/65 text-base sm:text-lg max-w-2xl leading-relaxed">
              These Terms govern your use of the SigmawealthSolution website and investment services.
            </p>
          </div>
        </section>

        <section className="py-10 sm:py-14 md:py-16">
          <div className="w-[95%] max-w-4xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-5">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl bg-[#163300] text-white p-6 sm:p-8 shadow-lg border border-white/5"
              >
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 sm:mb-4">{section.title}</h2>
                {section.body && (
                  <p className="text-white/80 leading-relaxed text-sm sm:text-base">{section.body}</p>
                )}
                {section.bullets && (
                  <ul className="mt-3 space-y-2.5">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3 text-sm sm:text-base text-white/80 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#9fe870] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}

            <article className="rounded-2xl bg-white border border-[#163300]/10 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-bold text-[#163300] mb-3">11. Contact</h2>
              <p className="text-[#163300]/75 text-sm sm:text-base leading-relaxed">
                Questions about these Terms? Contact{" "}
                <strong>Adetipe Adesanmi</strong> at{" "}
                <a href="tel:+358465560087" className="text-[#004324] font-semibold hover:underline">
                  +358 46 5560087
                </a>{" "}
                or visit our{" "}
                <Link href="/contact" className="text-[#004324] font-semibold hover:underline">
                  Contact
                </Link>{" "}
                page.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
