import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import SeasonGlyph from '@/components/SeasonGlyph';
import ClosingCTA from '@/components/ClosingCTA';
import RequestBrochure from '@/components/RequestBrochure';
import PageNotFound from '@/lib/PageNotFound';
import { getPathway, PATHWAY_SEASON } from '@/data/pathways';
import { getOutline } from '@/api/content';

export default function Pathway({ id }) {
  const p = getPathway(id);

  // What the brochure covers. Only published outlines are served — the entity
  // refuses a draft to anyone but an admin — so whatever arrives here is
  // already cleared to be public.
  const [outline, setOutline] = useState(null);
  useEffect(() => {
    let active = true;
    if (!id) return undefined;
    getOutline(id)
      .then((row) => { if (active && row) setOutline(row); })
      .catch(() => {});
    return () => { active = false; };
  }, [id]);

  if (!p) return <PageNotFound />;


  return (
    <>
      <SeasonalTree mode="hero" fixed={PATHWAY_SEASON[id]} />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <SeasonGlyph variant="watermark" season={PATHWAY_SEASON[id]} />
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

        {/* Why it matters. Shown only once there are sources: a heading promising
            "the research behind the need" over an apology for having none reads
            worse than not raising it. */}
        {p.evidence.length > 0 && (
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">Why it matters</p>
              <h2 className="nlw-h2">The research behind the need.</h2>
            </Reveal>
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
          </div>
        </section>
        )}

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

        {/* Asking for the brochure, placed straight after the outline: the moment
            someone has read what is inside it is when they want it. */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <RequestBrochure
              pathway={id}
              brochureName={outline && outline.brochureTitle ? outline.brochureTitle : `${p.name} brochure`}
            />
          </div>
        </section>

        {/* Closing */}
        <ClosingCTA heading="Wherever your season begins, a conversation is the same first step." tight />
      </main>

      <Footer />
    </>
  );
}
