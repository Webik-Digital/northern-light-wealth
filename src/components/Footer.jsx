import React from 'react';
import { Link } from 'react-router-dom';
import logoReverse from '@/assets/nlw-logo-reverse.png';

export default function Footer() {
  return (
    <footer className="nlw-footer">
      <div className="nlw-foot-in">
        <div className="nlw-foot-mark">
          <img src={logoReverse} alt="Northern Light Wealth" />
          <p className="nlw-foot-tag">Seasonal perspective. Daily discipline.</p>
          <p className="nlw-foot-addr">Street address<br />City, Province<br />hello@placeholder.ca</p>
        </div>
        <div className="nlw-foot-col">
          <h4>Firm</h4>
          <Link to="/about">About</Link>
          <Link to="/stewardship">Stewardship</Link>
          <Link to="/estate-ready">EstateReady</Link>
          <Link to="/sale-ready">SaleReady</Link>
          <Link to="/harvest-share">Harvest Share</Link>
          <Link to="/the-four-turnings">The Four Turnings</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="nlw-foot-col">
          <h4>Legal</h4>
          <a href="#" onClick={(e) => e.preventDefault()}>Compliance &amp; Privacy</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Accessibility</a>
        </div>
      </div>
      <div className="nlw-foot-base">© 2026 Northern Light Wealth. Compliance and disclosure wording placeholder, to be provided by NLW.</div>
    </footer>
  );
}