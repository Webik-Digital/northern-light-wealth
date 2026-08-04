import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import LockIcon from '@/components/LockIcon';
import { base44 } from '@/api/base44Client';

// Shown while locked: enough to see the shape of the library, not the contents.
const SHAPE = [
  { title: 'Estate and succession documents', body: 'Templates and checklists, kept current.' },
  { title: 'Business sale preparation', body: 'What to ready, and when.' },
  { title: 'Family stewardship guides', body: 'For the next generation.' },
  { title: 'Seasonal briefings for partners', body: 'Short notes, four times a year.' },
];

export default function Resources() {
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated().then((ok) => { if (active) setAuthed(ok); }).catch(() => {});
    base44.entities.Resource.filter({}, 'order', 50)
      .then((rows) => { if (active) setItems(rows || []); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const signIn = () => base44.auth.redirectToLogin(window.location.pathname);

  const openLibrary = () => {
    const el = document.getElementById('library');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">Resources</Reveal>
            <Reveal as="h1" className="nlw-h1">Stewardship Resources</Reveal>
            <Reveal as="p" className="nlw-lead">A reserved area for clients and invited guests. Access here is given, not sold.</Reveal>
          </div>
        </section>

        {/* The gate */}
        <section className="nlw-section">
          <div className="nlw-wrap">
            <Reveal className="nlw-panel">
              {authed ? (
                <>
                  <h2 className="nlw-h3">Welcome back. Your library is open.</h2>
                  <p>The newest briefings are at the top.</p>
                  <div className="nlw-actions">
                    <button type="button" className="nlw-btn" onClick={openLibrary}>Open the library</button>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--teal)', fontSize: 12.5, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 14 }}>
                    <LockIcon className="nlw-icon" /> Client access
                  </span>
                  <h2 className="nlw-h3">Kept here for the people we work with.</h2>
                  <p>A working library of documents, guides, and seasonal briefings, arranged with your advisor rather than opened to everyone.</p>
                  <div className="nlw-actions">
                    <button type="button" className="nlw-btn" onClick={signIn}>Enter the library</button>
                    <Link to="/contact" className="nlw-link-more">Request access <span className="arw">→</span></Link>
                  </div>
                </>
              )}
            </Reveal>
          </div>
        </section>

        {/* The shape of the library */}
        <section className="nlw-section nlw-section-tight" id="library">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">What is inside</p>
              <h2 className="nlw-h2">
                {authed ? 'Your library.' : 'Enough to see the shape of the library, not the contents.'}
              </h2>
            </Reveal>

            {!authed ? (
              <ul className="nlw-lib">
                {SHAPE.map((s) => (
                  <li key={s.title}>
                    <LockIcon className="nlw-icon lk" />
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : loading ? (
              <p style={{ marginTop: 36, color: 'var(--muted)' }}>Opening the library…</p>
            ) : items.length === 0 ? (
              <ul className="nlw-lib">
                {SHAPE.map((s) => (
                  <li key={s.title}>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="nlw-lib">
                {items.map((r) => (
                  <li key={r.id}>
                    <div>
                      {r.category && <span className="cat">{r.category}</span>}
                      <h3>{r.title}</h3>
                      {r.description && <p>{r.description}</p>}
                      {r.fileOrUrl && (
                        <a href={r.fileOrUrl} target="_blank" rel="noreferrer" className="nlw-link-more" style={{ marginTop: 12 }}>
                          Open <span className="arw">→</span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!authed && (
              <Reveal as="p" className="nlw-note">Library contents are drawn from the Resource entity and shown once a client signs in.</Reveal>
            )}
          </div>
        </section>

        {/* Help line */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <Reveal as="h2" className="nlw-h2" style={{ maxWidth: '20ch' }}>If you need access, or you are not sure whether you already have it, speak with us.</Reveal>
            <Reveal style={{ marginTop: 26 }}>
              <Link to="/contact" className="nlw-link-more">Speak with us <span className="arw">→</span></Link>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
