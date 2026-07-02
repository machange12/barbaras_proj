import { motion } from 'framer-motion';
import { Feather } from 'lucide-react';
import { fadeIn } from '../../lib/motion';
import { essayItems } from '../../content/landing';

export function EssaysSection() {
  return (
    <motion.section
      className="border-b border-brass/20 bg-[#f8efe0] px-5 py-20 sm:px-8 lg:px-10"
      id="essays"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
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
  );
}
