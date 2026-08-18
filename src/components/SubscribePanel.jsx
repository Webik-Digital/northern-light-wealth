import React, { useState } from 'react';
import Reveal from './Reveal';
import { base44 } from '@/api/base44Client';
import spring from '@/assets/seasons/spring-scene.jpg';
import summer from '@/assets/seasons/summer-scene.jpg';
import autumn from '@/assets/seasons/autumn-scene.jpg';
import winter from '@/assets/seasons/winter-scene.jpg';

const SCENES = { spring, summer, fall: autumn, winter };

// The invitation to the letter, with one of the firm's paintings filling the
// half of the panel the form does not need. All four are mounted and CSS shows
// whichever season the page is in, so it turns with everything else.
//
// Lives here rather than on each page: it appeared twice, form logic and all.
export default function SubscribePanel() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubscribe = async (e) => {
    e.preventDefault();
    setError('');
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter an email address we can reach you at.');
      return;
    }
    setBusy(true);
    try {
      await base44.entities.Subscriber.create({ email: value, source: 'the-four-turnings' });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again, or write to us directly.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="nlw-section nlw-section-tight">
      <div className="nlw-wrap wide">
        <Reveal className="nlw-panel nlw-subscribe">
          <div className="nlw-subscribe-body">
            {subscribed ? (
              <>
                <h2 className="nlw-h3">You are on the list.</h2>
                <p>We will send the next issue when it is published.</p>
              </>
            ) : (
              <>
                <h2 className="nlw-h2">Receive each turning when it is published.</h2>
                <p className="nlw-subscribe-line">Four emails a year. Nothing else.</p>
                <form className="nlw-inline-form" onSubmit={onSubscribe}>
                  <label className="nlw-label">
                    <input
                      className="nlw-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      autoComplete="email"
                      aria-label="Email address"
                    />
                  </label>
                  <button type="submit" className="nlw-btn" disabled={busy} style={{ opacity: busy ? 0.6 : 1 }}>
                    {busy ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
                {error && <p className="nlw-form-error">{error}</p>}
                <p className="nlw-form-small">We send only the letter. No sales sequence.</p>
              </>
            )}
          </div>

          <div className="nlw-subscribe-art" aria-hidden="true">
            {Object.keys(SCENES).map((k) => (
              <img key={k} src={SCENES[k]} alt="" data-season={k} loading="lazy" />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
