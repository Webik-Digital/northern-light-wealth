// Checks a deployed site is actually the site we think it is.
//
//   node scripts/verify-site.mjs https://northern-light-wealth.vercel.app
//   node scripts/verify-site.mjs https://nlwealth.ca
//
// Run it after every deploy. It asks the questions that have actually gone wrong
// on this project rather than a generic health check: is this the current build,
// is it wired to the database, does the letter open, and — the one that matters —
// does the client library refuse someone who is not signed in.
//
// Nothing here needs a password or a privileged key. Everything is checked the
// way a stranger would see it.

import { readFileSync, readdirSync, existsSync } from 'node:fs';

const site = (process.argv[2] || '').replace(/\/$/, '');
if (!site) {
  console.error('Usage: node scripts/verify-site.mjs <url>');
  process.exit(1);
}

const env = {};
if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
}

let failures = 0;
const check = (label, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '   ' + detail : ''}`);
};
const section = (t) => console.log(`\n${t}`);

const get = async (url, opts = {}) => {
  try {
    return await fetch(url, { redirect: 'manual', ...opts });
  } catch (e) {
    return { ok: false, status: 0, headers: new Map(), text: async () => '', error: e };
  }
};

console.log(`Checking ${site}`);

// ---------------------------------------------------------------- the build
section('Is this the build we think it is?');
const home = await get(site);
check('the site answers', home.status === 200, `HTTP ${home.status}`);
const html = home.status === 200 ? await home.text() : '';
const bundle = (html.match(/assets\/index-[A-Za-z0-9_-]+\.js/) || [])[0] || '';
check('an app bundle is referenced', Boolean(bundle), bundle);

let local = '';
if (existsSync('dist/index.html')) {
  local = (readFileSync('dist/index.html', 'utf8').match(/assets\/index-[A-Za-z0-9_-]+\.js/) || [])[0] || '';
}
// Hashes differ between a Vercel build and a local one for reasons that do not
// matter — dependency resolution, Node version, minifier build. Comparing them
// reports a difference that is not a problem. What matters is whether the code
// that is deployed is the code we wrote, so that is what is asked instead.
if (local && bundle !== local) {
  console.log(`  note  built elsewhere: deployed ${bundle}, local ${local}`);
}

let js = '';
if (bundle) {
  const r = await get(`${site}/${bundle}`);
  js = r.status === 200 ? await r.text() : '';
}
// "base44" as a substring is not evidence of anything: a hostname list in the
// scaffold's image helper mentions media.base44.com and always will. What would
// matter is the SDK or a call through it.
const usesBase44 = /base44Client|@base44|base44\.(auth|entities|integrations)/.test(js);
check('no Base44 code remains', js !== '' && !usesBase44,
  usesBase44 ? 'the old platform is still being called' : '');

// Markers from the most recent work. If these are missing the deploy really is
// behind, whatever its hash says.
const FEATURES = [
  ['the library request form', 'Ask for access to the Resource Library'],
  ['the enquiry endpoint', 'api/enquiry'],
  ['the legal pages', 'Legal, Privacy and Disclosures'],
];
for (const [label, marker] of FEATURES) {
  check(`carries ${label}`.padEnd(34), js.includes(marker));
}
check('the database is configured', js.includes('supabase.co'),
  js.includes('supabase.co') ? '' : 'env vars missing at build time — the site will not load data');

// ------------------------------------------------------------------- pages
section('Do the pages exist?');
for (const [path, label] of [
  ['/', 'home'], ['/about', 'about'], ['/stewardship', 'stewardship'],
  ['/estate-ready', 'EstateReady'], ['/sale-ready', 'SaleReady'],
  ['/harvest-share', 'Harvest Share'], ['/the-four-turnings', 'The Four Turnings'],
  ['/resources', 'resources'], ['/contact', 'contact'],
  ['/terms', 'Terms of Use'], ['/privacy', 'Privacy Policy'],
]) {
  const r = await get(site + path);
  check(label.padEnd(20), r.status === 200, r.status === 200 ? '' : `HTTP ${r.status}`);
}

// ----------------------------------------------------------- the brochures
// Status alone proves nothing here. Every unmatched path on this site answers
// 200 text/html, because the SPA rewrite hands back index.html — so a brochure
// that was never deployed looks exactly like one that was, and a check written
// on the status code passes before the files exist. These read the body.
section('Are the brochures open?');
for (const [slug, title] of [
  ['estate-ready', 'EstateReady'],
  ['sale-ready', 'SaleReady'],
  ['harvest-share', 'Harvest Share'],
]) {
  const page = await get(`${site}/brochures/${slug}/`);
  const html = page.status === 200 ? await page.text().catch(() => '') : '';
  const own = html.includes(`<title>${title} —`);
  check(`${slug} reads`.padEnd(26), own,
    own ? '' : page.status !== 200 ? `HTTP ${page.status}` : 'served the app shell, not the brochure');

  const pdf = await get(`${site}/brochures/${slug}.pdf`, { headers: { Range: 'bytes=0-3' } });
  const type = pdf.headers.get('content-type') || '';
  check(`${slug} PDF downloads`.padEnd(26), type.includes('pdf'),
    type.includes('pdf') ? '' : `served ${type || 'nothing'}`);
}

// -------------------------------------------------------------- the letter
section('Can anyone read the letter?');
const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.log('  SKIP  no Supabase keys in .env.local, so the data checks cannot run');
} else {
  const h = { apikey: anon, Authorization: `Bearer ${anon}` };
  const issues = await (await get(`${url}/rest/v1/turnings?select=title,pdf_path,published_at`, { headers: h })).json().catch(() => []);
  check('issues are published', Array.isArray(issues) && issues.length > 0, `${issues.length || 0} found`);

  const withDoc = (issues || []).filter((i) => i.pdf_path);
  check('every issue has its document', withDoc.length === (issues || []).length);

  if (withDoc[0]) {
    const doc = await get(`${url}/storage/v1/object/public/issues/${withDoc[0].pdf_path}`, { headers: { Range: 'bytes=0-0' } });
    check('an issue actually opens', doc.status === 206 || doc.status === 200,
      `HTTP ${doc.status} ${doc.headers.get ? doc.headers.get('content-type') : ''}`);
  }

  // ------------------------------------------------------- the client area
  section('Is the client library shut?');
  const libRes = await get(`${url}/rest/v1/resources?select=title`, { headers: h });
  const lib = await libRes.json().catch(() => null);
  check('a stranger is served no library items', Array.isArray(lib) && lib.length === 0,
    Array.isArray(lib) ? `${lib.length} returned` : 'unexpected response');

  const write = await get(`${url}/rest/v1/resources`, {
    method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: '{}',
  });
  check('a stranger cannot add to it', write.status === 401 || write.status === 403, `HTTP ${write.status}`);

  const mail = await get(`${url}/rest/v1/contact_submissions?select=name`, { headers: h });
  const mailRows = await mail.json().catch(() => null);
  check('a stranger cannot read enquiries', Array.isArray(mailRows) && mailRows.length === 0);

  // The library bucket, not the brochures. The brochures are deliberately open
  // now and are served from this app; what must stay shut is everything else in
  // the library, which is why this asks the bucket rather than the site.
  const priv = await get(`${url}/storage/v1/object/public/resources/brochures/estate-ready.pdf`);
  check('the library bucket stays shut', priv.status >= 400, `HTTP ${priv.status}`);

  const form = await get(`${url}/rest/v1/contact_submissions`, {
    method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: '{}',
  });
  check('the contact form can still be used', form.status === 400,
    form.status === 400 ? 'reached validation, so the rule allows it' : `HTTP ${form.status}`);
}

// ------------------------------------------------------------------ safety
section('Headers and redirects');
const hdr = home.headers;
if (hdr && hdr.get) {
  check('nosniff', hdr.get('x-content-type-options') === 'nosniff');
  check('HSTS', Boolean(hdr.get('strict-transport-security')));
  check('referrer policy', Boolean(hdr.get('referrer-policy')));
}
for (const [host, dest] of [
  ['estateready.ca', '/estate-ready'],
  ['saleready.ca', '/sale-ready'],
  ['harvestsharewealth.ca', '/harvest-share'],
  ['harvestsharewealth.com', '/harvest-share'],
  ['harvestshare.ca', '/harvest-share'],
]) {
  // Follow the whole chain. Vercel sends an apex to its www first, so the first
  // hop is often www rather than the destination; what matters is where a person
  // ends up, not how many steps it took.
  let url = `https://${host}/`;
  let r = await get(url);
  let hops = 0;
  while ([301, 302, 307, 308].includes(r.status) && hops < 5) {
    const loc = r.headers.get('location');
    if (!loc) break;
    url = new URL(loc, url).toString();
    r = await get(url);
    hops += 1;
  }
  const ok = url.includes(dest);
  check(`${host} -> ${dest}`.padEnd(38), ok,
    ok ? `(${hops} hop${hops === 1 ? '' : 's'})` : (hops ? `ends at ${url}` : '(not pointed here yet)'));
}

console.log(`\n${failures === 0 ? 'Everything checked out.' : failures + ' check(s) failed — see FAIL above.'}`);
process.exit(failures === 0 ? 0 : 1);
