import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from "next/image"

export function FAQSection() {
  const faqs = [
    {
      question: "What is NexTrend?",
      answer:
        "NexTrend is an AI-powered platform that identifies trending niches and topics across social media platforms like YouTube and TikTok. It helps creators, marketers, and businesses discover fast-rising trends before they go mainstream.",
    },
    {
      question: "How does NexTrend identify trends?",
      answer:
        "NexTrend uses advanced AI models to analyze vast amounts of data from social media platforms, identifying patterns and predicting emerging trends before they become widely popular.",
    },
    {
      question: "Which platforms does NexTrend support?",
      answer:
        "Currently, NexTrend supports YouTube and TikTok for trend identification and tracking. We plan to expand to more platforms in the future.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, we offer a free tier that allows you to generate one content idea per day. You can sign up for our newsletter to get started.",
    },
    {
      question: "How can I get personalized niche recommendations?",
      answer:
        "Our AI analyzes your content style and audience engagement to provide personalized niche recommendations directly within your user dashboard.",
    },
  ]

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden scroll-mt-16">
      {/* Background Image */}
      <Image
        src="/images/finance-management-hero-bg-scaled.png"
        alt="Finance Management Background"
        fill
        style={{ objectFit: 'contain' }}
        quality={100}
        className="absolute inset-0 z-0"
      />
      
      {/* Content */}
      <div className="relative z-10 w-[95%] max-w-[1080px] mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black mb-6">
            Here's to all your interesting questions
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Find answers to common questions about NexTrend.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <AccordionTrigger className="text-lg font-semibold text-black hover:no-underline px-6 py-5 hover:bg-[#004324]/5 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 px-6 pb-5 leading-relaxed">
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
