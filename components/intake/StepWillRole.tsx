import { IntakeData } from '@/types/intake'
import RadioCard from '@/components/ui/RadioCard'
import Button from '@/components/ui/Button'

interface StepProps {
  data: IntakeData
  onUpdate: (updates: Partial<IntakeData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepWillRole({ data, onUpdate, onNext, onBack }: StepProps) {
  const isValid =
    data.hasWill !== null && (data.hasWill === false || data.isNamedExecutor !== null)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
          The will and your role
        </h2>
        <p className="mt-2 text-slate-600 text-lg">
          This determines your legal authority and the specific process you&apos;ll follow.
        </p>
      </div>

      <div className="space-y-6">
        <RadioCard
          label="Is there a written will?"
          description="A will is a legal document that names an executor and describes how assets should be distributed."
          value={data.hasWill}
          onChange={(v) => {
            onUpdate({ hasWill: v, isNamedExecutor: v ? data.isNamedExecutor : null })
          }}
        />

        {data.hasWill === false && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <strong>What this means:</strong> Without a will, the estate follows your state&apos;s
            &quot;intestacy&quot; laws. You&apos;ll petition the court to be appointed as the{' '}
            <strong>Administrator</strong> of the estate, and assets will be distributed according to
            state law rather than the deceased&apos;s wishes.
          </div>
        )}

        {data.hasWill && (
          <RadioCard
            label="Are you named as the Executor in the will?"
            description="The executor is the person designated in the will to carry out its terms."
            value={data.isNamedExecutor}
            onChange={(v) => onUpdate({ isNamedExecutor: v })}
          />
        )}

        {data.hasWill && data.isNamedExecutor === false && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <strong>Note:</strong> If the named executor is unable or unwilling to serve, you may
            still petition the court to be appointed. We&apos;ll guide you through that process.
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
          See My Results
          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
