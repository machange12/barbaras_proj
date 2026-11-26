import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeaturedEntry } from '../../components/editorial/FeaturedEntry';
import { Reveal } from '../../components/ui/Reveal';
import { getFeaturedEntry, getRecentEntries, sections, site } from '../../content';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

export function HomePage() {
  useDocumentTitle(`${site.masthead} — ${site.tagline}`, site.description);

  const featured = getFeaturedEntry();
  const recent = getRecentEntries(5);
  const secondary = featured
    ? recent.filter((entry) => entry.slug !== featured.slug).slice(0, 4)
    : recent.slice(0, 4);

  return (
    <main className="relative min-h-svh overflow-hidden">
      <div aria-hidden="true" className="home-glow" />

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="kicker">A personal archive</p>
            <h1 className="mt-6 font-display text-[clamp(4.5rem,17vw,11rem)] font-medium leading-[0.78] tracking-[0.035em] text-ivory">
              BARBIE
            </h1>
            <p className="mt-8 max-w-xl font-body text-xl leading-relaxed text-ivory/70 sm:text-2xl">
              {site.tagline}
            </p>
            <p className="mt-10 max-w-md font-body text-lg italic leading-relaxed text-gold/75">
              {site.epigraph}
            </p>
            <div className="mt-12 flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-16 bg-gold/40" />
              <span className="font-ui text-[0.6rem] uppercase tracking-[0.3em] text-muted">
                Essays · Notes · Creative Work · Library
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-gold/15 lg:pl-10 lg:pt-10">
            <div className="flex items-baseline justify-between border-t border-gold/30 pt-5">
              <p className="kicker">Selected writing</p>
              <span className="font-ui text-[0.6rem] uppercase tracking-[0.22em] text-muted">
                01
              </span>
            </div>
            <div className="mt-7">
              {featured ? (
                <FeaturedEntry entry={featured} />
              ) : (
                <div className="border border-gold/20 bg-night/50 p-6">
                  <p className="font-display text-2xl text-ivory">The first page is blank.</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    New essays, notes, and creative work will appear here as they are
                    written.
                  </p>
                </div>
              )}
            </div>

            {secondary.length > 0 ? (
              <div className="mt-10 border-t border-gold/15 pt-6">
                <p className="kicker">Recent</p>
                <ul className="mt-5 divide-y divide-gold/10">
                  {secondary.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        className="group flex items-baseline justify-between gap-4 py-3"
                        to={`/${entry.section}/${entry.slug}`}
                      >
                        <span className="font-display text-lg leading-snug text-ivory/80 transition-colors group-hover:text-gold">
                          {entry.title}
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-gold-soft"
                          strokeWidth={1.4}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-y border-gold/20 bg-night/55">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="kicker">The sections</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight text-ivory sm:text-5xl">
                Four rooms of the archive.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Each section holds a different kind of attention. Enter where the work
              asks you to begin.
            </p>
          </Reveal>

          <div className="mt-12 divide-y divide-gold/15 border-y border-gold/15">
            {sections.map((section, index) => (
              <Reveal delay={index * 0.05} key={section.slug}>
                <Link
                  className="group grid gap-4 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-6 lg:py-10"
                  to={`/${section.slug}`}
                >
                  <span className="font-display text-2xl text-gold/45">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-3xl text-ivory transition-colors group-hover:text-gold sm:text-4xl">
                      {section.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-ivory/60">
                      {section.description}
                    </p>
                  </div>
                  <span className="hidden items-center gap-2 font-ui text-[0.6rem] uppercase tracking-[0.22em] text-gold-soft sm:flex">
                    Enter
                    <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="kicker">About the archive</p>
          </div>
          <div className="lg:col-span-8">
            <p className="max-w-3xl font-display text-3xl leading-snug text-ivory/85 sm:text-4xl">
              A record of reading, thinking, and making — kept in one place, arranged
              for slow attention.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-3 border-b border-gold/40 pb-2 font-ui text-[0.62rem] uppercase tracking-[0.22em] text-gold transition-colors hover:border-gold hover:text-ivory"
              to="/about"
            >
              Read the about page
              <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
