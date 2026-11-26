import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '../../components/ui/Reveal';
import { sections, site } from '../../content';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

export function AboutPage() {
  useDocumentTitle(
    `About — ${site.masthead}`,
    'About the BARBIE personal archive of thought, writing, and creative work.',
  );

  return (
    <main className="paper-texture min-h-svh">
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-8 lg:px-10 lg:pt-20">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-3 font-ui text-[0.6rem] uppercase tracking-[0.22em] text-muted"
        >
          <Link className="transition-colors hover:text-gold" to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gold-soft">About</span>
        </nav>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="kicker">About the archive</p>
            <h1 className="mt-6 max-w-4xl font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] text-ivory">
              A personal archive of thought, writing, and creative work.
            </h1>
          </div>
          <div className="lg:col-span-5 lg:border-l lg:border-gold/15 lg:pl-8 lg:pt-4">
            <p className="text-lg leading-relaxed text-ivory/70">
              BARBIE gathers essays, notes, creative writing, and reading reflections in
              one place. It is arranged for slow reading and return visits rather than
              for the tempo of a feed.
            </p>
            <p className="mt-5 text-base leading-relaxed text-ivory/60">
              This is not a commercial publication. It is a personal record of
              questions, arguments, observations, and imaginative work as they are
              written.
            </p>
            <p className="mt-8 max-w-sm font-body text-lg italic text-gold/70">
              {site.epigraph}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-gold/20 bg-night/55">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-20">
          <div className="lg:col-span-4">
            <p className="kicker">The author</p>
          </div>
          <div className="lg:col-span-8">
            <Reveal className="border border-gold/20 bg-void/40 p-8 sm:p-10">
              <span aria-hidden="true" className="font-display text-2xl text-gold-dim">
                ✦
              </span>
              <h2 className="mt-4 font-display text-3xl leading-tight text-ivory sm:text-4xl">
                A biographical note will appear here.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                This space is reserved for the author&apos;s own account of their work and
                intellectual life. No biography has been invented for it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="kicker">The sections</p>
          </div>
          <div className="lg:col-span-8">
            <div className="divide-y divide-gold/15 border-y border-gold/15">
              {sections.map((section) => (
                <Link
                  className="group flex items-center justify-between gap-6 py-5"
                  key={section.slug}
                  to={`/${section.slug}`}
                >
                  <div>
                    <h2 className="font-display text-2xl text-ivory transition-colors group-hover:text-gold">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-ivory/55">
                      {section.description}
                    </p>
                  </div>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-gold-soft transition-transform group-hover:translate-x-1"
                    strokeWidth={1.5}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gold/20 bg-night/55">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:px-10 lg:py-20">
          <div className="lg:col-span-4">
            <p className="kicker">Colophon</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8">
            <div>
              <h2 className="font-display text-2xl text-ivory">Typography &amp; design</h2>
              <p className="mt-3 text-sm leading-relaxed text-ivory/60">
                Set in Playfair Display and EB Garamond. Designed as a quiet,
                book-like archive: dark library tones, warm paper, and antique gold.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-ivory">Correspondence</h2>
              <p className="mt-3 text-sm leading-relaxed text-ivory/60">
                For correspondence, write to{' '}
                <a
                  className="break-all text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-ivory"
                  href={`mailto:${site.contactEmail}`}
                >
                  {site.contactEmail}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
