import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { coverFromFile, coverFromUrl, isPdf } from '@/lib/pdf-cover';

// Everything in the library is for clients. The Resource entity refuses a read
// to anyone not signed in, so there is no such thing as an open item here and
// no switch offering one: uploads go to private storage and are handed over as
// a signed link. The public half of the site is The Four Turnings.
const blank = () => ({
  title: '',
  category: '',
  description: '',
  fileOrUrl: '',
  thumbnailUrl: '',
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
  const [coverPreview, setCoverPreview] = useState('');

  const load = () => {
    setLoading(true);
    base44.entities.Resource.filter({}, 'order', 100)
      .then((r) => setRows(r || []))
      .catch(() => setErr('Could not load the library.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  // Covers live in private storage like everything else here, so showing one
  // back to the admin needs a signed link of its own.
  const coverUri = draft ? draft.thumbnailUrl : '';
  useEffect(() => {
    let active = true;
    if (!coverUri) { setCoverPreview(''); return undefined; }
    if (isLink(coverUri)) { setCoverPreview(coverUri); return undefined; }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: coverUri })
      .then(({ signed_url }) => { if (active) setCoverPreview(signed_url); })
      .catch(() => { if (active) setCoverPreview(''); });
    return () => { active = false; };
  }, [coverUri]);

  // Picking a document does both jobs: the file goes up, and if it is a PDF its
  // first page becomes the card's cover. A cover that fails to draw is not worth
  // failing the upload over, so it is reported and the document still saves.
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true); setErr(''); setMsg('');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      set('fileOrUrl', file_uri);

      if (isPdf(file.name)) {
        setMsg(`Uploaded ${file.name}. Drawing the cover…`);
        try {
          const cover = await coverFromFile(file);
          const up = await base44.integrations.Core.UploadPrivateFile({ file: cover });
          set('thumbnailUrl', up.file_uri);
          setMsg(`Uploaded ${file.name}, and took the cover from its first page.`);
        } catch (e3) {
          setMsg(`Uploaded ${file.name}. The cover could not be drawn from it — add one below.`);
        }
      } else {
        setMsg(`Uploaded ${file.name}.`);
      }
    } catch (e2) {
      setErr('The upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // A cover picked by hand: for a link, a scan, or when the first page is not
  // the face the item should show.
  const onCover = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true); setErr(''); setMsg('');
    try {
      const source = isPdf(file.name) ? await coverFromFile(file) : file;
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: source });
      set('thumbnailUrl', file_uri);
      setMsg('Cover set.');
    } catch (e2) {
      setErr('That cover could not be used. An image or a PDF works best.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // For items added before covers existed. Reading a stored file back is the
  // storage host's call, so this is offered rather than promised.
  const coverFromStored = async () => {
    if (!draft.fileOrUrl) return;
    setUploading(true); setErr(''); setMsg('');
    try {
      let url = draft.fileOrUrl;
      if (!isLink(url)) {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: draft.fileOrUrl });
        url = signed_url;
      }
      const cover = await coverFromUrl(url, draft.title || 'cover');
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: cover });
      set('thumbnailUrl', file_uri);
      setMsg('Took the cover from the first page.');
    } catch (e2) {
      setErr('The stored file could not be read back. Pick the PDF again above and the cover is made for you.');
    } finally {
      setUploading(false);
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
      thumbnailUrl: (draft.thumbnailUrl || '').trim(),
      isGated: true,
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
                    <em className="state draft">Clients only</em>
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

            <div className="nlw-admin-file">
              <p className="nlw-admin-muted">
                Upload a document, or paste a link. Everything here is for clients only:
                uploads go to private storage and are opened through a signed link, and
                the library is not served to anyone who is not signed in. To publish
                something openly, use The Four Turnings.
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
                  {isLink(draft.fileOrUrl)
                    ? 'External link. Whoever hosts it controls who can open it.'
                    : 'Stored file. Clients get a signed link when they open it.'}
                </p>
              )}
            </div>

            <div className="nlw-admin-file">
              <p className="nlw-admin-muted">
                Cover. The card shows this beside the title. A PDF uploaded above brings
                its own first page; set one here to use a different face, or for an item
                that is a link.
              </p>

              <div className="nlw-admin-cover">
                <span className="shot">
                  {coverPreview ? (
                    <img src={coverPreview} alt="" />
                  ) : (
                    <em>No cover yet</em>
                  )}
                </span>
                <span className="acts">
                  <input type="file" accept="image/*,application/pdf" onChange={onCover} disabled={uploading} />
                  {draft.fileOrUrl && (
                    <button type="button" className="nlw-admin-ghost" disabled={uploading} onClick={coverFromStored}>
                      Take it from the document
                    </button>
                  )}
                  {draft.thumbnailUrl && (
                    <button type="button" className="nlw-admin-ghost" disabled={uploading} onClick={() => set('thumbnailUrl', '')}>
                      Remove cover
                    </button>
                  )}
                </span>
              </div>
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
