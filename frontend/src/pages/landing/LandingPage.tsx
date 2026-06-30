import { motion } from 'framer-motion'
import {
  Archive,
  ArrowRight,
  BookOpen,
  Feather,
  Mail,
  MessageSquareQuote,
  Newspaper,
  ScrollText,
  Send,
  Sparkles,
} from 'lucide-react'
import { SiteHeader } from '../../components/layout/SiteHeader'
import { ButtonLink } from '../../components/ui/ButtonLink'
import libraryImage from '../../assets/images/old-library.jpg'

const principles = [
  {
    title: 'Books as instruments',
    body: 'We read to sharpen judgment, not to collect summaries.',
  },
  {
    title: 'Conversation as craft',
    body: 'A salon rewards precision, generosity, and the rare discipline of changing one\'s mind.',
  },
  {
    title: 'Culture in public',
    body: 'Philosophy, politics, economics, and art are treated as one continuous argument.',
  },
]

const readingBooks = [
  {
    title: 'The Social Contract',
    author: 'Jean-Jacques Rousseau',
    detail: 'The terms of civic life, written with an almost architectural calm.',
    meta: 'Current reading • 2 weeks',
    accent: 'from-[#5c4033] to-[#2b1e17]',
  },
  {
    title: 'The Wealth of Nations',
    author: 'Adam Smith',
    detail: 'A study of exchange, appetite, and the quiet order of markets.',
    meta: 'Discussion notes • Thursday',
    accent: 'from-[#3e2a1f] to-[#1f2a2e]',
  },
  {
    title: 'The Birth of Tragedy',
    author: 'Friedrich Nietzsche',
    detail: 'An inquiry into form, ritual, and the making of modern feeling.',
    meta: 'Essay circle • Next week',
    accent: 'from-[#3b1f1f] to-[#2b1e17]',
  },
  {
    title: 'The History of the Peloponnesian War',
    author: 'Thucydides',
    detail: 'A reminder that public argument survives by discipline and memory.',
    meta: 'Archive note • Reserved',
    accent: 'from-[#5c4033] to-[#3e2a1f]',
  },
]

const archiveEntries = [
  {
    title: 'Catalog 12',
    detail: 'Letters, receipts, and reading lists from the salon archive room.',
  },
  {
    title: 'Manuscript Drawer',
    detail: 'Short reflections published for members before the next gathering.',
  },
  {
    title: 'Reference Shelf',
    detail: 'Historical guides to etiquette, philosophy, and public debate.',
  },
]

const debateItems = [
  {
    title: 'On the Use of Public Disagreement',
    status: 'Open',
    body: 'A room for careful objections and the kind of argument that improves the mind.',
  },
  {
    title: 'The Ethics of Patronage',
    status: 'Sealed',
    body: 'Archived for later review after a full round of notes and responses.',
  },
]

