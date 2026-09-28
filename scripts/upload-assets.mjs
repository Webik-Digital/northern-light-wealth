// Puts the documents into storage.
//
// Run:  node scripts/upload-assets.mjs
//
// Needs SUPABASE_SERVICE_ROLE_KEY in .env.local, because both buckets refuse
// writes to anyone who is not an admin — which is the point of them. That key
// bypasses row-level security entirely, so it lives in a local, gitignored file
// and is read here at the command line. It must never be given a VITE_ prefix:
// that would compile it into the browser bundle and hand over the database.
//
// Safe to re-run. Files are upserted, so a second pass replaces rather than
// duplicates.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep, extname } from 'node:path';

const ROOT = process.argv[2];
if (!ROOT || !existsSync(ROOT)) {
  console.error('Usage: node scripts/upload-assets.mjs <folder containing issues/ and resources/>');
  process.exit(1);
}

// .env.local, read by hand: this is a plain node script, not a Vite build.
const env = {};
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
}

const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const mb = (n) => (n / 1048576).toFixed(2).padStart(6);

for (const bucket of ['issues', 'resources']) {
  const base = join(ROOT, bucket);
  if (!existsSync(base)) {
    console.log(`\n${bucket}: nothing staged, skipped`);
    continue;
  }
  const files = walk(base);
  console.log(`\n${bucket}  (${files.length} files)`);

  for (const file of files) {
    // the path inside the bucket mirrors the folder it was staged in
    const path = relative(base, file).split(sep).join('/');
    const body = readFileSync(file);
    const contentType = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';

    const { error } = await sb.storage
      .from(bucket)
      .upload(path, body, { contentType, upsert: true });

    console.log(
      `  ${mb(body.length)} MB  ${path.padEnd(44)} ${error ? 'FAILED: ' + error.message : 'ok'}`
    );
  }
}

// Read it back, so the report is what the server holds rather than what we sent.
console.log('\nwhat is in storage now:');
for (const bucket of ['issues', 'resources']) {
  const seen = [];
  const crawl = async (prefix) => {
    const { data } = await sb.storage.from(bucket).list(prefix, { limit: 100 });
    for (const entry of data || []) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) await crawl(full);
      else seen.push(full);
    }
  };
  await crawl('');
  console.log(`  ${bucket}: ${seen.length} objects`);
  for (const s of seen.sort()) console.log(`    ${s}`);
}
