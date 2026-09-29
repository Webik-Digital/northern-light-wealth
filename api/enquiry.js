// Takes an enquiry, records it, and tells somebody about it.
//
// The contact page promises "a person reads your note, and replies personally".
// Until now the site kept that promise only in the sense that the note was
// stored: nothing was sent to anyone, so an enquiry sat in a table waiting to be
// noticed. For a firm whose enquiries are prospective clients, silence is the
// worst failure mode there is, because nobody finds out it is happening.
//
// This runs on the server, so it can hold the service-role key and the mail
// provider's key. Neither is ever in the browser.
//
// Deliberate order: the row is written first and the email is attempted second.
// If the mail provider is down, or has not been set up yet, the enquiry is still
// recorded and the person is still thanked. Losing the enquiry to make the email
// atomic would be the wrong trade.

const REQUIRED = ['name', 'contact'];
const LIMITS = { name: 120, contact: 160, message: 4000, source: 60 };

const TO = process.env.ENQUIRY_TO || 'info@nlwealth.ca';
const FROM = process.env.ENQUIRY_FROM || 'Northern Light Wealth <onboarding@resend.dev>';

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  // A field no person can see and no person fills in. A bot fills in everything.
  if (body.website) return res.status(200).json({ ok: true });

  const clean = {};
  for (const key of ['name', 'contact', 'message', 'source']) {
    clean[key] = String(body[key] || '').trim().slice(0, LIMITS[key]);
  }
  clean.source = clean.source || 'contact';

  for (const key of REQUIRED) {
    if (!clean[key]) return res.status(400).json({ error: `Missing ${key}.` });
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('enquiry: Supabase is not configured on the server');
    return res.status(500).json({ error: 'The form is not available right now.' });
  }

  // 1. record it
  try {
    const stored = await fetch(`${url}/rest/v1/contact_submissions`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name: clean.name,
        contact: clean.contact,
        message: clean.message || null,
        source: clean.source,
      }),
    });
    if (!stored.ok) {
      console.error('enquiry: could not store', stored.status, await stored.text());
      return res.status(500).json({ error: 'Could not send your note. Please try again.' });
    }
  } catch (e) {
    console.error('enquiry: storing threw', e);
    return res.status(500).json({ error: 'Could not send your note. Please try again.' });
  }

  // 2. tell someone. Best effort: a failure here must not lose the enquiry.
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn('enquiry: stored, but RESEND_API_KEY is not set so nobody was emailed');
    return res.status(200).json({ ok: true, emailed: false });
  }

  try {
    const label = clean.source === 'contact' ? 'the contact page' : clean.source;
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        // so a reply goes to the person, not into the void
        reply_to: /@/.test(clean.contact) ? clean.contact : undefined,
        subject: `Website enquiry from ${clean.name}`,
        text:
          `${clean.name} got in touch through ${label}.\n\n` +
          `Contact: ${clean.contact}\n\n` +
          `${clean.message || '(no message)'}\n`,
        html:
          `<p><strong>${escape(clean.name)}</strong> got in touch through ${escape(label)}.</p>` +
          `<p>Contact: ${escape(clean.contact)}</p>` +
          `<p style="white-space:pre-wrap">${escape(clean.message || '(no message)')}</p>`,
      }),
    });
    if (!sent.ok) {
      console.error('enquiry: stored, but the email failed', sent.status, await sent.text());
      return res.status(200).json({ ok: true, emailed: false });
    }
  } catch (e) {
    console.error('enquiry: stored, but sending threw', e);
    return res.status(200).json({ ok: true, emailed: false });
  }

  return res.status(200).json({ ok: true, emailed: true });
}

function safeParse(s) {
  try { return JSON.parse(s); } catch (e) { return {}; }
}
