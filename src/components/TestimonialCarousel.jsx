import React, { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal';

// Client testimonials, one at a time. Quotes are supplied by NLW: none are
// written here, so the carousel renders an empty state until they arrive.
export default function TestimonialCarousel({ items = [] }) {
  const [i, setI] = useState(0);
  const timer = useRef(0);
  const [paused, setPaused] = useState(false);

  const count = items.length;

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    timer.current = setInterval(() => setI((v) => (v + 1) % count), 9000);
    return () => clearInterval(timer.current);
  }, [count, paused]);

  const go = (n) => setI(((n % count) + count) % count);

  if (count === 0) {
    return (
      <section className="nlw-section nlw-section-tight">
        <div className="nlw-wrap wide">
          <Reveal className="nlw-head">
            <p className="nlw-eyebrow">In their words</p>
            <h2 className="nlw-h2">What clients say about the work.</h2>
          </Reveal>
          <Reveal as="p" className="nlw-note">
            Client testimonials to be supplied by NLW, with written permission to publish and the
            attribution each client agrees to. The carousel appears here once they are in.
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section
      className="nlw-section nlw-section-tight"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="nlw-wrap wide">
        <Reveal className="nlw-head">
          <p className="nlw-eyebrow">In their words</p>
          <h2 className="nlw-h2">What clients say about the work.</h2>
        </Reveal>

        <div className="nlw-carousel" aria-roledescription="carousel" aria-label="Client testimonials">
          <div className="nlw-carousel-stage">
            {items.map((t, n) => (
              <figure
                key={n}
                className={`nlw-carousel-slide${n === i ? ' is-on' : ''}`}
                aria-hidden={n === i ? undefined : 'true'}
              >
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  {t.who}
                  {t.pathway && <span className="tag">{t.pathway}</span>}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="nlw-carousel-controls">
            <button type="button" onClick={() => go(i - 1)} aria-label="Previous testimonial">
              <span className="arw">←</span>
            </button>
            <div className="nlw-carousel-dots">
              {items.map((_, n) => (
                <button
                  key={n}
                  type="button"
                  className="nlw-carousel-dot"
                  aria-label={`Testimonial ${n + 1} of ${count}`}
                  aria-current={n === i ? 'true' : 'false'}
                  onClick={() => go(n)}
                />
              ))}
            </div>
            <button type="button" onClick={() => go(i + 1)} aria-label="Next testimonial">
              <span className="arw">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
