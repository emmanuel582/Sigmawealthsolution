/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production'
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://*.supabase.co",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://oauth2.googleapis.com http://127.0.0.1:4000 http://localhost:4000 https://*.onrender.com",
          "frame-src 'self' https://accounts.google.com https://*.supabase.co",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
        ].join('; '),
      },
    ]
    if (isProd) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      })
    }
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  async rewrites() {
    const api = (process.env.SIGMA_API_URL || process.env.NEXT_PUBLIC_SIGMA_API_URL || 'http://127.0.0.1:4000').replace(/\/$/, '')
    // Proxy investor/admin/auth/payment APIs to the Express backend.
    // Keep Next-native routes (/api/chat, /api/feedback) on Next.
    return [
      { source: '/api/health', destination: `${api}/health` },
      { source: '/api/config', destination: `${api}/api/config` },
      { source: '/api/banks', destination: `${api}/api/banks` },
      { source: '/api/verify-account', destination: `${api}/api/verify-account` },
      { source: '/api/auth/:path*', destination: `${api}/api/auth/:path*` },
      { source: '/api/investor/:path*', destination: `${api}/api/investor/:path*` },
      { source: '/api/flutterwave/:path*', destination: `${api}/api/flutterwave/:path*` },
      { source: '/api/opay/:path*', destination: `${api}/api/opay/:path*` },
      { source: '/api/admin/:path*', destination: `${api}/api/admin/:path*` },
      { source: '/api/payouts/:path*', destination: `${api}/api/payouts/:path*` },
    ]
  },
}

export default nextConfig
