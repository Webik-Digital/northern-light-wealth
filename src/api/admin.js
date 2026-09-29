import { supabase } from './supabase';

// Turns a database error into something a person can act on.
//
// Postgres is precise and unreadable: "duplicate key value violates unique
// constraint turnings_slug_key" is exactly right and tells an editor nothing.
// Worse is what the panels used to do with it, which was swallow it and say
// "Please try again" — advice that cannot work, because the second attempt fails
// in the same way as the first.
export function explain(error, what = 'that') {
  if (!error) return `Could not save ${what}.`;
  const msg = error.message || '';

  if (error.code === '23505' || /duplicate key/i.test(msg)) {
    if (/slug/.test(msg)) {
      // Should no longer be reachable: saveIssue picks a free slug before it
      // writes. If it ever is, do not send anyone looking for a field to edit —
      // there has never been one on the form.
      return 'An issue for that season and year already exists. Edit that one, ' +
             'or change the season or year.';
    }
    if (/pathway/.test(msg)) return 'That pathway already has an outline. Edit the existing one instead.';
    if (/email/.test(msg)) return 'That email address is already on the list.';
    return 'Something with that name already exists.';
  }
  if (error.code === '23502' || /null value in column/i.test(msg)) {
    const field = (msg.match(/column "([^"]+)"/) || [])[1];
    return field ? `${field} cannot be empty.` : 'A required field is empty.';
  }
  if (error.code === '23514' || /check constraint/i.test(msg)) {
    return 'One of the values is not allowed. Check the season and the year.';
  }
  if (error.code === '42501' || /row-level security/i.test(msg)) {
    return 'That was refused. Either your session has expired, or this account is not an admin.';
  }
  return msg || `Could not save ${what}.`;
}

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

// Checked before the upload rather than after it fails, because the failure a
// dead session produces is "new row violates row-level security policy" — which
// is true, and tells the person nothing they can act on. An access token lasts
// about an hour; a tab left open overnight still renders the admin from state it
// loaded while signed in, so the page looks fine right up until it writes.
async function requireLiveSession() {
  const { data, error } = await supabase.auth.getSession();
  const session = data ? data.session : null;
  if (error || !session) {
    throw new Error('Your session has expired. Sign in again and retry — nothing was lost.');
  }
  // getSession refreshes when it can; if it could not, the token is already dead
  if (session.expires_at && session.expires_at * 1000 < Date.now()) {
    throw new Error('Your session has expired. Sign in again and retry — nothing was lost.');
  }
  return session;
}

export async function uploadTo(bucket, path, file, contentType) {
  await requireLiveSession();
  // Not an upsert. An upsert is an insert-or-update, so the database has to read
  // the row first to know which it is — and reading storage.objects is governed
  // by a SELECT policy of its own. The public bucket had none, because a public
  // bucket's downloads bypass RLS and it looked as though reads were covered, so
  // every upload from the admin was refused while a plain insert of the same
  // file succeeded. Paths carry a timestamp and cannot collide, so there is
  // nothing for an upsert to do here anyway.
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: contentType || file.type || 'application/octet-stream',
  });
  if (error) {
    // The other way this reads as a policy violation is a signed-in person who
    // is not an admin, which is a different sentence entirely.
    if (/row-level security/i.test(error.message)) {
      throw new Error(
        'The upload was refused. Either your session has expired, or this account is not an admin. ' +
        'Signing out and back in fixes the first.'
      );
    }
    throw error;
  }
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

// The slug is the row's own identity and nothing else: there is one route for
// the letter and no per-issue pages, so it is never in an address a reader sees.
// It used to be a field on the form, which asked an editor to invent a value
// they had no way to reason about and then refused the save when it collided
// with an issue from a previous year. It is generated here instead.
async function freeSlug(base, ignoreId) {
  const { data } = await supabase.from('turnings').select('id, slug').ilike('slug', `${base}%`);
  const taken = new Set((data || []).filter((r) => r.id !== ignoreId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 50; n += 1) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function saveIssue(row) {
  const base = `${row.season}-${Number(row.year) || new Date().getFullYear()}`;
  const payload = {
    title: row.title,
    season: row.season,
    year: Number(row.year) || new Date().getFullYear(),
    marker: row.marker || null,
    slug: row.slug || (await freeSlug(base, row.id)),
    dek: row.dek || null,
    body: row.body || null,
    pdf_path: row.pdf_path || null,
    html_path: row.html_path || null,
    published_at: row.published_at || null,
    is_featured: Boolean(row.is_featured),
  };

  const { data, error } = row.id
    ? await supabase.from('turnings').update(payload).eq('id', row.id).select().single()
    : await supabase.from('turnings').insert(payload).select().single();
  if (error) throw error;

  // Only one issue is the current one. Cleared after the write and by id, so it
  // works for a new issue too, which has no id until the moment it exists.
  if (payload.is_featured && data) {
    await supabase.from('turnings').update({ is_featured: false }).neq('id', data.id);
  }
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
