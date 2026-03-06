'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Estate, LegalAuthority } from '@/types/dashboard'
import { INITIAL_LEGAL_AUTHORITY } from '@/types/dashboard'
import RadioCard from '@/components/ui/RadioCard'
import Button from '@/components/ui/Button'

export default function LegalAuthorityPage() {
  const router = useRouter()
  const [estate, setEstate] = useState<Estate | null>(null)
  const [legal, setLegal] = useState<LegalAuthority>(INITIAL_LEGAL_AUTHORITY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

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
        router.push('/intake')
        return
      }

      const est = estates[0] as Estate
      setEstate(est)

      const la = est.legal_authority
      const started = la && Object.keys(la).length > 0 && (
        la.will_located || la.will_filed || la.letters_applied ||
        la.letters_received || la.court_case_number || la.court_name
      )

      if (started) {
        setLegal({ ...INITIAL_LEGAL_AUTHORITY, ...la })
        setHasStarted(true)
      } else {
        // Pre-populate from Phase 1
        setLegal({
          ...INITIAL_LEGAL_AUTHORITY,
          will_located: est.has_will,
          court_name: est.county ? `${est.county} County Probate Court` : '',
        })
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  async function handleSave() {
    if (!estate) return
    setSaving(true)

    const { error } = await supabase
      .from('estates')
      .update({ legal_authority: legal })
      .eq('id', estate.id)

    if (!error) {
      setHasStarted(true)
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) return null

  const isFormView = !hasStarted || editing

  const pathLabel: Record<string, string> = {
    'no-probate': 'No Probate Required',
    'small-estate': 'Small Estate Affidavit',
    'formal-probate': 'Formal Probate',
  }

  const steps = [
    {
      label: estate?.has_will ? 'Will Located' : 'No Will (Intestacy)',
      done: legal.will_located || !estate?.has_will,
      skip: !estate?.has_will,
    },
    {
      label: 'Will Filed with Court',
      done: legal.will_filed,
      date: legal.will_filed_date,
      skip: !estate?.has_will || estate?.legal_path === 'no-probate',
    },
    {
      label: estate?.legal_path === 'small-estate' ? 'Affidavit Prepared' : 'Letters of Office Applied',
      done: legal.letters_applied,
      date: legal.letters_applied_date,
      skip: estate?.legal_path === 'no-probate',
    },
    {
      label: estate?.legal_path === 'small-estate' ? 'Affidavit Filed' : 'Letters of Office Received',
      done: legal.letters_received,
      date: legal.letters_received_date,
      skip: estate?.legal_path === 'no-probate',
    },
  ]

  function getNextStep(): string {
    if (!estate) return ''
    if (estate.legal_path === 'no-probate') {
      return 'No formal legal authority needed. Assets pass outside of probate.'
    }
    if (estate.has_will && !legal.will_located) {
      return 'Locate the original will. Check safe deposit boxes, attorney files, and the home.'
    }
    if (estate.has_will && !legal.will_filed) {
      return `File the will with ${legal.court_name || 'the local Probate Court'}. Most states require this within 30 days.`
    }
    if (!legal.letters_applied) {
      if (estate.legal_path === 'small-estate') {
        return `Prepare a Small Estate Affidavit. Your estate may qualify since it's under the state threshold.`
      }
      return `Apply for ${estate.has_will ? 'Letters Testamentary' : 'Letters of Administration'} at ${legal.court_name || 'the Probate Court'}.`
    }
    if (!legal.letters_received) {
      return 'Waiting for the court to issue your Letters. This typically takes 2-6 weeks.'
    }
    return 'Legal authority established. You can now act on behalf of the estate with institutions.'
  }

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in-up">
      {/* Back link */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Legal Authority</h1>
        <p className="mt-1 text-slate-600">
          {estate?.legal_path === 'no-probate'
            ? 'Your estate likely does not require formal probate.'
            : `Establish your legal right to manage this ${pathLabel[estate?.legal_path || ''] || ''} estate.`}
        </p>
      </div>

      {isFormView ? (
        /* ---- INTAKE / EDIT FORM ---- */
        <div className="space-y-6">
          {/* Will section */}
          {estate?.has_will && (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
              <h3 className="font-semibold text-slate-900">The Will</h3>
              <RadioCard
                label="Has the original will been located?"
                value={legal.will_located}
                onChange={(v) => setLegal(prev => ({ ...prev, will_located: v }))}
              />
              {legal.will_located && (
                <>
                  <RadioCard
                    label="Has the will been filed with the court?"
                    value={legal.will_filed}
                    onChange={(v) => setLegal(prev => ({ ...prev, will_filed: v }))}
                  />
                  {legal.will_filed && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date filed
                      </label>
                      <input
                        type="date"
                        value={legal.will_filed_date || ''}
                        onChange={(e) => setLegal(prev => ({ ...prev, will_filed_date: e.target.value || null }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!estate?.has_will && (
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50">
              <h3 className="font-semibold text-amber-900">Intestacy</h3>
              <p className="mt-1 text-sm text-amber-800">
                No will was identified. The estate will be distributed according to {estate?.state_of_residence} intestacy laws.
                You&apos;ll need to petition the court for Letters of Administration.
              </p>
            </div>
          )}

          {/* Letters of Office */}
          {estate?.legal_path !== 'no-probate' && (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
              <h3 className="font-semibold text-slate-900">
                {estate?.legal_path === 'small-estate' ? 'Small Estate Affidavit' : 'Letters of Office'}
              </h3>
              <RadioCard
                label={estate?.legal_path === 'small-estate'
                  ? 'Have you prepared the Small Estate Affidavit?'
                  : `Have you applied for ${estate?.has_will ? 'Letters Testamentary' : 'Letters of Administration'}?`}
                value={legal.letters_applied}
                onChange={(v) => setLegal(prev => ({ ...prev, letters_applied: v }))}
              />
              {legal.letters_applied && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date applied / prepared
                    </label>
                    <input
                      type="date"
                      value={legal.letters_applied_date || ''}
                      onChange={(e) => setLegal(prev => ({ ...prev, letters_applied_date: e.target.value || null }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <RadioCard
                    label={estate?.legal_path === 'small-estate'
                      ? 'Has the affidavit been accepted / filed?'
                      : 'Have you received the Letters?'}
                    value={legal.letters_received}
                    onChange={(v) => setLegal(prev => ({ ...prev, letters_received: v }))}
                  />
                  {legal.letters_received && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date received / filed
                      </label>
                      <input
                        type="date"
                        value={legal.letters_received_date || ''}
                        onChange={(e) => setLegal(prev => ({ ...prev, letters_received_date: e.target.value || null }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Court Info */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
            <h3 className="font-semibold text-slate-900">Court Information</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Court name</label>
              <input
                type="text"
                value={legal.court_name}
                onChange={(e) => setLegal(prev => ({ ...prev, court_name: e.target.value }))}
                placeholder="e.g., Cook County Probate Court"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Case number (if known)</label>
              <input
                type="text"
                value={legal.court_case_number}
                onChange={(e) => setLegal(prev => ({ ...prev, court_case_number: e.target.value }))}
                placeholder="e.g., 2026-P-001234"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={legal.notes}
              onChange={(e) => setLegal(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional notes about legal authority..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : hasStarted ? 'Update' : 'Save Progress'}
            </Button>
            {editing && (
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* ---- STATUS VIEW ---- */
        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white">
            <h3 className="font-semibold text-slate-900 mb-4">Progress</h3>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.skip ? (
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-xs text-slate-400">--</span>
                    </span>
                  ) : step.done ? (
                    <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full border-2 border-slate-200" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${step.done ? 'text-slate-900' : step.skip ? 'text-slate-400' : 'text-slate-600'}`}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-slate-500">{new Date(step.date + 'T00:00:00').toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Step Guidance */}
          <div className="p-5 rounded-2xl border border-cyan-200 bg-cyan-50">
            <p className="text-xs font-medium text-cyan-700 mb-1">What&apos;s Next</p>
            <p className="text-sm text-slate-800">{getNextStep()}</p>
          </div>

          {/* Court Info */}
          {(legal.court_name || legal.court_case_number) && (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <h3 className="font-semibold text-slate-900 mb-3">Court Information</h3>
              {legal.court_name && (
                <p className="text-sm text-slate-700"><span className="text-slate-500">Court:</span> {legal.court_name}</p>
              )}
              {legal.court_case_number && (
                <p className="text-sm text-slate-700 mt-1"><span className="text-slate-500">Case #:</span> {legal.court_case_number}</p>
              )}
            </div>
          )}

          {/* Notes */}
          {legal.notes && (
            <div className="p-5 rounded-2xl border border-slate-200 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{legal.notes}</p>
            </div>
          )}

          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit Legal Authority
          </Button>
        </div>
      )}
    </div>
  )
}
