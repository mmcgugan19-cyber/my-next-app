'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import type { EstateDocument, Estate } from '@/types/dashboard'
import { DOC_STATUSES } from '@/types/dashboard'
import Button from '@/components/ui/Button'

function getRequiredDocuments(estate: Estate): { doc_type: EstateDocument['doc_type']; name: string }[] {
  const docs: { doc_type: EstateDocument['doc_type']; name: string }[] = [
    { doc_type: 'death_certificate', name: 'Death Certificate (10-15 certified copies)' },
  ]
  const intake = estate.intake_data

  if (estate.has_will) {
    docs.push({ doc_type: 'will', name: 'Last Will and Testament' })
  }

  if (estate.legal_path === 'formal-probate') {
    docs.push({ doc_type: 'court_filing', name: 'Petition for Probate' })
    docs.push({ doc_type: 'letters_of_office', name: 'Letters Testamentary / Administration' })
  }

  if (estate.legal_path === 'small-estate') {
    docs.push({ doc_type: 'affidavit', name: 'Small Estate Affidavit' })
  }

  if (intake.ownsSoleRealEstate || intake.hasJointProperty) {
    docs.push({ doc_type: 'deed', name: 'Property Deed(s)' })
  }
  if (intake.ownsSoleVehicles) {
    docs.push({ doc_type: 'title', name: 'Vehicle Title(s)' })
  }
  if (intake.hasLifeInsurance) {
    docs.push({ doc_type: 'insurance_policy', name: 'Life Insurance Policy' })
  }

  docs.push({ doc_type: 'bank_statement', name: 'Bank / Financial Statements (last 3 months)' })
  docs.push({ doc_type: 'tax_return', name: 'Tax Returns (last 2 years)' })

  return docs
}

const STATUS_COLORS: Record<EstateDocument['status'], string> = {
  needed: 'bg-red-100 text-red-700',
  obtained: 'bg-emerald-100 text-emerald-700',
  filed: 'bg-cyan-100 text-cyan-700',
  not_applicable: 'bg-slate-100 text-slate-500',
}

interface DocForm {
  doc_type: EstateDocument['doc_type']
  name: string
  notes: string
}

const EMPTY_FORM: DocForm = {
  doc_type: 'other',
  name: '',
  notes: '',
}

const DOC_TYPES: Record<EstateDocument['doc_type'], string> = {
  death_certificate: 'Death Certificate',
  will: 'Will',
  trust: 'Trust Document',
  deed: 'Property Deed',
  title: 'Vehicle Title',
  insurance_policy: 'Insurance Policy',
  bank_statement: 'Bank Statement',
  tax_return: 'Tax Return',
  court_filing: 'Court Filing',
  letters_of_office: 'Letters of Office',
  affidavit: 'Affidavit',
  other: 'Other',
}

