import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// What a brochure covers, written for the public stewardship pages.
//
// The brochure itself stays in the library and stays private. This is the
// outline of it, and it is a separate record for a reason: the pathway pages are
// open to everyone, and a private row could never be read there. Publishing is
// a deliberate step, and an unpublished outline is not served to the world.
//
// A PDF can propose the outline, but it cannot publish one. What comes back from
// the file is a draft with the wrong rows in it as often as not — cover titles,
// pull quotes — and it is meant to be edited down before anyone ticks publish.

const PATHWAYS = [
  { id: 'estate-ready', name: 'EstateReady' },
  { id: 'sale-ready', name: 'SaleReady' },
  { id: 'harvest-share', name: 'Harvest Share' },
];

const blank = (pathway) => ({
  pathway,
  brochureTitle: '',
  blurb: '',
  sections: [],
  pages: 0,
  isPublished: false,
});

export default function OutlineAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    base44.entities.BrochureOutline.filter({}, 'pathway', 50)
      .then((r) => setRows(r || []))
      .catch(() => setErr('Could not load the outlines.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const pick = (pathway) => {
    const existing = rows.find((r) => r.pathway === pathway);
    setDraft(existing ? { ...existing, sections: existing.sections || [] } : blank(pathway));
    setMsg(''); setErr('');
  };

  const setRow = (i, k, v) =>
    setDraft((d) => {
      const sections = [...(d.sections || [])];
      sections[i] = { ...sections[i], [k]: v };
      return { ...d, sections };
    });

  const addRow = () => setDraft((d) => ({ ...d, sections: [...(d.sections || []), { section: '', title: '' }] }));

  const removeRow = (i) =>
    setDraft((d) => ({ ...d, sections: (d.sections || []).filter((_, n) => n !== i) }));

  const move = (i, by) =>
    setDraft((d) => {
      const sections = [...(d.sections || [])];
      const to = i + by;
      if (to < 0 || to >= sections.length) return d;
      [sections[i], sections[to]] = [sections[to], sections[i]];
      return { ...d, sections };
    });

  // The file is read here and never uploaded: this is the brochure being looked
  // at, not stored. The library is where the document itself belongs.
  const onPdf = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setReading(true); setErr(''); setMsg('');
    try {
      // pulled in on use, so the reader is not carried by every page load
      const { outlineFromFile } = await import('@/lib/pdf-outline');
      const result = await outlineFromFile(file);
      if (result.note === 'no-text') {
        setErr('That PDF has no text in it — it is probably a scan. The outline will have to be typed.');
      } else if (!result.sections.length) {
        setErr('No headings stood out in that PDF. Add the rows by hand below.');
      } else {
        setDraft((d) => ({
          ...d,
          pages: result.pages || d.pages,
          sections: result.sections,
          brochureTitle: d.brochureTitle || file.name.replace(/\.pdf$/i, ''),
        }));
        setMsg(`Read ${result.sections.length} headings from ${result.pages} pages. Edit them down to the ones worth showing, then publish.`);
      }
    } catch (e2) {
      setErr('That PDF could not be read.');
    } finally {
      setReading(false);
      e.target.value = '';
    }
  };

  const save = async () => {
    const sections = (draft.sections || [])
      .map((s) => ({ section: (s.section || '').trim(), title: (s.title || '').trim() }))
      .filter((s) => s.title);

    if (draft.isPublished && !sections.length) {
      setErr('An outline with no rows has nothing to show. Add at least one before publishing.');
      return;
    }

    setBusy(true); setErr(''); setMsg('');
    const payload = {
      pathway: draft.pathway,
      brochureTitle: (draft.brochureTitle || '').trim(),
      blurb: (draft.blurb || '').trim(),
      sections,
      pages: Number(draft.pages) || 0,
      isPublished: !!draft.isPublished,
    };
    try {
      if (draft.id) await base44.entities.BrochureOutline.update(draft.id, payload);
      else {
        const created = await base44.entities.BrochureOutline.create(payload);
        setDraft({ ...created, sections: created.sections || [] });
      }
      setMsg(payload.isPublished ? 'Saved and published.' : 'Saved as a draft. It is not on the site yet.');
      load();
    } catch (e2) {
      setErr('Could not save that outline.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!draft.id) { setDraft(null); return; }
    if (!window.confirm('Remove this outline? The brochure itself is not touched.')) return;
    setBusy(true);
    try {
      await base44.entities.BrochureOutline.delete(draft.id);
      setDraft(null);
      load();
    } catch (e2) {
      setErr('Could not remove that outline.');
    } finally {
      setBusy(false);
    }
  };

  const stateOf = (pathway) => {
    const r = rows.find((x) => x.pathway === pathway);
    if (!r) return { label: 'None', cls: 'draft' };
    return r.isPublished ? { label: 'On the site', cls: 'live' } : { label: 'Draft', cls: 'draft' };
  };

  return (
    <div className="nlw-admin-grid">
      <section className="nlw-admin-list">
        <div className="nlw-admin-list-head">
          <h2>Brochure outlines</h2>
        </div>
        <p className="nlw-admin-muted">
          Shown on the stewardship pages, so anyone can see what a brochure covers without
          it being opened. The brochure stays in the library.
        </p>

        {loading ? (
          <p className="nlw-admin-muted">Loading…</p>
        ) : (
          <ul>
            {PATHWAYS.map((p) => {
              const s = stateOf(p.id);
              return (
                <li key={p.id} className={draft && draft.pathway === p.id ? 'is-on' : ''}>
                  <button type="button" className="row" onClick={() => pick(p.id)}>
                    <span className="t">{p.name}</span>
                    <span className="m">
                      /{p.id}
                      <em className={`state ${s.cls}`}>{s.label}</em>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="nlw-admin-form">
        {!draft ? (
          <p className="nlw-admin-muted">Pick a pathway on the left.</p>
        ) : (
          <>
            <div className="nlw-admin-row">
              <label className="nlw-label">
                <span>Brochure title</span>
                <input className="nlw-input" value={draft.brochureTitle}
                  placeholder="The EstateReady brochure"
                  onChange={(e) => set('brochureTitle', e.target.value)} />
              </label>
              <label className="nlw-label">
                <span>Pages</span>
                <input className="nlw-input" type="number" value={draft.pages}
                  onChange={(e) => set('pages', e.target.value)} />
              </label>
            </div>

            <label className="nlw-label">
              <span>One line above the list</span>
              <textarea className="nlw-input" style={{ minHeight: 74 }} value={draft.blurb}
                placeholder="What the brochure sets out, in a sentence."
                onChange={(e) => set('blurb', e.target.value)} />
            </label>

            <div className="nlw-admin-file">
              <p className="nlw-admin-muted">
                Draft it from the brochure. The PDF is read here and not uploaded, and what
                comes back is a starting point: cover titles and pull quotes come through as
                rows too, so delete what does not belong before publishing.
              </p>
              <input type="file" accept="application/pdf" onChange={onPdf} disabled={reading} />
              {reading && <p className="nlw-admin-muted">Reading the brochure…</p>}
            </div>

            <div className="nlw-admin-sections">
              <div className="head">
                <span>Contents</span>
                <button type="button" className="nlw-admin-ghost" onClick={addRow}>Add a row</button>
              </div>

              {(draft.sections || []).length === 0 ? (
                <p className="nlw-admin-muted">Nothing yet. Read a PDF above, or add rows by hand.</p>
              ) : (
                <ol>
                  {draft.sections.map((s, i) => (
                    <li key={i}>
                      <span className="no">{String(i + 1).padStart(2, '0')}</span>
                      <input className="nlw-input" value={s.section || ''} placeholder="Part"
                        onChange={(e) => setRow(i, 'section', e.target.value)} />
                      <input className="nlw-input" value={s.title || ''} placeholder="Heading"
                        onChange={(e) => setRow(i, 'title', e.target.value)} />
                      <span className="acts">
                        <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                        <button type="button" onClick={() => move(i, 1)} disabled={i === draft.sections.length - 1} aria-label="Move down">↓</button>
                        <button type="button" onClick={() => removeRow(i)} aria-label="Remove row">✕</button>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <label className="nlw-admin-check">
              <input type="checkbox" checked={!!draft.isPublished}
                onChange={(e) => set('isPublished', e.target.checked)} />
              <span>
                Show this on the {PATHWAYS.find((p) => p.id === draft.pathway).name} page.
                Until this is ticked the outline is not served to the site at all.
              </span>
            </label>

            {err && <p className="nlw-admin-err">{err}</p>}
            {msg && <p className="nlw-admin-ok">{msg}</p>}

            <div className="nlw-admin-actions">
              <button type="button" className="nlw-btn" disabled={busy || reading} onClick={save}>Save</button>
              <button type="button" className="nlw-admin-ghost" disabled={busy} onClick={remove}>
                {draft.id ? 'Remove' : 'Close'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
