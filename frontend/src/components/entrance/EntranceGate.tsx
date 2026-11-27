import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { EntranceCover } from './EntranceCover';

const STORAGE_KEY = 'barbie:entered';

function hasEntered(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberEntry() {
  try {
    sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    return;
  }
}

export function EntranceGate({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(hasEntered);
  const [revealed, setRevealed] = useState(entered);

  useEffect(() => {
    if (entered) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [entered]);

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleEnter = useCallback(() => {
    rememberEntry();
    setRevealed(true);
    setEntered(true);
  }, []);

  return (
    <>
      {revealed ? (
        <div
          aria-hidden={!entered ? true : undefined}
          className={!entered ? 'pointer-events-none' : undefined}
          inert={!entered}
        >
          {children}
        </div>
      ) : null}
      {!entered ? <EntranceCover onEnter={handleEnter} onReveal={handleReveal} /> : null}
    </>
  );
}
