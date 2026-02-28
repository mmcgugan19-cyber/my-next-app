interface NumberInputProps {
  label: string
  description?: string
  value: number
  onChange: (value: number) => void
}

export default function NumberInput({ label, description, value, onChange }: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    onChange(parseInt(raw) || 0)
  }

  const formatted = value > 0 ? value.toLocaleString() : ''

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {description && <p className="text-sm text-slate-500 mb-2">{description}</p>}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
        <input
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          placeholder="0"
        />
      </div>
    </div>
  )
}
