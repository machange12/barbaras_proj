import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSection } from '../../content/sections';
import type { WritingEntry } from '../../content/types';
import { formatDate, getReadingTime } from '../../lib/format';

export function FeaturedEntry({ entry }: { entry: WritingEntry }) {
  const section = getSection(entry.section);
  const readingTime = getReadingTime(entry);

  if (!section) {
    return null;
  }

  return (
    <Link className="group block" to={`/${entry.section}/${entry.slug}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.62rem] uppercase tracking-[0.22em] text-muted">
        <span>{section.title}</span>
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
        {readingTime ? <span>{readingTime}</span> : null}
      </div>
      <h2 className="mt-4 font-display text-3xl leading-tight text-ivory transition-colors group-hover:text-gold sm:text-4xl">
        {entry.title}
      </h2>
      {entry.summary ? (
        <p className="mt-4 text-base leading-relaxed text-ivory/65">{entry.summary}</p>
      ) : null}
      <div className="mt-6 flex items-center gap-3 text-[0.62rem] uppercase tracking-[0.22em] text-gold-soft">
        <span>Read the piece</span>
        <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
      </div>
    </Link>
  );
}
