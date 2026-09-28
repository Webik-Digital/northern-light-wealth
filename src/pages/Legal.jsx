import React from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { DISCLOSURES, PRIVACY, PRIVACY_PREAMBLE } from '@/data/legal';

// The approved legal pages.
//
// The wording is reproduced from the documents NLW's compliance officer signed
// off, not rewritten, and the implementation note that came with them is blunt
// about why: approved wording "is used exactly; it is not paraphrased,
// shortened or merged". So this file is a renderer and holds no copy of its own
// beyond the title and the standing line at the foot.
//
// Set quietly and legibly on purpose. The same note lists, among the things that
// must not happen, "disclosure rendered illegible by small type, poor contrast,
// cropping or placement" — so this is body-sized text at full contrast, not
// grey six-point small print.

const Para = ({ text }) =>
  text.startsWith('•')
    ? <li>{text.replace(/^•\s*/, '')}</li>
    : <p>{text}</p>;

// Consecutive bullets belong in one list rather than one list each.
function Body({ paragraphs }) {
  const out = [];
  let bullets = [];
  const flush = (key) => {
    if (bullets.length) {
      out.push(<ul key={`u${key}`} className="nlw-legal-list">{bullets}</ul>);
      bullets = [];
    }
  };
  paragraphs.forEach((t, i) => {
    if (t.startsWith('•')) bullets.push(<Para key={i} text={t} />);
    else { flush(i); out.push(<Para key={i} text={t} />); }
  });
  flush('end');
  return out;
}

export function LegalDisclosures() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Legal, Privacy and Disclosures"
      standfirst={
        'This page sets out the terms on which the Northern Light Wealth website, its ' +
        'library of general information, and its secure client section may be used, ' +
        'together with the firm’s regulatory disclosure and a summary of its privacy practices.'
      }
      effective="Effective 1 October 2026 · Portfolio Manager · Alberta, British Columbia and Saskatchewan"
    >
      {DISCLOSURES.map((section) => (
        <section key={section.number} className="nlw-legal-section" id={`section-${section.number}`}>
          <Reveal as="h2" className="nlw-h3">{section.number}. {section.heading}</Reveal>
          {section.blocks.map((block, i) => (
            <Reveal key={i} className="nlw-legal-block">
              {block.title && <h3>{block.title}</h3>}
              <Body paragraphs={block.body} />
            </Reveal>
          ))}
        </section>
      ))}
    </LegalShell>
  );
}

export function PrivacyPolicy() {
  return (
    <LegalShell
      eyebrow="Privacy"
      title="Privacy Policy"
      standfirst="How Northern Light Wealth collects, uses, discloses and protects personal information."
      effective="Privacy Officer: Devan Legare · devan@nlwealth.ca"
    >
      {PRIVACY_PREAMBLE.length > 0 && (
        <Reveal className="nlw-legal-block"><Body paragraphs={PRIVACY_PREAMBLE} /></Reveal>
      )}
      {PRIVACY.map((section) => (
        <section key={section.number} className="nlw-legal-section" id={`privacy-${section.number}`}>
          <Reveal as="h2" className="nlw-h3">{section.number}. {section.heading}</Reveal>
          <Reveal className="nlw-legal-block"><Body paragraphs={section.body} /></Reveal>
        </section>
      ))}
    </LegalShell>
  );
}

function LegalShell({ eyebrow, title, standfirst, effective, children }) {
  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />
      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">{eyebrow}</Reveal>
            <Reveal as="h1" className="nlw-h1">{title}</Reveal>
            <Reveal as="p" className="nlw-lead">{standfirst}</Reveal>
            <Reveal as="p" className="nlw-note" style={{ marginTop: 18 }}>{effective}</Reveal>
          </div>
        </section>

        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <div className="nlw-legal">{children}</div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
