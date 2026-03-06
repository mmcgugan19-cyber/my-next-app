'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { STATES } from '@/data/states'
import type { Estate } from '@/types/dashboard'
import Pulse from '@/components/dashboard/Pulse'
import PillarCard from '@/components/dashboard/PillarCard'

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

  if (loading) return null // layout shows spinner

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
  const stateName = stateAbbr ? STATES[stateAbbr]?.name || estate.state_of_residence : estate.state_of_residence

  const legalStatus = (() => {
    const l = estate.legal_authority || {}
    if (l.letters_received) return 'Authority established'
    if (l.letters_applied) return 'Letters applied for'
    if (l.will_filed) return 'Will filed'
    if (l.will_located) return 'Will located'
    return 'Not started'
  })()

  return (
    <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Your Estate Dashboard
        </h1>
        <p className="mt-1 text-slate-600">
          Estate settlement for {stateName}
          {estate.county ? `, ${estate.county} County` : ''}
        </p>
      </div>

      {/* Pulse */}
      <Pulse estate={estate} progress={progress} />

      {/* Urgent Actions */}
      {estate.urgent_tasks.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Urgent Actions
          </h3>
          <div className="space-y-2">
            {estate.urgent_tasks.map((task, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 cursor-pointer group transition-all hover:shadow-sm"
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

      {/* Action Pillars */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Action Pillars</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <PillarCard
            title="Legal Authority"
            description="Establish your legal right to act on behalf of the estate"
            href="/dashboard/legal"
            started={legalStatus !== 'Not started'}
            status={legalStatus}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l9-3 9 3-9 3-9-3zm0 0v6m18-6v6M6 9v6c0 1.5 2.7 3 6 3s6-1.5 6-3V9" />
              </svg>
            }
          />
          <PillarCard
            title="The Inventory"
            description="Catalog and track all estate assets across categories"
            href="/dashboard/inventory"
            started={stats.assetCount > 0}
            status={stats.assetCount > 0 ? `${stats.assetCount} asset${stats.assetCount !== 1 ? 's' : ''} tracked` : 'Not started'}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
          <PillarCard
            title="The Debt Desk"
            description="Track and resolve funeral expenses, medical bills, and debts"
            href="/dashboard/debts"
            started={stats.debtCount > 0}
            status={stats.debtCount > 0 ? `${stats.debtCount} debt${stats.debtCount !== 1 ? 's' : ''} tracked` : 'Not started'}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
          <PillarCard
            title="Distribution Planner"
            description="Identify beneficiaries and plan asset distribution"
            href="/dashboard/distribution"
            started={stats.beneficiaryCount > 0}
            status={stats.beneficiaryCount > 0 ? `${stats.beneficiaryCount} beneficiar${stats.beneficiaryCount !== 1 ? 'ies' : 'y'} listed` : 'Not started'}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Document Locker */}
      <Link
        href="/dashboard/locker"
        className="block p-5 rounded-2xl border border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Document Locker</h3>
              <p className="text-sm text-slate-500">
                {stats.documentCount > 0
                  ? `${stats.documentsObtained} of ${stats.documentCount} documents obtained`
                  : 'Track death certificates, deeds, court filings, and more'}
              </p>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-slate-300 group-hover:text-cyan-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  )
}
