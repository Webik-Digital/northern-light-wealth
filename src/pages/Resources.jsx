import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import LockIcon from '@/components/LockIcon';
import { base44 } from '@/api/base44Client';
import { ISSUES } from '@/data/turnings';

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
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState('');
  const [busy, setBusy] = useState(false);

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

  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated().then((ok) => { if (active) setAuthed(ok); }).catch(() => {});
    base44.entities.Resource.filter({}, 'order', 50)
      .then(async (rows) => {
        // items uploaded to private storage are stored as a file_uri, not a URL,
        // so they need a signed link before a client can open them
        const resolved = await Promise.all(
          (rows || []).map(async (r) => {
            if (!r.fileOrUrl || /^https?:\/\//i.test(r.fileOrUrl)) return r;
            try {
              const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: r.fileOrUrl });
              return { ...r, href: signed_url };
            } catch (e) {
              return { ...r, href: '' };
            }
          })
        );
        if (active) setItems(resolved);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const signIn = () => navigate(`/login?returnTo=${encodeURIComponent('/resources')}`);

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

        {/* The Four Turnings, the library's standing series */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">The Four Turnings</p>
              <h2 className="nlw-h2">Our seasonal letter, issue by issue.</h2>
            </Reveal>

            <ul className="nlw-lib">
              {ISSUES.map((i) => (
                <li key={i.id}>
                  {!authed && <LockIcon className="nlw-icon lk" />}
                  <div>
                    <span className="cat">{i.marker} {i.year}</span>
                    <h3>{i.title}</h3>
                    <p>{i.dek}</p>
                    {authed && i.pdfUrl && (
                      <a href={i.pdfUrl} target="_blank" rel="noreferrer" className="nlw-link-more" style={{ marginTop: 12 }}>
                        Read the issue <span className="arw">→</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {!authed && (
              <Reveal as="p" className="nlw-note">
                Each issue opens once you are signed in.
              </Reveal>
            )}
          </div>
        </section>

        {/* Subscribe: open to everyone, since this is how readers first arrive */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <Reveal className="nlw-panel">
              {subscribed ? (
                <>
                  <h2 className="nlw-h3">You are on the list.</h2>
                  <p>We will send the next issue when it is published.</p>
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
                  <p className="nlw-form-small">We send only the letter. No sales sequence.</p>
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
                      {(r.href || r.fileOrUrl) && (
                        <a href={r.href || r.fileOrUrl} target="_blank" rel="noreferrer" className="nlw-link-more" style={{ marginTop: 12 }}>
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
