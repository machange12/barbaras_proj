import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Section, WritingEntry } from '../../content/types';
import { formatDate, getReadingTime } from '../../lib/format';

export function EntryList({
  entries,
  section,
}: {
  entries: WritingEntry[];
  section: Section;
}) {
  return (
    <div className="border-t border-gold/20">
      {entries.map((entry, index) => {
        const readingTime = getReadingTime(entry);

        return (
          <Link
            className="entry-row group grid gap-4 border-b border-gold/20 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-6 lg:py-10"
            key={entry.slug}
            to={`/${section.slug}/${entry.slug}`}
          >
            <span className="font-display text-xl text-gold/50">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.62rem] uppercase tracking-[0.22em] text-muted">
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                {readingTime ? <span>{readingTime}</span> : null}
                {entry.tags?.length ? <span>{entry.tags.join(' · ')}</span> : null}
              </div>
              <h2 className="entry-row__title mt-3 font-display text-2xl leading-tight text-ivory transition-colors sm:text-3xl">
                {entry.title}
              </h2>
              {entry.summary ? (
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ivory/65">
                  {entry.summary}
                </p>
              ) : null}
            </div>
            <ArrowUpRight
              aria-hidden="true"
              className="entry-row__arrow hidden size-5 text-gold-soft sm:block"
              strokeWidth={1.4}
            />
          </Link>
        );
      })}
    </div>
  );
}
