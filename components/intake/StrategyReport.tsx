import { IntakeData, StrategyResult } from '@/types/intake'
import { STATES } from '@/data/states'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface ReportProps {
  data: IntakeData
  onStartOver: () => void
}

function computeStrategy(data: IntakeData): StrategyResult {
  const stateInfo = STATES[data.state]

  const hasProbateAssets =
    data.ownsSoleRealEstate ||
    data.ownsSoleBankAccounts ||
    data.ownsSoleVehicles ||
    data.hasOtherProbateAssets

  const totalProbateValue =
    (data.ownsSoleRealEstate ? data.estRealEstate : 0) +
    (data.ownsSoleBankAccounts ? data.estBankAccounts : 0) +
    (data.ownsSoleVehicles ? data.estVehicles : 0) +
    (data.hasOtherProbateAssets ? data.estOtherAssets : 0)

  // Determine legal path
  let legalPath: StrategyResult['legalPath']
  if (!hasProbateAssets || totalProbateValue === 0) {
    legalPath = 'no-probate'
  } else if (data.ownsSoleRealEstate && !stateInfo?.realPropertyAllowed) {
    legalPath = 'formal-probate'
  } else if (!stateInfo || totalProbateValue >= stateInfo.smallEstateLimit) {
    legalPath = 'formal-probate'
  } else {
    legalPath = 'small-estate'
  }

  const role: StrategyResult['role'] = data.hasWill ? 'executor' : 'administrator'

  // Risk assessment
  const riskFactors: string[] = []
  if (data.hasActiveBusiness)
    riskFactors.push('Active business requires immediate continuity planning')
  if (!data.hasWill)
    riskFactors.push("No will — intestacy laws apply, which may not reflect the deceased's wishes")
  if (data.ownsSoleRealEstate)
    riskFactors.push('Real property in the estate may require formal court proceedings')
  if (totalProbateValue > 500000)
    riskFactors.push('High-value estate increases complexity and potential for disputes')
  if (data.hasVacantProperty)
    riskFactors.push('Vacant property poses ongoing security and insurance risks')

  let riskLevel: StrategyResult['riskLevel']
  if (riskFactors.length >= 3) riskLevel = 'high'
  else if (riskFactors.length >= 1) riskLevel = 'medium'
  else riskLevel = 'low'

  // Urgent actions (do today)
  const urgentActions: string[] = []
  if (data.hasVacantProperty)
    urgentActions.push(
      'Secure the vacant property — change locks, notify insurance of vacancy, forward mail'
    )
  if (data.hasPetsOrPerishables)
    urgentActions.push(
      'Arrange care for pets and remove perishable items from the home'
    )
  if (data.hasActiveBusiness)
    urgentActions.push(
      'Contact business partners about a continuity plan — payroll and vendor obligations may be due'
    )
  if (data.hasVehicleUnsecured)
    urgentActions.push('Move or secure vehicles to prevent towing or theft')

  // Immediate actions (week 1)
  const county = data.county ? `${data.county} County` : 'local'
  const immediateActions: string[] = [
    'Order 10-15 certified copies of the death certificate from the vital records office',
  ]
  if (data.hasWill) {
    immediateActions.push(`File the Will with the ${county} Probate Court`)
  } else {
    immediateActions.push(
      `Contact the ${county} Probate Court about opening intestacy proceedings`
    )
  }
  if (legalPath === 'small-estate') {
    immediateActions.push(
      `Prepare a Small Estate Affidavit (estate value under $${stateInfo?.smallEstateLimit.toLocaleString() ?? '—'})`
    )
  } else if (legalPath === 'formal-probate') {
    immediateActions.push(
      'Petition the Probate Court for Letters Testamentary (with will) or Letters of Administration (without will)'
    )
  }

  // Short-term actions (month 1)
  const shortTermActions: string[] = [
    'Notify the Social Security Administration of the death',
    'Notify banks and financial institutions — freeze or retitle accounts as needed',
    'Cancel or transfer utilities, subscriptions, and memberships',
    'Notify insurance companies (life, home, auto) and file claims where applicable',
  ]
  if (data.ownsSoleRealEstate) {
    shortTermActions.push(
      'Maintain mortgage payments and property insurance from estate funds'
    )
  }
  if (data.hasLifeInsurance) {
    shortTermActions.push(
      'File life insurance claims — beneficiaries should contact insurers directly'
    )
  }

  // Long-term actions (months 2-12)
  const longTermActions: string[] = []
  if (legalPath === 'formal-probate') {
    longTermActions.push(
      'Publish notice to creditors as required by state law (statutory waiting period applies)'
    )
    longTermActions.push('Prepare a complete estate inventory for the court')
  }
  if (data.ownsSoleRealEstate) {
    longTermActions.push(
      'Transfer or sell real property through the appropriate legal process'
    )
  }
  longTermActions.push("File the deceased's final federal and state income tax returns")
  longTermActions.push(
    'File estate tax return if required (2025 federal threshold: $13.61 million)'
  )
  longTermActions.push('Distribute remaining assets to beneficiaries or heirs per the will or state law')
  if (legalPath === 'formal-probate') {
    longTermActions.push(
      'File final accounting with the Probate Court and petition to close the estate'
    )
  }

  // Calculate first deadline
  let firstDeadline: StrategyResult['firstDeadline'] = null
  if (stateInfo?.willFilingDays && data.dateOfDeath) {
    const deathDate = new Date(data.dateOfDeath + 'T00:00:00')
    const dueDate = new Date(deathDate)
    dueDate.setDate(dueDate.getDate() + stateInfo.willFilingDays)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
    firstDeadline = {
      task: data.hasWill ? 'File Will with Probate Court' : 'Begin probate proceedings',
      dueDate: dueDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      daysRemaining: Math.max(0, daysRemaining),
    }
  }

  return {
    legalPath,
    role,
    totalProbateValue,
    stateThreshold: stateInfo?.smallEstateLimit ?? 0,
    stateName: stateInfo?.name ?? data.state,
    urgentActions,
    firstDeadline,
    riskLevel,
    riskFactors,
    immediateActions,
    shortTermActions,
    longTermActions,
  }
}

