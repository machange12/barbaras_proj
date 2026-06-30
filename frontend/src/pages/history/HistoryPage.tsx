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
      <section className="paper-texture border-b border-brass/25 bg-[radial-gradient(circle_at_68%_12%,rgba(176,141,87,0.22),transparent_30%),linear-gradient(180deg,#2b1e17,#3e2a1f)]">
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
            <div className="rounded-[1.25rem] border border-brass/20 bg-[#291f17]/90 p-10 shadow-[inset_0_1px_0_rgba(255,244,210,0.08),0_28px_70px_-32px_rgba(0,0,0,0.5)]">
              <h1 className="font-serif text-5xl leading-none text-[#f1deb6] sm:text-6xl lg:text-7xl">
                French salons made conversation into cultural power.
              </h1>
            </div>
            <div className="max-w-2xl border-l border-brass/45 pl-6 text-base leading-8 text-parchment/78 sm:text-lg">
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

      <section className="bg-[#231a14] px-5 py-20 sm:px-8 lg:px-10">
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
                className="grid gap-5 rounded-[1rem] border border-brass/25 bg-[#3c2e24]/76 p-6 shadow-[inset_0_1px_0_rgba(255,244,210,0.08),0_18px_54px_rgba(35,21,13,0.24)] md:grid-cols-[13rem_1fr]"
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

      <section className="wood-panel border-t border-brass/25 px-5 py-20 sm:px-8 lg:px-10">
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
              <article
                className="rounded-[1rem] border border-brass/30 bg-[#2b1e17]/82 p-6 shadow-[inset_0_1px_0_rgba(255,244,210,0.08),0_18px_54px_rgba(0,0,0,0.2)]"
                key={item.discipline}
              >
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
