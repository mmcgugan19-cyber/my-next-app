import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
        <span className="font-semibold text-lg">IllinoisEstateSettler</span>
        <div className="flex gap-6 text-sm">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/how-it-works" className="hover:underline">
            How It Works
          </Link>
          <Link
            href="/admin"
            className="text-zinc-400 hover:underline text-xs"
          >
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold leading-tight">
          Settle an Estate in Illinois — Step by Step
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          A guided tool that walks you through the Illinois probate process,
          helps you understand your options, and keeps you on track from start
          to finish.
        </p>

        {/* Value Props */}
        <ul className="mt-12 space-y-6">
          <li>
            <h3 className="font-semibold">Know your next step</h3>
            <p className="text-zinc-600">
              Answer a few questions and get a clear, personalized checklist
              based on Illinois law — whether you need probate, a small estate
              affidavit, or something else.
            </p>
          </li>
          <li>
            <h3 className="font-semibold">Stay organized</h3>
            <p className="text-zinc-600">
              Track assets, deadlines, and filings in one place. No more
              guessing what paperwork is missing.
            </p>
          </li>
          <li>
            <h3 className="font-semibold">Built for Illinois</h3>
            <p className="text-zinc-600">
              Every workflow follows the Illinois Probate Act of 1975 and
              current court rules. County-specific guidance included.
            </p>
          </li>
        </ul>

        {/* CTA */}
        <div className="mt-14">
          <Link
            href="/intake"
            className="inline-block rounded bg-zinc-900 px-6 py-3 text-white font-medium hover:bg-zinc-700 transition-colors"
          >
            Start Estate Intake
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400">
        This tool provides guidance for Illinois estates only. It is not a
        substitute for legal advice.
      </footer>
    </div>
  );
}
