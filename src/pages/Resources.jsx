import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import SubscribePanel from '@/components/SubscribePanel';
import SeasonGlyph from '@/components/SeasonGlyph';
import LockIcon from '@/components/LockIcon';
import ResourceCover from '@/components/ResourceCover';
import { base44 } from '@/api/base44Client';
import { ISSUES } from '@/data/turnings';
import ResourceSearch from '@/components/ResourceSearch';
import SeasonBand from '@/components/SeasonBand';

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

  useEffect(() => {
    let active = true;

    // The library is read only for someone signed in. The entity refuses it to
    // anyone else, so this is not what keeps it private; it just avoids firing
    // a request on every public page view that could only come back refused.
    const loadLibrary = async () => {
      const rows = await base44.entities.Resource.filter({}, 'order', 50);
      // items uploaded to private storage are stored as a file_uri, not a URL,
      // so they need a signed link before a client can open them
      const sign = async (uri) => {
        if (!uri) return '';
        if (/^https?:\/\//i.test(uri)) return uri;
        try {
          const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
          return signed_url;
        } catch (e) {
          return '';
        }
      };
      const resolved = await Promise.all(
        (rows || []).map(async (r) => {
          // the document and its cover are both private files, so each needs
          // its own signed link before a client can see it
          const [href, cover] = await Promise.all([sign(r.fileOrUrl), sign(r.thumbnailUrl)]);
          return { ...r, href, cover };
        })
      );
      if (active) setItems(resolved);
    };

    (async () => {
      try {
        const ok = await base44.auth.isAuthenticated();
        if (!active) return;
        setAuthed(ok);
        if (ok) await loadLibrary();
      } catch (e) {
        // signed out, or the library declined: the page simply stays locked
      } finally {
        if (active) setLoading(false);
      }
    })();

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
          <SeasonGlyph variant="watermark" />
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">Resources</Reveal>
            <Reveal as="h1" className="nlw-h1">Stewardship Resources</Reveal>
            <Reveal as="p" className="nlw-lead">A reserved area for clients and invited guests. Access here is given, not sold.</Reveal>
            <Reveal>
              <ResourceSearch libraryItems={items} authed={authed} />
            </Reveal>
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
                <li key={i.id} className="has-band">
                  <div>
                    <span className="cat">{i.marker} {i.year}</span>
                    <h3>{i.title}</h3>
                    <p>{i.dek}</p>
                    {i.pdfUrl && (
                      <a href={i.pdfUrl} target="_blank" rel="noreferrer" className="nlw-link-more" style={{ marginTop: 12 }}>
                        Read the issue <span className="arw">→</span>
                      </a>
                    )}
                  </div>
                  <SeasonBand season={i.season} className="nlw-lib-band" />
                </li>
              ))}
            </ul>

            <Reveal as="p" className="nlw-note">
              The letter is open to everyone. The library below is the part kept
              for clients.
            </Reveal>
          </div>
        </section>

        <SubscribePanel />

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
              <ul className="nlw-lib is-plain">
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
              <ul className="nlw-lib is-plain">
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
              <ul className="nlw-lib has-covers">
                {items.map((r) => (
                  <li key={r.id}>
                    <ResourceCover src={r.cover} title={r.title} />
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
