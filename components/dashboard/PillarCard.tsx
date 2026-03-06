import Link from 'next/link'

interface PillarCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  status: string
  started: boolean
}

export default function PillarCard({ title, description, href, icon, status, started }: PillarCardProps) {
  return (
    <Link
      href={href}
      className="group p-5 rounded-2xl border border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-600 flex items-center justify-center shrink-0">
          {icon}
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
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{description}</p>
      <p className={`mt-3 text-xs font-medium ${started ? 'text-cyan-600' : 'text-slate-400'}`}>
        {status}
      </p>
    </Link>
  )
}
