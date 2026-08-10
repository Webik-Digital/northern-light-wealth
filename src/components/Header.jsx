import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LockIcon from './LockIcon';
import logo from '@/assets/nlw-logo.png';
import logoReverse from '@/assets/nlw-logo-reverse.png';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // the bar turns light-on-dark while it sits over a dark zone
    const overDarkZone = () => {
      const band = 72; // roughly the header's own height
      return [...document.querySelectorAll('[data-dark-zone]')].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= band && r.bottom >= 0;
      });
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setOnDark(overDarkZone());
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated().then((ok) => { if (active) setAuthed(ok); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const handleLogin = () => {
    if (authed) {
      navigate('/resources');
      return;
    }
    base44.auth.redirectToLogin(window.location.pathname);
  };

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  const close = () => setMenuOpen(false);

  return (
    <>
      <header className={`nlw-header${scrolled ? ' scrolled' : ''}${onDark ? ' on-dark' : ''}`}>
        <Link className="nlw-mark" to="/" aria-label="Northern Light Wealth home">
          <img src={onDark ? logoReverse : logo} alt="Northern Light Wealth" />
        </Link>
        <div className="nlw-head-right">
          <nav className="nlw-nav">
            <Link to="/about">About</Link>
            <Link to="/estate-ready">EstateReady</Link>
            <Link to="/sale-ready">SaleReady</Link>
            <Link to="/harvest-share">Harvest Share</Link>
            <Link to="/contact" className="nlw-nav-cta">Begin a conversation</Link>
          </nav>
          <button className="nlw-portal" onClick={handleLogin} aria-label={authed ? 'Client area' : 'Client login'}>
            <LockIcon />
            <span className="plabel">{authed ? 'Client area' : 'Client login'}</span>
          </button>
          {authed && (
            <button className="nlw-nav-cta" onClick={handleLogout} style={{ display: 'none' }} aria-hidden="true" />
          )}
          <button className="nlw-burger" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>Menu</button>
        </div>
      </header>

      {menuOpen && (
        <div className="nlw-drawer open" onClick={close}>
          <div className="nlw-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <button className="nlw-drawer-close" onClick={close} aria-label="Close menu">Close</button>
            <Link to="/about" onClick={close}>About</Link>
            <Link to="/estate-ready" onClick={close}>EstateReady</Link>
            <Link to="/sale-ready" onClick={close}>SaleReady</Link>
            <Link to="/harvest-share" onClick={close}>Harvest Share</Link>
            <Link to="/contact" onClick={close}>Begin a conversation</Link>
            {/* still reachable, just no longer top-level */}
            <Link to="/the-four-turnings" onClick={close}>The Four Turnings</Link>
            <Link to="/resources" onClick={close}>Resources</Link>
          </div>
        </div>
      )}
    </>
  );
}