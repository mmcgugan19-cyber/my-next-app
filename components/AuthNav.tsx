'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

interface UserInfo {
  firstName: string
  email: string
}

export default function AuthNav() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser({
          firstName: session.user.user_metadata?.first_name || '',
          email: session.user.email || '',
        })
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          firstName: session.user.user_metadata?.first_name || '',
          email: session.user.email || '',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // While checking auth, render a placeholder to avoid layout shift
  if (loading) {
    return (
      <div className="flex items-center gap-8">
        <Link
          href="/how-it-works"
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
        >
          How It Works
        </Link>
        <Link
          href="/about"
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
        >
          About
        </Link>
        <span className="w-14" />
        <Link
          href="/intake"
          className="text-sm font-medium bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
        >
          Start Free Assessment
        </Link>
      </div>
    )
  }

  if (user) {
    const initial = user.firstName?.[0]?.toUpperCase() || user.email[0]?.toUpperCase() || '?'

    return (
      <div className="flex items-center gap-8">
        <Link
          href="/how-it-works"
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
        >
          How It Works
        </Link>
        <Link
          href="/about"
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
        >
          About
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
        >
          My Dashboard
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group"
          title={user.email}
        >
          <div className="w-8 h-8 rounded-full bg-navy-800 text-white text-sm font-semibold flex items-center justify-center shadow-sm group-hover:bg-navy-700 transition-colors">
            {initial}
          </div>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-8">
      <Link
        href="/how-it-works"
        className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
      >
        How It Works
      </Link>
      <Link
        href="/about"
        className="text-sm text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
      >
        About
      </Link>
      <Link
        href="/login"
        className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
      >
        Log In
      </Link>
      <Link
        href="/intake"
        className="text-sm font-medium bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors shadow-sm"
      >
        Start Free Assessment
      </Link>
    </div>
  )
}
