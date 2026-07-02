import { motion } from 'framer-motion';
import { Archive, ScrollText } from 'lucide-react';
import { fadeIn } from '../../lib/motion';
import { archiveEntries } from '../../content/landing';

export function ArchiveSection() {
  return (
    <motion.section
      className="border-b border-brass/20 bg-[#f7ebd5] px-5 py-20 sm:px-8 lg:px-10"
      id="archive"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
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
  );
}
