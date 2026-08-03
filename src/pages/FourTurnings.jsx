import React from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';

export default function FourTurnings() {
  return (
    <>
      <SeasonalTree />
      <Header />
      <main className="nlw-main">
        <section className="nlw-placeholder">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">The Four Turnings</Reveal>
            <Reveal as="h1" className="nlw-h1">A printed page for the current essay, then the archive.</Reveal>
            <Reveal as="p" className="nlw-lead">The featured Turning essay and the archive list (drawn from the Turning entity) will be built here next, with a subscribe form.</Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}