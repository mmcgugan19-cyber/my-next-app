import { IntakeData } from '@/types/intake'
import { STATES } from '@/data/states'
import Button from '@/components/ui/Button'

interface StepProps {
  data: IntakeData
  onUpdate: (updates: Partial<IntakeData>) => void
  onNext: () => void
  onBack: () => void
}

export default function StepCompass({ data, onUpdate, onNext }: StepProps) {
  const isValid = data.state !== '' && data.dateOfDeath !== ''
  const selectedState = data.state ? STATES[data.state] : null

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Let&apos;s start with the basics
        </h2>
        <p className="mt-2 text-slate-600 text-lg">
          Estate laws vary by state. We need to know where and when to give you accurate guidance.
        </p>
      </div>

      <div className="space-y-6">
        {/* State */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            State where the deceased primarily resided
          </label>
          <select
            value={data.state}
            onChange={(e) => onUpdate({ state: e.target.value, county: '' })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
          >
            <option value="">Select a state...</option>
            {Object.values(STATES)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <option key={s.abbreviation} value={s.abbreviation}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>

        {/* State info hint */}
        {selectedState && (
          <div className="p-4 rounded-xl bg-navy-50 border border-navy-100 text-sm text-navy-800">
            <strong>{selectedState.name}</strong> small estate threshold:{' '}
            <strong>${selectedState.smallEstateLimit.toLocaleString()}</strong>
            {selectedState.notes && (
              <span className="block mt-1 text-navy-600">{selectedState.notes}</span>
            )}
          </div>
        )}

        {/* County */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            County <span className="text-slate-400 font-normal">(optional but recommended)</span>
          </label>
          <input
            type="text"
            value={data.county}
            onChange={(e) => onUpdate({ county: e.target.value })}
            placeholder="e.g., Cook County"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Date of Death */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date of passing
          </label>
          <input
            type="date"
            value={data.dateOfDeath}
            onChange={(e) => onUpdate({ dateOfDeath: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
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
