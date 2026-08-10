import React from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import ClosingCTA from '@/components/ClosingCTA';
import PageNotFound from '@/lib/PageNotFound';
import { getPathway } from '@/data/pathways';
import TestimonialScroller from '@/components/TestimonialScroller';
import { TESTIMONIALS } from '@/data/testimonials';

export default function Pathway({ id }) {
  const p = getPathway(id);
  if (!p) return <PageNotFound />;

  // this pathway's quotes, plus the one that speaks to the relationship rather
  // than a single programme
  const quotes = TESTIMONIALS.filter((t) => t.pathway === p.name || t.pathway == null);

  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">{p.tag}</Reveal>
            <Reveal as="h1" className="nlw-h1">{p.name}</Reveal>
            <Reveal as="p" className="nlw-lead">{p.purpose}</Reveal>
            {/* the library sits near the top of every pathway page */}
            <Reveal className="nlw-actions">
              <Link to="/resources" className="nlw-link-more">Open the Stewardship Resources <span className="arw">→</span></Link>
            </Reveal>
          </div>
        </section>

        {/* What it is */}
        <section className="nlw-section">
          <div className="nlw-wrap wide">
            <div className="nlw-split">
              <div>
                <Reveal as="p" className="nlw-eyebrow">What it is</Reveal>
                <Reveal className="nlw-passage">
                  {p.detail.map((para, i) => <p key={i}>{para}</p>)}
                </Reveal>
                {p.note && <Reveal as="p" className="nlw-note">{p.note}</Reveal>}
              </div>
              <Reveal className="nlw-split-media">
                <img src={p.photo} alt={p.alt} loading="lazy" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* Why it matters — references supplied by NLW */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">Why it matters</p>
              <h2 className="nlw-h2">The research behind the need.</h2>
            </Reveal>
            {p.evidence.length === 0 ? (
              <Reveal as="p" className="nlw-note">
                Academic references to be supplied by NLW. Nothing is cited here until the sources
                are provided, so that no claim on this page is unsupported.
              </Reveal>
            ) : (
              <ol className="nlw-evidence">
                {p.evidence.map((e, i) => (
                  <li key={i}>
                    <Reveal className="row">
                      <p className="claim">{e.claim}</p>
                      <p className="cite">
                        {e.source}
                        {e.url && (
                          <> · <a href={e.url} target="_blank" rel="noreferrer">Read the source</a></>
                        )}
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* Testimonials — the homepage treatment, narrowed to this pathway */}
        <TestimonialScroller
          items={quotes}
          eyebrow="In their words"
          heading="Clients who came through this door."
        />

        {/* Closing */}
        <ClosingCTA heading="Wherever your season begins, a conversation is the same first step." tight />
      </main>

      <Footer />
    </>
  );
}
