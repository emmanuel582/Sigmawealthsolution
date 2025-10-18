import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ThemeProvider } from '@/components/theme-provider'
import ChatWidget from '@/components/chat-widget'
import { DropdownProvider } from '@/contexts/DropdownContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexTrend ',
  description: 'Created with NexTrend Team',
  generator: 'Nextrend Team',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DropdownProvider>
            {children}
            {/* Global website chatbot */}
            <ChatWidget />
          </DropdownProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
