import { supabase } from './supabase';

// Writes, for the admin portal.
//
// Nothing here carries a privileged key. Every call goes out with the signed-in
// person's own session, and the database decides what it is allowed to do — the
// same policies that refuse an anonymous visitor. An admin uploading a brochure
// works because the storage policy asks is_admin(), not because this file was
// trusted. If these functions were somehow called by a client account they would
// simply be refused, which is the property worth having.

// ---------------------------------------------------------------------------
// files
// ---------------------------------------------------------------------------

export async function uploadTo(bucket, path, file, contentType) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: contentType || file.type || 'application/octet-stream',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

// A name that will not collide and will not surprise anyone reading the bucket.
export function storagePath(folder, fileName) {
  const clean = fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  const ext = (fileName.match(/\.[^.]+$/) || ['.bin'])[0].toLowerCase();
  const stamp = Date.now().toString(36);
  return `${folder ? folder + '/' : ''}${clean}-${stamp}${ext}`;
}

// ---------------------------------------------------------------------------
// The Four Turnings
// ---------------------------------------------------------------------------

export async function listAllIssues() {
  const { data, error } = await supabase
    .from('turnings')
    .select('*')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveIssue(row) {
  const payload = {
    title: row.title,
    season: row.season,
    year: Number(row.year) || new Date().getFullYear(),
    marker: row.marker || null,
    slug: row.slug,
    dek: row.dek || null,
    body: row.body || null,
    pdf_path: row.pdf_path || null,
    html_path: row.html_path || null,
    published_at: row.published_at || null,
    is_featured: Boolean(row.is_featured),
  };

  // Only one issue is the current one. Clearing the others here keeps that true
  // even if two people are editing, because it happens in the same breath.
  if (payload.is_featured) {
    await supabase.from('turnings').update({ is_featured: false }).neq('slug', payload.slug);
  }

  const { data, error } = row.id
    ? await supabase.from('turnings').update(payload).eq('id', row.id).select().single()
    : await supabase.from('turnings').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteIssue(id) {
  const { error } = await supabase.from('turnings').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// The client library
// ---------------------------------------------------------------------------

export async function listAllResources() {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function saveResource(row) {
  const payload = {
    title: row.title,
    category: row.category,
    description: row.description || null,
    pdf_path: row.pdf_path || null,
    html_path: row.html_path || null,
    thumbnail_path: row.thumbnail_path || null,
    sort_order: Number(row.sort_order) || 0,
  };
  const { data, error } = row.id
    ? await supabase.from('resources').update(payload).eq('id', row.id).select().single()
    : await supabase.from('resources').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteResource(id) {
  const { error } = await supabase.from('resources').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Brochure outlines
// ---------------------------------------------------------------------------

export async function saveOutline(row) {
  const payload = {
    pathway: row.pathway,
    brochure_title: row.brochureTitle || null,
    blurb: row.blurb || null,
    sections: row.sections || [],
    pages: Number(row.pages) || null,
    is_published: Boolean(row.isPublished),
  };
  // One row per pathway, so the pathway itself is the key to upsert on.
  const { data, error } = await supabase
    .from('brochure_outlines')
    .upsert(payload, { onConflict: 'pathway' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOutline(id) {
  const { error } = await supabase.from('brochure_outlines').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// people
// ---------------------------------------------------------------------------

// Reading who has access is something an admin may do: the policy on profiles
// allows it. Creating an account is not, and cannot be from a browser — it needs
// the service-role key, which would have to be shipped in the bundle to be used
// here, and shipping it would hand over the database. Accounts are made by
// Webik, which is also how the arrangement with NLW is written.
export async function listPeople() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function setRole(id, role) {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}
