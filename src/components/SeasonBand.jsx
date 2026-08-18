import React from 'react';
import spring from '@/assets/seasons/spring-band.jpg';
import summer from '@/assets/seasons/summer-band.jpg';
import autumn from '@/assets/seasons/autumn-band.jpg';
import winter from '@/assets/seasons/winter-band.jpg';
import { currentSeason } from './SeasonGlyph';

const BANDS = { spring, summer, fall: autumn, winter };

// A strip of a season's painting. Given a season it shows that one outright,
// which is how an issue wears its own season; given none it follows whatever
// season the page is in and crossfades with the tree.
export default function SeasonBand({ season, className = '' }) {
  if (season) {
    return (
      <div className={`nlw-band-strip is-fixed ${className}`} aria-hidden="true">
        <img src={BANDS[season] || BANDS[currentSeason()]} alt="" loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`nlw-band-strip ${className}`} aria-hidden="true">
      {Object.keys(BANDS).map((k) => (
        <img key={k} src={BANDS[k]} alt="" data-season={k} loading="lazy" />
      ))}
    </div>
  );
}