const pathLabels: Record<StrategyResult['legalPath'], { title: string; subtitle: string }> = {
  'no-probate': {
    title: 'Probate Likely Not Required',
    subtitle: 'Assets appear to pass outside of probate',
  },
  'small-estate': {
    title: 'Small Estate Affidavit',
    subtitle: 'Simplified process — no formal court hearing required',
  },
  'formal-probate': {
    title: 'Formal Probate',
    subtitle: 'Court-supervised process required',
  },
}

const riskColors = {
  low: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-800' },
  medium: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800' },
  high: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800' },
}

export default function StrategyReport({ data, onStartOver }: ReportProps) {
  const result = computeStrategy(data)
  const risk = riskColors[result.riskLevel]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Assessment Complete
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Your Estate Strategy Report
        </h2>
        <p className="mt-2 text-slate-600">
          Based on your answers, here&apos;s your personalized roadmap for {result.stateName}.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Legal Path */}
        <div
          className={`p-5 rounded-2xl border-2 ${
            result.legalPath === 'formal-probate'
              ? 'border-amber-200 bg-amber-50'
              : 'border-emerald-200 bg-emerald-50'
          }`}
        >
          <p className="text-sm font-medium text-slate-500 mb-1">Legal Path</p>
          <p
            className={`text-lg font-bold ${
              result.legalPath === 'formal-probate' ? 'text-amber-800' : 'text-emerald-800'
            }`}
          >
            {pathLabels[result.legalPath].title}
          </p>
          <p className="text-sm mt-1 text-slate-600">
            {pathLabels[result.legalPath].subtitle}
          </p>
        </div>

        {/* Your Role */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <p className="text-sm font-medium text-slate-500 mb-1">Your Role</p>
          <p className="text-lg font-bold text-slate-900 capitalize">{result.role}</p>
          <p className="text-sm mt-1 text-slate-600">
            {result.role === 'executor'
              ? 'Named in the will to manage the estate'
              : 'Court-appointed to manage the estate under intestacy law'}
          </p>
        </div>

        {/* Estate Value */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white">
          <p className="text-sm font-medium text-slate-500 mb-1">Estimated Probate Estate</p>
          <p className="text-lg font-bold text-slate-900">
            ${result.totalProbateValue.toLocaleString()}
          </p>
          <p className="text-sm mt-1 text-slate-600">
            {result.stateName} threshold: ${result.stateThreshold.toLocaleString()}
          </p>
        </div>

        {/* Risk Level */}
        <div className={`p-5 rounded-2xl border-2 ${risk.border} ${risk.bg}`}>
          <p className="text-sm font-medium text-slate-500 mb-1">Risk Assessment</p>
          <p className={`text-lg font-bold capitalize ${risk.text}`}>{result.riskLevel} Risk</p>
          <p className="text-sm mt-1 text-slate-600">
            {result.riskFactors.length} factor{result.riskFactors.length !== 1 ? 's' : ''}{' '}
            identified
          </p>
        </div>
      </div>

      {/* First Deadline */}
      {result.firstDeadline && (
        <div className="p-5 rounded-2xl bg-navy-50 border border-navy-200">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-navy-800 text-white flex flex-col items-center justify-center">
              <span className="text-xl font-bold leading-none">
                {result.firstDeadline.daysRemaining}
              </span>
              <span className="text-[10px] uppercase tracking-wide">days</span>
            </div>
            <div>
              <p className="font-semibold text-navy-900">{result.firstDeadline.task}</p>
              <p className="text-sm text-navy-700 mt-1">
                Due by {result.firstDeadline.dueDate}
                {result.firstDeadline.daysRemaining > 0
                  ? ` — ${result.firstDeadline.daysRemaining} days remaining`
                  : ' — This deadline may have passed. Act immediately.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Actions */}
      {result.urgentActions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Urgent — Do Today
          </h3>
          <div className="space-y-2">
            {result.urgentActions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100"
              >
                <span className="shrink-0 w-5 h-5 rounded-full border-2 border-red-300 mt-0.5" />
                <p className="text-sm text-red-900">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate Actions */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          Week 1 — First Steps
        </h3>
        <div className="space-y-2">
          {result.immediateActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="shrink-0 w-5 h-5 rounded-full border-2 border-cyan-300 mt-0.5" />
              <p className="text-sm text-slate-700">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Short Term */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          Month 1 — Build the Foundation
        </h3>
        <div className="space-y-2">
          {result.shortTermActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="shrink-0 w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5" />
              <p className="text-sm text-slate-700">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Long Term */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          Months 2–12 — Complete the Process
        </h3>
        <div className="space-y-2">
          {result.longTermActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
            >
              <span className="shrink-0 w-5 h-5 rounded-full border-2 border-slate-200 mt-0.5" />
              <p className="text-sm text-slate-700">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factors */}
      {result.riskFactors.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Risk Factors to Monitor</h3>
          <div className="space-y-2">
            {result.riskFactors.map((factor, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100"
              >
                <svg
                  className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-amber-900">{factor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer + Actions */}
      <div className="pt-6 border-t border-slate-200 space-y-6">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500">
          <strong className="text-slate-600">Disclaimer:</strong> This report provides general
          guidance based on the information you provided. It is not legal advice. Estate laws vary by
          jurisdiction and individual circumstances. State threshold data is approximate and may have
          been updated. We recommend consulting with a licensed attorney for complex estates.
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => window.print()}>
            <svg className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Report
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Return Home
            </Button>
          </Link>
          <Button variant="outline" onClick={onStartOver}>
            Start Over
          </Button>
        </div>
      </div>
    </div>
  )
}
