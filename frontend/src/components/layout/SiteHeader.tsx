import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { sections } from '../../content/sections';
import { Seal } from '../ui/Seal';

const navItems = [
  { label: 'Home', to: '/' },
  ...sections.map((section) => ({ label: section.navLabel, to: `/${section.slug}` })),
];

function isActive(to: string, pathname: string): boolean {
  if (to === '/') {
    return pathname === '/';
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-void/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-10">
        <Link
          aria-label="BARBIE, home"
          className="group flex items-center gap-3"
          to="/"
        >
          <Seal size="sm" />
          <span className="font-display text-base uppercase tracking-[0.34em] text-ivory transition-colors group-hover:text-gold">
            BARBIE
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const active = isActive(item.to, location.pathname);

            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className={`relative py-1 font-ui text-[0.62rem] uppercase tracking-[0.22em] transition-colors ${
                  active ? 'text-gold' : 'text-ivory/65 hover:text-ivory'
                }`}
                key={item.to}
                to={item.to}
              >
                {item.label}
                <span
                  className={`absolute inset-x-0 -bottom-1 h-px origin-left bg-gold transition-transform duration-300 ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <button
          aria-controls="mobile-nav"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-10 w-10 items-center justify-center border border-gold/30 text-ivory transition-colors hover:border-gold/70 md:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-gold/15 bg-void px-5 pb-6 pt-2 md:hidden"
          id="mobile-nav"
        >
          <ul className="divide-y divide-gold/10">
            {navItems.map((item) => {
              const active = isActive(item.to, location.pathname);

              return (
                <li key={item.to}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between py-4 font-display text-2xl transition-colors ${
                      active ? 'text-gold' : 'text-ivory/80 hover:text-ivory'
                    }`}
                    to={item.to}
                  >
                    {item.label}
                    <span aria-hidden="true" className="font-body text-sm text-gold-soft">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
