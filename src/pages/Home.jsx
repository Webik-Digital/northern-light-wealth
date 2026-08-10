import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import StewardshipCard from '@/components/StewardshipCard';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import BrandDraw from '@/components/BrandDraw';
import { TESTIMONIALS } from '@/data/testimonials';

const SEASON_LABEL = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };

function currentSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

export default function Home() {
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    base44.entities.Turning.filter({}, '-publishedAt', 20)
      .then((rows) => {
        // drafts carry no publishedAt, and a future date is not live yet
        const live = (rows || []).filter(
          (r) => r.publishedAt && new Date(r.publishedAt) <= new Date()
        );
        if (live.length) setIssue(live.find((r) => r.isFeatured) || live[0]);
      })
      .catch(() => {});
  }, []);

  const season = currentSeason();
  const year = new Date().getFullYear();

  return (
    <>
      <SeasonalTree />
      <Header />

      <main className="nlw-main" id="top">
        {/* 1. Hero */}
        <section className="nlw-hero nlw-section" style={{ paddingBottom: '90px' }}>
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">Seasonal perspective. Daily discipline.</Reveal>
            <Reveal as="h1" className="nlw-h1">Not everyone is a fit. That is the point of doing this well.</Reveal>
            <Reveal as="p" className="nlw-lead">We look after a small number of families and business owners who want the long view held with discipline. No pressure, and no sales sequence. Only counsel.</Reveal>
            <Reveal className="nlw-hero-actions">
              <Link to="/contact" className="nlw-btn">Begin a conversation</Link>
              <Link to="/stewardship" className="nlw-link-more">Explore stewardship <span className="arw">→</span></Link>
            </Reveal>
          </div>
        </section>

        {/* 2. Statement */}
        <section className="nlw-statement nlw-section">
          <div className="nlw-wrap">
            <Reveal as="h2" className="nlw-h2">We plan for the whole arc of a life's work, not the next quarter. The family, the business, the transition, and the good you want to leave behind, all held as one continuing responsibility.</Reveal>
          </div>
        </section>

        {/* 3. Stewardship */}
        <section className="nlw-stewardship nlw-section">
          <div className="nlw-wrap">
            <Reveal className="head">
              <p className="nlw-eyebrow">Stewardship</p>
              <h2 className="nlw-h2">One doctrine, expressed three ways.</h2>
            </Reveal>
            <div className="nlw-cards">
              <StewardshipCard
                tag="Continuity"
                name="EstateReady"
                oneLiner="Readiness for the family and the estate, prepared long before it is ever needed."
                detail="Family continuity, operational continuity before probate, and stewardship that carries on long after."
                photo="estate"
                to="/estate-ready"
              />
              <StewardshipCard
                tag="Transition"
                name="SaleReady"
                oneLiner="Preparation for the owner, for the sale itself and for the life that follows it."
                detail="Owner, family, tax, liquidity, and identity, all readied before and after the transaction."
                photo="sale"
                to="/sale-ready"
              />
              <StewardshipCard
                tag="Giving"
                name="Harvest Share"
                oneLiner="Generosity built into the plan, with a portion of your giving returned to you in recognition."
                detail="Grounded in participation and community, not cause marketing. Exact terms confirmed with you."
                photo="harvest"
                to="/harvest-share"
              />
            </div>
            <Reveal className="sys">
              <Link to="/stewardship" className="nlw-link-more">See the full system <span className="arw">→</span></Link>
            </Reveal>
          </div>
        </section>

        {/* 4. Fiduciary */}
        <section className="nlw-fiduciary">
          <div className="nlw-wrap">
            <Reveal as="p">We are held to a <span className="k">fiduciary standard</span>. Your interest comes first, in writing, every time.</Reveal>
          </div>
        </section>

        {/* 5. Current issue */}
        <section className="nlw-issue nlw-section">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">The Four Turnings · {SEASON_LABEL[season]} {year}</Reveal>
            <Reveal as="h2" className="nlw-h2">
              {issue ? issue.title : 'The quiet season for the loudest decisions.'}
            </Reveal>
            <Reveal as="p" className="nlw-lead dek">
              {issue && issue.dek ? issue.dek : 'A short essay on why the unhurried months are usually when the most consequential planning gets done well.'}
            </Reveal>
            <Reveal>
              <Link to="/the-four-turnings" className="nlw-link-more">Read the issue <span className="arw">→</span></Link>
            </Reveal>
            <Reveal as="p" className="meta">Published at the solstice. New writing each turning of the year.</Reveal>
          </div>
        </section>

        {/* 6. Client testimonials */}
        <TestimonialCarousel items={TESTIMONIALS} />

        {/* 7. Closing — the mark draws itself in the column the tree has vacated */}
        <section className="nlw-closing nlw-closing-split nlw-section">
          <div className="nlw-wrap">
            <div className="nlw-closing-grid">
              <div>
                <Reveal as="h2" className="nlw-h2">If it is a fit, we should talk.</Reveal>
                <Reveal as="p" className="nlw-lead">One unhurried conversation. If we are not the right stewards for you, we will tell you plainly.</Reveal>
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
      </main>

      <Footer />
    </>
  );
}