import React from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';

export default function About() {
  return (
    <>
      <SeasonalTree />
      <Header />
      <main className="nlw-main">
        <section className="nlw-placeholder">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">About</Reveal>
            <Reveal as="h1" className="nlw-h1">A firm built around the long view.</Reveal>
            <Reveal as="p" className="nlw-lead">This page is being built next, on the same calm shell, tokens, and seasonal system as the homepage.</Reveal>
            <Reveal as="p" className="nlw-lead">Firm story, the seasonal worldview, advisor notes, and the Indigenous ownership section (authored by NLW) will follow.</Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}