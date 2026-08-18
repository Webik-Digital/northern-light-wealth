import React from 'react';
import { Image } from '@/components/ui/image';
import Reveal from './Reveal';

import winterScene from '@/assets/seasons/winter-scene.jpg';
import autumnScene from '@/assets/seasons/autumn-scene.jpg';
import summerScene from '@/assets/seasons/summer-scene.jpg';

// The firm's own commissioned paintings, one per pathway: continuity reads as
// winter, transition as autumn, and giving as the harvest. These replace the
// stock photographs, so nothing here loads from a third party.
const PHOTOS = {
  estate: winterScene,
  sale: autumnScene,
  harvest: summerScene,
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