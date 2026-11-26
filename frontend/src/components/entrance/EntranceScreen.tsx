import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import libraryImage from '../../assets/images/old-library.jpg';

type Stage = 'idle' | 'pressing' | 'opening' | 'revealing';

export function EntranceScreen({
  onReveal,
  onEnter,
}: {
  onReveal: () => void;
  onEnter: () => void;
}) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>('idle');

  useEffect(() => {
    if (stage === 'idle') {
      return;
    }

    const timers: number[] = [];

    if (stage === 'pressing') {
      timers.push(window.setTimeout(() => setStage('opening'), 320));
    }

    if (stage === 'opening') {
      timers.push(window.setTimeout(() => setStage('revealing'), 1450));
    }

    if (stage === 'revealing') {
      onReveal();
      timers.push(window.setTimeout(() => onEnter(), reduce ? 220 : 620));
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [stage, onReveal, onEnter, reduce]);

  const revealing = stage === 'revealing';
  const coverOpen = !reduce && (stage === 'opening' || revealing);

  function openBook() {
    if (stage !== 'idle') {
      return;
    }

    if (reduce) {
      setStage('revealing');
      return;
    }

    setStage('pressing');
  }

  function skip() {
    if (stage === 'revealing') {
      return;
    }

    setStage('revealing');
  }

  return (
    <motion.div
      animate={{ opacity: revealing ? 0 : 1 }}
      aria-label="The Book of Barbie"
      aria-modal="true"
      className="entrance"
      role="dialog"
      transition={{ duration: reduce ? 0.18 : 0.6, ease: 'easeInOut' }}
    >
      <div
        aria-hidden="true"
        className="entrance__photo"
        style={{ backgroundImage: `url(${libraryImage})` }}
      />
      <div aria-hidden="true" className="entrance__glow" />
      <div aria-hidden="true" className="entrance__vignette" />

      <div className="entrance__inner">
        <p className="entrance__eyebrow">The Book of Barbie</p>

        <div className="book-stage">
          <motion.div
            animate={{
              rotateX: reduce ? 0 : 5,
              rotateY: reduce ? 0 : -5,
              scale: revealing && !reduce ? 1.06 : 1,
              y: revealing && !reduce ? -12 : 0,
            }}
            className="book"
            transition={{ duration: reduce ? 0 : 0.8, ease: 'easeInOut' }}
          >
            <div className="book__back" />

            <div className="book__pages">
              <div className="book__page">
                <div className="book__page-inner">
                  <span aria-hidden="true" className="book__page-ornament">
                    ✦
                  </span>
                  <p className="book__page-title">
                    A personal archive of thought, writing, and creative work.
                  </p>
                  <span aria-hidden="true" className="book__page-ornament">
                    ✦
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              animate={{ rotateY: coverOpen ? -158 : 0 }}
              className="book__cover"
              style={{ transformOrigin: 'left center' }}
              transition={{ duration: reduce ? 0 : 1.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="book__face book__face--front">
                <div className="book__frame">
                  <span aria-hidden="true" className="book__corner book__corner--tl" />
                  <span aria-hidden="true" className="book__corner book__corner--tr" />
                  <span aria-hidden="true" className="book__corner book__corner--bl" />
                  <span aria-hidden="true" className="book__corner book__corner--br" />

                  <p className="book__cover-kicker">The Book of</p>
                  <h1 className="book__title">BARBIE</h1>
                  <span aria-hidden="true" className="book__title-rule" />
                  <p className="book__cover-subtitle">A personal archive</p>

                  <motion.button
                    animate={
                      stage === 'pressing'
                        ? { scale: 0.9, y: 3 }
                        : coverOpen || revealing
                          ? { scale: 0.96, opacity: 0, y: 8 }
                          : { scale: 1, opacity: 1, y: 0 }
                    }
                    aria-label="Open the book"
                    autoFocus
                    className="book__seal"
                    onClick={openBook}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    type="button"
                  >
                    <span aria-hidden="true" className="seal__ring" />
                    <span aria-hidden="true" className="book__seal-letter">
                      B
                    </span>
                  </motion.button>

                  <p className="book__cover-note">
                    Essays · Notes · Creative Work · Library
                  </p>
                </div>
              </div>

              <div className="book__face book__face--back">
                <div className="book__inside-cover">
                  <span aria-hidden="true" className="book__inside-ornament">
                    ✦
                  </span>
                  <p>Ex Libris</p>
                  <span className="book__inside-name">BARBIE</span>
                </div>
              </div>
            </motion.div>

            <div className="book__spine" />
          </motion.div>
        </div>

        <p className="entrance__welcome">Welcome to the mysteries of a philosopher.</p>
        <p className="entrance__hint">Press the seal to open the book</p>
        <button className="entrance__skip" onClick={skip} type="button">
          Enter without animation
        </button>
      </div>
    </motion.div>
  );
}
