import React, { useEffect, useState } from 'react';
import { listAllIssues, saveIssue, deleteIssue, uploadTo, storagePath } from '@/api/admin';

const SEASONS = ['spring', 'summer', 'fall', 'winter'];
const LABEL = { spring: 'Spring', summer: 'Summer', fall: 'Autumn', winter: 'Winter' };
const MARKER = { spring: 'Spring Equinox', summer: 'Summer Solstice', fall: 'Autumn Equinox', winter: 'Winter Solstice' };

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70);

const blank = () => ({
  title: '',
  season: 'spring',
  year: new Date().getFullYear(),
  marker: MARKER.spring,
  slug: '',
  dek: '',
  body: '',
  pdf_path: '',
  html_path: '',
  is_featured: false,
  published_at: null,
});

export default function IssueAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    listAllIssues()
      .then((r) => setRows(r || []))
      .catch(() => setErr('Could not load the issues.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  // an issue is a document: upload it and keep the address it lands at.
  //
  // The outer function must NOT be async. onFile('pdf_path','PDF') is called in
  // the markup to build the handler, so an async outer returns a Promise, React
  // is handed a Promise where it expects a function, and the upload never runs.
  // The file input still shows the chosen filename — that is the browser, not
  // us — so it looks like it worked and the publish check then refuses because
  // no path was ever recorded. That was this bug for the life of this panel.
  const onFile = (field, accept) => async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(field); setErr(''); setMsg('');
    try {
      // the letter is public, so the document goes in the public bucket and
      // keeps a permanent address rather than an expiring one
      const path = await uploadTo('issues', storagePath('', file.name), file);
      set(field, path);
      setMsg(`Uploaded ${file.name}.`);
    } catch (e2) {
      set(field, '');
      setErr(`Could not upload ${file.name}: ${e2.message || 'the upload was refused.'}`);
    } finally {
      setUploading('');
      e.target.value = '';
    }
  };

  const validate = () => {
    if (!draft.title.trim()) return 'Give the issue a title, for example "The Season of Connection".';
    if (!draft.year || String(draft.year).length !== 4) return 'Give the year as four digits.';
    if (!(draft.pdf_path || '').trim()) return 'An issue needs its PDF before it can be published.';
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
      marker: (draft.marker || MARKER[draft.season]).trim(),
      slug: (draft.slug || slugify(`${draft.season}-${draft.year}`)).trim(),
      dek: draft.dek.trim(),
      body: (draft.body || '').trim(),
      pdf_path: (draft.pdf_path || '').trim(),
      html_path: (draft.html_path || '').trim(),
      is_featured: !!draft.is_featured,
      published_at: publish === true
        ? (draft.published_at || new Date().toISOString())
        : publish === false
          ? null
          : draft.published_at || null,
    };

    try {
      // saveIssue clears is_featured on the others in the same breath
      const saved = await saveIssue({ ...draft, ...payload });
      setDraft({ ...saved });
      setMsg(publish === true ? 'Published.' : publish === false ? 'Moved back to draft.' : 'Saved.');
      load();
    } catch (e) {
      setErr('Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove "${row.title}" (${LABEL[row.season]} ${row.year})? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteIssue(row.id);
      if (draft && draft.id === row.id) setDraft(null);
      load();
    } catch (e) {
      setErr('Could not remove that issue.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nlw-admin-grid">
      <section className="nlw-admin-list">
        <div className="nlw-admin-list-head">
          <h2>Issues</h2>
          <button type="button" className="nlw-btn" onClick={() => { setDraft(blank()); setMsg(''); setErr(''); }}>
            New issue
          </button>
        </div>

        {loading ? (
          <p className="nlw-admin-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="nlw-admin-muted">
            No issues here yet. The four published so far ship with the site; add one here and
            the site uses these instead.
          </p>
        ) : (
          <ul>
            {rows.map((r) => (
              <li key={r.id} className={draft && draft.id === r.id ? 'is-on' : ''}>
                <button type="button" className="row" onClick={() => setDraft({ ...r })}>
                  <span className="t">{r.title}</span>
                  <span className="m">
                    {LABEL[r.season]} {r.year}
                    {r.is_featured && <em className="flag">Current issue</em>}
                    <em className={`state ${r.published_at ? 'live' : 'draft'}`}>
                      {r.published_at ? 'Published' : 'Draft'}
                    </em>
                  </span>
                </button>
                <button type="button" className="del" onClick={() => remove(r)} aria-label={`Remove ${r.title}`}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="nlw-admin-form">
        {!draft ? (
          <p className="nlw-admin-muted">Pick an issue on the left, or start a new one.</p>
        ) : (
          <>
            <label className="nlw-label">
              <span>Title</span>
              <input className="nlw-input" value={draft.title} placeholder="The Season of Connection"
                onChange={(e) => set('title', e.target.value)} />
            </label>

            <div className="nlw-admin-row">
              <label className="nlw-label">
                <span>Season</span>
                <select className="nlw-input" value={draft.season}
                  onChange={(e) => { set('season', e.target.value); set('marker', MARKER[e.target.value]); }}>
                  {SEASONS.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                </select>
              </label>
              <label className="nlw-label">
                <span>Year</span>
                <input className="nlw-input" type="number" value={draft.year} onChange={(e) => set('year', e.target.value)} />
              </label>
            </div>

            <label className="nlw-label">
              <span>Solstice or equinox</span>
              <input className="nlw-input" value={draft.marker} placeholder={MARKER[draft.season]}
                onChange={(e) => set('marker', e.target.value)} />
            </label>

            <label className="nlw-label">
              <span>Standfirst — the line under the title</span>
              <textarea className="nlw-input" style={{ minHeight: 80 }} value={draft.dek}
                onChange={(e) => set('dek', e.target.value)} />
            </label>

            {/* the issue itself */}
            <div className="nlw-admin-file">
              <p className="nlw-admin-muted">
                The issue as published. Upload the PDF: it goes to public storage, so the
                address is permanent and anyone may open it.
              </p>

              <label className="nlw-label" style={{ marginTop: 14 }}>
                <span>PDF</span>
                <input type="file" accept="application/pdf" onChange={onFile('pdf_path', 'PDF')} disabled={!!uploading} />
              </label>
              {uploading === 'pdf_path' && <p className="nlw-admin-muted">Uploading the PDF…</p>}
              <input className="nlw-input" value={draft.pdf_path} placeholder="or paste a link to the PDF"
                onChange={(e) => set('pdf_path', e.target.value)} style={{ marginTop: 8 }} />

              {/* No HTML upload. Storage serves any .html as text/plain with nosniff —
                  it will not host arbitrary HTML, which is how buckets become phishing
                  pages — so a reader following such a link is shown source code. A web
                  version hosted somewhere that does serve it can still be linked. */}
              <label className="nlw-label" style={{ marginTop: 18 }}>
                <span>Web version elsewhere (optional)</span>
                <input className="nlw-input" value={draft.html_path}
                  placeholder="https://… a page hosted somewhere that serves HTML"
                  onChange={(e) => set('html_path', e.target.value)} />
              </label>
            </div>

            <label className="nlw-label">
              <span>Summary (optional) — a short paragraph under the standfirst</span>
              <textarea className="nlw-input" style={{ minHeight: 110 }} value={draft.body || ''}
                onChange={(e) => set('body', e.target.value)} />
            </label>

            <label className="nlw-admin-check">
              <input type="checkbox" checked={!!draft.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
              <span>Show as the current issue on the homepage and at the top of The Four Turnings</span>
            </label>

            {err && <p className="nlw-admin-err">{err}</p>}
            {msg && <p className="nlw-admin-ok">{msg}</p>}

            <div className="nlw-admin-actions">
              <button type="button" className="nlw-btn" disabled={busy || !!uploading} onClick={() => save({ publish: true })}>
                {draft.published_at ? 'Save and keep published' : 'Publish'}
              </button>
              <button type="button" className="nlw-admin-ghost" disabled={busy || !!uploading} onClick={() => save({})}>
                Save draft
              </button>
              {draft.published_at && (
                <button type="button" className="nlw-admin-ghost" disabled={busy} onClick={() => save({ publish: false })}>
                  Unpublish
                </button>
              )}
              <button type="button" className="nlw-admin-ghost" disabled={busy} onClick={() => setDraft(null)}>Close</button>
            </div>
            <p className="nlw-admin-muted">
              {draft.published_at
                ? `Published ${new Date(draft.published_at).toLocaleDateString()}. Visible on the site.`
                : 'Draft. Nothing appears on the site until you publish.'}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
