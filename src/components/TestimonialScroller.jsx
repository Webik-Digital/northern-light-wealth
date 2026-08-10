import React, { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

// The section pins while the page scrolls through it, turning that vertical
// scroll into the cards moving sideways. The card nearest the middle of the
// viewport is the one being read, so it takes the plum. When the track runs
// out the section releases and the page carries on down.
export default function TestimonialScroller({ items = [] }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const [x, setX] = useState(0);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(true);
  const raf = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || items.length === 0) return undefined;

    // Below the breakpoint the section is a plain swipe list: pinning a
    // horizontal scroll on a touch device fights the user's own gesture.
    const small = window.matchMedia('(max-width: 900px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    const measure = () => {
      if (small.matches || reduce.matches) {
        setPinned(false);
        setX(0);
        wrap.style.height = '';
        return;
      }
      setPinned(true);
      const cards = [...track.children];
      if (cards.length === 0) return;

      const mid = window.innerWidth / 2;
      // offsetLeft ignores the transform, so these stay true while the track moves
      const centreOf = (c) => c.offsetLeft - track.offsetLeft + c.offsetWidth / 2;
      // read the live translate off the DOM: React state here would be a stale
      // closure, since this effect only re-runs when the card count changes
      const curX = new DOMMatrix(getComputedStyle(track).transform).m41;
      const trackLeft0 = track.getBoundingClientRect().left - curX;

      // Derive the run from where the cards actually are rather than from
      // scrollWidth against a viewport width: the CSS padding is in vw, which
      // counts the scrollbar, and the mismatch left the last card short of centre.
      const xFor = (i) => mid - trackLeft0 - centreOf(cards[i]);
      const xStart = xFor(0);
      const xEnd = xFor(cards.length - 1);
      const travel = Math.max(xStart - xEnd, 0);
      wrap.style.height = `${window.innerHeight + travel}px`;

      const rect = wrap.getBoundingClientRect();
      const p = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;
      const nextX = xStart + p * (xEnd - xStart);
      setX(nextX);

      // whichever card lands nearest the middle is the one being read
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(trackLeft0 + nextX + centreOf(c) - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActive(best);
    };

    const onScroll = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => { raf.current = 0; measure(); });
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      wrap.style.height = '';
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className={`nlw-tscroll${pinned ? ' is-pinned' : ''}`} ref={wrapRef}>
      <div className="nlw-tscroll-panel">
        <div className="nlw-wrap">
          <Reveal className="nlw-head">
            <p className="nlw-eyebrow">In their words</p>
            <h2 className="nlw-h2">What clients say about the work.</h2>
          </Reveal>
        </div>

        <div className="nlw-tscroll-viewport">
          <div
            className="nlw-tscroll-track"
            ref={trackRef}
            style={pinned ? { transform: `translate3d(${x}px,0,0)` } : undefined}
          >
            {items.map((t, i) => (
              <figure
                key={i}
                className={`nlw-tcard${i === active && pinned ? ' is-center' : ''}`}
              >
                {t.placeholder && <span className="flag">Placeholder</span>}
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <span className="who">{t.who}</span>
                  {t.pathway && <span className="tag">{t.pathway}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
