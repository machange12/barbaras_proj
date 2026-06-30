import { motion } from 'framer-motion'
import { Scale, ScrollText } from 'lucide-react'
import { SiteHeader } from '../../components/layout/SiteHeader'
import { salonDistinctions, salonPractices } from '../../content/salonIdentity'

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function SalonDifferencePage() {
  return (
    <main className="min-h-svh bg-ink">
      <section className="paper-texture border-b border-brass/25 bg-[radial-gradient(circle_at_22%_16%,rgba(176,141,87,0.2),transparent_32%),linear-gradient(180deg,#2b1e17,#3e2a1f)]">
        <SiteHeader />
        <motion.div
          animate="visible"
          className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10"
          initial="hidden"
          transition={{ duration: 0.65, ease: 'easeOut', staggerChildren: 0.1 }}
        >
          <motion.div variants={reveal}>
            <p className="font-serif text-sm uppercase tracking-[0.32em] text-brass">
              Beyond the book club
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-none text-parchment sm:text-6xl lg:text-7xl">
              The book is the doorway. The room is the work.
            </h1>
          </motion.div>
          <motion.div
            className="border-l border-brass/45 pl-6 text-base leading-8 text-parchment/78 sm:text-lg"
            variants={reveal}
          >
            <p>
              A normal book club gathers around a text. A salon gathers around
              the intellectual life the text awakens: judgment, taste,
              disagreement, memory, and the difficult art of public thought.
            </p>
            <p className="mt-5">
              This society is slower than a club, less casual than a meetup, and
              more hospitable than a debate society. It is designed for people
              who want conversation to become a serious practice.
            </p>
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-[#241b15] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex max-w-3xl items-start gap-5">
            <Scale aria-hidden="true" className="mt-1 size-7 text-brass" strokeWidth={1.5} />
            <div>
              <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">
                The distinction
              </p>
              <h2 className="mt-4 font-serif text-4xl text-parchment">
                Same books, different discipline.
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-5">
            {salonDistinctions.map((item) => (
              <article
                className="grid gap-5 rounded-[1rem] border border-brass/30 bg-[#3d2d24]/72 p-6 shadow-[inset_0_1px_0_rgba(255,244,210,0.08),0_18px_54px_rgba(35,21,13,0.24)] md:grid-cols-2"
                key={item.ordinary}
              >
                <p className="text-sm leading-7 text-parchment/58">{item.ordinary}</p>
                <p className="font-serif text-xl leading-8 text-parchment">{item.salon}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="wood-panel border-t border-brass/25 px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <ScrollText aria-hidden="true" className="size-8 text-brass" strokeWidth={1.5} />
            <h2 className="mt-6 font-serif text-4xl text-parchment">House practices</h2>
            <p className="mt-5 text-sm leading-7 text-parchment/64">
              These practices keep the society from becoming either passive
              consumption or performative cleverness.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {salonPractices.map((practice) => (
              <article
                className="rounded-[1rem] border border-brass/30 bg-[#2b1e17]/82 p-6 shadow-[inset_0_1px_0_rgba(255,244,210,0.08),0_18px_54px_rgba(0,0,0,0.2)]"
                key={practice.title}
              >
                <h3 className="font-serif text-2xl text-parchment">{practice.title}</h3>
                <p className="mt-4 text-sm leading-7 text-parchment/66">{practice.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
