import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f0f2f4] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-200/80">
        <span className="text-6xl font-black text-[#004324]">404</span>
        <h2 className="text-2xl font-bold text-black mt-4 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-600 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full px-6 py-3 rounded-full bg-[#004324] text-white font-semibold text-sm hover:bg-[#002a18] transition-colors shadow-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
