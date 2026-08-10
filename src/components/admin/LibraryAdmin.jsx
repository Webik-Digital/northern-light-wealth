import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const blank = () => ({
  title: '',
  category: '',
  description: '',
  fileOrUrl: '',
  isGated: true,
  order: 0,
});

const isLink = (v) => /^https?:\/\//i.test(v || '');

export default function LibraryAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    base44.entities.Resource.filter({}, 'order', 100)
      .then((r) => setRows(r || []))
      .catch(() => setErr('Could not load the library.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true); setErr(''); setMsg('');
    try {
      // gated items go to private storage; open items to public storage
      if (draft.isGated) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        set('fileOrUrl', file_uri);
      } else {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        set('fileOrUrl', file_url);
      }
      setMsg(`Uploaded ${file.name}.`);
    } catch (e2) {
      setErr('The upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async () => {
    if (!draft.title.trim()) { setErr('Give the item a title.'); return; }
    if (!draft.category.trim()) { setErr('Give the item a category, so it files itself correctly.'); return; }
    setBusy(true); setErr(''); setMsg('');
    const payload = {
      title: draft.title.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
      fileOrUrl: draft.fileOrUrl.trim(),
      isGated: !!draft.isGated,
      order: Number(draft.order) || 0,
    };
    try {
      if (draft.id) await base44.entities.Resource.update(draft.id, payload);
      else {
        const created = await base44.entities.Resource.create(payload);
        setDraft({ ...created });
      }
      setMsg('Saved.');
      load();
    } catch (e) {
      setErr('Could not save that item.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove "${row.title}" from the library?`)) return;
    setBusy(true);
    try {
      await base44.entities.Resource.delete(row.id);
      if (draft && draft.id === row.id) setDraft(null);
      load();
    } catch (e) {
      setErr('Could not remove that item.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nlw-admin-grid">
      <section className="nlw-admin-list">
        <div className="nlw-admin-list-head">
          <h2>Library</h2>
          <button type="button" className="nlw-btn" onClick={() => { setDraft(blank()); setMsg(''); setErr(''); }}>
            New item
          </button>
        </div>

        {loading ? (
          <p className="nlw-admin-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="nlw-admin-muted">The library is empty. Add the first document or guide.</p>
        ) : (
          <ul>
            {rows.map((r) => (
              <li key={r.id} className={draft && draft.id === r.id ? 'is-on' : ''}>
                <button type="button" className="row" onClick={() => setDraft({ ...r })}>
                  <span className="t">{r.title}</span>
                  <span className="m">
                    {r.category}
                    <em className={`state ${r.isGated ? 'draft' : 'live'}`}>
                      {r.isGated ? 'Clients only' : 'Open'}
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
          <p className="nlw-admin-muted">Pick an item on the left, or add a new one.</p>
        ) : (
          <>
            <label className="nlw-label">
              <span>Title</span>
              <input className="nlw-input" value={draft.title} onChange={(e) => set('title', e.target.value)} />
            </label>

            <div className="nlw-admin-row">
              <label className="nlw-label">
                <span>Category</span>
                <input className="nlw-input" value={draft.category} placeholder="Estate and succession documents"
                  onChange={(e) => set('category', e.target.value)} />
              </label>
              <label className="nlw-label">
                <span>Order</span>
                <input className="nlw-input" type="number" value={draft.order} onChange={(e) => set('order', e.target.value)} />
              </label>
            </div>

            <label className="nlw-label">
              <span>Description</span>
              <textarea className="nlw-input" style={{ minHeight: 100 }} value={draft.description}
                onChange={(e) => set('description', e.target.value)} />
            </label>

            <label className="nlw-admin-check">
              <input type="checkbox" checked={!!draft.isGated} onChange={(e) => set('isGated', e.target.checked)} />
              <span>Clients only. Uncheck to make this openly downloadable.</span>
            </label>

            <div className="nlw-admin-file">
              <p className="nlw-admin-muted">
                Upload a document, or paste a link. {draft.isGated
                  ? 'Gated uploads go to private storage and are served through a signed link.'
                  : 'Open uploads go to public storage.'}
              </p>
              <input type="file" onChange={onFile} disabled={uploading} />
              {uploading && <p className="nlw-admin-muted">Uploading…</p>}
              <label className="nlw-label" style={{ marginTop: 12 }}>
                <span>File reference or link</span>
                <input className="nlw-input" value={draft.fileOrUrl} placeholder="https://…"
                  onChange={(e) => set('fileOrUrl', e.target.value)} />
              </label>
              {draft.fileOrUrl && (
                <p className="nlw-admin-muted">
                  {isLink(draft.fileOrUrl) ? 'External link.' : 'Stored file. Clients get a signed link when they open it.'}
                </p>
              )}
            </div>

            {err && <p className="nlw-admin-err">{err}</p>}
            {msg && <p className="nlw-admin-ok">{msg}</p>}

            <div className="nlw-admin-actions">
              <button type="button" className="nlw-btn" disabled={busy || uploading} onClick={save}>Save</button>
              <button type="button" className="nlw-admin-ghost" disabled={busy} onClick={() => setDraft(null)}>Close</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
