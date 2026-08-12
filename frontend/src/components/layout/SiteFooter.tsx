import { Mail, MessagesSquare } from 'lucide-react';

const CONTACT_EMAIL = 'barbara55nyachieo@gmail.com';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-brass/20 bg-[#1f2a2e] px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[1.3rem] border border-[#b08d57]/20 bg-[#24353a]/90 p-8 text-parchment/80 sm:flex-row sm:justify-between">
        <div>
          <p className="font-serif text-sm uppercase tracking-[0.28em] text-brass">Contact</p>
          <h2 className="mt-3 font-serif text-3xl text-[#f8efe0]">The Salon</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-parchment/70">
            Reach the curator for membership, events, and the private community after acceptance.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <a
            className="flex items-center gap-2 break-all transition hover:text-[#f8efe0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
            href={`mailto:${CONTACT_EMAIL}`}
          >
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            {CONTACT_EMAIL}
          </a>
          <div className="flex items-center gap-2 text-parchment/60">
            <MessagesSquare aria-hidden="true" className="size-4" />
            Salon chat opens after approval
          </div>
          <div className="pt-2 text-parchment/60">© {year} The Salon. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
