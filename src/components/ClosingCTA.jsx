import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';
import BrandDraw from './BrandDraw';

// The banner every page signs off with: the invitation on the left, the mark
// drawing itself on the right. One component so the pages cannot drift apart.
export default function ClosingCTA({ heading, lead, tight = false }) {
  return (
    <section className={`nlw-closing nlw-closing-split nlw-section${tight ? ' nlw-section-tight' : ''}`}>
      <div className="nlw-wrap">
        <div className="nlw-closing-grid">
          <div>
            <Reveal as="h2" className="nlw-h2">{heading}</Reveal>
            {lead && <Reveal as="p" className="nlw-lead">{lead}</Reveal>}
            <Reveal>
              <Link to="/contact" className="nlw-btn">Begin a conversation</Link>
            </Reveal>
          </div>
          <div className="nlw-closing-mark">
            <BrandDraw />
          </div>
        </div>
      </div>
    </section>
  );
}
