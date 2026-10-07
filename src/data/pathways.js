// The three stewardship pathways, now each with its own page.
// Descriptions are NLW's approved copy. `evidence` and `testimonials` are
// deliberately empty: references and client quotes must come from NLW, they
// are not written here.
import springScene from '@/assets/seasons/spring-scene.jpg';
import autumnScene from '@/assets/seasons/autumn-scene.jpg';
import summerScene from '@/assets/seasons/summer-scene.jpg';

// NLW's placement: continuity reads as autumn, transition as spring, giving as
// the harvest. Each pathway page is held to this season throughout — the tree,
// the wash and the watermark follow the painting.
const PHOTO = {
  estate: autumnScene,
  sale: springScene,
  harvest: summerScene,
};

export const PATHWAY_SEASON = {
  'estate-ready': 'fall',
  'sale-ready': 'spring',
  'harvest-share': 'summer',
};

export const PATHWAYS = [
  {
    id: 'estate-ready',
    name: 'EstateReady',
    tag: 'Continuity',
    purpose: 'Readiness for the family and the estate, prepared long before it is ever needed.',
    detail: [
      'We ready the family and the estate together: the documents, the roles, the difficult conversations, and the plan for continuity before probate and long after it. When the moment comes, nothing is improvised.',
      'Good estate planning prepares the documents. EstateReady prepares the people.',
    ],
    // The questions a reader should be asking before they need an answer. The
    // figures are NLW's, supplied with the October soft-launch notes; they are
    // not sourced here and `source` is left empty until NLW supplies one.
    prompts: {
      eyebrow: 'Before an estate exists',
      cards: [
        {
          question: 'When was your Will last reviewed?',
          facts: [
            '52% of Canadians say they have a Will.',
            '53% of Canadians 65+ had not updated their Will in the previous five years.',
          ],
          source: '',
        },
        {
          question: 'Does your Executor know they have been chosen and what to do?',
          facts: ['78% of Canadians surveyed had never acted as an Executor before.'],
          source: '',
        },
      ],
    },
    explore: 'Prepare while everyone can still be part of the conversation.',
    photo: PHOTO.estate,
    alt: 'Winter across the Prairie, painted',
    evidence: [],
    testimonials: [],
  },
  {
    id: 'sale-ready',
    name: 'SaleReady',
    tag: 'Transition',
    purpose: 'The business may be ready to sell. Are you ready for what comes next?',
    detail: [
      'SaleReady keeps the owner and family at the centre while the professional team stays connected around them.',
      'Lawyers, accountants, transaction specialists and investment professionals each bring important expertise. But business, tax, transaction, liquidity and family decisions do not happen in isolation. SaleReady helps keep the gaps between those areas visible, so responsibilities, decisions and next steps do not quietly fall between professionals.',
      'Preparation. Coordination. Stewardship.',
    ],
    prompts: {
      eyebrow: 'Before a transaction controls the timeline',
      cards: [
        {
          question: 'If an offer arrived tomorrow, would you know what “enough” looks like?',
          facts: [
            'Financial independence, family expectations and what life looks like after the business are easier to define before a transaction starts setting the timetable.',
          ],
          source: '',
        },
        {
          question: 'What happens when the business is no longer the centre of everything?',
          facts: [
            'After a sale, that operating asset can become family wealth, along with new choices about identity, purpose and responsibility.',
          ],
          source: '',
        },
      ],
    },
    explore: 'The goal is not simply to sell well. It is to be ready for what follows.',
    photo: PHOTO.sale,
    alt: 'Autumn turning across the Prairie, painted',
    evidence: [],
    testimonials: [],
  },
  {
    id: 'harvest-share',
    name: 'Harvest Share',
    tag: 'Giving',
    // The old lead promised "a portion of your giving returned to you in
    // recognition", which is why it carried a note saying the wording was not
    // final. NLW replaced it in the October notes with copy that makes no claim
    // about terms or returns, so the note goes with it — it was an internal
    // caveat and it was rendering on the public page.
    purpose: 'Wealth is rarely created in isolation. Harvest Share is one way we can honour the people, places and communities that helped make wealth possible.',
    detail: [
      'Harvest Share is how Northern Light Wealth shares part of the economic success of a client relationship while empowering the choice of that participation back with the client.',
      'It is not about prescribing generosity or promoting preferred causes. It is about creating room for families to direct support toward the people, organizations and communities that matter to them.',
      'Our participation. Your choice.',
    ],
    prompts: {
      eyebrow: 'When success creates more caring',
      cards: [
        {
          question: 'Who helped make this prosperity possible?',
          facts: [
            'Wealth is rarely created in isolation. The people and places around a family are often part of the story long before the wealth itself is visible.',
          ],
          source: '',
        },
        {
          question: 'What does stewardship look like when there is no obligation to act?',
          facts: [
            'Prosperity creates choices about where time, attention and resources can go. The opportunity is to decide, as a family, what responsibility means when the choice is entirely your own.',
          ],
          source: '',
        },
      ],
    },
    explore: 'Stewardship, practised.',
    photo: PHOTO.harvest,
    alt: 'The harvest in high summer, painted',
    evidence: [],
    testimonials: [],
  },
];

export const getPathway = (id) => PATHWAYS.find((p) => p.id === id);
