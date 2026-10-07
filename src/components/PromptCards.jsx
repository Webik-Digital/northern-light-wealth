import React from 'react';
import Reveal from './Reveal';

// The two questions that open a pathway page.
//
// NLW asked for these "styled similarly to the cards on the Home Page". Similar,
// not the same: a home card is a photograph you click to go somewhere, and these
// are neither — they are a question put to the reader, and there is nowhere for
// them to lead. So they borrow the card itself, the surface, the rule and the
// type, and leave out the image and the link. A clickable card that does nothing
// is worse than a panel that was never asking to be clicked.
//
// `source` is printed when NLW supplies one. The figures on the EstateReady page
// are quoted without one, and a statistic a registered firm publishes should say
// where it came from.
export default function PromptCards({ eyebrow, cards }) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="nlw-section nlw-section-tight">
      <div className="nlw-wrap wide">
        <Reveal className="nlw-head">
          <p className="nlw-eyebrow">{eyebrow}</p>
        </Reveal>

        <div className="nlw-prompts">
          {cards.map((c, i) => (
            <Reveal key={i} className="nlw-prompt">
              <h3 className="nlw-h3">{c.question}</h3>
              {c.facts.map((f, n) => (
                <p key={n} className="fact">{f}</p>
              ))}
              {c.source && <p className="src">{c.source}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
