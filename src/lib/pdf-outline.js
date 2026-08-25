// Proposes a brochure's outline by reading its headings.
//
// This produces a DRAFT, and is built on the assumption that a person will fix
// it. Nothing here reaches a public page on its own: the admin edits what comes
// back, and a row is only served to the world once it is published. That matters
// for a firm under securities marketing rules — a heading pulled out of a
// private brochure is a suggestion, not approved public copy.
//
// Headings are found by size rather than by any tag, because a PDF has no tags:
// it is glyphs at positions. Text noticeably larger than the body is a heading;
// a line that repeats on most pages is a running head, not a heading.

import { getLib } from './pdf-cover';

const MAX_PAGES = 14;        // brochures are short; do not read a whole book
const HEADING_RATIO = 1.16;  // how much bigger than body text a heading must be
const MIN_CHARS = 3;
const MAX_CHARS = 90;

// A designer setting a label as "S E A S O N A L  P E R S P E C T I V E" leaves
// no trace of that intent in the file: pdf.js hands back one run per word, each
// with a space between every letter. So the tracking is undone per run, and the
// runs are then joined normally — the word boundary is the run boundary, not
// anything visible in the text.
function collapseTracked(str) {
  const t = str.trim();
  if (t.length < 5 || !t.includes(' ')) return str;
  const tokens = t.split(' ');
  if (tokens.length < 3) return str;
  // every token one character, allowing a mark such as "." to close the run
  const spaced = tokens.every((tok, i) => tok.length === 1 || (i === tokens.length - 1 && tok.length <= 2));
  return spaced ? tokens.join('') : str;
}

// A PDF has no words, only glyphs at coordinates, so a space has to be inferred
// from the gap: type breaks words at roughly a fifth of the type size.
function joinLine(parts, size) {
  const ordered = [...parts].sort((a, b) => a.x - b.x);
  const advance = (p) => (p.width || p.str.length * size * 0.5);
  let out = '';
  ordered.forEach((p, i) => {
    if (i > 0) {
      const gap = p.x - (ordered[i - 1].x + advance(ordered[i - 1]));
      if (gap > size * 0.2) out += ' ';
    }
    out += p.str;
  });
  return out.replace(/\s+/g, ' ').trim();
}

// Lines are rebuilt from glyph runs by their vertical position, since pdf.js
// hands back fragments in drawing order, not reading order.
function linesFromItems(items) {
  const rows = new Map();
  for (const it of items) {
    const str = it.str || '';
    if (!str.trim()) continue;
    const size = Math.abs(it.transform[3]) || it.height || 0;
    const y = Math.round(it.transform[5]);
    const key = Math.round(y / 3); // glyphs a couple of points apart share a line
    const row = rows.get(key) || { y, size: 0, parts: [] };
    row.size = Math.max(row.size, size);
    row.parts.push({ x: it.transform[4], width: it.width, str: collapseTracked(str) });
    rows.set(key, row);
  }
  return [...rows.values()]
    .sort((a, b) => b.y - a.y)
    .map((r) => ({ y: r.y, size: r.size, text: joinLine(r.parts, r.size) }))
    .filter((r) => r.text);
}

// The body size is whichever size the most text is set in, weighted by how many
// characters it carries: a document has more body than headings by definition.
function bodySize(lines) {
  const weight = new Map();
  for (const l of lines) {
    const bucket = Math.round(l.size * 2) / 2;
    weight.set(bucket, (weight.get(bucket) || 0) + l.text.length);
  }
  let best = 0;
  let most = -1;
  for (const [size, chars] of weight) {
    if (chars > most) { most = chars; best = size; }
  }
  return best;
}

const looksLikeJunk = (t) =>
  /^[\d\s.,:;/|—–-]+$/.test(t) ||        // page numbers and rules
  /^page\s+\d+/i.test(t) ||
  /^\d+\s*of\s*\d+$/i.test(t) ||
  /^(www\.|https?:)/i.test(t) ||
  /@/.test(t);

// "01 SEASONAL PERSPECTIVE" is the part, not the heading: the heading is the
// line under it. Recognised so the two arrive in the right columns.
const MARKER = /^(\d{1,2})[.)\s]+(.{2,40})$/;
const isMarker = (t) => {
  const m = t.match(MARKER);
  if (!m) return null;
  const rest = m[2].trim();
  const letters = rest.replace(/[^A-Za-z]/g, '');
  if (!letters) return null;
  const upper = rest.replace(/[^A-Z]/g, '').length / letters.length;
  return upper > 0.8 ? { no: m[1], section: titleCase(rest) } : null;
};

const titleCase = (s) =>
  s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()).replace(/\s+/g, ' ').trim();

// a heading that runs onto a second line is still one heading
const CONTINUES = /[,;:]$|\b(and|of|the|for|to|a|an|in|on|with)$/i;
const ENDS = /[.?!]$/;

export async function outlineFromFile(file) {
  const { pdfjs, PdfWorker } = await getLib();
  const port = new PdfWorker();
  const worker = new pdfjs.PDFWorker({ port });
  const task = pdfjs.getDocument({ data: await file.arrayBuffer(), worker });
  const doc = await task.promise;

  try {
    const pageCount = doc.numPages;
    const readTo = Math.min(pageCount, MAX_PAGES);
    const perPage = [];

    for (let n = 1; n <= readTo; n += 1) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      perPage.push(linesFromItems(content.items));
      page.cleanup();
    }

    const all = perPage.flat();
    if (!all.length) return { pages: pageCount, sections: [], note: 'no-text' };

    const body = bodySize(all);

    // a line printed on most pages is furniture, not a heading
    const appearances = new Map();
    perPage.forEach((lines) => {
      new Set(lines.map((l) => l.text.toLowerCase())).forEach((t) => {
        appearances.set(t, (appearances.get(t) || 0) + 1);
      });
    });
    const isRunningHead = (t) => appearances.get(t.toLowerCase()) > Math.max(1, readTo / 2);

    const seen = new Set();
    const sections = [];
    let pendingSection = '';

    perPage.forEach((lines) => {
      let last = null; // the previous heading on this page, for run-on titles

      lines.forEach((l) => {
        const t = l.text;
        if (t.length < MIN_CHARS || t.length > MAX_CHARS) { last = null; return; }
        if (body && l.size < body * HEADING_RATIO) { last = null; return; }
        if (looksLikeJunk(t) || isRunningHead(t)) { last = null; return; }

        const marker = isMarker(t);
        if (marker) { pendingSection = marker.section; last = null; return; }

        // a heading broken over two lines: same size, directly beneath, and the
        // first line does not read as finished
        if (
          last &&
          Math.abs(l.size - last.size) < 0.6 &&
          last.y - l.y < l.size * 2 &&
          !ENDS.test(last.entry.title) &&
          (CONTINUES.test(last.entry.title) || last.entry.title.length < 34)
        ) {
          last.entry.title = `${last.entry.title} ${t}`.replace(/\s+/g, ' ');
          last.y = l.y;
          return;
        }

        const key = t.toLowerCase();
        if (seen.has(key)) { last = null; return; }
        seen.add(key);

        const entry = { section: pendingSection, title: t };
        pendingSection = '';
        sections.push(entry);
        last = { entry, size: l.size, y: l.y };
      });
    });

    return {
      pages: pageCount,
      sections,
      note: sections.length ? '' : 'no-headings',
    };
  } finally {
    try { await task.destroy(); } catch (e) { /* already gone */ }
    worker.destroy();
    port.terminate();
  }
}
