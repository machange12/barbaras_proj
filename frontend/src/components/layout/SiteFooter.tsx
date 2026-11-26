import { Link } from 'react-router-dom';
import { sections } from '../../content/sections';
import { site } from '../../content/site';
import { Seal } from '../ui/Seal';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/15 bg-night px-5 py-14 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <Seal size="md" />
              <p className="font-display text-lg uppercase tracking-[0.3em] text-ivory">
                {site.masthead}
              </p>
            </div>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-ivory/60">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-sm font-body text-sm italic text-gold/70">
              {site.epigraph}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="kicker">Sections</p>
            <ul className="mt-5 space-y-3">
              {sections.map((section) => (
                <li key={section.slug}>
                  <Link
                    className="text-sm text-ivory/65 transition-colors hover:text-gold"
                    to={`/${section.slug}`}
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <p className="kicker">Elsewhere</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  className="text-ivory/65 transition-colors hover:text-gold"
                  to="/about"
                >
                  About this archive
                </Link>
              </li>
              <li>
                <a
                  className="break-all text-ivory/65 transition-colors hover:text-gold"
                  href={`mailto:${site.contactEmail}`}
                >
                  {site.contactEmail}
                </a>
              </li>
            </ul>
            <p className="mt-8 text-xs leading-relaxed text-muted">
              Set in Playfair Display and EB Garamond. Built as a static literary archive.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-gold/10 pt-6 text-xs uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.masthead}</p>
          <p>{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
