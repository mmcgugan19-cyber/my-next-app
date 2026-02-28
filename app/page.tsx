import Link from "next/link";
import AuthNav from "@/components/AuthNav";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Instant Clarity",
    description:
      "Know in minutes whether you need formal probate or qualify for a simplified process. No more guessing or expensive consultations.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "State-Specific Guidance",
    description:
      "Rules and thresholds for your exact jurisdiction. Not generic advice — real, actionable steps based on your state's probate laws.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Protect Yourself",
    description:
      "Identify liability risks before they become problems. Know your obligations as executor and stay ahead of creditor claims.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Save Thousands",
    description:
      "Avoid unnecessary attorney fees on straightforward estates. Know exactly when professional help is truly needed and when you can handle it yourself.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">EstateIQ</span>
          </Link>
          <AuthNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-50/70 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-cyan-50/40 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 text-sm mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Free for all 50 states
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-navy-950 leading-[1.1] tracking-tight">
                Know Exactly What
                <br className="hidden sm:block" /> To Do Next.
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-lg">
                Answer a few simple questions and get a personalized roadmap for
                settling your loved one&apos;s estate. No legal jargon. No expensive
                retainers. Just clarity.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/intake"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-cyan-600 text-white font-semibold text-lg hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/25 hover:shadow-cyan-500/30"
                >
                  Start Your Free Assessment
                  <svg
                    className="ml-2.5 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
                <span className="text-sm text-slate-500">
                  Instant personalized checklist — Takes about 5 minutes
                </span>
              </div>
            </div>

            {/* Hero visual — product preview checklist */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-amber-100/40 via-transparent to-cyan-100/30 rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
                <div className="flex gap-1.5 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <div className="text-sm font-medium text-slate-400 mb-5">Your Estate Roadmap</div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-cyan-500 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700">Gather essential documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-cyan-500 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-700">Determine probate requirements</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border-2 border-cyan-400 bg-cyan-50 shrink-0" />
                    <span className="text-sm text-slate-700 font-medium">File with county probate court</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border-2 border-slate-200 shrink-0" />
                    <span className="text-sm text-slate-400">Notify creditors &amp; beneficiaries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border-2 border-slate-200 shrink-0" />
                    <span className="text-sm text-slate-400">Distribute assets per will</span>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>2 of 5 complete</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/5 bg-cyan-500 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-white rounded-xl px-4 py-2.5 shadow-lg border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-medium text-slate-600">Updated for your state</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-slate-50/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to clarity. No account required to get started.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60">
              <div className="w-11 h-11 rounded-xl bg-navy-800 text-white font-bold text-lg flex items-center justify-center mb-5 shadow-sm">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Answer Simple Questions</h3>
              <p className="text-slate-600 leading-relaxed">
                Tell us about the estate in plain English. We ask about what
                matters — no legal jargon, no confusing forms.
              </p>
            </div>
            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60">
              <div className="w-11 h-11 rounded-xl bg-navy-800 text-white font-bold text-lg flex items-center justify-center mb-5 shadow-sm">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Your Legal Path</h3>
              <p className="text-slate-600 leading-relaxed">
                We determine whether you qualify for a simplified process or need
                formal probate — specific to your state and county.
              </p>
            </div>
            <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60">
              <div className="w-11 h-11 rounded-xl bg-navy-800 text-white font-bold text-lg flex items-center justify-center mb-5 shadow-sm">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Follow Your Roadmap</h3>
              <p className="text-slate-600 leading-relaxed">
                Get a personalized action plan with deadlines, checklists, and
                risk alerts — prioritized by what matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Why Executors Choose EstateIQ
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Built by people who&apos;ve been through it, for people going
              through it now.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-5 p-6 lg:p-8 rounded-2xl border border-slate-200/60 hover:border-cyan-200 hover:shadow-sm transition-all"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
        <div className="absolute inset-0 hero-pattern" />
        <div className="relative max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
            Don&apos;t Navigate This Alone
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl mx-auto">
            Estate settlement is one of life&apos;s most complex tasks. Get a
            clear, personalized plan in minutes — not weeks.
          </p>
          <Link
            href="/intake"
            className="mt-10 inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg"
          >
            Start Your Free Assessment
            <svg
              className="ml-2.5 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="font-semibold text-lg tracking-tight">EstateIQ</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Step-by-step estate settlement guidance for executors in all 50
                states.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">Product</h4>
                <div className="flex flex-col gap-2.5 text-sm text-slate-600">
                  <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                    How It Works
                  </Link>
                  <Link href="/about" className="hover:text-slate-900 transition-colors">
                    About
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">Legal</h4>
                <div className="flex flex-col gap-2.5 text-sm text-slate-600">
                  <span className="cursor-default">Privacy Policy</span>
                  <span className="cursor-default">Terms of Service</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-center text-xs text-slate-400 leading-relaxed">
              This tool provides general guidance only. It is not a substitute
              for legal, tax, or financial advice. Consult a licensed attorney
              for your specific situation.
            </p>
            <p className="text-center text-xs text-slate-400 mt-2">
              &copy; {new Date().getFullYear()} EstateIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
