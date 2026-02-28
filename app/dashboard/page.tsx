'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface Task {
  text: string
  completed: boolean
}

interface Estate {
  id: string
  state_of_residence: string
  county: string | null
  total_value: number
  legal_path: string
  executor_role: string
  has_will: boolean
  risk_level: string
  urgent_tasks: Task[]
  immediate_tasks: Task[]
  short_term_tasks: Task[]
  long_term_tasks: Task[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [estate, setEstate] = useState<Estate | null>(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/intake')
        return
      }

      setUserName(user.user_metadata?.first_name || 'there')

      const { data: estates } = await supabase
        .from('estates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (estates && estates.length > 0) {
        setEstate(estates[0])
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  const toggleTask = useCallback(async (
    category: 'urgent_tasks' | 'immediate_tasks' | 'short_term_tasks' | 'long_term_tasks',
    index: number
  ) => {
    if (!estate) return

    const tasks = [...estate[category]]
    tasks[index] = { ...tasks[index], completed: !tasks[index].completed }

    setEstate((prev) => prev ? { ...prev, [category]: tasks } : prev)

    await supabase
      .from('estates')
      .update({ [category]: tasks })
      .eq('id', estate.id)
  }, [estate])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading your dashboard...
        </div>
      </div>
    )
  }

  if (!estate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-slate-600">No estate data found.</p>
          <Link
            href="/intake"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-600 text-white font-medium px-6 py-3 hover:bg-cyan-700 transition-all"
          >
            Start Assessment
          </Link>
        </div>
      </div>
    )
  }

  const pathLabel: Record<string, string> = {
    'no-probate': 'Probate Likely Not Required',
    'small-estate': 'Small Estate Affidavit',
    'formal-probate': 'Formal Probate',
  }

  function completedCount(tasks: Task[]) {
    return tasks.filter((t) => t.completed).length
  }

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
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Welcome back, {userName}
          </h1>
          <p className="mt-2 text-slate-600">
            Here&apos;s your estate settlement checklist for {estate.state_of_residence}.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500 mb-1">Estate Value</p>
            <p className="text-lg font-bold text-slate-900">
              ${estate.total_value.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500 mb-1">Legal Path</p>
            <p className="text-lg font-bold text-slate-900">
              {pathLabel[estate.legal_path] ?? estate.legal_path}
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-xs font-medium text-slate-500 mb-1">Your Role</p>
            <p className="text-lg font-bold text-slate-900 capitalize">{estate.executor_role}</p>
          </div>
        </div>

        {/* Urgent Tasks */}
        {estate.urgent_tasks.length > 0 && (
          <TaskSection
            title="Urgent — Do Today"
            dotColor="bg-red-500"
            titleColor="text-red-800"
            cardBg="bg-red-50"
            cardBorder="border-red-100"
            checkColor="border-red-300 peer-checked:bg-red-500 peer-checked:border-red-500"
            textColor="text-red-900"
            tasks={estate.urgent_tasks}
            completed={completedCount(estate.urgent_tasks)}
            onToggle={(i) => toggleTask('urgent_tasks', i)}
          />
        )}

        {/* Immediate Tasks */}
        {estate.immediate_tasks.length > 0 && (
          <TaskSection
            title="Week 1 — First Steps"
            dotColor="bg-cyan-500"
            titleColor="text-slate-900"
            cardBg="bg-slate-50"
            cardBorder="border-slate-100"
            checkColor="border-cyan-300 peer-checked:bg-cyan-500 peer-checked:border-cyan-500"
            textColor="text-slate-700"
            tasks={estate.immediate_tasks}
            completed={completedCount(estate.immediate_tasks)}
            onToggle={(i) => toggleTask('immediate_tasks', i)}
          />
        )}

        {/* Short-term Tasks */}
        {estate.short_term_tasks.length > 0 && (
          <TaskSection
            title="Month 1 — Build the Foundation"
            dotColor="bg-slate-400"
            titleColor="text-slate-900"
            cardBg="bg-slate-50"
            cardBorder="border-slate-100"
            checkColor="border-slate-300 peer-checked:bg-slate-500 peer-checked:border-slate-500"
            textColor="text-slate-700"
            tasks={estate.short_term_tasks}
            completed={completedCount(estate.short_term_tasks)}
            onToggle={(i) => toggleTask('short_term_tasks', i)}
          />
        )}

        {/* Long-term Tasks */}
        {estate.long_term_tasks.length > 0 && (
          <TaskSection
            title="Months 2–12 — Complete the Process"
            dotColor="bg-slate-300"
            titleColor="text-slate-900"
            cardBg="bg-slate-50"
            cardBorder="border-slate-100"
            checkColor="border-slate-200 peer-checked:bg-slate-400 peer-checked:border-slate-400"
            textColor="text-slate-700"
            tasks={estate.long_term_tasks}
            completed={completedCount(estate.long_term_tasks)}
            onToggle={(i) => toggleTask('long_term_tasks', i)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 text-center text-xs text-slate-400">
          This tool provides general guidance only. It is not a substitute for legal, tax, or
          financial advice.
        </div>
      </footer>
    </div>
  )
}

/* ---- Task Section Component ---- */

interface TaskSectionProps {
  title: string
  dotColor: string
  titleColor: string
  cardBg: string
  cardBorder: string
  checkColor: string
  textColor: string
  tasks: Task[]
  completed: number
  onToggle: (index: number) => void
}

function TaskSection({
  title,
  dotColor,
  titleColor,
  cardBg,
  cardBorder,
  checkColor,
  textColor,
  tasks,
  completed,
  onToggle,
}: TaskSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-bold ${titleColor} flex items-center gap-2`}>
          <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          {title}
        </h3>
        <span className="text-sm text-slate-500">
          {completed}/{tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <label
            key={i}
            className={`flex items-start gap-3 p-4 rounded-xl ${cardBg} border ${cardBorder} cursor-pointer group transition-all hover:shadow-sm`}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(i)}
              className="peer sr-only"
            />
            <span
              className={`shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${checkColor}`}
            >
              {task.completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <p className={`text-sm ${textColor} ${task.completed ? 'line-through opacity-60' : ''}`}>
              {task.text}
            </p>
          </label>
        ))}
      </div>
    </div>
  )
}
