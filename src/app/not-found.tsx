import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#1a1a18]">
      <section className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#B4B2A9]">
          lost page
        </p>

        <h1 className="font-serif text-4xl leading-tight">
          This memory was never here.
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-[#888780]">
          The page you are looking for may have been moved, deleted, or quietly
          slipped away.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/feed"
            className="rounded-full bg-[#1a1a18] px-6 py-3 text-sm font-medium text-[#f7f4ef] transition-opacity hover:opacity-85"
          >
            back to memories
          </Link>

          <Link
            href="/"
            className="rounded-full border border-[#d8d0c3] px-6 py-3 text-sm font-medium text-[#5F5E5A] transition-colors hover:border-[#1a1a18] hover:text-[#1a1a18]"
          >
            go home
          </Link>
        </div>
      </section>
    </main>
  )
}