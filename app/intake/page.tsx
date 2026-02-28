'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IntakeData, INITIAL_INTAKE_DATA } from '@/types/intake'
import ProgressBar from '@/components/ui/ProgressBar'
import StepCompass from '@/components/intake/StepCompass'
import StepSafety from '@/components/intake/StepSafety'
import StepAssets from '@/components/intake/StepAssets'
import StepThreshold from '@/components/intake/StepThreshold'
import StepWillRole from '@/components/intake/StepWillRole'
import StrategyReport from '@/components/intake/StrategyReport'

const STEP_LABELS = ['Location', 'Safety', 'Assets', 'Values', 'Will']

export default function IntakePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<IntakeData>(INITIAL_INTAKE_DATA)

  const updateData = (updates: Partial<IntakeData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startOver = () => {
    setCurrentStep(0)
    setData(INITIAL_INTAKE_DATA)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stepProps = { data, onUpdate: updateData, onNext: nextStep, onBack: prevStep }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-semibold text-slate-900">EstateIQ</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Save & Exit
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep < 5 && (
        <div className="border-b border-slate-100 bg-white">
          <div className="max-w-3xl mx-auto px-6 py-5">
            <ProgressBar
              currentStep={currentStep}
              totalSteps={5}
              labels={STEP_LABELS}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div key={currentStep} className="animate-fade-in-up">
          {currentStep === 0 && <StepCompass {...stepProps} />}
          {currentStep === 1 && <StepSafety {...stepProps} />}
          {currentStep === 2 && <StepAssets {...stepProps} />}
          {currentStep === 3 && <StepThreshold {...stepProps} />}
          {currentStep === 4 && <StepWillRole {...stepProps} />}
          {currentStep === 5 && <StrategyReport data={data} onStartOver={startOver} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white no-print">
        <div className="max-w-3xl mx-auto px-6 py-4 text-center text-xs text-slate-400">
          This tool provides general guidance only. It is not a substitute for legal, tax, or
          financial advice.
        </div>
      </footer>
    </div>
  )
}
