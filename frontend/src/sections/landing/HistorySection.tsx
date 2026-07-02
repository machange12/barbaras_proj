import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { fadeIn } from '../../lib/motion';
import { principles } from '../../content/landing';

export function HistorySection() {
  return (
    <motion.section
      className="relative overflow-hidden border-b border-brass/20 bg-[#f2e9d8] px-5 py-20 sm:px-8 lg:px-10"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(176,141,87,0.16),transparent_24%),linear-gradient(135deg,rgba(242,233,216,0.92),rgba(224,204,161,0.86))]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="room-frame rounded-[1.4rem] bg-[#f8efe0]/90 p-8 text-[#3e2a1f] sm:p-10">
          <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#5c4033]">
            History of French Salons
          </p>
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
  );
}
