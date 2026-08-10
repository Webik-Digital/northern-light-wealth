import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import EssayAdmin from '@/components/admin/EssayAdmin';
import LibraryAdmin from '@/components/admin/LibraryAdmin';
import logo from '@/assets/nlw-logo.png';

const TABS = [
  { id: 'essays', label: 'The Four Turnings' },
  { id: 'library', label: 'Resource library' },
];

export default function Admin() {
  const [user, setUser] = useState(undefined); // undefined while loading, null when signed out
  const [tab, setTab] = useState('essays');

  useEffect(() => {
    let active = true;
    base44.auth.me()
      .then((u) => { if (active) setUser(u || null); })
      .catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, []);

  if (user === undefined) {
    return <div className="nlw-admin-gate"><p>Checking your access…</p></div>;
  }

  if (!user) {
    return (
      <div className="nlw-admin-gate">
        <h1 className="nlw-h3">Sign in to manage the site.</h1>
        <p>This area is for Northern Light Wealth staff.</p>
        <button className="nlw-btn" onClick={() => base44.auth.redirectToLogin('/admin')}>Sign in</button>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="nlw-admin-gate">
        <h1 className="nlw-h3">You do not have access to this area.</h1>
        <p>
          You are signed in as {user.email}. Publishing is limited to admin accounts. Ask an
          administrator to raise your role if you need to write here.
        </p>
        <Link to="/" className="nlw-link-more">Back to the site <span className="arw">→</span></Link>
      </div>
    );
  }

  return (
    <div className="nlw-admin">
      <header className="nlw-admin-bar">
        <Link to="/" className="nlw-admin-mark" aria-label="Northern Light Wealth home">
          <img src={logo} alt="Northern Light Wealth" />
        </Link>
        <nav className="nlw-admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="nlw-admin-tab"
              aria-current={tab === t.id ? 'true' : 'false'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="nlw-admin-who">
          <span>{user.email}</span>
          <button type="button" onClick={() => base44.auth.logout('/')}>Sign out</button>
        </div>
      </header>

      <main className="nlw-admin-main">
        {tab === 'essays' && <EssayAdmin />}
        {tab === 'library' && <LibraryAdmin />}
      </main>
    </div>
  );
}
