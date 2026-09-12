import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "What is SigmawealthSolution?",
      answer:
        "SigmawealthSolution is an investment platform where you can invest from $100 to unlimited amounts and receive your full return of investment within one month — paid in two parts.",
    },
    {
      question: "How do payouts work?",
      answer:
        "Returns are paid twice every month: 50% of your deposit within the first two weeks, and the remaining 50% plus interest at month end.",
    },
    {
      question: "What is the minimum investment?",
      answer:
        "The minimum investment is $100. There is no maximum — you can invest as much as you want.",
    },
    {
      question: "How can I fund my investment?",
      answer:
        "You can pay with a debit card through Flutterwave (including optional monthly auto-debit), make a one-time payment, or transfer via Opay.",
    },
    {
      question: "What will I see in my investor dashboard?",
      answer:
        "You'll see total money invested, your next payment date, debit card details for transactions, and options for auto-debit or one-time deposits.",
    },
  ]

  return (
    <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden scroll-mt-16 bg-[#f0f2f4]">
      <div className="relative z-10 w-[95%] max-w-[1080px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-4 sm:mb-6">
            Questions about investing with us
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            Find answers about SigmawealthSolution returns, payouts, and funding options.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <AccordionTrigger className="text-base sm:text-lg font-semibold text-black hover:no-underline px-4 sm:px-6 py-4 sm:py-5 hover:bg-[#004324]/5 transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 px-4 sm:px-6 pb-4 sm:pb-5 leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
