import React, { useEffect, useRef, useState } from 'react';

const ORDER = ['summer', 'fall', 'winter', 'spring'];
const ACCENT = { spring: '#5E7C5A', summer: '#3E6B57', fall: '#9A6B3F', winter: '#3C6E80' };
const WASH = {
  spring: 'rgba(94,124,90,.14)',
  summer: 'rgba(62,107,87,.15)',
  fall: 'rgba(154,107,63,.17)',
  winter: 'rgba(60,110,128,.16)',
};
const LABEL = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };

const TREES = {
  winter: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/e410f210c_tree-winter.jpg',
  spring: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/292a405ad_tree-spring.jpg',
  summer: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/1e1115c7a_tree-summer.jpg',
  fall: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/2aa49d740_tree-fall.jpg',
};

// True current season from today's date (Northern Hemisphere).
function currentSeason() {
  const m = new Date().getMonth(); // 0-11
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

// mode 'page'  — the homepage signature: fixed full-height panel, scroll-driven
//                through the year, with the manual season control.
// mode 'hero'  — inner pages: the tree sits behind the page hero only and then
//                dissolves into canvas, held at the true current season.
export default function SeasonalTree({ mode = 'page' }) {
  const heroOnly = mode === 'hero';
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [season, setSeason] = useState(() => currentSeason());
  const imgs = useRef({});
  const manual = useRef(null); // 'spring'|'summer'|'fall'|'winter' | null (auto)
  const ticking = useRef(false);

  const setVars = (s) => {
    const root = document.documentElement;
    root.style.setProperty('--season-accent', ACCENT[s]);
    root.style.setProperty('--wash', WASH[s]);
    setSeason(s);
  };

  const paint = (s) => {
    ORDER.forEach((o) => {
      const el = imgs.current[o];
      if (el) el.style.opacity = o === s ? '1' : '0';
    });
    setVars(s);
  };

  const scrollSeason = () => {
    if (manual.current) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.min(Math.max(window.scrollY / h, 0), 1) : 0;
    const seg = p * (ORDER.length - 1);
    const i = Math.floor(seg);
    const f = seg - i;
    const cur = ORDER[Math.min(i, ORDER.length - 1)];
    const nxt = ORDER[Math.min(i + 1, ORDER.length - 1)];
    ORDER.forEach((o) => {
      const el = imgs.current[o];
      if (el) el.style.opacity = '0';
    });
    if (imgs.current[cur]) imgs.current[cur].style.opacity = String(1 - f);
    if (imgs.current[nxt]) imgs.current[nxt].style.opacity = String(f);
    setVars(f < 0.5 ? cur : nxt);
  };

  // Mount once: paint the true current season, then wire scroll listener.
  useEffect(() => {
    paint(currentSeason());

    const onScroll = () => {
      if (reduce || manual.current) return;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          scrollSeason();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    scrollSeason();
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, heroOnly]);

  const onDot = (s) => {
    manual.current = s;
    paint(s);
  };

  const onRelease = () => {
    manual.current = null;
    scrollSeason();
  };

  if (heroOnly) {
    return (
      <>
        <div className="nlw-canopy is-hero" aria-hidden="true">
          {ORDER.map((s) => (
            <img
              key={s}
              ref={(el) => { imgs.current[s] = el; }}
              data-season={s}
              src={TREES[s]}
              alt=""
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="nlw-wash" aria-hidden="true" />
      </>
    );
  }

  return (
    <>
      <div className="nlw-canopy" aria-hidden="true">
        {ORDER.map((s) => (
          <img
            key={s}
            ref={(el) => { imgs.current[s] = el; }}
            data-season={s}
            src={TREES[s]}
            alt=""
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="nlw-wash" aria-hidden="true" />

      <div className="nlw-season-ctl" role="group" aria-label="Seasonal view">
        <span
          className="nlw-season-name"
          title="Return to automatic season"
          onClick={onRelease}
        >
          {LABEL[season]}
        </span>
        <div className="nlw-dots">
          {['spring', 'summer', 'fall', 'winter'].map((s) => (
            <button
              key={s}
              className="nlw-dot"
              data-s={s}
              aria-label={LABEL[s]}
              aria-current={season === s ? 'true' : 'false'}
              onClick={() => onDot(s)}
            />
          ))}
        </div>
      </div>
    </>
  );
}