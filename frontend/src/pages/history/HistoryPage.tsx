import { motion } from 'framer-motion'
import { Landmark, LibraryBig } from 'lucide-react'
import { SiteHeader } from '../../components/layout/SiteHeader'
import { salonInfluences, salonTimeline } from '../../content/salonHistory'

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function HistoryPage() {
  return (
    <main className="min-h-svh bg-ink">
      <section className="border-b border-parchment/10 bg-[radial-gradient(circle_at_68%_12%,rgba(177,132,65,0.18),transparent_30%),linear-gradient(180deg,#080706,#11100e)]">
        <SiteHeader />
        <motion.div
          animate="visible"
          className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 lg:px-10"
          initial="hidden"
          transition={{ duration: 0.65, ease: 'easeOut', staggerChildren: 0.1 }}
        >
          <motion.p
            className="font-serif text-sm uppercase tracking-[0.32em] text-brass"
            variants={reveal}
          >
            A brief history
          </motion.p>
          <motion.div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]" variants={reveal}>
            <h1 className="font-serif text-5xl leading-none text-parchment sm:text-6xl lg:text-7xl">
              French salons made conversation into cultural power.
            </h1>
            <div className="max-w-2xl text-base leading-8 text-parchment/72 sm:text-lg">
              <p>
                The eighteenth-century salon was neither a classroom nor a club.
                It was a carefully hosted room where letters, philosophy,
                politics, taste, ambition, and friendship met under pressure.
              </p>
              <p className="mt-5">
                Its importance came from form as much as content: who was
                invited, how disagreement was governed, what counted as wit,
                and whether an idea could survive the attention of the room.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <LibraryBig aria-hidden="true" className="size-8 text-brass" strokeWidth={1.5} />
            <h2 className="mt-6 font-serif text-4xl text-parchment">The tradition</h2>
            <p className="mt-5 text-sm leading-7 text-parchment/64">
              The salon was a cultural technology: a repeatable way to make
              reading social, criticism elegant, and argument consequential.
            </p>
          </div>
          <div className="grid gap-5">
            {salonTimeline.map((entry) => (
              <article
                className="grid gap-5 border border-parchment/12 bg-mahogany/25 p-6 md:grid-cols-[13rem_1fr]"
                key={entry.title}
              >
                <p className="font-serif text-sm uppercase tracking-[0.24em] text-brass">
                  {entry.period}
                </p>
                <div>
                  <h3 className="font-serif text-2xl text-parchment">{entry.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-parchment/68">{entry.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-parchment/10 bg-stone px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex max-w-3xl items-start gap-5">
            <Landmark aria-hidden="true" className="mt-1 size-7 text-brass" strokeWidth={1.5} />
            <div>
              <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">
                Influence
              </p>
              <h2 className="mt-4 font-serif text-4xl text-parchment">
                The salon joined disciplines that modern life often separates.
              </h2>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {salonInfluences.map((item) => (
              <article className="border border-parchment/12 bg-ink/50 p-6" key={item.discipline}>
                <h3 className="font-serif text-2xl text-parchment">{item.discipline}</h3>
                <p className="mt-4 text-sm leading-7 text-parchment/66">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
