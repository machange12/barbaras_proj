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
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
      <Link
        className="font-serif text-base uppercase tracking-[0.28em] text-parchment"
        to="/"
      >
        The Reading Salon
      </Link>
      <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
        {navigationItems.map((item) => (
          <Link
            className={`text-sm transition hover:text-parchment ${
              location.pathname === item.to ? 'text-parchment' : 'text-parchment/68'
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
