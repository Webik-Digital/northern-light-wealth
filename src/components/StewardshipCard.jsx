import React from 'react';
import { Image } from '@/components/ui/image';
import Reveal from './Reveal';

const TREES = {
  winter: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/e410f210c_tree-winter.jpg',
  fall: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/2aa49d740_tree-fall.jpg',
  spring: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/292a405ad_tree-spring.jpg',
  summer: 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/1e1115c7a_tree-summer.jpg',
};

export default function StewardshipCard({ tag, name, oneLiner, detail, photo, to }) {
  return (
    <Reveal to={to} className="nlw-card" aria-label={`${name} — ${tag}`}>
      <span className="ph">
        <Image src={TREES[photo]} alt="" fittingType="fill" aria-hidden="true" />
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