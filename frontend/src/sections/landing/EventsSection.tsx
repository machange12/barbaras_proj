import { motion } from 'framer-motion';
import { eventItems } from '../../content/landing';

export function EventsSection() {
  return (
    <motion.section
      className="border-b border-brass/20 bg-[#3b1f1f] px-5 py-20 sm:px-8 lg:px-10"
      id="events"
      initial="hidden"
      viewport={{ once: true, amount: 0.2 }}
      whileInView="visible"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 rounded-[1.4rem] border border-[#b08d57]/20 bg-[#2b1e17]/90 p-8 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.7)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-[#b08d57]">Events</p>
            <h2 className="mt-4 font-serif text-4xl text-parchment sm:text-5xl">
              Gatherings in the hearth room and the reading circle.
            </h2>
          </div>
          <div className="grid gap-4 text-sm text-parchment/80 sm:grid-cols-2">
            {eventItems.map((event) => (
              <div className="rounded-[1rem] border border-[#b08d57]/15 bg-[#312d26]/90 p-4" key={event.title}>
                <h3 className="font-serif text-lg text-[#f8efe0]">{event.title}</h3>
                <p className="mt-2 leading-7">{event.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
