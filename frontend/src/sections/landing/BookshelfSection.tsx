import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { readingBooks, readingPrompts } from '../../content/landing';

export function BookshelfSection() {
  return (
    <motion.section
      className="border-b border-brass/25 bg-[#2b1e17] px-5 py-20 sm:px-8 lg:px-10"
      id="bookshelf"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="max-w-xl">
          <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">Current Reading</p>
          <h2 className="mt-4 font-serif text-4xl text-parchment sm:text-5xl">
            A shelf of volumes chosen for the next conversation.
          </h2>
          <p className="mt-6 text-base leading-8 text-parchment/74">
            Each volume waits beside a lamp, a note, and an invitation to read more slowly than usual.
          </p>
          <div className="mt-10 space-y-4 rounded-[1rem] border border-brass/20 bg-[#3a2721]/85 p-6 text-sm leading-7 text-parchment/82">
            <p className="font-serif text-sm uppercase tracking-[0.24em] text-brass">Reading prompts</p>
            <ul className="space-y-3">
              {readingPrompts.map((prompt) => (
                <li className="rounded-[0.85rem] border border-[#b08d57]/15 bg-[#271d18]/80 px-4 py-3" key={prompt}>
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="room-frame rounded-[1.4rem] bg-[#3e2a1f]/92 p-7 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-brass/20 pb-4">
            <p className="font-serif text-sm uppercase tracking-[0.24em] text-brass">The library shelf</p>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-parchment/70">
              <Sparkles aria-hidden="true" className="size-3.5" />
              New arrivals
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {readingBooks.map((book) => (
              <motion.article
                className="book-card group relative overflow-hidden rounded-[1rem] bg-[#2b1e17]/80"
                key={book.title}
                whileHover={{ y: -6, rotate: -1, scale: 1.01 }}
              >
                <Link
                  className="block min-h-full p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
                  to={`/books/${book.slug}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${book.accent} opacity-70`} />
                  <div className="relative">
                    <p className="text-xs uppercase tracking-[0.24em] text-parchment/70">{book.author}</p>
                    <h3 className="mt-3 font-serif text-xl text-[#f8efe0]">{book.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-parchment/80">{book.detail}</p>
                    <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-[#f8efe0]/75">
                      <span>{book.meta}</span>
                      <span className="opacity-0 transition group-hover:opacity-100">Open</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
