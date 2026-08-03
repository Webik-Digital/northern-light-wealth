import React from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';

export default function Stewardship() {
  return (
    <>
      <SeasonalTree />
      <Header />
      <main className="nlw-main">
        <section className="nlw-placeholder">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">Stewardship</Reveal>
            <Reveal as="h1" className="nlw-h1">One doctrine, expressed three ways.</Reveal>
            <Reveal as="p" className="nlw-lead">The three pathways — EstateReady, SaleReady, and Harvest Share — will be expanded here, alongside the shared movements that sit under all three: Understand, Order, Act, Steward.</Reveal>
            <Reveal><Link to="/contact" className="nlw-btn">Begin a conversation</Link></Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}