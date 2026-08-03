import React, { useState } from 'react';
import SeasonalTree from '@/components/SeasonalTree';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
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
      await base44.entities.ContactSubmission.create({ name: name.trim(), contact: contact.trim(), message: message.trim() });
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong sending your note. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SeasonalTree />
      <Header />
      <main className="nlw-main">
        <section className="nlw-placeholder">
          <div className="nlw-wrap" style={{ maxWidth: 640 }}>
            <Reveal as="p" className="nlw-eyebrow">Contact</Reveal>
            <Reveal as="h1" className="nlw-h1">Begin a conversation.</Reveal>
            <Reveal as="p" className="nlw-lead">One unhurried conversation. If we are not the right stewards for you, we will tell you plainly.</Reveal>

            {submitted ? (
              <Reveal className="nlw-locked" style={{ marginTop: 36 }}>
                <h3 className="nlw-h3">Thank you, your note is with us.</h3>
                <p>We will be in touch shortly at the details you provided.</p>
              </Reveal>
            ) : (
              <Reveal>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 36, maxWidth: 560 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Name</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} autoComplete="name" />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>How to reach you</span>
                    <input value={contact} onChange={(e) => setContact(e.target.value)} style={inputStyle} placeholder="Email or phone" />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Your note</span>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }} />
                  </label>
                  {error && <p style={{ color: 'var(--plum)', fontSize: 14 }}>{error}</p>}
                  <button type="submit" className="nlw-btn" disabled={busy} style={{ alignSelf: 'flex-start', opacity: busy ? 0.6 : 1 }}>
                    {busy ? 'Sending…' : 'Send note'}
                  </button>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>A direct line and a book-a-time option will follow here. What happens next: a brief reply, then an unhurried first conversation.</p>
                </form>
              </Reveal>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const inputStyle = {
  fontFamily: 'inherit',
  fontSize: 16,
  padding: '12px 14px',
  borderRadius: 5,
  border: '.5px solid var(--rule)',
  background: '#FBFAF9',
  color: 'var(--ink)',
  outline: 'none',
};