import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { FUNDING_PLANS } from "@/lib/sigma/fundingPlans"
import { formatNaira } from "@/lib/sigma/utils"

export function FundingPlansSection() {
  return (
    <section
      id="funding-plans"
      aria-labelledby="funding-plans-heading"
      className="w-full scroll-mt-24 bg-[#f0f2f4] py-12 sm:py-16 md:py-24"
    >
      <div className="mx-auto w-[95%] max-w-[1080px] px-4 sm:px-6 md:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#004324]">
            Funding plans
          </p>
          <h2
            id="funding-plans-heading"
            className="text-2xl font-bold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl"
          >
            Choose your <span className="text-[#004324]">funding plan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">
            Five clear options for your next contribution. Choose a fixed amount
            when you fund your investment from your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6 lg:gap-6">
          {FUNDING_PLANS.map((plan, index) => (
            <article
              key={plan.id}
              className={`min-w-0 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-[#004324]/30 hover:shadow-md sm:col-span-2 sm:p-6 ${
                index === 4 ? "sm:col-start-2 lg:col-start-4" : ""
              } ${index === 3 ? "lg:col-start-2" : ""}`}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-700">Plan {index + 1}</h3>
                <span className="rounded-full bg-[#004324]/5 px-3 py-1 text-xs font-medium text-[#004324]">
                  Fixed amount
                </span>
              </div>
              <p className="whitespace-nowrap text-3xl font-bold tracking-tight text-[#004324] tabular-nums sm:text-[2rem]">
                {formatNaira(plan.amount)}
              </p>
              <p className="mt-1 text-sm text-gray-500">per top-up</p>

              <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[#004324]" />
                Full amount credited
              </div>
              <Link
                href="/auth/signup"
                aria-label={`Get started with the ${formatNaira(plan.amount)} funding plan`}
                className="group mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#004324] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#002f19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#004324]"
              >
                Get started
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-gray-600 sm:mt-8">
          Each top-up must match one plan exactly. You can choose a different plan
          for your next top-up.
        </p>
      </div>
    </section>
  )
}
