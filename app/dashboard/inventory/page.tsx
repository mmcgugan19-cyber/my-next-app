'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Asset, Estate } from '@/types/dashboard'
import { ASSET_CATEGORIES, ASSET_STATUSES } from '@/types/dashboard'
import NumberInput from '@/components/ui/NumberInput'
import Button from '@/components/ui/Button'

interface AssetForm {
  category: Asset['category']
  name: string
  estimated_value: number
  ownership_type: Asset['ownership_type']
  institution: string
  account_number: string
  notes: string
}

const EMPTY_FORM: AssetForm = {
  category: 'real_estate',
  name: '',
  estimated_value: 0,
  ownership_type: 'sole',
  institution: '',
  account_number: '',
  notes: '',
}

const STATUS_COLORS: Record<Asset['status'], string> = {
  identified: 'bg-slate-100 text-slate-700',
  valued: 'bg-blue-100 text-blue-700',
  claimed: 'bg-amber-100 text-amber-700',
  transferred: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-500',
}

export default function InventoryPage() {
  const router = useRouter()
  const [estate, setEstate] = useState<Estate | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AssetForm>(EMPTY_FORM)
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
        .from('assets')
        .select('*')
        .eq('estate_id', est.id)
        .order('created_at', { ascending: true })

      setAssets(data || [])
      if (!data?.length) setShowForm(true)
      setLoading(false)
    }

    loadData()
  }, [router])

  function getSuggestions(): { category: Asset['category']; name: string; value: number }[] {
    if (!estate) return []
    const intake = estate.intake_data
    const suggestions: { category: Asset['category']; name: string; value: number }[] = []

    if (intake.ownsSoleRealEstate)
      suggestions.push({ category: 'real_estate', name: 'Real Estate Property', value: Number(intake.estRealEstate) || 0 })
    if (intake.ownsSoleBankAccounts)
      suggestions.push({ category: 'financial', name: 'Bank Account(s)', value: Number(intake.estBankAccounts) || 0 })
    if (intake.ownsSoleVehicles)
      suggestions.push({ category: 'vehicle', name: 'Vehicle(s)', value: Number(intake.estVehicles) || 0 })
    if (intake.hasOtherProbateAssets)
      suggestions.push({ category: 'personal_property', name: 'Personal Property', value: Number(intake.estOtherAssets) || 0 })
    if (intake.hasLifeInsurance)
      suggestions.push({ category: 'financial', name: 'Life Insurance Policy', value: 0 })
    if (intake.hasBeneficiaryAccounts)
      suggestions.push({ category: 'financial', name: 'Beneficiary Accounts (POD/TOD)', value: 0 })
    if (intake.hasJointProperty)
      suggestions.push({ category: 'real_estate', name: 'Joint Property', value: 0 })

    return suggestions
  }

  function prefillFromSuggestion(s: { category: Asset['category']; name: string; value: number }) {
    setForm({
      ...EMPTY_FORM,
      category: s.category,
      name: s.name,
      estimated_value: s.value,
    })
    setEditingId(null)
    setShowForm(true)
  }

  async function handleSave() {
    if (!estate || !form.name.trim()) return
    setSaving(true)

    const payload = {
      estate_id: estate.id,
      category: form.category,
      name: form.name.trim(),
      estimated_value: form.estimated_value,
      ownership_type: form.ownership_type,
      institution: form.institution.trim() || null,
      account_number: form.account_number.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('assets')
        .update(payload)
        .eq('id', editingId)
        .select()
        .single()

      if (!error && data) {
        setAssets(prev => prev.map(a => a.id === editingId ? data : a))
      }
    } else {
      const { data, error } = await supabase
        .from('assets')
        .insert(payload)
        .select()
        .single()

      if (!error && data) {
        setAssets(prev => [...prev, data])
      }
    }

    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setSaving(false)
  }

  function startEdit(asset: Asset) {
    setForm({
      category: asset.category,
      name: asset.name,
      estimated_value: asset.estimated_value,
      ownership_type: asset.ownership_type,
      institution: asset.institution || '',
      account_number: asset.account_number || '',
      notes: asset.notes || '',
    })
    setEditingId(asset.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    await supabase.from('assets').delete().eq('id', id)
    setAssets(prev => prev.filter(a => a.id !== id))
  }

  async function updateStatus(id: string, status: Asset['status']) {
    const { data } = await supabase
      .from('assets')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (data) setAssets(prev => prev.map(a => a.id === id ? data : a))
  }

  if (loading) return null

  const totalValue = assets.reduce((sum, a) => sum + a.estimated_value, 0)
  const grouped = Object.entries(ASSET_CATEGORIES).map(([key, label]) => ({
    category: key as Asset['category'],
    label,
    items: assets.filter(a => a.category === key),
  })).filter(g => g.items.length > 0)

  const suggestions = getSuggestions().filter(
    s => !assets.some(a => a.name === s.name && a.category === s.category)
  )

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in-up">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">The Inventory</h1>
        <p className="mt-1 text-slate-600">Catalog and track all estate assets.</p>
      </div>

      {/* Summary */}
      {assets.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-1 p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500">Total Assets</p>
            <p className="text-lg font-bold text-slate-900">{assets.length}</p>
          </div>
          <div className="flex-1 p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500">Estimated Value</p>
            <p className="text-lg font-bold text-slate-900">${totalValue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Suggestions from Phase 1 */}
      {assets.length === 0 && suggestions.length > 0 && (
        <div className="p-5 rounded-2xl border border-cyan-200 bg-cyan-50">
          <p className="text-sm font-medium text-cyan-800 mb-3">
            Based on your initial assessment, you may have these assets:
          </p>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => prefillFromSuggestion(s)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-cyan-100 text-left hover:border-cyan-300 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500">{ASSET_CATEGORIES[s.category]}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.value > 0 && (
                    <span className="text-sm text-slate-600">${s.value.toLocaleString()}</span>
                  )}
                  <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="font-semibold text-slate-900">
            {editingId ? 'Edit Asset' : 'Add Asset'}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as Asset['category'] }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {Object.entries(ASSET_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ownership</label>
              <select
                value={form.ownership_type || 'sole'}
                onChange={(e) => setForm(prev => ({ ...prev, ownership_type: e.target.value as Asset['ownership_type'] }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="sole">Sole (Deceased only)</option>
                <option value="joint">Joint ownership</option>
                <option value="trust">In a trust</option>
                <option value="beneficiary">Has beneficiary (POD/TOD)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name / Description</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., 123 Main St or Chase Savings Account"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <NumberInput
            label="Estimated Value"
            value={form.estimated_value}
            onChange={(v) => setForm(prev => ({ ...prev, estimated_value: v }))}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Institution (optional)</label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => setForm(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="e.g., Chase Bank"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account # (optional)</label>
              <input
                type="text"
                value={form.account_number}
                onChange={(e) => setForm(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Last 4 digits"
                maxLength={4}
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
              {saving ? 'Saving...' : editingId ? 'Update Asset' : 'Add Asset'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Asset List */}
      {grouped.map((group) => (
        <div key={group.category}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.items.map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{asset.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600">
                        ${asset.estimated_value.toLocaleString()}
                      </span>
                      {asset.institution && (
                        <span className="text-xs text-slate-400">
                          {asset.institution}
                          {asset.account_number ? ` ****${asset.account_number}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <select
                      value={asset.status}
                      onChange={(e) => updateStatus(asset.id, e.target.value as Asset['status'])}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[asset.status]}`}
                    >
                      {Object.entries(ASSET_STATUSES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {asset.notes && (
                  <p className="text-xs text-slate-500 mt-2">{asset.notes}</p>
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => startEdit(asset)}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setEditingId(null) }}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
        >
          + Add Asset
        </button>
      )}
    </div>
  )
}
