'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { Debt, Estate } from '@/types/dashboard'
import { DEBT_CATEGORIES, DEBT_STATUSES } from '@/types/dashboard'
import NumberInput from '@/components/ui/NumberInput'
import Button from '@/components/ui/Button'

interface DebtForm {
  category: Debt['category']
  creditor: string
  amount: number
  due_date: string
  account_number: string
  notes: string
}

const EMPTY_FORM: DebtForm = {
  category: 'funeral',
  creditor: '',
  amount: 0,
  due_date: '',
  account_number: '',
  notes: '',
}

const STATUS_COLORS: Record<Debt['status'], string> = {
  unpaid: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-700',
  disputed: 'bg-amber-100 text-amber-700',
  negotiating: 'bg-blue-100 text-blue-700',
  forgiven: 'bg-slate-100 text-slate-600',
}

export default function DebtDeskPage() {
  const router = useRouter()
  const [estate, setEstate] = useState<Estate | null>(null)
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DebtForm>(EMPTY_FORM)
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
        .from('debts')
        .select('*')
        .eq('estate_id', est.id)
        .order('created_at', { ascending: true })

      setDebts(data || [])
      if (!data?.length) setShowForm(true)
      setLoading(false)
    }

    loadData()
  }, [router])

  async function handleSave() {
    if (!estate || !form.creditor.trim()) return
    setSaving(true)

    const payload = {
      estate_id: estate.id,
      category: form.category,
      creditor: form.creditor.trim(),
      amount: form.amount,
      due_date: form.due_date || null,
      account_number: form.account_number.trim() || null,
      notes: form.notes.trim() || null,
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('debts')
        .update(payload)
        .eq('id', editingId)
        .select()
        .single()

      if (!error && data) {
        setDebts(prev => prev.map(d => d.id === editingId ? data : d))
      }
    } else {
      const { data, error } = await supabase
        .from('debts')
        .insert(payload)
        .select()
        .single()

      if (!error && data) {
        setDebts(prev => [...prev, data])
      }
    }

    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setSaving(false)
  }

  function startEdit(debt: Debt) {
    setForm({
      category: debt.category,
      creditor: debt.creditor,
      amount: debt.amount,
      due_date: debt.due_date || '',
      account_number: debt.account_number || '',
      notes: debt.notes || '',
    })
    setEditingId(debt.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    await supabase.from('debts').delete().eq('id', id)
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  async function updateStatus(id: string, status: Debt['status']) {
    const { data } = await supabase
      .from('debts')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (data) setDebts(prev => prev.map(d => d.id === id ? data : d))
  }

  if (loading) return null

  const totalOwed = debts.reduce((sum, d) => sum + d.amount, 0)
  const totalPaid = debts.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0)
  const totalOutstanding = totalOwed - totalPaid

  const grouped = Object.entries(DEBT_CATEGORIES).map(([key, label]) => ({
    category: key as Debt['category'],
    label,
    items: debts.filter(d => d.category === key),
  })).filter(g => g.items.length > 0)

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in-up">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">The Debt Desk</h1>
        <p className="mt-1 text-slate-600">Track and resolve estate obligations.</p>
      </div>

      {/* Summary */}
      {debts.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500">Total Owed</p>
            <p className="text-lg font-bold text-slate-900">${totalOwed.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50">
            <p className="text-xs font-medium text-emerald-600">Paid</p>
            <p className="text-lg font-bold text-emerald-800">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50">
            <p className="text-xs font-medium text-red-600">Outstanding</p>
            <p className="text-lg font-bold text-red-800">${totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {debts.length === 0 && !showForm && (
        <div className="p-8 rounded-2xl border border-slate-200 bg-white text-center">
          <p className="text-slate-600 mb-4">No debts tracked yet. Common estate debts include:</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.values(DEBT_CATEGORIES).map((label) => (
              <span key={label} className="px-3 py-1 rounded-full bg-slate-50 text-xs text-slate-600 border border-slate-100">
                {label}
              </span>
            ))}
          </div>
          <Button onClick={() => setShowForm(true)}>Add First Debt</Button>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="font-semibold text-slate-900">
            {editingId ? 'Edit Debt' : 'Add Debt'}
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as Debt['category'] }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {Object.entries(DEBT_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Creditor</label>
              <input
                type="text"
                value={form.creditor}
                onChange={(e) => setForm(prev => ({ ...prev, creditor: e.target.value }))}
                placeholder="e.g., Memorial Hospital"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          <NumberInput
            label="Amount"
            value={form.amount}
            onChange={(v) => setForm(prev => ({ ...prev, amount: v }))}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due date (optional)</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account # (optional)</label>
              <input
                type="text"
                value={form.account_number}
                onChange={(e) => setForm(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Reference number"
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
            <Button onClick={handleSave} disabled={saving || !form.creditor.trim()}>
              {saving ? 'Saving...' : editingId ? 'Update Debt' : 'Add Debt'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Debt List */}
      {grouped.map((group) => (
        <div key={group.category}>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.items.map((debt) => (
              <div key={debt.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{debt.creditor}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-slate-700">
                        ${debt.amount.toLocaleString()}
                      </span>
                      {debt.due_date && (
                        <span className="text-xs text-slate-400">
                          Due {new Date(debt.due_date + 'T00:00:00').toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <select
                    value={debt.status}
                    onChange={(e) => updateStatus(debt.id, e.target.value as Debt['status'])}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[debt.status]}`}
                  >
                    {Object.entries(DEBT_STATUSES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                {debt.notes && (
                  <p className="text-xs text-slate-500 mt-2">{debt.notes}</p>
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => startEdit(debt)} className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(debt.id)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add button */}
      {!showForm && debts.length > 0 && (
        <button
          onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setEditingId(null) }}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
        >
          + Add Debt
        </button>
      )}

      {/* Guidance */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500">
        <strong className="text-slate-600">Note:</strong> Estate debts are generally paid from estate
        assets before distribution to beneficiaries. Beneficiaries are typically not personally
        responsible for the deceased&apos;s debts unless they co-signed.
      </div>
    </div>
  )
}
