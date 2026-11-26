import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState } from '../../components/editorial/EmptyState';
import { Markdown } from '../../components/editorial/Markdown';
import { ReadingProgress } from '../../components/editorial/ReadingProgress';
import {
  getAdjacentEntries,
  getEntry,
  getSection,
  site,
} from '../../content';
import type { Section, WritingEntry } from '../../content/types';
import { formatDate, getReadingTime } from '../../lib/format';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { NotFoundPage } from '../NotFoundPage';

function ArticleNav({
  direction,
  entry,
  section,
  align = 'left',
}: {
  direction: 'Previous' | 'Next';
  entry: WritingEntry;
  section: Section;
  align?: 'left' | 'right';
}) {
  return (
    <Link
      className={`group block border-t border-wine/20 pt-5 ${
        align === 'right' ? 'text-right' : ''
      }`}
      to={`/${section.slug}/${entry.slug}`}
    >
      <span className="font-ui text-[0.58rem] uppercase tracking-[0.24em] text-wine/60">
        {direction}
      </span>
      <span className="mt-2 block font-display text-xl leading-snug text-wine transition-colors group-hover:text-burgundy">
        {entry.title}
      </span>
    </Link>
  );
}

export function ArticlePage() {
  const { section: sectionSlug, slug } = useParams<{ section: string; slug: string }>();
  const section = getSection(sectionSlug);
  const entry = section && slug ? getEntry(section.slug, slug) : undefined;
  useDocumentTitle(
    entry ? `${entry.title} — ${site.masthead}` : `Page not found — ${site.masthead}`,
    entry?.summary ?? site.description,
  );

  if (!section || !entry) {
    return <NotFoundPage />;
  }

  const readingTime = getReadingTime(entry);
  const { previous, next } = getAdjacentEntries(section.slug, entry.slug);

  return (
    <main className="article-page min-h-svh">
      <ReadingProgress />

      <article className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 lg:px-10 lg:pb-28 lg:pt-14">
        <div className="mx-auto max-w-4xl">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-3 font-ui text-[0.6rem] uppercase tracking-[0.22em] text-ink/55"
          >
            <Link className="transition-colors hover:text-wine" to="/">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link className="transition-colors hover:text-wine" to={`/${section.slug}`}>
              {section.title}
            </Link>
          </nav>

          <header className="mt-12 border-t border-wine/20 pt-10">
            <span aria-hidden="true" className="font-display text-lg text-gold-dim">
              ✦
            </span>
            <p className="mt-5 font-ui text-[0.62rem] uppercase tracking-[0.28em] text-wine/70">
              {section.title}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.7rem,7vw,5.4rem)] leading-[0.98] text-wine">
              {entry.title}
            </h1>
            {entry.summary ? (
              <p className="mt-6 max-w-2xl font-body text-xl leading-relaxed text-ink/70">
                {entry.summary}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-ui text-[0.6rem] uppercase tracking-[0.2em] text-ink/55">
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
              {readingTime ? <span>{readingTime}</span> : null}
              {entry.tags?.length ? <span>{entry.tags.join(' · ')}</span> : null}
            </div>
          </header>

          <div className="mt-12 max-w-3xl">
            {entry.body.trim() ? (
              <div className="prose-barbie">
                <Markdown>{entry.body}</Markdown>
              </div>
            ) : (
              <EmptyState
                message="The text of this piece has not been added to the archive yet."
                title="This page is waiting for its text."
                tone="paper"
              />
            )}
          </div>

          <footer className="mt-20 max-w-3xl border-t border-wine/20 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                className="inline-flex items-center gap-3 font-ui text-[0.6rem] uppercase tracking-[0.22em] text-wine/70 transition-colors hover:text-wine"
                to={`/${section.slug}`}
              >
                <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
                Return to {section.title}
              </Link>
              <Link
                className="inline-flex items-center gap-3 font-ui text-[0.6rem] uppercase tracking-[0.22em] text-wine/70 transition-colors hover:text-wine"
                to="/"
              >
                Home
                <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
              </Link>
            </div>

            {previous || next ? (
              <nav aria-label="Adjacent pieces" className="mt-10 grid gap-6 sm:grid-cols-2">
                {previous ? (
                  <ArticleNav direction="Previous" entry={previous} section={section} />
                ) : (
                  <div />
                )}
                {next ? (
                  <ArticleNav align="right" direction="Next" entry={next} section={section} />
                ) : null}
              </nav>
            ) : null}
          </footer>
        </div>
      </article>
    </main>
  );
}
