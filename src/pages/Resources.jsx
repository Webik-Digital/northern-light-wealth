import React, { useEffect, useState } from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import LockIcon from '@/components/LockIcon';
import { base44 } from '@/api/base44Client';

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

  const requestAccess = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  return (
    <>
      <SeasonalTree />
      <Header />
      <main className="nlw-main">
        <section className="nlw-placeholder">
          <div className="nlw-wrap" style={{ maxWidth: 720 }}>
            <Reveal as="p" className="nlw-eyebrow">Resources</Reveal>
            <Reveal as="h1" className="nlw-h1">The library.</Reveal>
            <Reveal as="p" className="nlw-lead">A quiet collection of thinking and planning materials for our clients.</Reveal>

            {!authed ? (
              <Reveal className="nlw-locked" style={{ marginTop: 36 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--teal)', marginBottom: 12 }}>
                  <LockIcon className="nlw-icon" /> Client access
                </span>
                <h3 className="nlw-h3">The library is gated.</h3>
                <p>Signed-in clients see the full library. Gated items require a client login. Request access and we will be in touch.</p>
                <button className="nlw-btn" onClick={requestAccess}>Client login</button>
              </Reveal>
            ) : loading ? (
              <Reveal><p style={{ marginTop: 36, color: 'var(--muted)' }}>Loading the library…</p></Reveal>
            ) : items.length === 0 ? (
              <Reveal><p style={{ marginTop: 36, color: 'var(--muted)' }}>The library is being curated. New writing and materials will appear here each turning of the year.</p></Reveal>
            ) : (
              <Reveal>
                <ul style={{ listStyle: 'none', marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {items.map((r) => (
                    <li key={r.id} style={{ border: '.5px solid var(--rule)', borderRadius: 10, padding: '20px 22px', background: '#FBFAF9' }}>
                      <span style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--teal)', fontWeight: 500 }}>{r.category}</span>
                      <h3 className="nlw-h3" style={{ marginTop: 8 }}>{r.title}</h3>
                      {r.description && <p style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{r.description}</p>}
                      {r.fileOrUrl && (
                        <a href={r.fileOrUrl} target="_blank" rel="noreferrer" className="nlw-link-more" style={{ marginTop: 10, display: 'inline-flex' }}>
                          Open <span className="arw">→</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}