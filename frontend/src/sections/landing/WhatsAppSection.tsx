import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export function WhatsAppSection() {
  return (
    <motion.section
      className="border-b border-brass/20 bg-[#f7ebd5] px-5 py-20 sm:px-8 lg:px-10"
      id="whatsapp"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
    >
      <div className="mx-auto max-w-7xl">
        <div className="room-frame rounded-[1.4rem] bg-[#f6eee0]/95 p-8 sm:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#5c4033]">
                WhatsApp Community
              </p>
              <h2 className="mt-3 font-serif text-4xl text-[#2b1e17] sm:text-5xl">
                Conversations that continue after the room closes.
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1f2a2e]/30 bg-[#1f2a2e] px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#d8c8a3]">
              <Users aria-hidden="true" className="size-4" />
              Private group
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#3e2a1f]/88">
            After acceptance, members continue the conversation in a private WhatsApp group where texts, notes, and invitations are shared with the same care as the salon room.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
