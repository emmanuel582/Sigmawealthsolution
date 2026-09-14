import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import ChatWidget from '@/components/chat-widget'
import { DropdownProvider } from '@/contexts/DropdownContext'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'SigmawealthSolution | Smart Investing',
  description:
    'Invest from ₦100,000 with SigmawealthSolution. Full monthly returns — 25% paid every week for 4 weeks; week 4 includes your interest.',
  generator: 'SigmawealthSolution',
  icons: {
    icon: [{ url: '/images/logo.png', type: 'image/png' }],
    apple: [{ url: '/images/logo.png' }],
    shortcut: ['/images/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="bg-[#f0f2f4] antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <DropdownProvider>
              {children}
              <ChatWidget />
            </DropdownProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
