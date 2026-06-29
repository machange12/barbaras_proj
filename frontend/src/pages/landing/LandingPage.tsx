import { motion } from 'framer-motion'
import { BookOpen, CalendarDays, Feather, MessageSquareQuote } from 'lucide-react'
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

const pathways = [
  {
    id: 'bookshelf',
    icon: BookOpen,
    title: 'Current Reading',
    body: 'A slow bookshelf for shared inquiry, with prompts and marginalia before each gathering.',
  },
  {
    id: 'essays',
    icon: Feather,
    title: 'Member Essays',
    body: 'Short written provocations, responses, and reflective notes from the society.',
  },
  {
    id: 'debates',
    icon: MessageSquareQuote,
    title: 'Debate Hall',
    body: 'Structured disagreements where the aim is clarity before victory.',
  },
  {
    id: 'events',
    icon: CalendarDays,
    title: 'Events',
    body: 'Evening salons, lectures, reading circles, and private debates.',
  },
]

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

export function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative isolate min-h-svh border-b border-parchment/10">
        <img
          src={libraryImage}
          alt="An old library interior lined with antique books"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,7,6,0.95),rgba(18,12,8,0.78)_42%,rgba(8,7,6,0.52)),radial-gradient(circle_at_72%_34%,rgba(177,132,65,0.24),transparent_28%),linear-gradient(180deg,rgba(8,7,6,0.5),rgba(8,7,6,0.96))]" />

        <SiteHeader />

        <div className="mx-auto flex min-h-[calc(100svh-84px)] max-w-7xl items-center px-5 pb-16 pt-12 sm:px-8 lg:px-10">
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
              Candlelit inquiry for serious readers
            </motion.p>
            <motion.h1
              className="font-serif text-5xl leading-[0.98] text-parchment sm:text-6xl lg:text-7xl"
              variants={fadeIn}
            >
              The Reading Salon
            </motion.h1>
            <motion.p
              className="mt-7 max-w-2xl text-lg leading-8 text-parchment/78 sm:text-xl"
              variants={fadeIn}
            >
              An intellectual society inspired by the French salons of the
              eighteenth century, built for readers who want books to become
              arguments, friendships, essays, and public thought.
            </motion.p>
            <motion.div className="mt-10 flex flex-col gap-4 sm:flex-row" variants={fadeIn}>
              <ButtonLink href="#apply">Request an invitation</ButtonLink>
              <ButtonLink href="/history" variant="ghost">
                Read the salon history
              </ButtonLink>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 sm:px-8 lg:px-10" id="history">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">
              Not a book club
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-parchment sm:text-5xl">
              A room where reading becomes civic imagination.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {principles.map((principle) => (
              <article
                className="border border-parchment/12 bg-mahogany/35 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
                key={principle.title}
              >
                <h3 className="font-serif text-xl text-parchment">{principle.title}</h3>
                <p className="mt-4 text-sm leading-7 text-parchment/66">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-parchment/10 bg-stone px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">
              Society rooms
            </p>
            <h2 className="mt-4 font-serif text-4xl text-parchment">
              Built for reading, writing, and disagreement.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pathways.map(({ body, icon: Icon, id, title }) => (
              <article className="group border border-parchment/12 bg-ink/45 p-6" id={id} key={title}>
                <Icon
                  aria-hidden="true"
                  className="size-6 text-brass transition duration-300 group-hover:translate-y-[-2px]"
                  strokeWidth={1.5}
                />
                <h3 className="mt-7 font-serif text-2xl text-parchment">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-parchment/66">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 sm:px-8 lg:px-10" id="apply">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 border-l border-brass/50 pl-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">
              Applications open soon
            </p>
            <h2 className="mt-4 font-serif text-4xl text-parchment">
              Membership begins with questions.
            </h2>
            <p className="mt-5 text-base leading-8 text-parchment/68">
              The application form will ask what conversations you wish existed
              more often, what drains you, and what question you have carried
              for years.
            </p>
          </div>
          <ButtonLink href="mailto:curator@example.com" variant="ghost">
            Contact the curator
          </ButtonLink>
        </div>
      </section>
    </main>
  )
}
