import { IntakeData } from '@/types/intake'
import RadioCard from '@/components/ui/RadioCard'
import Button from '@/components/ui/Button'

interface StepProps {
  data: IntakeData
  onUpdate: (updates: Partial<IntakeData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepSafety({ data, onUpdate, onNext, onBack }: StepProps) {
  const isValid =
    data.hasVacantProperty !== null &&
    data.hasVehicleUnsecured !== null &&
    data.hasPetsOrPerishables !== null &&
    data.hasActiveBusiness !== null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Immediate safety check
        </h2>
        <p className="mt-2 text-slate-600 text-lg">
          Before we look at finances, let&apos;s make sure nothing urgent needs attention right now.
        </p>
      </div>

      <div className="space-y-6">
        <RadioCard
          label="Is there a vacant home or property that needs to be secured?"
          description="An unoccupied home may need locks changed, insurance updated, or utilities managed."
          value={data.hasVacantProperty}
          onChange={(v) => onUpdate({ hasVacantProperty: v })}
        />
        {data.hasVacantProperty && (
          <div className="ml-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Tip:</strong> Securing the property is your first priority. Change the locks,
            notify the home insurance company of the vacancy, and consider having mail forwarded.
          </div>
        )}

        <RadioCard
          label="Are there vehicles parked on the street or in a public area?"
          description="Unattended vehicles may be towed or ticketed."
          value={data.hasVehicleUnsecured}
          onChange={(v) => onUpdate({ hasVehicleUnsecured: v })}
        />

        <RadioCard
          label="Are there pets or perishable items that need immediate attention?"
          value={data.hasPetsOrPerishables}
          onChange={(v) => onUpdate({ hasPetsOrPerishables: v })}
        />
        {data.hasPetsOrPerishables && (
          <div className="ml-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Tip:</strong> Arrange temporary care for pets right away. Remove perishable food
            to prevent damage to the home.
          </div>
        )}

        <RadioCard
          label="Did the deceased own or operate a business?"
          description="An active business may need immediate action to protect employees and operations."
          value={data.hasActiveBusiness}
          onChange={(v) => onUpdate({ hasActiveBusiness: v })}
        />
        {data.hasActiveBusiness && (
          <div className="ml-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Important:</strong> Contact any business partners immediately. Payroll, vendor
            payments, and client obligations may need to continue without interruption.
          </div>
        )}
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
