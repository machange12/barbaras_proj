import { Link, useLocation } from 'react-router-dom'

const navigationItems = [
  { label: 'History', to: '/history' },
  { label: 'Society', to: '/society' },
  { label: 'Bookshelf', to: '/#bookshelf' },
  { label: 'Essays', to: '/#essays' },
  { label: 'Debates', to: '/#debates' },
  { label: 'Apply', to: '/#apply' },
]

export function SiteHeader() {
  const location = useLocation()

  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-10">
      <Link
        className="font-serif text-lg uppercase tracking-[0.24em] text-parchment drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
        to="/"
      >
        The Salon
      </Link>
      <nav
        aria-label="Primary navigation"
        className="hidden items-center gap-6 rounded-2xl border border-brass/20 bg-[#2d1c13]/85 px-5 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm md:flex"
      >
        {navigationItems.map((item) => (
          <Link
            className={`text-xs uppercase tracking-[0.14em] text-parchment/80 transition duration-300 hover:text-parchment ${
              location.pathname === item.to ? 'text-parchment' : ''
            }`}
            key={item.label}
            to={item.to}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
