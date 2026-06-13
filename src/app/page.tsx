import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#1a1a18]">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#B4B2A9]">
          Memoir
        </p>

        <h1 className="max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
          Keep the small moments before they fade.
        </h1>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-[#888780] md:text-base">
          A quiet place to save photos, notes, moods, and little pieces of your
          everyday life.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-full bg-[#1a1a18] px-6 py-3 text-sm font-medium text-[#f7f4ef] transition-opacity hover:opacity-85"
          >
            start your memoir
          </Link>

          <Link
            href="/feed"
            className="rounded-full border border-[#d8d0c3] px-6 py-3 text-sm font-medium text-[#5F5E5A] transition-colors hover:border-[#1a1a18] hover:text-[#1a1a18]"
          >
            open memories
          </Link>
        </div>

        <div className="mt-14 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e0d9ce] bg-[#fdfcf8] p-5 text-left">
            <p className="font-serif text-lg">save</p>
            <p className="mt-2 text-xs leading-relaxed text-[#888780]">
              collect photos with captions, moods, and places.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0d9ce] bg-[#fdfcf8] p-5 text-left">
            <p className="font-serif text-lg">return</p>
            <p className="mt-2 text-xs leading-relaxed text-[#888780]">
              revisit old memories through recap and on this day.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0d9ce] bg-[#fdfcf8] p-5 text-left">
            <p className="font-serif text-lg">keep</p>
            <p className="mt-2 text-xs leading-relaxed text-[#888780]">
              your photos stay private, shown only when you are signed in.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}