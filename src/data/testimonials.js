// Client testimonials for the home page and the pathway pages.
//
// Empty, and that is the correct state until NLW supplies real ones.
//
// There were five invented quotes here, written to show the section working at
// the right length and rhythm. They were never shown to anyone — the section is
// not rendered on any page — but leaving them was a standing hazard: the next
// person to switch the component back on would have published five fabricated
// client testimonials for a registered portfolio manager. The scroller and its
// styling are kept, because they work and the words are the only missing part.
//
// To bring the section back: add entries below, then render <TestimonialScroller
// items={testimonialsFor(name)} /> on the pages that should carry it.
//
// Each entry is { quote, who, pathway }. `who` is the attribution the client
// agreed to and nothing more — initials and a city if that is what was agreed.
// `pathway` is 'EstateReady' | 'SaleReady' | 'Harvest Share', or null for a
// quote about the relationship rather than one programme. Nothing here should
// be written on a client's behalf, and no quote should appear without their
// permission and in the form they approved.
const MIN = 5;

export function testimonialsFor(pathwayName, min = MIN) {
  const own = TESTIMONIALS.filter((t) => t.pathway === pathwayName);
  const general = TESTIMONIALS.filter((t) => t.pathway == null);
  const rest = TESTIMONIALS.filter((t) => t.pathway && t.pathway !== pathwayName);
  return [...own, ...general, ...rest].slice(0, Math.max(min, own.length + general.length));
}

export const TESTIMONIALS = [];
