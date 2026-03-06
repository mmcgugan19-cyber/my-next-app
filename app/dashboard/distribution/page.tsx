'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Beneficiary, Estate } from '@/types/dashboard'
import Button from '@/components/ui/Button'

interface BeneficiaryForm {
  name: string
  relationship: string
  share_percentage: string
  share_description: string
  contact_email: string
  contact_phone: string
  notes: string
}

const EMPTY_FORM: BeneficiaryForm = {
  name: '',
  relationship: 'child',
  share_percentage: '',
  share_description: '',
  contact_email: '',
  contact_phone: '',
  notes: '',
}

const RELATIONSHIPS = [
  'Spouse',
  'Child',
  'Grandchild',
  'Sibling',
  'Parent',
  'Niece/Nephew',
  'Friend',
  'Charity',
  'Other',
]

export default function DistributionPage() {
  const router = useRouter()
  const [estate, setEstate] = useState<Estate | null>(null)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<BeneficiaryForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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

      if (!estates?.length) { router.push('/intake'); return }

      const est = estates[0] as Estate
      setEstate(est)

      const { data } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('estate_id', est.id)
        .order('created_at', { ascending: true })

      setBeneficiaries(data || [])
      if (!data?.length) setShowForm(true)
      setLoading(false)
    }

    loadData()
  }, [router])

  async function handleSave() {
    if (!estate || !form.name.trim()) return
    setSaving(true)

    const pct = form.share_percentage ? parseFloat(form.share_percentage) : null

    const payload = {
      estate_id: estate.id,
      name: form.name.trim(),
      relationship: form.relationship,
      share_percentage: pct,
      share_description: form.share_description.trim() || null,
      contact_email: form.contact_email.trim() || null,
      contact_phone: form.contact_phone.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('beneficiaries')
        .update(payload)
        .eq('id', editingId)
        .select()
        .single()

      if (!error && data) {
        setBeneficiaries(prev => prev.map(b => b.id === editingId ? data : b))
      }
    } else {
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert(payload)
        .select()
        .single()

      if (!error && data) {
        setBeneficiaries(prev => [...prev, data])
      }
    }

    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setSaving(false)
  }

  function startEdit(b: Beneficiary) {
    setForm({
      name: b.name,
      relationship: b.relationship,
      share_percentage: b.share_percentage != null ? String(b.share_percentage) : '',
      share_description: b.share_description || '',
      contact_email: b.contact_email || '',
      contact_phone: b.contact_phone || '',
      notes: b.notes || '',
    })
    setEditingId(b.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    await supabase.from('beneficiaries').delete().eq('id', id)
    setBeneficiaries(prev => prev.filter(b => b.id !== id))
  }

  if (loading) return null

  const totalShares = beneficiaries.reduce((sum, b) => sum + (b.share_percentage || 0), 0)
  const sharesWarning = beneficiaries.length > 0 && totalShares > 0 && totalShares !== 100

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in-up">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Distribution Planner</h1>
        <p className="mt-1 text-slate-600">
          {estate?.has_will
            ? 'Identify beneficiaries named in the will and track distribution.'
            : `No will — ${estate?.state_of_residence} intestacy laws determine distribution.`}
        </p>
      </div>

      {/* Intestacy notice */}
      {!estate?.has_will && (
        <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-amber-900">Intestacy Distribution</h3>
          <p className="mt-1 text-sm text-amber-800">
            Without a will, assets are distributed according to state law. Typically, the surviving
            spouse and children have priority. Add all surviving family members below so we can
            help you determine shares.
          </p>
        </div>
      )}

      {/* Summary */}
      {beneficiaries.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-1 p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500">Beneficiaries</p>
            <p className="text-lg font-bold text-slate-900">{beneficiaries.length}</p>
          </div>
          <div className={`flex-1 p-4 rounded-2xl border ${sharesWarning ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <p className="text-xs font-medium text-slate-500">Shares Allocated</p>
            <p className={`text-lg font-bold ${sharesWarning ? 'text-amber-700' : 'text-slate-900'}`}>
              {totalShares > 0 ? `${totalShares}%` : 'Not set'}
            </p>
          </div>
        </div>
      )}

      {sharesWarning && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          Share percentages total {totalShares}% — they should add up to 100%.
        </div>
      )}

      {/* Empty state */}
      {beneficiaries.length === 0 && !showForm && (
        <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center">
          <p className="text-slate-600 mb-4">
            {estate?.has_will
              ? 'Add the beneficiaries named in the will.'
              : 'Add surviving family members to determine intestacy shares.'}
          </p>
          <Button onClick={() => setShowForm(true)}>Add First Beneficiary</Button>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="font-semibold text-slate-900">
            {editingId ? 'Edit Beneficiary' : 'Add Beneficiary'}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Jane Smith"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
              <select
                value={form.relationship}
                onChange={(e) => setForm(prev => ({ ...prev, relationship: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r.toLowerCase()}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Share % (optional)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.share_percentage}
                onChange={(e) => setForm(prev => ({ ...prev, share_percentage: e.target.value }))}
                placeholder="e.g., 50"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Or describe share</label>
              <input
                type="text"
                value={form.share_description}
                onChange={(e) => setForm(prev => ({ ...prev, share_description: e.target.value }))}
                placeholder='e.g., "the family home"'
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="jane@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add Beneficiary'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Beneficiary List */}
      {beneficiaries.length > 0 && (
        <div className="space-y-2">
          {beneficiaries.map((b) => (
            <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{b.name}</p>
                  <p className="text-sm text-slate-500 capitalize">{b.relationship}</p>
                </div>
                <div className="text-right">
                  {b.share_percentage != null && (
                    <span className="text-lg font-bold text-slate-900">{b.share_percentage}%</span>
                  )}
                  {b.share_description && (
                    <p className="text-xs text-slate-500 mt-0.5">{b.share_description}</p>
                  )}
                </div>
              </div>
              {(b.contact_email || b.contact_phone) && (
                <div className="flex gap-4 mt-2 text-xs text-slate-400">
                  {b.contact_email && <span>{b.contact_email}</span>}
                  {b.contact_phone && <span>{b.contact_phone}</span>}
                </div>
              )}
              {b.notes && (
                <p className="text-xs text-slate-500 mt-2">{b.notes}</p>
              )}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button onClick={() => startEdit(b)} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                  Edit
                </button>
                <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      {!showForm && beneficiaries.length > 0 && (
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setEditingId(null) }}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
        >
          + Add Beneficiary
        </button>
      )}
    </div>
  )
}
