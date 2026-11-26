import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { isSectionSlug } from '../../content/sections';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  const segments = location.pathname.split('/').filter(Boolean);
  const isArticle = segments.length === 2 && isSectionSlug(segments[0]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));

    if (target) {
      target.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }, [location.pathname, location.hash, reduce]);

  return (
    <div className="flex min-h-svh flex-col bg-void text-ivory">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ivory focus:px-4 focus:py-2 focus:text-ink"
        href="#main-content"
      >
        Skip to content
      </a>

      <SiteHeader />

      <div className="page-viewport flex-1">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, rotateY: 0 }}
            className={`page-shell ${isArticle ? 'bg-ivory' : 'bg-void'}`}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -18, rotateY: -4 }}
            id="main-content"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24, rotateY: 4 }}
            key={location.pathname}
            transition={{ duration: reduce ? 0.15 : 0.38, ease: 'easeOut' }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </div>

      <SiteFooter />
    </div>
  );
}
