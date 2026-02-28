interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  labels: string[]
}

export default function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-200" />
        {/* Filled connector line */}
        <div
          className="absolute left-0 top-4 h-0.5 bg-cyan-600 transition-all duration-500 ease-out"
          style={{ width: currentStep === 0 ? '0%' : `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />

        {labels.map((label, i) => (
          <div key={label} className="relative flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-all duration-300 ${
                i < currentStep
                  ? 'bg-cyan-600 text-white'
                  : i === currentStep
                    ? 'bg-cyan-600 text-white ring-4 ring-cyan-100'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
              }`}
            >
              {i < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-xs mt-2 whitespace-nowrap hidden sm:block transition-colors ${
                i <= currentStep ? 'text-cyan-600 font-medium' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
