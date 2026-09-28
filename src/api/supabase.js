import { createClient } from '@supabase/supabase-js';

// The one client the browser uses.
//
// Both values here are public on purpose: the anon key is designed to be shipped
// in the bundle, and it grants nothing on its own. What a request may actually
// do is decided by the row-level security policies on the database, which is why
// those were verified from outside with this very key before any code was
// written against it. The service-role key is not here and must never be: a
// VITE_ prefix would compile it into the bundle and hand the database to anyone
// who views source.

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Failing loudly here beats a hundred confusing "fetch failed" errors later.
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
    'in .env.local for local work, and in the Vercel project settings for deploys.'
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // The client area is reached by a link in an email, so the session has to be
    // recoverable from the URL the person lands on.
    detectSessionInUrl: true,
  },
});

// How long a link to a private file stays good.
//
// The default is five minutes. That was the bug on the old platform: covers and
// documents were fine on load and broken a few minutes later on a page someone
// had left open. An hour is long enough to read a brochure and short enough that
// a copied link is not a permanent one.
export const SIGNED_URL_TTL = 3600;