const essayItems = [
  {
    title: 'How a room makes thought possible',
    blurb: 'A note on the social architecture of serious reading.',
  },
  {
    title: 'Reading notes from the winter table',
    blurb: 'Marginalia, recorded objections, and small acts of attention.',
  },
]

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="dust-field relative isolate min-h-svh overflow-hidden border-b border-brass/30">
        <img
          src={libraryImage}
          alt="An old library interior lined with antique books"
          className="absolute inset-0 -z-30 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(255,238,195,0.16),transparent_22%),radial-gradient(circle_at_20%_70%,rgba(176,141,87,0.12),transparent_18%),linear-gradient(180deg,rgba(43,30,23,0.4),rgba(35,21,14,0.84))]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#190f0d] to-transparent" />

        <SiteHeader />

        <div className="mx-auto flex min-h-[calc(100svh-84px)] max-w-7xl items-center px-5 pb-16 pt-14 sm:px-8 lg:px-10">
          <motion.div
            animate="visible"
            className="max-w-3xl"
            initial="hidden"
            transition={{ duration: 0.7, ease: 'easeOut', staggerChildren: 0.12 }}
          >
            <motion.p
              className="mb-5 font-serif text-sm uppercase tracking-[0.32em] text-brass"
              variants={fadeIn}
            >
              An invitation to a warm, eighteenth-century reading room
            </motion.p>
            <motion.h1
              className="max-w-4xl font-serif text-5xl leading-[0.98] text-parchment drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)] sm:text-6xl lg:text-7xl"
              variants={fadeIn}
            >
              The Salon
            </motion.h1>
            <motion.p
              className="mt-7 max-w-2xl text-lg leading-8 text-parchment/84 sm:text-xl"
              variants={fadeIn}
            >
              A private society for readers who value inquiry, elegant disagreement, and long-form conversation inside a grand library of ideas.
            </motion.p>
            <motion.blockquote
              className="mt-8 max-w-2xl border-l border-brass/70 pl-5 font-serif text-2xl leading-snug text-parchment sm:text-3xl"
              variants={fadeIn}
            >
              <span>Leave with better questions than you arrived with.</span>
              <span className="mt-3 block text-brass">Until the next argument.</span>
            </motion.blockquote>
            <motion.div className="mt-10 flex flex-col gap-4 sm:flex-row" variants={fadeIn}>
              <ButtonLink href="#apply">Apply to Join</ButtonLink>
              <ButtonLink href="#bookshelf" variant="ghost">
                Explore the Library
              </ButtonLink>
            </motion.div>
            <motion.div className="mt-12 flex items-center gap-3 border-t border-brass/30 pt-6 text-sm uppercase tracking-[0.24em] text-parchment/70" variants={fadeIn}>
              <span className="candle-glow inline-flex h-2.5 w-2.5 rounded-full bg-brass" />
              The room is built from walnut shelves, leather chairs, warm lamps, and quiet argument.
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="relative overflow-hidden border-b border-brass/20 bg-[#f2e9d8] px-5 py-20 sm:px-8 lg:px-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(176,141,87,0.16),transparent_24%),linear-gradient(135deg,rgba(242,233,216,0.92),rgba(224,204,161,0.86))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="room-frame rounded-[1.4rem] bg-[#f8efe0]/90 p-8 text-[#3e2a1f] sm:p-10">
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#5c4033]">History of French Salons</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#2b1e17] sm:text-5xl">
              An archive room of manners, letters, and ideas.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#5c4033]/82">
              The salon was not merely a gathering. It was a social instrument for making thought public without surrendering elegance.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[#5c4033]">
              <BookOpen aria-hidden="true" className="size-4" />
              Reading historical manuscripts in the archive room
            </div>
          </div>
          <div className="grid gap-5">
            {principles.map((principle) => (
              <motion.article
                className="rounded-[1rem] border border-[#5c4033]/16 bg-[#fff8eb]/80 p-6 shadow-[0_18px_45px_-28px_rgba(43,30,23,0.65)]"
                key={principle.title}
                variants={fadeIn}
              >
                <h3 className="font-serif text-xl text-[#2b1e17]">{principle.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5c4033]/80">{principle.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="border-b border-brass/25 bg-[#2b1e17] px-5 py-20 sm:px-8 lg:px-10"
        id="bookshelf"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
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
                  className="book-card group relative overflow-hidden rounded-[1rem] bg-[#2b1e17]/80 p-5"
                  key={book.title}
                  whileHover={{ y: -6, rotate: -1, scale: 1.01 }}
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
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="border-b border-brass/20 bg-[#f7ebd5] px-5 py-20 sm:px-8 lg:px-10"
        id="archive"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="room-frame rounded-[1.4rem] bg-[#fef8e9]/90 p-8 sm:p-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#5c4033]">Reading Archive</p>
                <h2 className="mt-3 font-serif text-4xl text-[#2b1e17] sm:text-5xl">
                  An old library catalogue, arranged for serious use.
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b08d57]/30 bg-[#fff4d8] px-4 py-2 text-sm uppercase tracking-[0.2em] text-[#5c4033]">
                <Archive aria-hidden="true" className="size-4" />
                Catalogued notes
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {archiveEntries.map((entry) => (
                <motion.article
                  className="rounded-[1rem] border border-[#b08d57]/20 bg-[#fff7df] p-6 shadow-[0_16px_38px_-28px_rgba(43,30,23,0.65)]"
                  key={entry.title}
                  variants={fadeIn}
                >
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-[#5c4033]">
                    <ScrollText aria-hidden="true" className="size-4" />
                    {entry.title}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#5c4033]/78">{entry.detail}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="border-b border-brass/20 bg-[#1f2a2e] px-5 py-20 sm:px-8 lg:px-10"
        id="debates"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-w-xl">
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#b08d57]">Debate Hall</p>
            <h2 className="mt-4 font-serif text-4xl text-parchment sm:text-5xl">
              Calm, deliberate conversation beneath the green lamps.
            </h2>
            <p className="mt-6 text-base leading-8 text-parchment/74">
              The room is meant for clarity rather than performance. Disagreement is welcomed when it arrives with care.
            </p>
          </div>
          <div className="grid gap-4">
            {debateItems.map((debate) => (
              <motion.article
                className="rounded-[1rem] border border-[#b08d57]/20 bg-[#2b3a3f]/90 p-6 shadow-[0_18px_45px_-28px_rgba(0,0,0,0.6)]"
                key={debate.title}
                variants={fadeIn}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-serif text-2xl text-[#f8efe0]">{debate.title}</h3>
                  <span className="rounded-full border border-[#b08d57]/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#b08d57]">
                    {debate.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-parchment/76">{debate.body}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="border-b border-brass/20 bg-[#f8efe0] px-5 py-20 sm:px-8 lg:px-10"
        id="essays"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="room-frame rounded-[1.4rem] bg-[#fff8e8]/90 p-8 text-[#3e2a1f] sm:p-10">
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#5c4033]">Essays & Reading Notes</p>
            <h2 className="mt-4 font-serif text-4xl text-[#2b1e17] sm:text-5xl">
              Pages laid across the walnut table.
            </h2>
            <p className="mt-6 text-base leading-8 text-[#5c4033]/80">
              Each essay arrives like a carefully placed sheet at the edge of a candlelit desk: deliberate, readable, and waiting to be argued with.
            </p>
            <blockquote className="mt-8 border-l border-[#b08d57]/50 pl-5 text-xl leading-9 text-[#3b1f1f]">
              “A good note is a small act of hospitality to the future.”
            </blockquote>
          </div>
          <div className="grid gap-4">
            {essayItems.map((item) => (
              <motion.article
                className="rounded-[1rem] border border-[#5c4033]/15 bg-[#fffdf6] p-6 shadow-[0_16px_40px_-30px_rgba(43,30,23,0.7)]"
                key={item.title}
                variants={fadeIn}
              >
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-[#5c4033]">
                  <Feather aria-hidden="true" className="size-4" />
                  Essays
                </div>
                <h3 className="mt-4 font-serif text-2xl text-[#2b1e17]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5c4033]/74">{item.blurb}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="border-b border-brass/20 bg-[#3b1f1f] px-5 py-20 sm:px-8 lg:px-10"
        id="newsletter"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[1.4rem] border border-[#b08d57]/20 bg-[#2b1e17]/85 p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.7)] lg:grid-cols-[1fr_0.8fr] lg:p-10">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#b08d57]">Newsletter</p>
            <h2 className="mt-4 font-serif text-4xl text-parchment sm:text-5xl">
              A quiet invitation to the next gathering.
            </h2>
            <p className="mt-5 text-base leading-8 text-parchment/75">
              Receive reading notes, event reminders, and thoughtful prompts without the excess of modern correspondence.
            </p>
          </div>
          <div className="rounded-[1rem] border border-[#b08d57]/20 bg-[#fff6df]/90 p-6 text-[#3b1f1f]">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-[#5c4033]">
              <Newspaper aria-hidden="true" className="size-4" />
              Join the mailing list
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <input className="rounded-md border border-[#5c4033]/20 bg-[#fffdf7] px-4 py-3 outline-none ring-0" placeholder="Name" />
              <input className="rounded-md border border-[#5c4033]/20 bg-[#fffdf7] px-4 py-3 outline-none ring-0" placeholder="Email address" />
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#b08d57]/40 bg-[#3b1f1f] px-4 py-3 font-serif text-sm uppercase tracking-[0.2em] text-[#f8efe0] transition hover:border-[#d1ae73] hover:brightness-105" type="button">
                Subscribe <Send aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="border-b border-brass/20 bg-[#f7ebd5] px-5 py-20 sm:px-8 lg:px-10"
        id="apply"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="room-frame rounded-[1.4rem] bg-[#fdf7e8]/90 p-8 sm:p-10">
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#5c4033]">Application Form</p>
            <h2 className="mt-4 font-serif text-4xl text-[#2b1e17] sm:text-5xl">
              Write your request as if in an antique journal.
            </h2>
            <form className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="rounded-md border border-[#5c4033]/20 bg-[#fffdf6] px-4 py-3 outline-none ring-0" placeholder="Name" />
                <input className="rounded-md border border-[#5c4033]/20 bg-[#fffdf6] px-4 py-3 outline-none ring-0" placeholder="Email" />
              </div>
              <input className="w-full rounded-md border border-[#5c4033]/20 bg-[#fffdf6] px-4 py-3 outline-none ring-0" placeholder="What question have you carried longest?" />
              <textarea className="min-h-32 w-full rounded-md border border-[#5c4033]/20 bg-[#fffdf6] px-4 py-3 outline-none ring-0" placeholder="Tell us what kind of conversation you hope to deepen." />
              <button className="inline-flex items-center gap-2 rounded-md border border-[#b08d57]/35 bg-[#2b1e17] px-5 py-3 font-serif text-sm uppercase tracking-[0.2em] text-[#f8efe0] transition hover:border-[#d1ae73] hover:brightness-105" type="button">
                Submit application <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </form>
          </div>
          <div className="rounded-[1.4rem] border border-[#5c4033]/20 bg-[#2b1e17]/90 p-8 text-parchment shadow-[0_24px_70px_-34px_rgba(0,0,0,0.7)] sm:p-10">
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">Membership expectations</p>
            <h3 className="mt-4 font-serif text-3xl text-[#f8efe0]">The room asks for attention, not performance.</h3>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-parchment/80">
              <li className="flex items-start gap-3"><span className="mt-1 text-brass">•</span> Bring a prepared question and a willingness to be corrected.</li>
              <li className="flex items-start gap-3"><span className="mt-1 text-brass">•</span> Read slowly enough to notice what the text refuses to explain.</li>
              <li className="flex items-start gap-3"><span className="mt-1 text-brass">•</span> Leave room for others to shape the argument as well as yourself.</li>
            </ul>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-brass/20 bg-[#1f2a2e] px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[1.3rem] border border-[#b08d57]/20 bg-[#24353a]/90 p-8 text-parchment/80 sm:flex-row sm:justify-between">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">Contact</p>
            <h2 className="mt-3 font-serif text-3xl text-[#f8efe0]">The Salon</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-parchment/70">
              Reach the curator for membership, events, and the private community after acceptance.
            </p>
          </div>
          <div className="space-y-3 text-sm">
            <a className="flex items-center gap-2 transition hover:text-[#f8efe0]" href="mailto:curator@example.com">
              <Mail aria-hidden="true" className="size-4" />
              curator@example.com
            </a>
            <a className="flex items-center gap-2 transition hover:text-[#f8efe0]" href="https://wa.me/" target="_blank" rel="noreferrer">
              <MessageSquareQuote aria-hidden="true" className="size-4" />
              WhatsApp community
            </a>
            <div className="pt-2 text-parchment/60">© 2026 The Salon. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </main>
  )
}
