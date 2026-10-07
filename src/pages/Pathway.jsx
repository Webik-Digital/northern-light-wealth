import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import SeasonGlyph from '@/components/SeasonGlyph';
import ClosingCTA from '@/components/ClosingCTA';
import RequestLibraryAccess from '@/components/RequestLibraryAccess';
import PromptCards from '@/components/PromptCards';
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
            {/* Straight into the brochure. This used to point at the library,
                which was shut, so the first invitation on the page led to a
                locked door. */}
            <Reveal className="nlw-actions">
              <a href={`/brochures/${id}/`} className="nlw-btn">
                Explore {p.name} <span className="arw">→</span>
              </a>
            </Reveal>
          </div>
        </section>

        {p.prompts && <PromptCards eyebrow={p.prompts.eyebrow} cards={p.prompts.cards} />}

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

        {/* The brochure.
            This section used to render only when an outline had been published
            in the admin, because all it did was list what the brochure covered.
            None of the three has ever been published, so the panel has never
            appeared — which was survivable while the brochure was behind a form
            and invisible either way. It is not survivable now: the brochure is
            the thing this page is for. It exists for all three pathways as a
            page and a PDF, so the panel renders either way and the contents
            list is what is conditional. */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <Reveal className="nlw-feature">
              <p className="nlw-eyebrow">Explore {p.name}</p>
              <h2 className="nlw-h2">
                {p.explore || (outline && outline.brochureTitle) || `The ${p.name} brochure`}
              </h2>
              {outline && outline.blurb && <p className="nlw-lead stand">{outline.blurb}</p>}

              {outline && outline.sections && outline.sections.length > 0 && (
                <ol className="nlw-issue-contents">
                  {outline.sections.map((c, i) => (
                    <li key={i}>
                      <span className="no">{String(i + 1).padStart(2, '0')}</span>
                      <span className="sec">{c.section}</span>
                      <span className="ttl">{c.title}</span>
                    </li>
                  ))}
                </ol>
              )}

              {/* NLW asked for the PDF here, and the web version is already the
                  invitation at the top of the page — so this is the printable
                  one, with the online copy kept alongside rather than hidden. */}
              <div className="nlw-actions">
                <a className="nlw-btn" href={`/brochures/${id}.pdf`}>
                  View the {p.name} brochure <span className="arw">→</span>
                </a>
                <a className="nlw-link-more" href={`/brochures/${id}/`}>
                  Read it in your browser <span className="arw">→</span>
                </a>
                <Link to="/contact" className="nlw-link-more">Speak with us <span className="arw">→</span></Link>
              </div>
              <p className="meta">
                {outline && outline.pages ? `${outline.pages} pages · free to read` : 'Free to read, nothing to fill in'}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Asking for the library, placed straight after the brochure: someone who
            has just read it is the person most likely to want what is behind it. */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <RequestLibraryAccess pathway={id} pathwayName={p.name} />
          </div>
        </section>

        {/* Closing */}
        <ClosingCTA heading="Wherever your season begins, a conversation is the same first step." tight />
      </main>

      <Footer />
    </>
  );
}
