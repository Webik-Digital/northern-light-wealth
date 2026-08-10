import React, { useEffect, useRef, useState } from 'react';

// A pinned section: the panel holds still while the page scrolls through it,
// swapping the text on the left and wiping the paired image in on the right.
// steps: [{ title?, body?, image, alt }]
export default function StickyFeature({ eyebrow, steps }) {
  const wrapRef = useRef(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;
      setProgress(p);
      // the last step holds to the end rather than flicking past at p === 1
      setActive(Math.min(Math.floor(p * steps.length), steps.length - 1));
    };

    // replace the pending frame rather than gating on a flag: a dropped frame
    // (background tab, throttled compositor) then cannot wedge the listener
    const onScroll = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        measure();
      });
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [steps.length]);

  return (
    <section className="nlw-sticky" ref={wrapRef} data-dark-zone="" style={{ '--steps': steps.length }}>
      <div className="nlw-sticky-panel">
        <div className="nlw-sticky-in">
          <div className="nlw-sticky-text">
            {eyebrow && <p className="nlw-eyebrow">{eyebrow}</p>}
            <div className="nlw-sticky-steps">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={`nlw-sticky-step${i === active ? ' is-on' : ''}`}
                  aria-hidden={i === active ? undefined : 'true'}
                >
                  {s.title && <h2 className="nlw-h2">{s.title}</h2>}
                  {s.body && <p className="nlw-lead">{s.body}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className="nlw-sticky-media">
            <div className="nlw-sticky-frame">
              {steps.map((s, i) => (
                <div key={i} className={`nlw-sticky-shot${i === active ? ' is-on' : ''}`}>
                  <img src={s.image} alt={s.alt || ''} loading="lazy" />
                </div>
              ))}
              <div className="nlw-sticky-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${progress})` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
