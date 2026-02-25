import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
        <Link href="/" className="font-semibold text-lg hover:underline">
          IllinoisEstateSettler
        </Link>
      </nav>
      <main className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="mt-4 text-zinc-600">Coming soon.</p>
        <Link href="/" className="mt-6 inline-block text-sm hover:underline">
          &larr; Back to home
        </Link>
      </main>
    </div>
  );
}
