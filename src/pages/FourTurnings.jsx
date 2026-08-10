import React, { useEffect, useMemo, useState } from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { base44 } from '@/api/base44Client';

const LABEL = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };
const ACCENT = { spring: '#5E7C5A', summer: '#3E6B57', fall: '#9A6B3F', winter: '#3C6E80' };
const FILTERS = ['all', 'spring', 'summer', 'fall', 'winter'];

// Sample archive content, in voice, shown until the Turning entity has rows.
const SAMPLE = [
  { id: 's1', season: 'spring', year: 2026, title: 'Beginning again, on purpose', dek: 'On the season for starting, and why the best beginnings are planned in the quiet before them.' },
  { id: 's2', season: 'winter', year: 2025, title: 'What holds when the market does not', dek: 'On steadiness, and the parts of a plan built not to move.' },
  { id: 's3', season: 'fall', year: 2025, title: 'Letting go without losing the thread', dek: 'On transitions, and handing on a life’s work while it is still yours to shape.' },
  { id: 's4', season: 'summer', year: 2025, title: 'The long view, stated plainly', dek: 'On patience as a discipline rather than a mood.' },
];

function currentSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

export default function FourTurnings() {
  const [turnings, setTurnings] = useState(null); // null until the first load settles
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    base44.entities.Turning.filter({}, '-publishedAt', 50)
      .then((rows) => {
        // only published essays reach the public page; drafts stay in /admin
        const live = (rows || []).filter(
          (r) => r.publishedAt && new Date(r.publishedAt) <= new Date()
        );
        if (active) setTurnings(live);
      })
      .catch(() => { if (active) setTurnings([]); });
    return () => { active = false; };
  }, []);

  const published = turnings || [];
  const featured = published.find((t) => t.isFeatured) || published[0] || null;
  // Until enough essays are published, the archive shows the sample entries so
  // the section reads as designed. The note below says so plainly.
  const { archive, usingSample } = useMemo(() => {
    const rows = featured ? published.filter((t) => t.id !== featured.id) : published;
    return rows.length ? { archive: rows, usingSample: false } : { archive: SAMPLE, usingSample: true };
  }, [published, featured]);

  const shown = filter === 'all' ? archive : archive.filter((t) => t.season === filter);

  const onSubscribe = async (e) => {
    e.preventDefault();
    setSubError('');
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setSubError('Please enter an email address we can reach you at.');
      return;
    }
    setBusy(true);
    try {
      await base44.entities.Subscriber.create({ email: value, source: 'the-four-turnings' });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setSubError('Something went wrong. Please try again, or write to us directly.');
    } finally {
      setBusy(false);
    }
  };

  const season = featured ? featured.season : currentSeason();
  const year = featured ? featured.year : new Date().getFullYear();

  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">The Four Turnings</Reveal>
            <Reveal as="h1" className="nlw-h1">The Four Turnings</Reveal>
            <Reveal as="p" className="nlw-lead">Where we publish our thinking, one essay each turning of the year. Written to be read here, in full, and not filed away as another attachment.</Reveal>
          </div>
        </section>

        {/* Current issue */}
        <section className="nlw-section">
          <div className="nlw-wrap">
            {/* the accent here belongs to the issue's own season, not the cycling tree */}
            <Reveal className="nlw-feature" style={{ borderTopColor: ACCENT[season] }}>
              <p className="nlw-eyebrow" style={{ color: ACCENT[season] }}>Current issue · {LABEL[season]} {year}</p>
              <h2 className="nlw-h2">{featured ? featured.title : 'The quiet season for the loudest decisions.'}</h2>
              <p className="nlw-lead stand">
                {featured && featured.dek
                  ? featured.dek
                  : 'The unhurried months are usually when the most consequential planning gets done well. A short essay on using a calm season to make the decisions a busy one cannot.'}
              </p>
              {featured && (
                <button
                  type="button"
                  className="nlw-link-more"
                  style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                >
                  {open ? 'Close the piece' : 'Read the piece'} <span className="arw">{open ? '↑' : '→'}</span>
                </button>
              )}
              {featured && open && featured.body && (
                <div className="nlw-essay">
                  {featured.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
                </div>
              )}
              <p className="meta">Published at the solstice.</p>
            </Reveal>
          </div>
        </section>

        {/* Archive */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">Archive</p>
              <h2 className="nlw-h2">Every turning, kept in one place.</h2>
            </Reveal>

            <Reveal className="nlw-filters" role="group" aria-label="Filter the archive by season">
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
                <li className="empty">No essays in that season yet.</li>
              ) : (
                shown.map((t) => (
                  <li key={t.id}>
                    <Reveal className="row">
                      <span className="when">{LABEL[t.season]} {t.year}</span>
                      <div>
                        <h3>{t.title}</h3>
                        {t.dek && <p>{t.dek}</p>}
                      </div>
                    </Reveal>
                  </li>
                ))
              )}
            </ul>

            {usingSample && (
              <Reveal as="p" className="nlw-note">Sample entries. These are replaced as soon as more essays are published from the Turning entity.</Reveal>
            )}
          </div>
        </section>

        {/* Subscribe */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <Reveal className="nlw-panel">
              {subscribed ? (
                <>
                  <h2 className="nlw-h3">You are on the list.</h2>
                  <p>We will send the next turning when it is published.</p>
                </>
              ) : (
                <>
                  <h2 className="nlw-h2" style={{ maxWidth: '20ch' }}>Receive each turning when it is published.</h2>
                  <p style={{ marginTop: 14 }}>Four emails a year. Nothing else.</p>
                  <form className="nlw-inline-form" onSubmit={onSubscribe}>
                    <label className="nlw-label">
                      <input
                        className="nlw-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        autoComplete="email"
                        aria-label="Email address"
                      />
                    </label>
                    <button type="submit" className="nlw-btn" disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
                      {busy ? 'Subscribing…' : 'Subscribe'}
                    </button>
                  </form>
                  {subError && <p className="nlw-form-error">{subError}</p>}
                  <p className="nlw-form-small">We send only the essay. No sales sequence.</p>
                </>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
