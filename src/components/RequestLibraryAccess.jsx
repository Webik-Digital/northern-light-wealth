import React, { useState } from 'react';
import Reveal from './Reveal';
import { submitEnquiry } from '@/api/content';

// Asking for the Stewardship Resource Library.
//
// This form used to ask for the brochure. The brochure is now on the site for
// anyone to read, so gating it would have been asking people to fill in a form
// for something already a click away — and the firm would have learned nothing
// from a request it could not refuse. What is worth asking for is the library
// behind it: the working documents, the templates, the issues of The Four
// Turnings. So the form stayed and the thing it opens changed.
//
// Still short on purpose. Every field costs completions, and the firm only needs
// enough to reply: who, and where to reach them. Which page the request came
// from is recorded automatically rather than being another thing to choose, so
// the firm can see which pathway is drawing interest without anyone typing it.
export default function RequestLibraryAccess({ pathway, pathwayName }) {
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
        message: `Requested access to the Stewardship Resource Library from the ${pathwayName} page.`,
        source: `library:${pathway}`,
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
          We have your request and will be in touch shortly to set up your access. If it is
          easier, you can also reach us on <a href="tel:+14039914331">403-991-4331</a>.
        </p>
      </Reveal>
    );
  }

  return (
    <Reveal className="nlw-panel nlw-request">
      <h3 className="nlw-h3">Ask for access to the Resource Library</h3>
      <p>
        The {pathwayName} brochure is yours to read above. The library is what sits behind
        it — the working documents and seasonal letters we keep for clients and invited
        guests. Tell us where to reach you and a person will follow up. No newsletter, no list.
      </p>

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
          {busy ? 'Sending…' : 'Request access'}
        </button>
      </form>

      {error && <p className="nlw-form-error">{error}</p>}
    </Reveal>
  );
}
