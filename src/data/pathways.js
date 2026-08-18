// The three stewardship pathways, now each with its own page.
// Descriptions are NLW's approved copy. `evidence` and `testimonials` are
// deliberately empty: references and client quotes must come from NLW, they
// are not written here.
import winterScene from '@/assets/seasons/winter-scene.jpg';
import autumnScene from '@/assets/seasons/autumn-scene.jpg';
import summerScene from '@/assets/seasons/summer-scene.jpg';

const PHOTO = {
  estate: winterScene,
  sale: autumnScene,
  harvest: summerScene,
};

export const PATHWAYS = [
  {
    id: 'estate-ready',
    name: 'EstateReady',
    tag: 'Continuity',
    purpose: 'Readiness for the family and the estate, prepared long before it is ever needed.',
    detail: [
      'We ready the family and the estate together: the documents, the roles, the difficult conversations, and the plan for continuity before probate and long after it. When the moment comes, nothing is improvised.',
      'Family continuity, operational continuity before probate, and stewardship that carries on long after.',
    ],
    photo: PHOTO.estate,
    alt: 'Winter across the Prairie, painted',
    evidence: [],
    testimonials: [],
  },
  {
    id: 'sale-ready',
    name: 'SaleReady',
    tag: 'Transition',
    purpose: 'Preparation for the owner, for the sale itself and for the life that follows it.',
    detail: [
      'A business sale is a personal event, not only a transaction. We prepare the owner, the family, the tax position, and the liquidity ahead of time, and we stay through the change of identity that follows the cheque.',
      'Owner, family, tax, liquidity, and identity, all readied before and after the transaction.',
    ],
    photo: PHOTO.sale,
    alt: 'Autumn turning across the Prairie, painted',
    evidence: [],
    testimonials: [],
  },
  {
    id: 'harvest-share',
    name: 'Harvest Share',
    tag: 'Giving',
    purpose: 'Generosity built into the plan, with a portion of your giving returned to you in recognition.',
    detail: [
      'Giving belongs in the plan, not after it. Harvest Share builds your generosity into the whole, grounded in participation and community rather than cause marketing. The exact structure, including any recognition returned to you, is confirmed with you directly.',
    ],
    note: 'Wording to be finalised with NLW compliance. No terms or figures are stated here.',
    photo: PHOTO.harvest,
    alt: 'The harvest in high summer, painted',
    evidence: [],
    testimonials: [],
  },
];

export const getPathway = (id) => PATHWAYS.find((p) => p.id === id);
