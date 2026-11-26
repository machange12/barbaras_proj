import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sections, site } from '../content';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle(`Page not found — ${site.masthead}`);

  return (
    <main className="paper-texture flex min-h-svh items-center px-5 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <p className="kicker">404 · Missing page</p>
        <h1 className="mt-5 font-display text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.95] text-ivory">
          This page has slipped from the binding.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ivory/65">
          The page you asked for is not part of the archive. Return to the beginning
          or choose a section below.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center gap-3 border border-gold/40 px-5 py-3 font-ui text-[0.62rem] uppercase tracking-[0.22em] text-gold transition-colors hover:border-gold hover:text-ivory"
            to="/"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            Home
          </Link>
          {sections.map((section) => (
            <Link
              className="inline-flex items-center border border-gold/20 px-5 py-3 font-ui text-[0.62rem] uppercase tracking-[0.22em] text-ivory/65 transition-colors hover:border-gold/60 hover:text-ivory"
              key={section.slug}
              to={`/${section.slug}`}
            >
              {section.title}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
