// Client testimonials for the home page.
//
// These five are PLACEHOLDERS and say so on the card. They exist to show the
// section working at the right length and rhythm, not to stand in for opinions
// nobody has given yet. No quote here is attributed to a real person, and none
// should be invented: replace each with words a client actually gave you, with
// their permission and the attribution they agreed to.
//
// To go live, drop `placeholder: true` and fill in quote / who / pathway.
// A testimonial section always shows at least MIN cards: fewer than that and
// the row looks unfinished and has too little to scroll through. A pathway's
// own quotes lead, then the one about the relationship, then the rest — each
// card carries its own pathway tag, so nothing is passed off as belonging to a
// programme it does not.
const MIN = 5;

export function testimonialsFor(pathwayName, min = MIN) {
  const own = TESTIMONIALS.filter((t) => t.pathway === pathwayName);
  const general = TESTIMONIALS.filter((t) => t.pathway == null);
  const rest = TESTIMONIALS.filter((t) => t.pathway && t.pathway !== pathwayName);
  return [...own, ...general, ...rest].slice(0, Math.max(min, own.length + general.length));
}

export const TESTIMONIALS = [
  {
    placeholder: true,
    quote: 'A client’s own words go here. Two or three sentences is the right length: long enough to say something specific about the work, short enough to read in one breath.',
    who: 'Client name, city',
    pathway: 'EstateReady',
  },
  {
    placeholder: true,
    quote: 'The most useful quotes name the moment rather than the feeling. What the family faced, what was readied beforehand, and what that meant when it mattered.',
    who: 'Client name, city',
    pathway: 'EstateReady',
  },
  {
    placeholder: true,
    quote: 'For a business sale, the words that carry are usually about the years either side of it, not the transaction itself.',
    who: 'Client name, city',
    pathway: 'SaleReady',
  },
  {
    placeholder: true,
    quote: 'A giving quote works best when it is plain about what was built into the plan, and leaves the figures out.',
    who: 'Client name, city',
    pathway: 'Harvest Share',
  },
  {
    placeholder: true,
    quote: 'One quote about the relationship rather than a single event gives the set somewhere to rest at the end.',
    who: 'Client name, city',
    pathway: null,
  },
];
