import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

type NavItem = { label: string; to: string };

export const PRIMARY_NAV: ReadonlyArray<NavItem> = [
  { label: 'Home', to: '/' },
  { label: 'History', to: '/history' },
  { label: 'Society', to: '/society' },
];

export const SECTION_NAV: ReadonlyArray<NavItem> = [
  { label: 'Bookshelf', to: '/#bookshelf' },
  { label: 'Archive', to: '/#archive' },
  { label: 'Essays', to: '/#essays' },
  { label: 'Debates', to: '/#debates' },
  { label: 'Apply', to: '/#apply' },
];

const ALL_NAV: ReadonlyArray<NavItem> = [...PRIMARY_NAV, ...SECTION_NAV];

function isActive(itemTo: string, pathname: string, hash: string) {
  if (itemTo.startsWith('/#')) {
    return pathname === '/' && hash === itemTo.slice(1);
  }
  if (itemTo === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(itemTo);
}

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, status } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-10">
      <Link
        aria-label="The Salon, home"
        className="font-serif text-lg uppercase tracking-[0.24em] text-parchment drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
        to="/"
      >
        The Salon
      </Link>

      <nav
        aria-label="Primary navigation"
        className="hidden items-center gap-6 rounded-2xl border border-brass/20 bg-[#2d1c13]/85 px-5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm md:flex"
      >
        {ALL_NAV.map((item) => {
          const active = isActive(item.to, location.pathname, location.hash);
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={`text-xs uppercase tracking-[0.14em] transition duration-300 hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass ${
                active ? 'text-parchment' : 'text-parchment/70'
              }`}
              key={item.label}
              to={item.to}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {status === 'authenticated' && user ? (
          <div className="hidden items-center gap-3 rounded-full border border-brass/30 bg-[#2d1c13]/70 px-3 py-2 text-sm text-parchment/80 md:flex">
            <span>{user.name}</span>
            {user.role === 'curator' ? <span className="text-brass">Curator</span> : null}
            <button className="text-xs uppercase tracking-[0.14em] text-brass" onClick={() => void handleLogout()} type="button">
              Logout
            </button>
          </div>
        ) : (
          <Link className="hidden rounded-full border border-brass/30 px-3 py-2 text-sm uppercase tracking-[0.14em] text-parchment/80 hover:text-parchment md:inline-flex" to="/login">
            Login
          </Link>
        )}
        <button
          aria-controls="mobile-nav"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-brass/30 bg-[#2d1c13]/80 text-parchment md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full z-40 mx-auto mt-2 max-w-7xl px-5 md:hidden"
          id="mobile-nav"
        >
          <ul className="grid gap-1 rounded-2xl border border-brass/20 bg-[#2d1c13]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            {ALL_NAV.map((item) => {
              const active = isActive(item.to, location.pathname, location.hash);
              return (
                <li key={item.label}>
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-md px-3 py-3 text-sm uppercase tracking-[0.14em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass ${
                      active ? 'bg-brass/15 text-parchment' : 'text-parchment/80 hover:bg-brass/10'
                    }`}
                    to={item.to}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            {status === 'authenticated' && user ? (
              <li>
                <button className="block w-full rounded-md px-3 py-3 text-left text-sm uppercase tracking-[0.14em] text-parchment/80 hover:bg-brass/10" onClick={() => void handleLogout()} type="button">
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <Link className="block rounded-md px-3 py-3 text-sm uppercase tracking-[0.14em] text-parchment/80 hover:bg-brass/10" to="/login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
