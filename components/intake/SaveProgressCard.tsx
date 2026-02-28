'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { IntakeData, StrategyResult } from '@/types/intake'

interface SaveProgressCardProps {
  data: IntakeData
  result: StrategyResult
}

export default function SaveProgressCard({ data, result }: SaveProgressCardProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [showGuestWarning, setShowGuestWarning] = useState(false)

  if (dismissed) return null

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.length >= 6

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError(null)

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Signup succeeded but no user returned.')

      // 2. Insert estate data linked to new user
      const urgentTasks = result.urgentActions.map((text) => ({
        text,
        completed: false,
      }))
      const immediateTasks = result.immediateActions.map((text) => ({
        text,
        completed: false,
      }))
      const shortTermTasks = result.shortTermActions.map((text) => ({
        text,
        completed: false,
      }))
      const longTermTasks = result.longTermActions.map((text) => ({
        text,
        completed: false,
      }))

      const { error: insertError } = await supabase.from('estates').insert({
        user_id: authData.user.id,
        state_of_residence: result.stateName,
        county: data.county || null,
        date_of_death: data.dateOfDeath || null,
        total_value: result.totalProbateValue,
        legal_path: result.legalPath,
        executor_role: result.role,
        has_will: data.hasWill ?? false,
        risk_level: result.riskLevel,
        intake_data: data,
        urgent_tasks: urgentTasks,
        immediate_tasks: immediateTasks,
        short_term_tasks: shortTermTasks,
        long_term_tasks: longTermTasks,
      })

      if (insertError) throw insertError

      // 3. Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50/50 p-6 sm:p-8 space-y-6">
      {/* Heading */}
      <div>
        <h3 className="text-xl font-bold text-slate-900">Save Your Progress</h3>
        <p className="text-sm text-slate-600 mt-1">
          Create a free account to keep your personalized estate plan.
        </p>
      </div>

      {/* Value props */}
      <ul className="space-y-2">
        <li className="flex items-start gap-2.5 text-sm text-slate-700">
          <svg className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save your ${result.totalProbateValue.toLocaleString()} progress
        </li>
        <li className="flex items-start gap-2.5 text-sm text-slate-700">
          <svg className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Access your {result.stateName}-specific court forms
        </li>
        <li className="flex items-start gap-2.5 text-sm text-slate-700">
          <svg className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Invite co-executors
        </li>
      </ul>

      {/* Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sp-first" className="block text-sm font-medium text-slate-700 mb-1">
              First Name
            </label>
            <input
              id="sp-first"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Jane"
            />
          </div>
          <div>
            <label htmlFor="sp-last" className="block text-sm font-medium text-slate-700 mb-1">
              Last Name
            </label>
            <input
              id="sp-last"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sp-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="sp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="jane@example.com"
          />
        </div>

        <div>
          <label htmlFor="sp-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="sp-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 text-white font-medium px-6 py-3 text-base hover:bg-cyan-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </>
          ) : (
            'Create Free Account'
          )}
        </button>
      </form>

      {/* Continue as Guest */}
      <div className="text-center">
        {showGuestWarning ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 space-y-3">
            <p className="font-medium">
              Are you sure? Your estate plan will be lost if you close or refresh your browser.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDismissed(true)}
                className="px-4 py-2 rounded-lg border border-amber-300 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                Continue as Guest
              </button>
              <button
                onClick={() => setShowGuestWarning(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-700 transition-colors"
              >
                I&apos;ll Create an Account
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowGuestWarning(true)}
            className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
          >
            Continue as guest
          </button>
        )}
      </div>
    </div>
  )
}
