import { motion } from 'framer-motion';
import { fadeIn } from '../../lib/motion';
import libraryImage from '../../assets/images/old-library.jpg';
import { ButtonLink } from '../../components/ui/ButtonLink';

export function HeroSection() {
  return (
    <section className="dust-field relative isolate min-h-svh overflow-hidden border-b border-brass/30">
      <img
        alt="An old library interior lined with antique books"
        className="absolute inset-0 -z-30 h-full w-full object-cover"
        decoding="async"
        loading="eager"
        src={libraryImage}
      />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(255,238,195,0.16),transparent_22%),radial-gradient(circle_at_20%_70%,rgba(176,141,87,0.12),transparent_18%),linear-gradient(180deg,rgba(43,30,23,0.4),rgba(35,21,14,0.84))]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-[#190f0d] to-transparent" />

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
          <motion.div
            className="mt-12 flex items-center gap-3 border-t border-brass/30 pt-6 text-sm uppercase tracking-[0.24em] text-parchment/70"
            variants={fadeIn}
          >
            <span aria-hidden className="candle-glow inline-flex h-2.5 w-2.5 rounded-full bg-brass" />
            The room is built from walnut shelves, leather chairs, warm lamps, and quiet argument.
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
