// Creates the content rows that point at the uploaded files.
//
// Run:  node scripts/seed-content.mjs
//
// Idempotent: issues match on slug, brochures on title, so a second run updates
// rather than duplicates.
//
// html_path is deliberately left empty. The HTML files are uploaded and stored,
// but Supabase serves any .html as text/plain with nosniff — it will not host
// arbitrary HTML from its storage domain, which is a sensible thing for it to
// refuse. A reader would be shown source code. Until those documents can be
// served as pages, the PDF is what a person is given.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim();
}
const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Standfirsts are the issues' own opening lines, carried over from the site.
const ISSUES = [
  {
    slug: 'summer-2026', season: 'summer', year: 2026, marker: 'Summer Solstice',
    title: 'The Season of Connection',
    dek: 'There is something different about a Prairie summer. Longer days and warmer evenings naturally draw us outside.',
    published_at: '2026-06-21T00:00:00Z', is_featured: true,
    pdf_path: 'issues-pdf/four-turnings-summer-2026.pdf',
  },
  {
    slug: 'spring-2026', season: 'spring', year: 2026, marker: 'Spring Equinox',
    title: 'The Season of Renewal',
    dek: 'As the days begin to lengthen, energy starts to return in subtle ways. What felt uncertain or heavy often begins to lighten.',
    published_at: '2026-03-20T00:00:00Z', is_featured: false,
    pdf_path: 'issues-pdf/four-turnings-spring-2026.pdf',
  },
  {
    slug: 'winter-2025', season: 'winter', year: 2025, marker: 'Winter Solstice',
    title: 'The Season of Reflection',
    dek: 'As the days shorten and the year turns, many people find themselves carrying more than they expected.',
    published_at: '2025-12-21T00:00:00Z', is_featured: false,
    pdf_path: 'issues-pdf/four-turnings-winter-2025.pdf',
  },
  {
    slug: 'autumn-2025', season: 'fall', year: 2025, marker: 'Autumn Equinox',
    title: 'The Season of Stewardship',
    dek: 'On the Prairies, September is not just the end of summer. It is a natural time to plan and re-evaluate.',
    published_at: '2025-09-22T00:00:00Z', is_featured: false,
    pdf_path: 'issues-pdf/four-turnings-autumn-2025.pdf',
  },
];

// Titles and descriptions as NLW had them in the library.
const BROCHURES = [
  {
    title: 'EstateReady Client Brochure', category: 'Brochure',
    description: 'An Operating System for Estate Stewardship',
    pdf_path: 'brochures/estate-ready.pdf',
    thumbnail_path: 'brochures/estate-ready-cover.jpg',
    sort_order: 1,
  },
  {
    title: 'SaleReady Client Brochure', category: 'Brochure',
    description: 'Preparing More Than the Business for Transition',
    pdf_path: 'brochures/sale-ready.pdf',
    thumbnail_path: 'brochures/sale-ready-cover.jpg',
    sort_order: 2,
  },
  {
    title: 'HarvestShare Client Brochure', category: 'Brochure',
    description: 'Stewardship, Practised.',
    pdf_path: 'brochures/harvest-share.pdf',
    thumbnail_path: 'brochures/harvest-share-cover.jpg',
    sort_order: 3,
  },
];

const issues = await sb.from('turnings').upsert(ISSUES, { onConflict: 'slug' }).select('slug');
console.log('turnings :', issues.error ? 'FAILED ' + issues.error.message : (issues.data || []).length + ' rows');

for (const b of BROCHURES) {
  const { data: found } = await sb.from('resources').select('id').eq('title', b.title).limit(1);
  const res = found && found.length
    ? await sb.from('resources').update(b).eq('id', found[0].id)
    : await sb.from('resources').insert(b);
  console.log('resource :', b.title.padEnd(32), res.error ? 'FAILED ' + res.error.message : 'ok');
}

// Read back what the server holds, rather than trusting what was sent.
const { data: t } = await sb.from('turnings').select('slug,title,season,year,pdf_path,is_featured').order('published_at', { ascending: false });
const { data: r } = await sb.from('resources').select('title,pdf_path,thumbnail_path,sort_order').order('sort_order');
console.log('\nturnings in the database:');
for (const x of t || []) console.log(`  ${x.year} ${x.season.padEnd(7)} ${x.title.padEnd(30)} ${x.pdf_path}${x.is_featured ? '  [featured]' : ''}`);
console.log('resources in the database:');
for (const x of r || []) console.log(`  ${x.title.padEnd(32)} ${x.pdf_path}`);
