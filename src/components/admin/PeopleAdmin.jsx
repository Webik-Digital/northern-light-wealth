import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

// Invites someone to the app. Base44 sends them the email; they choose their own
// password from it, or via "Forgot password" later. No password is ever set or
// seen from here, which is how it should stay.
export default function PeopleAdmin() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [sent, setSent] = useState([]);

  const invite = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErr('That does not look like an email address.');
      return;
    }
    setBusy(true);
    try {
      await base44.auth.inviteUser(value, role);
      setSent((s) => [{ email: value, role, at: new Date() }, ...s]);
      setMsg(`Invitation sent to ${value}. They set their own password from the email.`);
      setEmail('');
    } catch (e2) {
      const status = e2 && e2.status;
      setErr(
        status === 403
          ? 'Your account cannot invite people. An owner or editor has to do it.'
          : status === 400
            ? 'Base44 rejected that address or role. Check the address and try again.'
            : 'Could not send that invitation. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nlw-admin-grid">
      <section className="nlw-admin-list">
        <div className="nlw-admin-list-head">
          <h2>People</h2>
        </div>
        <p className="nlw-admin-muted">
          Invite a client or a colleague. They receive an email, choose their own password, and
          can reset it any time from the sign-in page. Nobody here sets or sees it.
        </p>
        <p className="nlw-admin-muted" style={{ marginTop: 14 }}>
          <strong>Client</strong> opens the library. <strong>Admin</strong> also opens this area,
          so give it only to staff who publish.
        </p>

        {sent.length > 0 && (
          <ul style={{ marginTop: 20 }}>
            {sent.map((s, i) => (
              <li key={i}>
                <span className="row" style={{ cursor: 'default' }}>
                  <span className="t">{s.email}</span>
                  <span className="m">
                    {s.role === 'admin' ? 'Admin' : 'Client'}
                    <em className="state live">Invited</em>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="nlw-admin-form">
        <form onSubmit={invite} style={{ display: 'contents' }}>
          <label className="nlw-label">
            <span>Email address</span>
            <input
              className="nlw-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="off"
            />
          </label>

          <label className="nlw-label">
            <span>Access</span>
            <select className="nlw-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Client — the resource library</option>
              <option value="admin">Admin — the library and this area</option>
            </select>
          </label>

          {err && <p className="nlw-admin-err">{err}</p>}
          {msg && <p className="nlw-admin-ok">{msg}</p>}

          <div className="nlw-admin-actions">
            <button type="submit" className="nlw-btn" disabled={busy}>
              {busy ? 'Sending…' : 'Send invitation'}
            </button>
          </div>
        </form>

        <p className="nlw-admin-muted">
          If an invitation does not arrive, the person can still get in: ask them to use
          “Forgot password” on the sign-in page with the address you invited.
        </p>
      </section>
    </div>
  );
}
