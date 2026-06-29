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
      <section className="border-b border-parchment/10 bg-[radial-gradient(circle_at_22%_16%,rgba(177,132,65,0.17),transparent_32%),linear-gradient(180deg,#080706,#11100e)]">
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
            className="border-l border-brass/45 pl-6 text-base leading-8 text-parchment/72 sm:text-lg"
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

      <section className="px-5 py-20 sm:px-8 lg:px-10">
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
                className="grid gap-5 border border-parchment/12 bg-mahogany/25 p-6 md:grid-cols-2"
                key={item.ordinary}
              >
                <p className="text-sm leading-7 text-parchment/58">{item.ordinary}</p>
                <p className="font-serif text-xl leading-8 text-parchment">{item.salon}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-parchment/10 bg-stone px-5 py-20 sm:px-8 lg:px-10">
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
              <article className="border border-parchment/12 bg-ink/50 p-6" key={practice.title}>
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
