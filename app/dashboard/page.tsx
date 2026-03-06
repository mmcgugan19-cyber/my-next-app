'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { STATES } from '@/data/states'
import type { Estate } from '@/types/dashboard'

interface PillarStats {
  assetCount: number
  assetsResolved: number
  debtCount: number
  debtsResolved: number
  beneficiaryCount: number
  beneficiariesAssigned: number
  documentCount: number
  documentsObtained: number
}

function computeProgress(estate: Estate, stats: PillarStats): number {
  let progress = 3

  const legal = estate.legal_authority || {}
  const skipWill = !estate.has_will
  const skipLetters = estate.legal_path === 'no-probate'

  if (legal.will_located || skipWill) progress += 5
  if (legal.will_filed || skipWill || skipLetters) progress += 5
  if (legal.letters_applied || skipLetters) progress += 7
  if (legal.letters_received || skipLetters) progress += 8

  if (stats.assetCount > 0) {
    progress += 7
    progress += Math.round((stats.assetsResolved / stats.assetCount) * 15)
  }

  if (stats.debtCount > 0) {
    progress += 7
    progress += Math.round((stats.debtsResolved / stats.debtCount) * 15)
  }

  if (stats.beneficiaryCount > 0) {
    progress += 6
    progress += Math.round((stats.beneficiariesAssigned / stats.beneficiaryCount) * 10)
  }

  if (stats.documentCount > 0) {
    progress += 4
    progress += Math.round((stats.documentsObtained / stats.documentCount) * 8)
  }

  return Math.min(progress, 100)
}

interface StepDef {
  key: string
  title: string
  href: string
  why: string
  tasks: string[]
  getStatus: () => { started: boolean; done: boolean; label: string }
}

