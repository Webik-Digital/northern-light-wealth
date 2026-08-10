import React from 'react';
import { Link } from 'react-router-dom';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';

const PATHWAYS = [
  {
    name: 'EstateReady',
    tag: 'Continuity',
    purpose: 'Readiness for the family and the estate, prepared long before it is ever needed.',
    detail: 'We ready the family and the estate together: the documents, the roles, the difficult conversations, and the plan for continuity before probate and long after it. When the moment comes, nothing is improvised.',
  },
  {
    name: 'SaleReady',
    tag: 'Transition',
    purpose: 'Preparation for the owner, for the sale itself and for the life that follows it.',
    detail: 'A business sale is a personal event, not only a transaction. We prepare the owner, the family, the tax position, and the liquidity ahead of time, and we stay through the change of identity that follows the cheque.',
  },
  {
    name: 'Harvest Share',
    tag: 'Giving',
    purpose: 'Generosity built into the plan, with a portion of your giving returned to you in recognition.',
    detail: 'Giving belongs in the plan, not after it. Harvest Share builds your generosity into the whole, grounded in participation and community rather than cause marketing. The exact structure, including any recognition returned to you, is confirmed with you directly.',
    note: 'Wording to be finalised with NLW compliance. No terms or figures are stated here.',
  },
];

const MOVEMENTS = [
  { num: '01', name: 'Understand', body: 'We learn the whole picture before we propose anything.' },
  { num: '02', name: 'Order', body: 'We put the structure, the documents, and the roles in their right place.' },
  { num: '03', name: 'Act', body: 'We move at the right moment, not the loud one.' },
  { num: '04', name: 'Steward', body: 'We stay, and we keep the plan true as the seasons change.' },
];

export default function Stewardship() {
  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">Stewardship</Reveal>
            <Reveal as="h1" className="nlw-h1">Stewardship, expressed three ways.</Reveal>
            <Reveal as="p" className="nlw-lead">One philosophy of care, carried through three connected programs. Not a menu to choose from, but a single approach applied at different moments.</Reveal>
          </div>
        </section>

        {/* One system, not three products */}
        <section className="nlw-section">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">One system, not three products</Reveal>
            <Reveal className="nlw-passage">
              <p>EstateReady, SaleReady, and Harvest Share are not three products. They are one system of care applied at the three moments that most reshape a legacy: what the family inherits, what the owner sells, and what you choose to give.</p>
              <p>You do not pick one. You grow into each as your season turns.</p>
            </Reveal>
          </div>
        </section>

        {/* The three pathways */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">The three pathways</p>
              <h2 className="nlw-h2">Where the work meets the moment.</h2>
            </Reveal>
            <div className="nlw-pathways">
              {PATHWAYS.map((p) => (
                <Reveal key={p.name} className="nlw-pathway">
                  <div>
                    <span className="tag">{p.tag}</span>
                    <h3>{p.name}</h3>
                  </div>
                  <div>
                    <p className="purpose">{p.purpose}</p>
                    <p className="detail">{p.detail}</p>
                    {p.note && <p className="nlw-note">{p.note}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* The shared movements */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap wide">
            <Reveal className="nlw-head">
              <p className="nlw-eyebrow">Under every pathway</p>
              <h2 className="nlw-h2">The same movements sit under all three.</h2>
            </Reveal>
            <div className="nlw-movements">
              {MOVEMENTS.map((m) => (
                <Reveal key={m.num} className="nlw-movement">
                  <span className="num">{m.num}</span>
                  <h3>{m.name}</h3>
                  <p>{m.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="nlw-closing nlw-section">
          <div className="nlw-wrap">
            <Reveal as="h2" className="nlw-h2">Wherever your season begins, a conversation is the same first step.</Reveal>
            <Reveal>
              <Link to="/contact" className="nlw-btn">Begin a conversation</Link>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
