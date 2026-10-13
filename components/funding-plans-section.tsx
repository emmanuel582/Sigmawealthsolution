import Link from 'next/link';
import { FUNDING_PLANS } from '@/lib/sigma/fundingPlans';
import { formatNaira } from '@/lib/sigma/utils';

export function FundingPlansSection() {
  return (
    <section id="funding-plans" className="bg-white py-12 sm:py-16 scroll-mt-24">
      <div className="mx-auto w-[95%] max-w-[1080px] px-4 sm:px-6 md:px-8">
        <div className="mb-7 max-w-xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#163300]/60">Funding plans</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#163300]">Pick your exact top-up.</h2>
          <p className="mt-3 text-sm sm:text-base text-[#163300]/65">Choose from five fixed plans. The amount you select is the amount credited to your investment.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FUNDING_PLANS.map((plan,index) => (
            <article key={plan.id} className="flex flex-col rounded-2xl border border-[#163300]/10 bg-[#f5f7f3] p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#163300]/50">Plan {index + 1}</p>
              <h3 className="mt-3 text-xl font-bold tracking-tight text-[#163300] tabular-nums">{formatNaira(plan.amount)}</h3>
              <p className="mt-2 mb-5 text-xs text-[#163300]/55">Exact contribution amount</p>
              <Link href="/auth/signup" className="mt-auto rounded-lg bg-[#163300] px-3 py-2.5 text-center text-xs font-bold text-[#9fe870] hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#163300]" aria-label="Create an account to choose your funding plan">Get started</Link>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#163300]/55">Funding is available only at ₦64,000, ₦98,550, ₦135,000, ₦540,000, and ₦2,160,000. Custom amounts are unavailable.</p>
      </div>
    </section>
  );
}
