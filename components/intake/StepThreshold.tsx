import { IntakeData } from '@/types/intake'
import { STATES } from '@/data/states'
import NumberInput from '@/components/ui/NumberInput'
import Button from '@/components/ui/Button'

interface StepProps {
  data: IntakeData
  onUpdate: (updates: Partial<IntakeData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepThreshold({ data, onUpdate, onNext, onBack }: StepProps) {
  const stateInfo = data.state ? STATES[data.state] : null
  const hasProbateAssets =
    data.ownsSoleRealEstate ||
    data.ownsSoleBankAccounts ||
    data.ownsSoleVehicles ||
    data.hasOtherProbateAssets

  const total =
    (data.ownsSoleRealEstate ? data.estRealEstate : 0) +
    (data.ownsSoleBankAccounts ? data.estBankAccounts : 0) +
    (data.ownsSoleVehicles ? data.estVehicles : 0) +
    (data.hasOtherProbateAssets ? data.estOtherAssets : 0)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Estimate the value
        </h2>
        <p className="mt-2 text-slate-600 text-lg">
          {hasProbateAssets
            ? "Rough estimates are fine — we just need to determine which legal path applies to your situation."
            : "Based on your answers, there may not be significant probate assets."}
        </p>
      </div>

      {hasProbateAssets ? (
        <div className="space-y-6">
          {data.ownsSoleRealEstate && (
            <NumberInput
              label="Real estate (home, land)"
              description="Approximate market value of property in their name only."
              value={data.estRealEstate}
              onChange={(v) => onUpdate({ estRealEstate: v })}
            />
          )}
          {data.ownsSoleBankAccounts && (
            <NumberInput
              label="Bank & investment accounts"
              description="Total balance of accounts without a co-owner or beneficiary."
              value={data.estBankAccounts}
              onChange={(v) => onUpdate({ estBankAccounts: v })}
            />
          )}
          {data.ownsSoleVehicles && (
            <NumberInput
              label="Vehicles"
              description="Approximate value of cars, boats, or other titled vehicles."
              value={data.estVehicles}
              onChange={(v) => onUpdate({ estVehicles: v })}
            />
          )}
          {data.hasOtherProbateAssets && (
            <NumberInput
              label="Other valuable assets"
              description="Jewelry, collections, equipment, or other items of significant value."
              value={data.estOtherAssets}
              onChange={(v) => onUpdate({ estOtherAssets: v })}
            />
          )}

          {/* Running total & threshold comparison */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium text-slate-600">Estimated Probate Estate</span>
              <span className="text-2xl font-bold text-slate-900">
                ${total.toLocaleString()}
              </span>
            </div>
            {stateInfo && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    {stateInfo.name} small estate limit
                  </span>
                  <span className="font-medium text-slate-700">
                    ${stateInfo.smallEstateLimit.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3">
                  {total < stateInfo.smallEstateLimit ? (
                    <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      May qualify for simplified process
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Formal probate likely required
                    </span>
                  )}
                </div>
                {data.ownsSoleRealEstate && !stateInfo.realPropertyAllowed && total < stateInfo.smallEstateLimit && (
                  <p className="mt-3 text-sm text-amber-700">
                    Note: In {stateInfo.name}, real property typically cannot pass through a small estate affidavit
                    and may require formal probate regardless of total value.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-emerald-800 font-medium">
                No significant probate assets identified
              </p>
              <p className="text-emerald-700 text-sm mt-1">
                Based on your previous answers, the estate may not require formal probate.
                We&apos;ll confirm this in your strategy report.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          <svg className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