export default function LockerPage() {
  const router = useRouter()
  const [estate, setEstate] = useState<Estate | null>(null)
  const [documents, setDocuments] = useState<EstateDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<DocForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

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
        .from('documents')
        .select('*')
        .eq('estate_id', est.id)
        .order('created_at', { ascending: true })

      if (data && data.length > 0) {
        setDocuments(data)
      } else {
        // Auto-seed document checklist on first visit
        const required = getRequiredDocuments(est)
        const { data: seeded } = await supabase
          .from('documents')
          .insert(required.map(d => ({ estate_id: est.id, ...d })))
          .select()

        setDocuments(seeded || [])
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  async function updateDocStatus(id: string, status: EstateDocument['status']) {
    const { data } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (data) setDocuments(prev => prev.map(d => d.id === id ? data : d))
  }

  async function updateCopies(id: string, copies_count: number) {
    const { data } = await supabase
      .from('documents')
      .update({ copies_count: Math.max(0, copies_count) })
      .eq('id', id)
      .select()
      .single()

    if (data) setDocuments(prev => prev.map(d => d.id === id ? data : d))
  }

  async function updateNotes(id: string, notes: string) {
    await supabase
      .from('documents')
      .update({ notes: notes.trim() || null })
      .eq('id', id)

    setDocuments(prev => prev.map(d => d.id === id ? { ...d, notes: notes.trim() || null } : d))
  }

  async function handleAddDoc() {
    if (!estate || !form.name.trim()) return
    setSaving(true)

    const { data, error } = await supabase
      .from('documents')
      .insert({
        estate_id: estate.id,
        doc_type: form.doc_type,
        name: form.name.trim(),
        notes: form.notes.trim() || null,
      })
      .select()
      .single()

    if (!error && data) {
      setDocuments(prev => [...prev, data])
    }

    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('documents').delete().eq('id', id)
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  if (loading) return null

  const obtained = documents.filter(d => ['obtained', 'filed'].includes(d.status)).length
  const needed = documents.filter(d => d.status === 'needed').length

  return (
    <div className="max-w-2xl mx-auto w-full px-6 py-8 space-y-8 animate-fade-in-up">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document Locker</h1>
        <p className="mt-1 text-slate-600">Track required documents for estate settlement.</p>
      </div>

      {/* Summary */}
      {documents.length > 0 && (
        <div className="flex gap-4">
          <div className="flex-1 p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500">Total Documents</p>
            <p className="text-lg font-bold text-slate-900">{documents.length}</p>
          </div>
          <div className="flex-1 p-4 rounded-2xl border border-emerald-200 bg-emerald-50">
            <p className="text-xs font-medium text-emerald-600">Obtained / Filed</p>
            <p className="text-lg font-bold text-emerald-800">{obtained}</p>
          </div>
          <div className="flex-1 p-4 rounded-2xl border border-red-200 bg-red-50">
            <p className="text-xs font-medium text-red-600">Still Needed</p>
            <p className="text-lg font-bold text-red-800">{needed}</p>
          </div>
        </div>
      )}

      {/* Document Checklist */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{DOC_TYPES[doc.doc_type]}</p>
              </div>
              <select
                value={doc.status}
                onChange={(e) => updateDocStatus(doc.id, e.target.value as EstateDocument['status'])}
                className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer shrink-0 ${STATUS_COLORS[doc.status]}`}
              >
                {Object.entries(DOC_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Copies counter for death certificate */}
            {doc.doc_type === 'death_certificate' && doc.status !== 'not_applicable' && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-slate-500">Copies:</span>
                <button
                  onClick={() => updateCopies(doc.id, doc.copies_count - 1)}
                  className="w-6 h-6 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 text-xs"
                >
                  -
                </button>
                <span className="text-sm font-medium text-slate-700 w-6 text-center">
                  {doc.copies_count}
                </span>
                <button
                  onClick={() => updateCopies(doc.id, doc.copies_count + 1)}
                  className="w-6 h-6 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-50 text-xs"
                >
                  +
                </button>
              </div>
            )}

            {/* Notes */}
            {editingNotes === doc.id ? (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateNotes(doc.id, noteText)
                      setEditingNotes(null)
                    }
                  }}
                />
                <button
                  onClick={() => { updateNotes(doc.id, noteText); setEditingNotes(null) }}
                  className="text-xs text-cyan-600 font-medium"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                {doc.notes && <p className="text-xs text-slate-500">{doc.notes}</p>}
                <button
                  onClick={() => { setEditingNotes(doc.id); setNoteText(doc.notes || '') }}
                  className="text-xs text-slate-400 hover:text-cyan-600"
                >
                  {doc.notes ? 'edit' : '+ note'}
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs text-slate-400 hover:text-red-500 ml-auto"
                >
                  remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Document */}
      {showForm ? (
        <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="font-semibold text-slate-900">Add Document</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={form.doc_type}
                onChange={(e) => setForm(prev => ({ ...prev, doc_type: e.target.value as EstateDocument['doc_type'] }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {Object.entries(DOC_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Homeowner's Insurance"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddDoc} disabled={saving || !form.name.trim()}>
              {saving ? 'Adding...' : 'Add Document'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 text-sm font-medium text-slate-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
        >
          + Add Document
        </button>
      )}
    </div>
  )
}
