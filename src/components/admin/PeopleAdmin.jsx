import React, { useEffect, useState } from 'react';
import { listPeople, setRole } from '@/api/admin';

// Who can open the client library.
//
// There is no "invite" button here any more, and its absence is deliberate.
// Creating an account needs the service-role key, and that key would have to be
// shipped inside the browser bundle for a button on this page to use it — which
// would hand the whole database to anyone who viewed source. So accounts are
// made by Webik, which is also how the arrangement with NLW is written: they
// manage client logins so the system stays predictable.
//
// What an admin can do from here is see who has access and take it away, which
// is the part that is ever urgent.

const ROLES = {
  admin: 'Can publish, upload and manage people',
  user: 'Can open the client library',
};

export default function PeopleAdmin() {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    listPeople()
      .then(setRows)
      .catch(() => { setRows([]); setErr('Could not load the list of people.'); });
  };

  useEffect(load, []);

  const change = async (person, role) => {
    setBusy(person.id); setErr('');
    try {
      await setRole(person.id, role);
      load();
    } catch (e) {
      setErr(`Could not change the role for ${person.email}.`);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="nlw-admin-grid">
      <section className="nlw-admin-list">
        <div className="nlw-admin-list-head">
          <h2>People</h2>
        </div>
        <p className="nlw-admin-muted">
          Everyone who can sign in. A client sees the library; an admin can also publish,
          upload, and change what is on this page.
        </p>

        {rows === null ? (
          <p className="nlw-admin-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="nlw-admin-muted">Nobody has an account yet.</p>
        ) : (
          <ul>
            {rows.map((p) => (
              <li key={p.id}>
                <span className="row" style={{ cursor: 'default' }}>
                  <span className="t">{p.full_name || p.email}</span>
                  <span className="m">
                    {p.full_name ? p.email : ROLES[p.role]}
                    <em className={`state ${p.role === 'admin' ? 'live' : 'draft'}`}>
                      {p.role === 'admin' ? 'Admin' : 'Client'}
                    </em>
                  </span>
                </span>
                <button
                  type="button"
                  className="del"
                  disabled={busy === p.id}
                  onClick={() => change(p, p.role === 'admin' ? 'user' : 'admin')}
                >
                  {p.role === 'admin' ? 'Make client' : 'Make admin'}
                </button>
              </li>
            ))}
          </ul>
        )}

        {err && <p className="nlw-admin-err">{err}</p>}
      </section>

      <section className="nlw-admin-form">
        <h3 style={{ fontSize: 16, marginBottom: 10 }}>Adding someone</h3>
        <p className="nlw-admin-muted">
          New accounts are created by Webik rather than from this page. Send the person&rsquo;s
          name and email address and the account is issued, along with the email that lets
          them choose their own password. Nobody at Webik or Northern Light Wealth ever sees
          or sets that password.
        </p>
        <p className="nlw-admin-muted" style={{ marginTop: 14 }}>
          There is no public sign-up on this site and no sign-in through Google or any other
          service, so an invitation is the only way in.
        </p>

        <h3 style={{ fontSize: 16, margin: '22px 0 10px' }}>Removing someone</h3>
        <p className="nlw-admin-muted">
          Making a person a client rather than an admin takes away publishing straight away.
          To remove their access to the library entirely, ask Webik to delete the account —
          treated as urgent and actioned the same working day.
        </p>
      </section>
    </div>
  );
}
