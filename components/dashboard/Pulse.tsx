import { STATES } from '@/data/states'
import type { Estate } from '@/types/dashboard'

interface PulseProps {
  estate: Estate
  progress: number
}

export default function Pulse({ estate, progress }: PulseProps) {
  const stateAbbr = (estate.intake_data?.state as string) || ''
  const stateInfo = stateAbbr ? STATES[stateAbbr] : null

  let deadline: { task: string; dueDate: string; daysRemaining: number } | null = null
  if (stateInfo?.willFilingDays && estate.date_of_death) {
    const deathDate = new Date(estate.date_of_death + 'T00:00:00')
    const dueDate = new Date(deathDate)
    dueDate.setDate(dueDate.getDate() + stateInfo.willFilingDays)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    deadline = {
      task: estate.has_will ? 'File Will with Probate Court' : 'Begin probate proceedings',
      dueDate: dueDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      daysRemaining: Math.max(0, daysRemaining),
    }
  }

  const pathLabel: Record<string, string> = {
    'no-probate': 'No Probate',
    'small-estate': 'Small Estate',
    'formal-probate': 'Formal Probate',
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Estate Settlement Progress</h2>
          <span className="text-sm font-bold text-cyan-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Stat badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
            ${estate.total_value.toLocaleString()} est. value
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
            {pathLabel[estate.legal_path] ?? estate.legal_path}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 capitalize">
            {estate.executor_role}
          </span>
        </div>
      </div>

      {/* Next Deadline */}
      {deadline && (
        <div className={`p-5 rounded-2xl border ${
          deadline.daysRemaining <= 7
            ? 'border-red-200 bg-red-50'
            : deadline.daysRemaining <= 30
            ? 'border-amber-200 bg-amber-50'
            : 'border-navy-200 bg-navy-50'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
              deadline.daysRemaining <= 7
                ? 'bg-red-600 text-white'
                : deadline.daysRemaining <= 30
                ? 'bg-amber-600 text-white'
                : 'bg-navy-800 text-white'
            }`}>
              <span className="text-xl font-bold leading-none">
                {deadline.daysRemaining}
              </span>
              <span className="text-[10px] uppercase tracking-wide">days</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Next Critical Deadline</p>
              <p className="font-semibold text-slate-900">{deadline.task}</p>
              <p className="text-sm text-slate-600 mt-1">
                Due by {deadline.dueDate}
                {deadline.daysRemaining === 0 && ' — This deadline may have passed. Act immediately.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
