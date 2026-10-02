// Awards and press from the foot of nlwealth.ca.
//
// These were hotlinked from the old WordPress site —
// https://nlwealth.ca/wp-content/uploads/… — which worked only for as long as
// that domain served WordPress. It now serves this app from Vercel, where the
// SPA rewrite answers every unmatched path with index.html, so each logo came
// back as a 1.5 KB HTML page with a 200 on it. The browser does not complain
// about that: the image reports complete, decodes to 0x0, and the section drew
// a heading over seven empty boxes. The files themselves are gone — the
// WordPress install is no longer reachable and the Internet Archive never took
// a copy — so they have to come from NLW or the publisher.
//
// `file` is the name to drop into src/assets/recognition/, extension included.
// Anything in that folder is picked up by the glob below and bundled with a
// content hash, the same as every other image in this app; nothing here is
// fetched from another host at runtime, which is what made this breakable in
// the first place. Until a file is there the mark is set as its name, which is
// true, legible, and does not look like a fault.

// Eager, so a missing file is a null at build time rather than a promise that
// rejects in front of a reader. `query: '?url'` keeps SVGs as URLs too.
const FILES = import.meta.glob('../assets/recognition/*.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const srcFor = (file) => FILES[`../assets/recognition/${file}`] || null;

const withSrc = (list) => list.map((m) => ({ ...m, src: srcFor(m.file) }));

export const AWARDS = withSrc([
  // wealthprofessional.ca/images/logo.svg
  { name: 'Wealth Professional', file: 'wealth-professional.svg' },
  // cpaalberta.ca, About Us > Logo
  { name: 'CPA Alberta', file: 'cpa-alberta.png' },
  // The IIAC Top Under 40 Award, won by Devan in 2019. The IIAC became CFFiM
  // and took its site with it, award microsite included, so there is no longer
  // a mark to show and this one is set as its name. If NLW has the badge from
  // the year they won, drop it in as top-under-40.png and it appears.
  { name: 'IIAC Top Under 40', file: 'top-under-40.png' },
]);

export const PRESS = withSrc([
  // Advisor.ca and Investment Executive are both Newcom; the two wordmarks are
  // served from media.investmentexecutive.com rather than either front end.
  { name: 'Advisor.ca', file: 'advisor-ca.svg' },
  // lifted from the masthead of CPA Alberta's own Dividends cover — the
  // magazine publishes no separate logo file
  { name: 'CPA Dividends', file: 'cpa-dividends.png' },
  { name: 'Investment Executive', file: 'investment-executive.svg' },
  // the nameplate from Wikimedia Commons, with the red knocked back so the type
  // itself is the mark — a solid red box greyscales to a blot on a pale page
  { name: 'The Globe and Mail', file: 'globe-and-mail.png' },
]);

// True once the logos are in place; the section is worth more with them.
export const HAVE_LOGOS = [...AWARDS, ...PRESS].some((m) => m.src);
