'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
      } else {
        setUserName(user.user_metadata?.first_name || 'there')
        setAuthChecked(true)
      }
    })
  }, [router])

  if (!authChecked) {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-semibold text-slate-900">EstateIQ</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:block">Hi, {userName}</span>
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
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 text-center text-xs text-slate-400">
          This tool provides general guidance only. It is not a substitute for legal, tax, or
          financial advice.
        </div>
      </footer>
    </div>
  )
}
