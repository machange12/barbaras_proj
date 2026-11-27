import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { OrnateSeal } from './OrnateSeal';
import { has3dSupport } from '../../lib/capabilities';
import { useReducedMotionPref } from '../../lib/prefs';
import { playSound } from '../../lib/sound';
import { site } from '../../content/site';

type Stage = 'idle' | 'cracking' | 'opening' | 'fading';
type Side = 'l' | 'r';

const CRACK_MS = 520;
const COVER_MS = 1500;
const FADE_MS = 340;
const REDUCED_STEP_MS = 300;
const REDUCED_FADE_MS = 240;

/** One half of the front board. Both halves carry the same full-width artwork
 *  so the copy splits exactly on the spine; the right half is hidden from
 *  assistive tech because it duplicates the left. */
function CoverPanel({ side }: { side: Side }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gilt = `gilt-${uid}`;

  return (
    <div className={`cover__panel cover__panel--${side}`} aria-hidden={side === 'r' ? true : undefined}>
      <div className="cover__hinge">
        <div className="cover__face">
          <span className="cover__corner cover__corner--tl" />
          <span className="cover__corner cover__corner--tr" />
          <span className="cover__corner cover__corner--bl" />
          <span className="cover__corner cover__corner--br" />
          <span className="cover__sheen" />
        </div>

        <svg aria-hidden="true" className="cover__wordmark" focusable="false" viewBox="0 0 1000 150">
          <defs>
            <linearGradient id={gilt} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7e6b6" />
              <stop offset="28%" stopColor="#c9a45f" />
              <stop offset="52%" stopColor="#8a6a35" />
              <stop offset="74%" stopColor="#e9d198" />
              <stop offset="100%" stopColor="#a5813f" />
            </linearGradient>
          </defs>
          <text
            x="64"
            y="131"
            fill="#180609"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="170"
            opacity="0.7"
            textLength="872"
            lengthAdjust="spacing"
            transform="translate(0 3)"
          >
            {site.masthead}
          </text>
          <text
            x="64"
            y="131"
            fill="#fff4d6"
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="170"
            opacity="0.35"
            textLength="872"
            lengthAdjust="spacing"
            transform="translate(0 -2)"
          >
            {site.masthead}
          </text>
          <text
            x="64"
            y="131"
            fill={`url(#${gilt})`}
            fontFamily="'Playfair Display', Georgia, serif"
            fontSize="170"
            textLength="872"
            lengthAdjust="spacing"
          >
            {site.masthead}
          </text>
        </svg>

        <p className="cover__welcome">{site.epigraph}</p>
        <p className="cover__kicker">The Book of</p>
        <span className="cover__rule" />
        <p className="cover__foot">
          {site.tagline}
          <span className="cover__note">Essays · Notes · Creative Work · Library</span>
        </p>
        <span className="cover__thickness" />

        <div className="cover__face cover__face--back">
          <span aria-hidden="true" className="cover__inside-ornament">
            ✦
          </span>
          <span className="cover__inside-label">Ex Libris</span>
          <span className="cover__inside-name">{site.masthead}</span>
        </div>
      </div>
    </div>
  );
}

export function EntranceCover({
  onReveal,
  onEnter,
}: {
  onReveal: () => void;
  onEnter: () => void;
}) {
  const reducedPref = useReducedMotionPref();
  const [has3d] = useState(has3dSupport);
  const reduced = reducedPref || !has3d;
  const [stage, setStage] = useState<Stage>('idle');
  const [fast, setFast] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (stage === 'idle') return undefined;

    const timers: number[] = [];

    if (stage === 'cracking') {
      timers.push(
        window.setTimeout(
          () => {
            playSound('cover-open');
            setStage('opening');
          },
          reduced ? 160 : CRACK_MS,
        ),
      );
    }

    if (stage === 'opening') {
      onReveal();
      timers.push(window.setTimeout(() => setStage('fading'), reduced ? REDUCED_STEP_MS : COVER_MS));
    }

    if (stage === 'fading') {
      timers.push(window.setTimeout(onEnter, reduced ? REDUCED_FADE_MS : FADE_MS));
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [stage, reduced, onReveal, onEnter]);

  const openBook = useCallback(() => {
    if (stage !== 'idle') return;
    if (reduced) {
      playSound('cover-open');
      setStage('opening');
      return;
    }
    playSound('seal-break');
    setStage('cracking');
  }, [stage, reduced]);

  const enterNow = useCallback(() => {
    if (stage === 'fading') return;
    setFast(true);
    setStage(stage === 'opening' ? 'fading' : 'opening');
  }, [stage]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        enterNow();
        return;
      }
      if (event.key !== 'Tab' || stage === 'fading') return;
      const first = sealRef.current;
      const last = skipRef.current;
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === last)) {
        event.preventDefault();
        first.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [enterNow, stage],
  );

  return (
    <div
      aria-label="The Book of Barbie"
      aria-modal="true"
      className="entrance"
      data-fast={fast ? '1' : undefined}
      data-motion={reduced ? 'reduced' : 'full'}
      data-stage={stage}
      inert={stage === 'opening' || stage === 'fading' ? true : undefined}
      onKeyDown={handleKeyDown}
      ref={rootRef}
      role="dialog"
    >
      <div aria-hidden="true" className="entrance__backdrop" />
      <div aria-hidden="true" className="cover__pages" />

      <div className="cover">
        <CoverPanel side="l" />
        <CoverPanel side="r" />
        <span aria-hidden="true" className="cover__seam" />
        <span aria-hidden="true" className="cover__spine" />
      </div>

      <div className="seal-stage">
        <button
          aria-describedby="entrance-hint"
          aria-label="Break the seal and open the book"
          autoFocus
          className="seal-button"
          onClick={openBook}
          ref={sealRef}
          type="button"
        />
        <span aria-hidden="true" className="seal-flash" />
        <div aria-hidden="true" className="seal-break">
          <span className="seal-break__piece">
            <OrnateSeal />
          </span>
          <span className="seal-break__piece">
            <OrnateSeal />
          </span>
          <span className="seal-break__piece">
            <OrnateSeal />
          </span>
          <span className="seal-break__piece">
            <OrnateSeal />
          </span>
        </div>
      </div>

      <p className="entrance__hint" data-state={stage === 'idle' ? 'shown' : 'hidden'} id="entrance-hint">
        Press the seal to open the book
      </p>

      <div className="entrance__controls">
        <button className="entrance__skip" onClick={enterNow} ref={skipRef} type="button">
          Enter without animation
        </button>
      </div>
    </div>
  );
}
