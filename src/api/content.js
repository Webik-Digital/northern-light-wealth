import { supabase, SIGNED_URL_TTL } from './supabase';

// Everything the site reads or writes, in one place.
//
// The shapes returned here are the shapes the pages already expect, so the
// components did not have to be rewritten around a new database. Where the
// column names changed — snake_case in Postgres, camelCase in the components —
// the translation happens here rather than being spread across the pages.

const rowToIssue = (r) => ({
  id: r.id,
  title: r.title,
  season: r.season,
  year: r.year,
  marker: r.marker || '',
  slug: r.slug,
  dek: r.dek || '',
  body: r.body || '',
  htmlPath: r.html_path || '',
  pdfPath: r.pdf_path || '',
  publishedAt: r.published_at,
  isFeatured: r.is_featured,
});

const rowToResource = (r) => ({
  id: r.id,
  title: r.title,
  category: r.category || '',
  description: r.description || '',
  htmlPath: r.html_path || '',
  pdfPath: r.pdf_path || '',
  thumbnailPath: r.thumbnail_path || '',
  order: r.sort_order || 0,
});

const rowToOutline = (r) => ({
  id: r.id,
  pathway: r.pathway,
  brochureTitle: r.brochure_title || '',
  blurb: r.blurb || '',
  sections: Array.isArray(r.sections) ? r.sections : [],
  pages: r.pages || 0,
  isPublished: r.is_published,
});

// ---------------------------------------------------------------------------
// files
// ---------------------------------------------------------------------------

// The letter lives in a public bucket, so its address is permanent and the CDN
// can cache it. No signing, no expiry, nothing to go stale.
export function publicUrl(path) {
  if (!path) return '';
  const { data } = supabase.storage.from('issues').getPublicUrl(path);
  return data ? data.publicUrl : '';
}

// The library does not. Each file is handed over as a link that stops working.
export async function signedUrl(path, expiresIn = SIGNED_URL_TTL) {
  if (!path) return '';
  const { data, error } = await supabase.storage
    .from('resources')
    .createSignedUrl(path, expiresIn);
  if (error || !data) return '';
  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// The Four Turnings — public
// ---------------------------------------------------------------------------

export async function listIssues(limit = 50) {
  const { data, error } = await supabase
    .from('turnings')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  // The document lives in the public bucket, so the address is permanent and
  // needs no signing: the letter is meant to be read by anyone.
  return (data || []).map((r) => {
    const issue = rowToIssue(r);
    return { ...issue, href: publicUrl(issue.pdfPath) };
  });
}

// ---------------------------------------------------------------------------
// The client library — signed in only
// ---------------------------------------------------------------------------

// Returns [] for anyone not signed in, because the database returns nothing to
// them. The page does not have to remember to hide it.
export async function listResources(limit = 50) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return [];

  // Both the document and its cover are private, so each needs its own link.
  return Promise.all(
    (data || []).map(async (r) => {
      const item = rowToResource(r);
      const [href, cover] = await Promise.all([
        signedUrl(item.htmlPath || item.pdfPath),
        signedUrl(item.thumbnailPath),
      ]);
      return { ...item, href, cover };
    })
  );
}

// ---------------------------------------------------------------------------
// Brochure outlines — published ones are public
// ---------------------------------------------------------------------------

export async function getOutline(pathway) {
  const { data, error } = await supabase
    .from('brochure_outlines')
    .select('*')
    .eq('pathway', pathway)
    .eq('is_published', true)
    .limit(1);
  if (error || !data || !data.length) return null;
  const outline = rowToOutline(data[0]);
  return outline.sections.length ? outline : null;
}

export async function listOutlines() {
  const { data, error } = await supabase
    .from('brochure_outlines')
    .select('*')
    .order('pathway', { ascending: true });
  if (error) return [];
  return (data || []).map(rowToOutline);
}

// ---------------------------------------------------------------------------
// The two public forms
// ---------------------------------------------------------------------------
// `source` records which form this came from, so a request from the SaleReady
// page is distinguishable from a general enquiry.

// Goes through the server rather than straight to the database, because the
// point is not only to record the enquiry but to tell somebody about it, and the
// mail provider's key cannot live in a browser. The endpoint writes the row too,
// so there is one path and one place that decides what a valid enquiry is.
export async function submitEnquiry({ name, contact, message, source = 'contact', website = '' }) {
  const res = await fetch('/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, contact, message, source, website }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Could not send your note.');
  }
  return res.json().catch(() => ({ ok: true }));
}

export async function subscribe(email, source = 'the-four-turnings') {
  const { error } = await supabase
    .from('subscribers')
    .insert({ email: (email || '').trim().toLowerCase(), source });
  // Signing up twice is not a failure worth showing anyone.
  if (error && error.code !== '23505') throw error;
}
