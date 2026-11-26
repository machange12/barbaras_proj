import { ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/editorial/EmptyState';
import { EntryList } from '../../components/editorial/EntryList';
import { Reveal } from '../../components/ui/Reveal';
import { getEntriesBySection, getSection, site } from '../../content';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { NotFoundPage } from '../NotFoundPage';

export function SectionPage() {
  const { section: sectionSlug } = useParams<{ section: string }>();
  const section = getSection(sectionSlug);
  useDocumentTitle(
    section ? `${section.title} — ${site.masthead}` : `Page not found — ${site.masthead}`,
    section?.description,
  );

  if (!section) {
    return <NotFoundPage />;
  }

  const entries = getEntriesBySection(section.slug);

  return (
    <main className="paper-texture min-h-svh">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 lg:px-10 lg:pb-20 lg:pt-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-3 font-ui text-[0.6rem] uppercase tracking-[0.22em] text-muted">
          <Link className="transition-colors hover:text-gold" to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gold-soft">{section.title}</span>
        </nav>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="kicker">{section.kicker}</p>
            <h1 className="mt-5 font-display text-[clamp(3.5rem,10vw,7rem)] leading-[0.88] text-ivory">
              {section.title}
            </h1>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-gold/15 lg:pl-8 lg:pt-4">
            <p className="max-w-md text-lg leading-relaxed text-ivory/70">
              {section.description}
            </p>
            <p className="mt-6 font-ui text-[0.62rem] uppercase tracking-[0.22em] text-muted">
              {entries.length} {entries.length === 1 ? 'piece' : 'pieces'} in this section
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        {entries.length === 0 ? (
          <Reveal>
            <EmptyState message={section.emptyMessage} title={section.emptyTitle} />
            <div className="mt-8">
              <Link
                className="inline-flex items-center gap-3 border-b border-gold/40 pb-2 font-ui text-[0.62rem] uppercase tracking-[0.22em] text-gold transition-colors hover:border-gold hover:text-ivory"
                to="/"
              >
                Return to the beginning
                <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
        ) : (
          <EntryList entries={entries} section={section} />
        )}
      </section>
    </main>
  );
}
