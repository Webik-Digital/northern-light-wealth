// The Four Turnings.
//
// There is no longer a copy of the issues in this file. They were hard-coded
// while the site had no database behind it worth trusting, with the documents
// sitting in the site's own public folder; both the rows and the files now live
// in Supabase, and a second copy here could only ever drift from them.
//
// The letter is public, so an issue carries a permanent URL rather than an
// expiring one. `href` is filled in by listIssues().

// Published, not post-dated, and actually attached to a document. A row without
// one is a draft or a leftover, and is not an issue anyone can read.
export function issuesFrom(rows) {
  if (!rows) return [];
  const now = new Date();
  return rows.filter(
    (r) => r.publishedAt && new Date(r.publishedAt) <= now && r.href
  );
}
