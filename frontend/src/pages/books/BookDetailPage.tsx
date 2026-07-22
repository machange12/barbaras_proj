import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { readingBooks, readingPrompts } from '../../content/landing';

export function BookDetailPage() {
  const { slug } = useParams();
  const book = readingBooks.find((item) => item.slug === slug);

  if (!book) {
    return <Navigate to="/#bookshelf" replace />;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-parchment">
      <Link
        className="inline-flex items-center gap-2 rounded-md border border-brass/30 px-4 py-2 text-sm uppercase tracking-[0.16em] text-parchment/70 transition hover:border-brass/70 hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
        to="/#bookshelf"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Back to shelf
      </Link>

      <section className="mt-8 overflow-hidden rounded-[1.4rem] border border-brass/20 bg-[#2d1c13]/85 shadow-[0_24px_70px_-34px_rgba(0,0,0,0.7)]">
        <div className={`bg-gradient-to-br ${book.accent} p-8 sm:p-10`}>
          <p className="text-sm uppercase tracking-[0.24em] text-parchment/70">{book.author}</p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl text-[#f8efe0] sm:text-6xl">{book.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-parchment/82">{book.detail}</p>
        </div>

        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_0.75fr]">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.24em] text-brass">Discussion focus</p>
            <p className="mt-4 text-lg leading-8 text-parchment/82">{book.discussionFocus}</p>
          </div>

          <aside className="rounded-[1rem] border border-brass/20 bg-[#150f0b]/60 p-6">
            <p className="font-serif text-sm uppercase tracking-[0.24em] text-brass">{book.meta}</p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-parchment/76">
              {readingPrompts.map((prompt) => (
                <li className="rounded-[0.85rem] border border-brass/15 bg-[#271d18]/80 px-4 py-3" key={prompt}>
                  {prompt}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
