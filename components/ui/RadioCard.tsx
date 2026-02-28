interface RadioCardProps {
  label: string
  description?: string
  value: boolean | null
  onChange: (value: boolean) => void
}

export default function RadioCard({ label, description, value, onChange }: RadioCardProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
            value === true
              ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
            value === false
              ? 'border-cyan-600 bg-cyan-50 text-cyan-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          No
        </button>
      </div>
    </div>
  )
}
