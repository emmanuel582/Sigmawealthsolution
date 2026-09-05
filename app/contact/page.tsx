"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageHeader } from "@/components/page-header"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion" // Import motion

export default function ContactPage() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const infoVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f4]">
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="Contact Us"
          description="Have questions or feedback? Reach out to us using the form below."
          imageUrl="/images/contact-header.jpeg"
        />

        <motion.section
          className="py-12 md:py-24 lg:py-32 bg-[#f0f2f4] dark:bg-gray-950 scroll-mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <div className="container px-4 md:px-6 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.form className="space-y-6" variants={formVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Send us a message</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 dark:text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your Name"
                    required
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 dark:text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@example.com"
                    required
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-gray-900 dark:text-white">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="Subject of your inquiry"
                  required
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-900 dark:text-white">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  rows={5}
                  required
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
                />
              </div>
              <Button type="submit" className="w-full bg-[#004324] hover:bg-[#00331c] text-white">
                Send Message
              </Button>
            </motion.form>

            <motion.div className="space-y-6" variants={infoVariants}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Location</h2>
              <p className="text-gray-700 dark:text-gray-300">
                SigmawealthSolution
                <br />
                Harmony Gold estate olonde
                <br />
                Nigeria
              </p>
              <div className="w-full h-[300px] rounded-lg overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.3000000000005!2d3.379205!3d6.596929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b9228b2222222%3A0x123456789abcdef!2sLagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SigmawealthSolution Location"
                ></iframe>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                For general inquiries, please email us at{" "}
                <a href="mailto:hello@sigmawealthsolution.com" className="text-[#004324] hover:underline">
                  hello@sigmawealthsolution.com
                </a>
                .
              </p>
            </motion.div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  )
}
