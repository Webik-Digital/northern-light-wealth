// The Four Turnings issues that NLW has published.
//
// Each issue is a designed publication, not an article written into this site:
// five pages across four standing sections. So the site presents an issue and
// hands the reader the document, rather than pretending to be the document.
//
// These four ship with the site. Anything NLW publishes from here goes into the
// Turning entity through /admin, and entity rows take precedence over this list.
//
// PUBLIC BY DESIGN. These files sit in the site's public folder and the URLs
// below answer to anyone, which is what is wanted: the letter is how the firm
// is met by people who are not clients yet. The client library is the private
// half, and it is a different entity with its own rule.
//
// Standfirsts are the issues' own opening lines.
const PDF = '/four-turnings';

export const ISSUES = [
  {
    id: 'summer-2026',
    season: 'summer',
    year: 2026,
    marker: 'Summer Solstice',
    title: 'The Season of Connection',
    dek: 'There is something different about a Prairie summer. Longer days and warmer evenings naturally draw us outside.',
    publishedAt: '2026-06-21',
    pdfUrl: `${PDF}/four-turnings-summer-2026.pdf`,
    pages: 5,
    contents: [
      { no: '01', section: 'Seasonal Perspective', title: 'The Season of Connection' },
      { no: '02', section: 'Stewardship Principle', title: 'Around the Table' },
      { no: '03', section: 'Practical Planning', title: 'Mid-Year Check-In' },
      { no: '04', section: 'Market View', title: 'Beyond the Headlines' },
    ],
  },
  {
    id: 'spring-2026',
    season: 'spring',
    year: 2026,
    marker: 'Spring Equinox',
    title: 'The Season of Renewal',
    dek: 'As the days begin to lengthen, energy starts to return in subtle ways. What felt uncertain or heavy often begins to lighten.',
    publishedAt: '2026-03-20',
    pdfUrl: `${PDF}/four-turnings-spring-2026.pdf`,
    pages: 5,
    contents: [
      { no: '01', section: 'Seasonal Perspective', title: 'The Season of Renewal' },
      { no: '02', section: 'Stewardship Principle', title: 'The Bank of Mom & Dad' },
      { no: '03', section: 'Practical Planning', title: 'Spring Cleaning' },
      { no: '04', section: 'Market View', title: 'Looking Forward' },
    ],
  },
  {
    id: 'winter-2025',
    season: 'winter',
    year: 2025,
    marker: 'Winter Solstice',
    title: 'The Season of Reflection',
    dek: 'As the days shorten and the year turns, many people find themselves carrying more than they expected.',
    publishedAt: '2025-12-21',
    pdfUrl: `${PDF}/four-turnings-winter-2025.pdf`,
    pages: 5,
    contents: [
      { no: '01', section: 'Seasonal Perspective', title: 'The Season of Reflection' },
      { no: '02', section: 'Stewardship Principle', title: 'Year-End Readiness' },
      { no: '03', section: 'Practical Planning', title: 'Time for a Review' },
      { no: '04', section: 'Market View', title: 'Looking Forward' },
    ],
  },
  {
    id: 'autumn-2025',
    season: 'fall',
    year: 2025,
    marker: 'Autumn Equinox',
    title: 'The Season of Stewardship',
    dek: 'On the Prairies, September is not just the end of summer. It is a natural time to plan and re-evaluate.',
    publishedAt: '2025-09-22',
    pdfUrl: `${PDF}/four-turnings-autumn-2025.pdf`,
    pages: 5,
    contents: [
      { no: '01', section: 'Seasonal Perspective', title: 'The Season of Stewardship' },
      { no: '02', section: 'Stewardship Principle', title: 'The Estate IMA' },
      { no: '03', section: 'Practical Planning', title: 'Gathering Together' },
      { no: '04', section: 'Market View', title: 'Looking Forward' },
    ],
  },
];

// Entity rows win when they exist; these are the fallback until NLW publishes
// through the admin.
export function issuesFrom(rows) {
  const live = (rows || []).filter(
    (r) =>
      r.publishedAt &&
      new Date(r.publishedAt) <= new Date() &&
      // an issue is the document: a row without one is left over from when this
      // section was modelled as an essay, and is not shown
      (r.pdfUrl || r.webUrl)
  );
  if (!live.length) return ISSUES;
  return live.map((r) => ({
    id: r.id,
    season: r.season,
    year: r.year,
    marker: r.marker || '',
    title: r.title,
    dek: r.dek,
    publishedAt: r.publishedAt,
    pdfUrl: r.pdfUrl || '',
    webUrl: r.webUrl || '',
    isFeatured: r.isFeatured,
    contents: [],
  }));
}
