import React from 'react';
import { Image } from '@/components/ui/image';
import Reveal from './Reveal';

// One photograph per pathway, chosen to match the moment each one speaks to:
// a life handed on, a life's work, and a harvest shared. These are licence-free
// placeholders served from Unsplash; swap them for NLW's own photography and
// upload it to the app's media so nothing is loaded from a third party.
const PHOTOS = {
  estate: 'https://images.unsplash.com/photo-1534768654272-e97681c3a2c7?auto=format&fit=crop&w=900&q=70',
  sale: 'https://images.unsplash.com/photo-1753164726626-e4c38056a03f?auto=format&fit=crop&w=900&q=70',
  harvest: 'https://images.unsplash.com/photo-1515276427842-f85802d514a2?auto=format&fit=crop&w=900&q=70',
};

export default function StewardshipCard({ tag, name, oneLiner, detail, photo, to }) {
  return (
    <Reveal to={to} className="nlw-card" aria-label={`${name} — ${tag}`}>
      <span className="ph">
        <Image src={PHOTOS[photo]} alt="" fittingType="fill" aria-hidden="true" />
      </span>
      <span className="scrim" aria-hidden="true" />
      <span className="c">
        <span className="tag">{tag}</span>
        <h3 className="nlw-h3">{name}</h3>
        <p className="one">{oneLiner}</p>
        <p className="more">{detail}</p>
        <span className="go">Learn more <span className="arw">→</span></span>
      </span>
    </Reveal>
  );
}