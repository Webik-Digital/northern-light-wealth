import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ISSUES } from '@/data/turnings';

// Searches what a visitor might actually be looking for: the issues, the pages
// themselves, and — once signed in — the client library. Small enough to match
// in the browser, so there is no request behind a keystroke.
const PAGES = [
  { title: 'About the firm', where: 'About', to: '/about', text: 'firm story seasonal view indigenous ownership community advisors devan legare garth mcintosh how it works investment tenets' },
  { title: 'Stewardship', where: 'Stewardship', to: '/stewardship', text: 'one system three pathways understand order act steward movements' },
  { title: 'EstateReady', where: 'Stewardship', to: '/estate-ready', text: 'continuity estate family probate documents roles inheritance' },
  { title: 'SaleReady', where: 'Stewardship', to: '/sale-ready', text: 'transition business sale owner tax liquidity identity transaction' },
  { title: 'Harvest Share', where: 'Stewardship', to: '/harvest-share', text: 'giving generosity philanthropy charity community recognition' },
  { title: 'The Four Turnings', where: 'Reading', to: '/the-four-turnings', text: 'newsletter letter seasonal solstice equinox issues archive subscribe' },
  { title: 'Stewardship Resources', where: 'Library', to: '/resources', text: 'client library documents guides briefings gated access sign in' },
  { title: 'Begin a conversation', where: 'Contact', to: '/contact', text: 'contact email phone book a time enquiry' },
];

const norm = (s) => (s || '').toLowerCase();

export default function ResourceSearch({ libraryItems = [], authed = false }) {
  const [q, setQ] = useState('');
  const query = q.trim();

  const results = useMemo(() => {
    if (query.length < 2) return null;
    const needle = norm(query);
    const hits = [];

    ISSUES.forEach((i) => {
      const hay = norm(`${i.title} ${i.dek} ${i.marker} ${i.year} ${(i.contents || []).map((c) => `${c.section} ${c.title}`).join(' ')}`);
      if (hay.includes(needle)) {
        hits.push({
          key: `issue-${i.id}`,
          kind: 'The Four Turnings',
          title: i.title,
          meta: `${i.marker} ${i.year}`,
          body: i.dek,
          // the letter is public: the issue opens straight from the result
          href: i.pdfUrl,
        });
      }
    });

    // The library only ever reaches this component signed in, and the entity is
    // what enforces that. Searching cannot be a side door into it.
    if (authed) {
      libraryItems.forEach((r) => {
        const hay = norm(`${r.title} ${r.category} ${r.description}`);
        if (hay.includes(needle)) {
          hits.push({
            key: `res-${r.id}`,
            kind: r.category || 'Library',
            title: r.title,
            meta: 'Client library',
            body: r.description,
            href: r.href || r.fileOrUrl,
          });
        }
      });
    }

    PAGES.forEach((p) => {
      if (norm(`${p.title} ${p.where} ${p.text}`).includes(needle)) {
        hits.push({ key: `page-${p.to}`, kind: p.where, title: p.title, meta: 'Page', body: '', to: p.to });
      }
    });

    return hits;
  }, [query, libraryItems, authed]);

  return (
    <div className="nlw-search">
      <label className="nlw-label">
        <span>Search the site</span>
        <input
          className="nlw-input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “estate”, “tax”, “solstice”…"
          aria-label="Search resources and pages"
        />
      </label>

      {results && (
        <div className="nlw-search-results" role="status" aria-live="polite">
          <p className="nlw-search-count">
            {results.length === 0
              ? `Nothing matches “${query}”.`
              : `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query}”.`}
          </p>

          <ul>
            {results.map((r) => {
              const inner = (
                <>
                  <span className="kind">{r.kind}</span>
                  <span className="ttl">{r.title}</span>
                  {r.body && <span className="body">{r.body}</span>}
                  <span className="meta">{r.meta}</span>
                </>
              );
              return (
                <li key={r.key}>
                  {r.href ? (
                    <a href={r.href} target="_blank" rel="noreferrer">{inner}</a>
                  ) : (
                    <Link to={r.to}>{inner}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
