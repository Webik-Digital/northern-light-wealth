import React from 'react';
import { Link } from 'react-router-dom';
// The brand's own horizontal reverse lockup. It carries NLW's two near-white
// tones rather than the flat white the raster had, so the wordmark keeps the
// separation it is drawn with against the plum.
import logoReverse from '@/assets/nlw-logo-horizontal-reverse.svg';

export default function Footer() {
  return (
    <footer className="nlw-footer">
      <div className="nlw-foot-in">
        <div className="nlw-foot-mark">
          <img src={logoReverse} alt="Northern Light Wealth" />
          <p className="nlw-foot-tag">Seasonal perspective. Daily discipline.</p>
          {/* Each line is its own row rather than <br>-separated: on a phone the
              number and the address are tapped, and a link sitting inside a
              wrapped paragraph cannot be given a target without its hit area
              running into the line above it. */}
          <address className="nlw-foot-addr">
            <span>#310, 5010 Richard Road SW</span>
            <span>Calgary, AB&nbsp;&nbsp;T3E 6L1</span>
            <a href="tel:+14039914331">403-991-4331</a>
            <a href="mailto:info@nlwealth.ca">info@nlwealth.ca</a>
          </address>
        </div>
        <div className="nlw-foot-col">
          <h4>Firm</h4>
          <Link to="/about">About</Link>
          <Link to="/stewardship">Stewardship</Link>
          <Link to="/the-four-turnings">The Four Turnings</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="nlw-foot-col">
          <h4>Stewardship</h4>
          <Link to="/estate-ready">EstateReady</Link>
          <Link to="/sale-ready">SaleReady</Link>
          <Link to="/harvest-share">Harvest Share</Link>
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