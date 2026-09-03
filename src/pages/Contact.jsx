import React, { useState } from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import SeasonGlyph from '@/components/SeasonGlyph';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !contact.trim() || !message.trim()) {
      setError('Please share your name, a way to reach you, and a note.');
      return;
    }
    setBusy(true);
    try {
      await base44.entities.ContactSubmission.create({
        name: name.trim(),
        contact: contact.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong sending your note. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SeasonalTree mode="hero" />
      <Header />

      <main className="nlw-main nlw-inner">
        <section className="nlw-page-hero">
          <SeasonGlyph variant="watermark" />
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">Contact</Reveal>
            <Reveal as="h1" className="nlw-h1">Begin a conversation.</Reveal>
            <Reveal as="p" className="nlw-lead">Tell us a little, and we will answer personally. No obligation, and no sales sequence.</Reveal>
          </div>
        </section>

        <section className="nlw-section">
          <div className="nlw-wrap wide">
            <div className="nlw-contact-grid">
              {/* The form */}
              <div>
                {submitted ? (
                  <Reveal className="nlw-panel">
                    <h2 className="nlw-h3">Thank you. Your note is with us.</h2>
                    <p>One of us will read it and reply personally, usually within a couple of days.</p>
                  </Reveal>
                ) : (
                  <Reveal>
                    <form className="nlw-form" onSubmit={onSubmit}>
                      <label className="nlw-label">
                        <span>Your name</span>
                        <input
                          className="nlw-input"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                        />
                      </label>
                      <label className="nlw-label">
                        <span>Where we can reach you</span>
                        <input
                          className="nlw-input"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder="Email or phone"
                        />
                      </label>
                      <label className="nlw-label">
                        <span>What is on your mind (a few lines is plenty)</span>
                        <textarea
                          className="nlw-input"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </label>
                      {error && <p className="nlw-form-error">{error}</p>}
                      <button type="submit" className="nlw-btn" disabled={busy} style={{ alignSelf: 'flex-start', opacity: busy ? 0.6 : 1 }}>
                        {busy ? 'Sending…' : 'Send'}
                      </button>
                    </form>
                  </Reveal>
                )}
              </div>

              {/* Direct line and what happens next */}
              <div>
                <Reveal as="p" className="nlw-eyebrow">Direct line</Reveal>
                <Reveal className="nlw-direct">
                  <div className="item">
                    <p className="k">Write to us</p>
                    <p className="v"><a href="mailto:info@nlwealth.ca">info@nlwealth.ca</a></p>
                  </div>
                  <div className="item">
                    <p className="k">Call</p>
                    <p className="v"><a href="tel:+14039914331">403-991-4331</a></p>
                    <p className="sub">Weekdays, Mountain Time.</p>
                  </div>
                  <div className="item">
                    <p className="k">Find us</p>
                    <address className="v" style={{ fontStyle: 'normal' }}>
                      #310, 5010 Richard Road SW<br />
                      Calgary, AB&nbsp;&nbsp;T3E 6L1
                    </address>
                  </div>
                  <div className="item">
                    <p className="k">Book a time</p>
                    <p className="sub">A short introductory call at a time that suits you.</p>
                    <p className="v" style={{ marginTop: 10 }}>
                      <span className="nlw-link-more" style={{ color: 'var(--muted)', cursor: 'default' }}>
                        Find a time <span className="arw">→</span>
                      </span>
                    </p>
                  </div>
                </Reveal>
                <Reveal as="p" className="nlw-note">The booking link is still to be provided by NLW.</Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* What happens next */}
        <section className="nlw-section nlw-section-tight">
          <div className="nlw-wrap">
            <Reveal as="p" className="nlw-eyebrow">What happens next</Reveal>
            <Reveal as="h2" className="nlw-h2" style={{ maxWidth: '22ch' }}>A person reads your note, and replies personally.</Reveal>
            <Reveal as="p" className="nlw-lead" style={{ marginTop: 20 }}>
              If there is a fit we suggest a first conversation. Nothing automated, and no follow-up sequence.
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
