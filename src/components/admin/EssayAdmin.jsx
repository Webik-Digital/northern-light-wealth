import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const LABEL = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70);

const blank = () => ({
  title: '',
  season: 'spring',
  year: new Date().getFullYear(),
  slug: '',
  dek: '',
  body: '',
  isFeatured: false,
  publishedAt: null,
});

export default function EssayAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null); // the essay being edited
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    base44.entities.Turning.filter({}, '-created_date', 100)
      .then((r) => setRows(r || []))
      .catch(() => setErr('Could not load the essays.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const edit = (row) => { setDraft({ ...row }); setMsg(''); setErr(''); };
  const startNew = () => { setDraft(blank()); setMsg(''); setErr(''); };
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const validate = () => {
    if (!draft.title.trim()) return 'An essay needs a title.';
    if (!draft.year || String(draft.year).length !== 4) return 'Give the year as four digits.';
    return '';
  };

  const save = async ({ publish }) => {
    const problem = validate();
    if (problem) { setErr(problem); return; }
    setBusy(true); setErr(''); setMsg('');

    const payload = {
      title: draft.title.trim(),
      season: draft.season,
      year: Number(draft.year),
      slug: (draft.slug || slugify(draft.title)).trim(),
      dek: draft.dek.trim(),
      body: draft.body,
      isFeatured: !!draft.isFeatured,
      publishedAt: publish === true
        ? (draft.publishedAt || new Date().toISOString())
        : publish === false
          ? null
          : draft.publishedAt || null,
    };

    try {
      // only one essay can be the featured current issue
      if (payload.isFeatured) {
        const others = rows.filter((r) => r.isFeatured && r.id !== draft.id);
        for (const o of others) await base44.entities.Turning.update(o.id, { isFeatured: false });
      }
      if (draft.id) {
        await base44.entities.Turning.update(draft.id, payload);
      } else {
        const created = await base44.entities.Turning.create(payload);
        setDraft({ ...created });
      }
      setMsg(publish === true ? 'Published.' : publish === false ? 'Moved back to draft.' : 'Saved.');
      load();
    } catch (e) {
      setErr('Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await base44.entities.Turning.delete(row.id);
      if (draft && draft.id === row.id) setDraft(null);
      load();
    } catch (e) {
      setErr('Could not delete that essay.');
    } finally {
      setBusy(false);
    }
  };

  const paragraphs = draft ? draft.body.split(/\n{2,}/).filter((p) => p.trim()) : [];

  return (
    <div className="nlw-admin-grid">
      <section className="nlw-admin-list">
        <div className="nlw-admin-list-head">
          <h2>Essays</h2>
          <button type="button" className="nlw-btn" onClick={startNew}>New essay</button>
        </div>

        {loading ? (
          <p className="nlw-admin-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="nlw-admin-muted">Nothing written yet. Start with the first turning.</p>
        ) : (
          <ul>
            {rows.map((r) => (
              <li key={r.id} className={draft && draft.id === r.id ? 'is-on' : ''}>
                <button type="button" className="row" onClick={() => edit(r)}>
                  <span className="t">{r.title}</span>
                  <span className="m">
                    {LABEL[r.season]} {r.year}
                    {r.isFeatured && <em className="flag">Current issue</em>}
                    <em className={`state ${r.publishedAt ? 'live' : 'draft'}`}>
                      {r.publishedAt ? 'Published' : 'Draft'}
                    </em>
                  </span>
                </button>
                <button type="button" className="del" onClick={() => remove(r)} aria-label={`Delete ${r.title}`}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="nlw-admin-form">
        {!draft ? (
          <p className="nlw-admin-muted">Pick an essay on the left, or start a new one.</p>
        ) : (
          <>
            <label className="nlw-label">
              <span>Title</span>
              <input className="nlw-input" value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                onBlur={() => { if (!draft.slug) set('slug', slugify(draft.title)); }} />
            </label>

            <div className="nlw-admin-row">
              <label className="nlw-label">
                <span>Season</span>
                <select className="nlw-input" value={draft.season} onChange={(e) => set('season', e.target.value)}>
                  {SEASONS.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
              </label>
              <label className="nlw-label">
                <span>Year</span>
                <input className="nlw-input" type="number" value={draft.year} onChange={(e) => set('year', e.target.value)} />
              </label>
            </div>

            <label className="nlw-label">
              <span>Web address</span>
              <input className="nlw-input" value={draft.slug} onChange={(e) => set('slug', slugify(e.target.value))} />
            </label>

            <label className="nlw-label">
              <span>Standfirst — the short line under the title</span>
              <textarea className="nlw-input" style={{ minHeight: 80 }} value={draft.dek} onChange={(e) => set('dek', e.target.value)} />
            </label>

            <label className="nlw-label">
              <span>The essay — leave a blank line between paragraphs</span>
              <textarea className="nlw-input" style={{ minHeight: 320 }} value={draft.body} onChange={(e) => set('body', e.target.value)} />
            </label>

            <label className="nlw-admin-check">
              <input type="checkbox" checked={!!draft.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
              <span>Show as the current issue on the homepage and at the top of The Four Turnings</span>
            </label>

            {paragraphs.length > 0 && (
              <div className="nlw-admin-preview">
                <p className="nlw-admin-muted">How it will read</p>
                <h3>{draft.title || 'Untitled'}</h3>
                {draft.dek && <p className="dek">{draft.dek}</p>}
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}

            {err && <p className="nlw-admin-err">{err}</p>}
            {msg && <p className="nlw-admin-ok">{msg}</p>}

            <div className="nlw-admin-actions">
              <button type="button" className="nlw-btn" disabled={busy} onClick={() => save({ publish: true })}>
                {draft.publishedAt ? 'Save and keep published' : 'Publish'}
              </button>
              <button type="button" className="nlw-admin-ghost" disabled={busy} onClick={() => save({})}>
                Save draft
              </button>
              {draft.publishedAt && (
                <button type="button" className="nlw-admin-ghost" disabled={busy} onClick={() => save({ publish: false })}>
                  Unpublish
                </button>
              )}
              <button type="button" className="nlw-admin-ghost" disabled={busy} onClick={() => setDraft(null)}>Close</button>
            </div>
            <p className="nlw-admin-muted">
              {draft.publishedAt
                ? `Published ${new Date(draft.publishedAt).toLocaleDateString()}. Visible on the site.`
                : 'Draft. Nothing appears on the site until you publish.'}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
