import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function NewsletterSection() {
  return (
    <motion.section
      className="border-b border-brass/20 bg-[#1f2a2e] px-5 py-20 sm:px-8 lg:px-10"
      id="newsletter"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
    >
      <div className="mx-auto grid max-w-7xl gap-8 rounded-[1.4rem] border border-[#b08d57]/20 bg-[#2b1e17]/85 p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.7)] lg:grid-cols-[1fr_0.8fr] lg:p-10">
        <div>
          <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#b08d57]">Newsletter</p>
          <h2 className="mt-4 font-serif text-4xl text-parchment sm:text-5xl">
            A quiet invitation to the next gathering.
          </h2>
          <p className="mt-5 text-base leading-8 text-parchment/75">
            Reading notes, event reminders, and thoughtful prompts will travel to members from the curator’s desk. Apply below to be added to the next dispatch.
          </p>
        </div>
        <div className="flex flex-col items-start justify-center gap-4 rounded-[1rem] border border-[#b08d57]/20 bg-[#fff6df]/90 p-8 text-[#3b1f1f]">
          <p className="font-serif text-lg">Send a request through the application form.</p>
          <Link
            className="inline-flex items-center gap-2 rounded-md border border-[#b08d57]/40 bg-[#3b1e17] px-5 py-3 font-serif text-sm uppercase tracking-[0.2em] text-[#f8efe0] transition hover:border-[#d1ae73] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
            to="/#apply"
          >
            Open the application
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
