import { motion } from 'framer-motion';
import { fadeIn } from '../../lib/motion';
import { debateItems } from '../../content/landing';

export function DebatesSection() {
  return (
    <motion.section
      className="border-b border-brass/20 bg-[#1f2a2e] px-5 py-20 sm:px-8 lg:px-10"
      id="debates"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
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
  );
}
