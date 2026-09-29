import React, { useState } from 'react';
import Reveal from './Reveal';
import { submitEnquiry } from '@/api/content';

// Asking for a brochure.
//
// Short on purpose. Every field costs completions, and the firm only needs
// enough to reply: who, and where to reach them. Which brochure was asked for is
// recorded automatically rather than being another thing to choose, so Garth can
// see which of the three is drawing interest without anyone typing it.
//
// It does not send the brochure. Those live in the client library, and handing a
// document to anyone who types an address would undo the point of that. This
// starts a conversation, which is what the pathway pages are for.
export default function RequestBrochure({ pathway, brochureName }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState(''); // the honeypot
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !contact.trim()) {
      setError('Please give your name and an email address.');
      return;
    }

    setBusy(true);
    try {
      await submitEnquiry({
        name,
        contact,
        message: `Requested the ${brochureName}.`,
        source: `brochure:${pathway}`,
        website,
      });
      setDone(true);
    } catch (err) {
      setError('Something went wrong sending that. Please try again, or write to us directly.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Reveal className="nlw-panel nlw-request is-done">
        <h3 className="nlw-h3">Thank you.</h3>
        <p>
          We have your request for the {brochureName} and will be in touch shortly. If it is
          easier, you can also reach us on <a href="tel:+14039914331">403-991-4331</a>.
        </p>
      </Reveal>
    );
  }

  return (
    <Reveal className="nlw-panel nlw-request">
      <h3 className="nlw-h3">Ask us for the {brochureName}</h3>
      <p>Tell us where to send it and a person will follow up. No newsletter, no list.</p>

      <form className="nlw-request-form" onSubmit={onSubmit}>
        <input
          type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
          value={website} onChange={(e) => setWebsite(e.target.value)}
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />

        <label className="nlw-label">
          <span>Your name</span>
          <input className="nlw-input" value={name} autoComplete="name"
            onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="nlw-label">
          <span>Email</span>
          <input className="nlw-input" type="email" value={contact} autoComplete="email"
            onChange={(e) => setContact(e.target.value)} required />
        </label>

        <button type="submit" className="nlw-btn" disabled={busy}>
          {busy ? 'Sending…' : 'Request the brochure'}
        </button>
      </form>

      {error && <p className="nlw-form-error">{error}</p>}
    </Reveal>
  );
}
