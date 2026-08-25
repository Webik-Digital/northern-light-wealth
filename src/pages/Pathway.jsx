import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import SeasonGlyph from '@/components/SeasonGlyph';
import ClosingCTA from '@/components/ClosingCTA';
import PageNotFound from '@/lib/PageNotFound';
import { getPathway } from '@/data/pathways';
import { base44 } from '@/api/base44Client';
import TestimonialScroller from '@/components/TestimonialScroller';
import { testimonialsFor } from '@/data/testimonials';

export default function Pathway({ id }) {
  const p = getPathway(id);

  // What the brochure covers. Only published outlines are served — the entity
  // refuses a draft to anyone but an admin — so whatever arrives here is
  // already cleared to be public.
  const [outline, setOutline] = useState(null);
  useEffect(() => {
    let active = true;
    if (!id) return undefined;
    base44.entities.BrochureOutline.filter({ pathway: id, isPublished: true }, '-updated_date', 1)
      .then((rows) => {
        const row = (rows || [])[0];
        if (active && row && (row.sections || []).length) setOutline(row);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [id]);

  if (!p) return <PageNotFound />;

  // this pathway's quotes first, topped up to a full row
  const quotes = testimonialsFor(p.name);

  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <SeasonGlyph variant="watermark" />
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

        {/* What the brochure covers — the document's shape, not its contents */}
        {outline && (
          <section className="nlw-section nlw-section-tight">
            <div className="nlw-wrap">
              <Reveal className="nlw-feature">
                <p className="nlw-eyebrow">What the brochure covers</p>
                <h2 className="nlw-h2">{outline.brochureTitle || `The ${p.name} brochure`}</h2>
                {outline.blurb && <p className="nlw-lead stand">{outline.blurb}</p>}

                <ol className="nlw-issue-contents">
                  {outline.sections.map((c, i) => (
                    <li key={i}>
                      <span className="no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="sec">{c.section}</span>
                      <span className="ttl">{c.title}</span>
                    </li>
                  ))}
                </ol>

                <div className="nlw-actions">
                  <Link to="/resources" className="nlw-btn">Request access to the brochure</Link>
                  <Link to="/contact" className="nlw-link-more">Speak with us <span className="arw">→</span></Link>
                </div>
                <p className="meta">
                  {outline.pages ? `${outline.pages} pages · kept in the client library` : 'Kept in the client library'}
                </p>
              </Reveal>
            </div>
          </section>
        )}

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
