import { IntakeData } from '@/types/intake'
import RadioCard from '@/components/ui/RadioCard'
import Button from '@/components/ui/Button'

interface StepProps {
  data: IntakeData
  onUpdate: (updates: Partial<IntakeData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepAssets({ data, onUpdate, onNext, onBack }: StepProps) {
  const isValid =
    data.hasLifeInsurance !== null &&
    data.hasBeneficiaryAccounts !== null &&
    data.hasJointProperty !== null &&
    data.ownsSoleRealEstate !== null &&
    data.ownsSoleBankAccounts !== null &&
    data.ownsSoleVehicles !== null &&
    data.hasOtherProbateAssets !== null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
          What did they own?
        </h2>
        <p className="mt-2 text-slate-600 text-lg">
          Not all assets go through probate. Let&apos;s sort out what does and what doesn&apos;t.
        </p>
      </div>

      {/* Non-Probate Assets */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Assets that typically pass automatically
          </h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          These usually go directly to the named beneficiary or co-owner — no court required.
        </p>
        <div className="space-y-5">
          <RadioCard
            label="Did they have life insurance policies?"
            description="Life insurance typically pays directly to named beneficiaries."
            value={data.hasLifeInsurance}
            onChange={(v) => onUpdate({ hasLifeInsurance: v })}
          />
          <RadioCard
            label="Were there retirement accounts (401k, IRA) or bank accounts with named beneficiaries?"
            description='Look for "Transfer on Death" (TOD) or "Payable on Death" (POD) designations.'
            value={data.hasBeneficiaryAccounts}
            onChange={(v) => onUpdate({ hasBeneficiaryAccounts: v })}
          />
          <RadioCard
            label="Did they own property jointly with a spouse or partner?"
            description="Jointly held property usually transfers automatically to the surviving co-owner."
            value={data.hasJointProperty}
            onChange={(v) => onUpdate({ hasJointProperty: v })}
          />
        </div>
      </div>

      {/* Probate Assets */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Assets that may require probate
          </h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          Assets solely in the deceased&apos;s name typically need to go through the legal process.
        </p>
        <div className="space-y-5">
          <RadioCard
            label="Did they own a home or land in their name only?"
            description="Real estate solely in the deceased's name typically requires probate to transfer."
            value={data.ownsSoleRealEstate}
            onChange={(v) => onUpdate({ ownsSoleRealEstate: v })}
          />
          <RadioCard
            label="Are there bank or investment accounts without a co-owner or beneficiary?"
            description="Accounts in their name only, without a POD/TOD designation."
            value={data.ownsSoleBankAccounts}
            onChange={(v) => onUpdate({ ownsSoleBankAccounts: v })}
          />
          <RadioCard
            label="Did they own vehicles in their name only?"
            description="Cars, boats, or other titled vehicles without a co-owner."
            value={data.ownsSoleVehicles}
            onChange={(v) => onUpdate({ ownsSoleVehicles: v })}
          />
          <RadioCard
            label="Are there other valuable assets in their name only?"
            description="Jewelry, art, collections, equipment, or other items of significant value."
            value={data.hasOtherProbateAssets}
            onChange={(v) => onUpdate({ hasOtherProbateAssets: v })}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          <svg className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Continue
          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
