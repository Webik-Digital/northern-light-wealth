import React, { useEffect, useState } from 'react';
import spring from '@/assets/seasons/spring.png';
import summer from '@/assets/seasons/summer.png';
import autumn from '@/assets/seasons/autumn.png';
import winter from '@/assets/seasons/winter.png';

// The firm's four seasonal marks. The site already knows what season it is in;
// these let it say so without a word. Decorative, so they stay out of the
// accessibility tree.
const GLYPH = { spring, summer, fall: autumn, winter };
const NAME = { spring: 'tulip', summer: 'sun', fall: 'leaf', winter: 'snowflake' };

export function currentSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

// variant: 'mark' — a small accent at full strength
//          'watermark' — large and faint, for the empty half of a hero
export default function SeasonGlyph({ season, variant = 'mark', className = '' }) {
  const s = season || currentSeason();
  return (
    <span className={`nlw-glyph is-${variant} ${className}`} aria-hidden="true" data-season={s}>
      {/* every season is mounted so the change is a crossfade, not a swap */}
      {Object.keys(GLYPH).map((k) => (
        <img key={k} src={GLYPH[k]} alt="" data-glyph={NAME[k]} className={k === s ? 'is-on' : ''} />
      ))}
    </span>
  );
}