export default function DashboardPage() {
  const router = useRouter()
  const [estate, setEstate] = useState<Estate | null>(null)
  const [stats, setStats] = useState<PillarStats>({
    assetCount: 0, assetsResolved: 0,
    debtCount: 0, debtsResolved: 0,
    beneficiaryCount: 0, beneficiariesAssigned: 0,
    documentCount: 0, documentsObtained: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showAssessment, setShowAssessment] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: estates } = await supabase
        .from('estates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!estates?.length) {
        setLoading(false)
        return
      }

      const est = estates[0] as Estate
      setEstate(est)

      const [
        { data: assets },
        { data: debts },
        { data: beneficiaries },
        { data: documents },
      ] = await Promise.all([
        supabase.from('assets').select('id, status').eq('estate_id', est.id),
        supabase.from('debts').select('id, status').eq('estate_id', est.id),
        supabase.from('beneficiaries').select('id, share_percentage, share_description').eq('estate_id', est.id),
        supabase.from('documents').select('id, status').eq('estate_id', est.id),
      ])

      setStats({
        assetCount: assets?.length ?? 0,
        assetsResolved: assets?.filter(a => ['transferred', 'closed'].includes(a.status)).length ?? 0,
        debtCount: debts?.length ?? 0,
        debtsResolved: debts?.filter(d => ['paid', 'forgiven'].includes(d.status)).length ?? 0,
        beneficiaryCount: beneficiaries?.length ?? 0,
        beneficiariesAssigned: beneficiaries?.filter(b => b.share_percentage != null || b.share_description).length ?? 0,
        documentCount: documents?.length ?? 0,
        documentsObtained: documents?.filter(d => ['obtained', 'filed'].includes(d.status)).length ?? 0,
      })

      setLoading(false)
    }

    loadData()
  }, [])

  const toggleUrgentTask = useCallback(async (index: number) => {
    if (!estate) return
    const tasks = [...estate.urgent_tasks]
    tasks[index] = { ...tasks[index], completed: !tasks[index].completed }
    setEstate(prev => prev ? { ...prev, urgent_tasks: tasks } : prev)
    await supabase.from('estates').update({ urgent_tasks: tasks }).eq('id', estate.id)
  }, [estate])

  if (loading) return null

  if (!estate) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-4">
        <p className="text-slate-600">No estate data found. Complete your initial assessment first.</p>
        <Link
          href="/intake"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-600 text-white font-medium px-6 py-3 hover:bg-cyan-700 transition-all"
        >
          Start Assessment
        </Link>
      </div>
    )
  }

  const progress = computeProgress(estate, stats)
  const stateAbbr = (estate.intake_data?.state as string) || ''
  const stateInfo = stateAbbr ? STATES[stateAbbr] : null
  const stateName = stateInfo?.name || estate.state_of_residence

  // Deadline
  let deadline: { task: string; dueDate: string; daysRemaining: number } | null = null
  if (stateInfo?.willFilingDays && estate.date_of_death) {
    const deathDate = new Date(estate.date_of_death + 'T00:00:00')
    const dueDate = new Date(deathDate)
    dueDate.setDate(dueDate.getDate() + stateInfo.willFilingDays)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    deadline = {
      task: estate.has_will ? 'File Will with Probate Court' : 'Begin probate proceedings',
      dueDate: dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      daysRemaining: Math.max(0, daysRemaining),
    }
  }

  // Roadmap steps
  const legal = estate.legal_authority || {}
  const legalDone = estate.legal_path === 'no-probate' || !!legal.letters_received
  const legalStarted = !!(legal.will_located || legal.will_filed || legal.letters_applied || legal.court_name)

  const steps: StepDef[] = [
    {
      key: 'legal',
      title: 'Establish Legal Authority',
      href: '/dashboard/legal',
      why: 'Before you can access bank accounts, sell property, or manage any estate assets, you need legal authority from the court.',
      tasks: estate.legal_path === 'no-probate'
        ? ['Confirm that probate is not required for your situation']
        : estate.legal_path === 'small-estate'
        ? ['Confirm will status', 'Prepare Small Estate Affidavit', 'File with the court']
        : ['Confirm will status and file with the court', `Apply for ${estate.has_will ? 'Letters Testamentary' : 'Letters of Administration'}`, 'Record your court case number'],
      getStatus: () => ({
        started: legalStarted,
        done: legalDone,
        label: legalDone ? 'Complete' : legalStarted ? 'In progress' : 'Not started',
      }),
    },
    {
      key: 'inventory',
      title: 'Catalog the Estate',
      href: '/dashboard/inventory',
      why: 'Create a complete inventory of everything the deceased owned — real estate, bank accounts, vehicles, and personal property.',
      tasks: ['Add each asset with its estimated value', 'Categorize by type (real estate, financial, vehicle, etc.)', 'Track status as you claim or transfer each asset'],
      getStatus: () => ({
        started: stats.assetCount > 0,
        done: stats.assetCount > 0 && stats.assetsResolved === stats.assetCount,
        label: stats.assetCount > 0 ? `${stats.assetCount} asset${stats.assetCount !== 1 ? 's' : ''} tracked` : 'Not started',
      }),
    },
    {
      key: 'debts',
      title: 'Settle Debts & Obligations',
      href: '/dashboard/debts',
      why: 'Estate debts must be paid before assets can be distributed. Catalog all outstanding obligations.',
      tasks: ['Add funeral expenses, medical bills, and credit cards', 'Record mortgage balances and utility bills', 'Track each debt as you pay or resolve it'],
      getStatus: () => ({
        started: stats.debtCount > 0,
        done: stats.debtCount > 0 && stats.debtsResolved === stats.debtCount,
        label: stats.debtCount > 0 ? `${stats.debtCount} debt${stats.debtCount !== 1 ? 's' : ''} tracked` : 'Not started',
      }),
    },
    {
      key: 'distribution',
      title: 'Plan the Distribution',
      href: '/dashboard/distribution',
      why: estate.has_will
        ? 'Identify the beneficiaries named in the will and track what each person receives.'
        : `Without a will, ${stateName} intestacy laws determine who inherits. List all surviving heirs.`,
      tasks: estate.has_will
        ? ['Add each beneficiary named in the will', 'Record their share (percentage or specific assets)', 'Track contact information']
        : ['Add all surviving family members', 'Determine intestacy shares under state law', 'Track contact information'],
      getStatus: () => ({
        started: stats.beneficiaryCount > 0,
        done: stats.beneficiaryCount > 0 && stats.beneficiariesAssigned === stats.beneficiaryCount,
        label: stats.beneficiaryCount > 0 ? `${stats.beneficiaryCount} beneficiar${stats.beneficiaryCount !== 1 ? 'ies' : 'y'}` : 'Not started',
      }),
    },
    {
      key: 'locker',
      title: 'Gather Documents',
      href: '/dashboard/locker',
      why: 'You\'ll need certified copies of key documents throughout this process — death certificates, deeds, court filings, and more.',
      tasks: ['Obtain 10-15 certified death certificates', 'Collect deeds, titles, and insurance policies', 'Track court filings and letters of office'],
      getStatus: () => ({
        started: stats.documentCount > 0,
        done: stats.documentCount > 0 && stats.documentsObtained === stats.documentCount,
        label: stats.documentCount > 0 ? `${stats.documentsObtained} of ${stats.documentCount} obtained` : 'Not started',
      }),
    },
  ]

  // Determine which step is the current "next" step
  const currentStepIndex = steps.findIndex(s => {
    const st = s.getStatus()
    return !st.done
  })

  const unfinishedUrgent = estate.urgent_tasks.filter(t => !t.completed)
  const hasUrgent = unfinishedUrgent.length > 0

  const pathLabel: Record<string, string> = {
    'no-probate': 'No Probate Required',
    'small-estate': 'Small Estate Affidavit',
    'formal-probate': 'Formal Probate',
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Welcome + Progress */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Welcome back. Let&apos;s keep going.
        </h1>
        <p className="mt-2 text-slate-600">
          We&apos;ll walk you through each step. Just follow the roadmap below.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-cyan-600 shrink-0">{progress}%</span>
        </div>
      </div>

      {/* Deadline Alert */}
      {deadline && deadline.daysRemaining <= 30 && (
        <div className={`p-4 rounded-2xl border flex items-start gap-4 ${
          deadline.daysRemaining <= 7
            ? 'border-red-200 bg-red-50'
            : 'border-amber-200 bg-amber-50'
        }`}>
          <div className={`shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
            deadline.daysRemaining <= 7 ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            <span className="text-lg font-bold leading-none">{deadline.daysRemaining}</span>
            <span className="text-[9px] uppercase tracking-wide">days</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{deadline.task}</p>
            <p className="text-sm text-slate-600 mt-0.5">
              Due by {deadline.dueDate}.
              {deadline.daysRemaining <= 7 ? ' Act immediately.' : ' Complete Step 1 below to address this.'}
            </p>
          </div>
        </div>
      )}

      {/* Urgent Actions */}
      {hasUrgent && (
        <div className="p-5 rounded-2xl border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="font-semibold text-red-900">Handle these first</h3>
          </div>
          <p className="text-sm text-red-800 mb-4">
            These need immediate attention to protect the estate and avoid liability.
          </p>
          <div className="space-y-2">
            {estate.urgent_tasks.map((task, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-red-100 cursor-pointer transition-all hover:bg-white"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleUrgentTask(i)}
                  className="peer sr-only"
                />
                <span className={`shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all border-red-300 ${task.completed ? 'bg-red-500 border-red-500' : ''}`}>
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <p className={`text-sm text-red-900 ${task.completed ? 'line-through opacity-60' : ''}`}>
                  {task.text}
                </p>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Your Next Step — Hero Card */}
      {currentStepIndex >= 0 && (() => {
        const step = steps[currentStepIndex]
        const status = step.getStatus()
        return (
          <div className="p-6 rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
            <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-2">
              Your Next Step — Step {currentStepIndex + 1} of {steps.length}
            </p>
            <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.why}</p>
            <div className="mt-4 space-y-1.5">
              {step.tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-700">{task}</p>
                </div>
              ))}
            </div>
            <Link
              href={step.href}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 text-white font-medium px-6 py-3 text-sm hover:bg-cyan-700 transition-all shadow-sm"
            >
              {status.started ? 'Continue This Step' : 'Start This Step'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )
      })()}

      {/* Roadmap */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Roadmap</h2>
        <div className="space-y-0">
          {steps.map((step, i) => {
            const status = step.getStatus()
            const isCurrent = i === currentStepIndex
            const isFuture = i > currentStepIndex && currentStepIndex >= 0

            return (
              <div key={step.key} className="relative flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                    status.done
                      ? 'bg-cyan-500 text-white'
                      : isCurrent
                      ? 'bg-cyan-600 text-white ring-4 ring-cyan-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {status.done ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-[24px] ${
                      status.done ? 'bg-cyan-300' : 'bg-slate-200'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <Link
                  href={step.href}
                  className={`flex-1 pb-6 group ${isFuture ? 'opacity-50' : ''}`}
                >
                  <div className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-cyan-200 bg-white shadow-sm'
                      : status.done
                      ? 'border-slate-100 bg-slate-50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${status.done ? 'text-slate-500' : 'text-slate-900'}`}>
                        {step.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          status.done
                            ? 'bg-cyan-100 text-cyan-700'
                            : status.started
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {status.label}
                        </span>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    {!status.done && !isFuture && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{step.why}</p>
                    )}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      {/* Collapsible Initial Assessment */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => setShowAssessment(!showAssessment)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Initial Assessment Summary</p>
              <p className="text-xs text-slate-500">{pathLabel[estate.legal_path]} in {stateName}</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${showAssessment ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAssessment && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-slate-500">Est. Value</p>
                <p className="text-sm font-semibold text-slate-900">${estate.total_value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Legal Path</p>
                <p className="text-sm font-semibold text-slate-900">{pathLabel[estate.legal_path]}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Your Role</p>
                <p className="text-sm font-semibold text-slate-900 capitalize">{estate.executor_role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Risk Level</p>
                <p className={`text-sm font-semibold capitalize ${
                  estate.risk_level === 'high' ? 'text-red-700' : estate.risk_level === 'medium' ? 'text-amber-700' : 'text-emerald-700'
                }`}>{estate.risk_level}</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              {stateName}{estate.county ? `, ${estate.county} County` : ''} — Assessment completed on {new Date(estate.created_at).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
