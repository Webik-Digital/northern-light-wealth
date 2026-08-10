import React from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import ClosingCTA from '@/components/ClosingCTA';
import StickyFeature from '@/components/StickyFeature';

// The section's own copy, split into steps. The tree carries the seasonal
// argument the passage makes, so it turns from bare to full as you scroll.
const TREE = 'https://media.base44.com/images/public/6a70610b0eb9bb2f777d7afd/';
const HOW_WE_THINK = [
  {
    title: 'Most firms manage money. We steward what money is for.',
    image: `${TREE}292a405ad_tree-spring.jpg`,
    alt: 'The tree in leaf in spring',
  },
  {
    body: 'That means holding the whole picture, the family, the business, the transition, and the causes you want to outlast you, as one continuing responsibility rather than a set of separate accounts.',
    image: `${TREE}2aa49d740_tree-fall.jpg`,
    alt: 'The same tree turning in autumn',
  },
  {
    body: 'We work slowly, we write things down, and we say what we think. What you get is counsel you can rely on through every season, not advice tuned to the mood of the market.',
    image: `${TREE}e410f210c_tree-winter.jpg`,
    alt: 'The same tree bare in winter',
  },
];

// Advisor names and bios are supplied by NLW. Placeholders until then.
const PEOPLE = [
  { name: 'Advisor name', role: 'Role', note: 'One or two plain sentences on background and the clients they look after. Placeholder bio, to be provided.' },
  { name: 'Advisor name', role: 'Role', note: 'Placeholder bio, to be provided.' },
  { name: 'Advisor name', role: 'Role', note: 'Placeholder bio, to be provided.' },
];

export default function About() {
  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">About</Reveal>
            <Reveal as="h1" className="nlw-h1">About the firm and the view behind it.</Reveal>
            <Reveal as="p" className="nlw-lead">Who we are, and the conviction that shapes the work. A firm built for the long measure, not the loud moment.</Reveal>
          </div>
        </section>

        {/* How we think — pinned, one step at a time */}
        <StickyFeature eyebrow="How we think" steps={HOW_WE_THINK} />

        {/* The seasonal view — full top padding: it follows the dark band, not a padded section */}
        <section className="nlw-section">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">The seasonal view</Reveal>
            <Reveal className="nlw-passage">
              <p>A year has four turnings, and so does a life's work. There are seasons for building, for holding, for letting go, and for beginning again. We plan for all of them before they arrive, so that when a season changes you are ready rather than surprised. That is the idea behind our writing, and behind our tree.</p>
            </Reveal>
            <Reveal style={{ marginTop: 26 }}>
              <Link to="/the-four-turnings" className="nlw-link-more">The Four Turnings <span className="arw">→</span></Link>
            </Reveal>
          </div>
        </section>

        {/* Indigenous ownership and community responsibility */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">Ownership and responsibility</Reveal>
            <Reveal className="nlw-panel">
              <h3 className="nlw-h3">Indigenous ownership and community responsibility</h3>
              <p>Written and approved by Northern Light Wealth, in the firm's own words. This section states the firm's Indigenous ownership and its commitments to community.</p>
              <p className="nlw-note">Placeholder. This section is authored and approved by NLW and is not written on the firm's behalf.</p>
            </Reveal>
          </div>
        </section>

        {/* The people */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">The people</p>
              <h2 className="nlw-h2">The advisors you would be working with.</h2>
            </Reveal>
            <div className="nlw-people">
              {PEOPLE.map((p, i) => (
                <Reveal key={i} className="nlw-person">
                  <h3>{p.name}</h3>
                  <p className="role">{p.role}</p>
                  <p>{p.note}</p>
                </Reveal>
              ))}
            </div>
            <Reveal as="p" className="nlw-note">Advisor names, roles, and bios to be provided by NLW.</Reveal>
          </div>
        </section>

        {/* Closing */}
        <ClosingCTA heading="We hold ourselves to the standard we would want held for our own families." />
      </main>

      <Footer />
    </>
  );
}
