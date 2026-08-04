import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// A brief, brand-aligned transition between routes: a slim seasonal-accent
// line sweeps across the top while a soft canvas veil fades the page out/in.
// It only shows on real path changes, never on hash-only navigation, and it
// honours reduced-motion users by skipping the animation entirely.
const DURATION = 520;
const reduce =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PageTransition() {
  const { pathname, hash } = useLocation();
  const [active, setActive] = useState(false);
  const first = useRef(true);
  const lastPath = useRef(pathname);

  useEffect(() => {
    const samePath = pathname === lastPath.current;
    lastPath.current = pathname;
    if (first.current || samePath || reduce) {
      first.current = false;
      return;
    }

    setActive(true);
    const t = window.setTimeout(() => setActive(false), DURATION);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash]);

  if (!active) return null;

  return (
    <div className="nlw-page-transition" aria-hidden="true">
      <div className="nlw-pt-veil" />
      <div className="nlw-pt-bar">
        <span />
      </div>
    </div>
  );
}