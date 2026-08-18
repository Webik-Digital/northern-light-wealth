import React, { useEffect, useMemo, useState } from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import SubscribePanel from '@/components/SubscribePanel';
import SeasonGlyph from '@/components/SeasonGlyph';
import SeasonBand from '@/components/SeasonBand';
import { base44 } from '@/api/base44Client';
import { issuesFrom } from '@/data/turnings';
import LockIcon from '@/components/LockIcon';
import { useNavigate } from 'react-router-dom';

const LABEL = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };
const ACCENT = { spring: '#5E7C5A', summer: '#3E6B57', fall: '#9A6B3F', winter: '#3C6E80' };
const FILTERS = ['all', 'spring', 'summer', 'fall', 'winter'];

export default function FourTurnings() {
  const [rows, setRows] = useState(null);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated().then((ok) => { if (active) setAuthed(ok); }).catch(() => {});
    base44.entities.Turning.filter({}, '-publishedAt', 50)
      .then((r) => { if (active) setRows(r || []); })
      .catch(() => { if (active) setRows([]); });
    return () => { active = false; };
  }, []);

  const issues = useMemo(() => issuesFrom(rows), [rows]);
  const featured = issues.find((i) => i.isFeatured) || issues[0] || null;
  const archive = featured ? issues.filter((i) => i.id !== featured.id) : issues;
  const shown = filter === 'all' ? archive : archive.filter((i) => i.season === filter);

  const when = (i) => `${i.marker || LABEL[i.season]} ${i.year}`;

  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <SeasonGlyph variant="watermark" />
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">The Four Turnings</Reveal>
            <Reveal as="h1" className="nlw-h1">The Four Turnings</Reveal>
            <Reveal as="p" className="nlw-lead">
              Our seasonal letter, published at each solstice and equinox. Four standing sections:
              a seasonal perspective, a stewardship principle, practical planning, and the market view.
            </Reveal>
          </div>
        </section>

        {/* Current issue */}
        {featured && (
          <section className="nlw-section">
            <div className="nlw-wrap">
              <Reveal className="nlw-feature has-band" style={{ borderTopColor: ACCENT[featured.season] }}>
                <SeasonBand season={featured.season} className="nlw-feature-band" />
                <p className="nlw-eyebrow nlw-issue-eyebrow" style={{ color: ACCENT[featured.season] }}>
                  <SeasonGlyph season={featured.season} className="nlw-issue-mark" />
                  Current issue · {when(featured)}
                </p>
                <h2 className="nlw-h2">{featured.title}</h2>
                {featured.dek && <p className="nlw-lead stand">{featured.dek}</p>}

                {featured.contents && featured.contents.length > 0 && (
                  <ol className="nlw-issue-contents">
                    {featured.contents.map((c) => (
                      <li key={c.no}>
                        <span className="no">{c.no}</span>
                        <span className="sec">{c.section}</span>
                        <span className="ttl">{c.title}</span>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="nlw-actions">
                  {featured.pdfUrl && (authed ? (
                    <a className="nlw-btn" href={featured.pdfUrl} target="_blank" rel="noreferrer">
                      Read the issue
                    </a>
                  ) : (
                    <button type="button" className="nlw-btn"
                      onClick={() => navigate('/login?returnTo=%2Fthe-four-turnings')}>
                      <LockIcon className="nlw-icon" /> Sign in to read
                    </button>
                  ))}
                  {featured.webUrl && (
                    <a className="nlw-link-more" href={featured.webUrl} target="_blank" rel="noreferrer">
                      Open the web version <span className="arw">→</span>
                    </a>
                  )}
                </div>
                <p className="meta">
                  {featured.pages ? `${featured.pages} pages · PDF` : 'PDF'}
                </p>
              </Reveal>
            </div>
          </section>
        )}

        {/* Archive */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">Every issue</p>
              <h2 className="nlw-h2">The letters, kept in one place.</h2>
            </Reveal>

            <Reveal className="nlw-filters" role="group" aria-label="Filter by season">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className="nlw-filter"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : LABEL[f]}
                </button>
              ))}
            </Reveal>

            <ul className="nlw-archive">
              {shown.length === 0 ? (
                <li className="empty">No issues in that season yet.</li>
              ) : (
                shown.map((i) => (
                  <li key={i.id}>
                    <Reveal className="row">
                      <span className="when">
                        <SeasonGlyph season={i.season} className="nlw-issue-mark is-row" />
                        {when(i)}
                      </span>
                      <div>
                        <h3>{i.title}</h3>
                        {i.dek && <p>{i.dek}</p>}
                        <div className="nlw-issue-links">
                          {i.pdfUrl && (authed ? (
                            <a href={i.pdfUrl} target="_blank" rel="noreferrer" className="nlw-link-more">
                              Read the issue <span className="arw">→</span>
                            </a>
                          ) : (
                            <span className="nlw-issue-locked"><LockIcon className="nlw-icon" /> Clients only</span>
                          ))}
                          {i.webUrl && (
                            <a href={i.webUrl} target="_blank" rel="noreferrer" className="nlw-link-more">
                              Web version <span className="arw">→</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </Reveal>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        <SubscribePanel />
      </main>

      <Footer />
    </>
  );
}
