import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';

export function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-svh bg-ink text-parchment antialiased">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
