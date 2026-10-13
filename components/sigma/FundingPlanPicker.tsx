'use client';

import { useId } from 'react';
import { FUNDING_PLANS } from '@/lib/sigma/fundingPlans';
import { formatNaira } from '@/lib/sigma/utils';

export function FundingPlanPicker({ value, onChange, disabled = false, label = 'Choose a funding plan' }: {
  value: string; onChange: (amount: number) => void; disabled?: boolean; label?: string;
}) {
  const id = useId();
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-bold text-[#163300]">{label}</legend>
      <div className="grid grid-cols-2 gap-2.5">
        {FUNDING_PLANS.map((plan, index) => (
          <label key={plan.id} className="cursor-pointer">
            <input type="radio" name={`funding-plan-${id}`} value={plan.amount}
              checked={Number(value) === plan.amount} onChange={() => onChange(plan.amount)}
              className="peer sr-only" />
            <span className="flex flex-col gap-1 rounded-xl border border-[#163300]/15 bg-white px-3 py-3 text-[#163300] transition peer-checked:border-[#163300] peer-checked:bg-[#163300] peer-checked:text-[#9fe870] peer-focus-visible:ring-2 peer-focus-visible:ring-[#163300] peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Plan {index + 1}</span>
              <span className="text-sm sm:text-base font-bold tabular-nums">{formatNaira(plan.amount)}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="text-[11px] text-[#163300]/55">Each top-up must match one of these amounts exactly.</p>
    </fieldset>
  );
}
