import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f4]">
      <Navbar />
      <main className="flex-1 w-[95%] max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Terms & Conditions</h1>
          <p>These Terms govern your use of the SigmawealthSolution website and investment services.</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.
            If you do not agree, you may not use our services.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            SigmawealthSolution is an investment platform. Investors may contribute from a minimum of $100 with no
            maximum limit. Full return of investment is structured over one month, paid twice: 50% within the first
            two weeks, and 50% at the end of the month.
          </p>

          <h2>3. Investments & Payouts</h2>
          <ul>
            <li>Minimum investment: $100 USD (or equivalent).</li>
            <li>Maximum investment: unlimited.</li>
            <li>Payout schedule: 50% at ~2 weeks; 50% at month end.</li>
            <li>Payment methods may include Paystack (debit card / auto-debit) and Opay transfer.</li>
          </ul>

          <h2>4. User Accounts</h2>
          <p>
            To invest, you may need an account. You are responsible for keeping your login credentials secure and for
            all activity under your account. Notify us immediately of any unauthorized use.
          </p>

          <h2>5. User Conduct</h2>
          <p>You agree not to use our services for unlawful purposes, including fraud, unauthorized access, or abuse of payment systems.</p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content and materials on our services are the property of SigmawealthSolution or its licensors and are
            protected by applicable intellectual property laws.
          </p>

          <h2>7. Payments</h2>
          <p>
            By funding an investment, you authorize the selected payment method. Auto-debit plans continue monthly
            until you cancel them from your dashboard or by contacting support.
          </p>

          <h2>8. Disclaimer</h2>
          <p>
            Services are provided &quot;as is.&quot; Investing involves risk. Past or illustrated returns do not guarantee
            future results. Review all details carefully before investing.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, SigmawealthSolution shall not be liable for indirect, incidental,
            special, or consequential damages arising from your use of the services.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the services after changes are posted
            constitutes acceptance of the updated Terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these Terms? Reach us via the{" "}
            <a href="/contact" className="text-[#004324]">Contact</a> page.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
