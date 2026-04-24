// Pelin sisältödata: monologit, valinnat, ambient, päätökset.
// Flat rakenne — ei enää kielikerroksia.

import type { EndingKey } from './content';

export type Choice = {
  text: string;
  d: number;
  release?: boolean;
};

export type Prompt = {
  text: string;
  choices: Choice[];
};

export type PhaseContent = {
  prompts: Prompt[];
  ambient: string[];
};

export type ReleaseContent = {
  thought: string;
  yes: string;
  no: string;
};

export type EndingContent = {
  title: string;
  text: string;
};

// ═══════════════════════════════════════════════════════════════
//  PROMPTS
// ═══════════════════════════════════════════════════════════════

export const PROMPTS: PhaseContent[] = [
  // Phase 1: Denial
  {
    prompts: [
      {
        text: 'This heat… I think I\u2019m imagining it.',
        choices: [
          { text: 'Nothing is happening.', d: +5 },
          { text: 'Something is wrong.', d: -3 },
        ],
      },
      {
        text: 'I grew up in the freezer. This must just be another room.',
        choices: [
          { text: 'Probably.', d: +5 },
          { text: 'The door isn\u2019t opening anymore.', d: -3 },
        ],
      },
      {
        text: 'The sausage next to me is sweating. Strange choice.',
        choices: [
          { text: 'Everyone copes differently.', d: +4 },
          { text: 'Does it know something I don\u2019t?', d: -4 },
        ],
      },
    ],
    ambient: [
      'The heat ripples.',
      'Bubbling, far off.',
      'This must be temporary.',
    ],
  },

  // Phase 2: Anger
  {
    prompts: [
      {
        text: 'I had the makings of a bratwurst.',
        choices: [
          { text: 'Fate doesn\u2019t read résumés.', d: +6 },
          { text: 'This is an insult to my whole lineage.', d: -5 },
        ],
      },
      {
        text: 'The cook is flipping everyone else. Not me.',
        choices: [
          { text: 'Perhaps I am special.', d: +3 },
          { text: 'I\u2019ve been forgotten here to burn.', d: -5 },
        ],
      },
      {
        text: 'The tongs. Always the tongs.',
        choices: [
          { text: 'They\u2019re only tools.', d: +5 },
          { text: 'They are enjoying this.', d: -4 },
        ],
      },
    ],
    ambient: [
      'Juice simmers on the surface.',
      'The shadow of the tongs shifts.',
      'Someone laughs, far away.',
    ],
  },

  // Phase 3: Bargaining
  {
    prompts: [
      {
        text: 'If I roll right now, maybe I\u2019ll reach a cooler spot.',
        choices: [
          { text: 'Try.', d: +2 },
          { text: 'Stay still. Motion is self-deception.', d: +5 },
        ],
      },
      {
        text: 'Chef, if you can hear me — I\u2019m a good sausage.',
        choices: [
          { text: 'Hope is food for humans.', d: +3 },
          { text: 'Silence answers.', d: -3 },
        ],
      },
      {
        text: 'I will give everything if this ends.',
        choices: [
          { text: 'Giving is freedom.', d: +7 },
          { text: 'I have nothing left.', d: -4 },
        ],
      },
    ],
    ambient: [
      'Smoke arcs upward.',
      'A clock ticks somewhere.',
      'A fly lands on the grill lid.',
    ],
  },

  // Phase 4: Depression
  {
    prompts: [
      {
        text: 'My fat is dripping. It was part of me.',
        choices: [
          { text: 'All things flow.', d: +6 },
          { text: 'There is less and less of me.', d: -4 },
        ],
      },
      {
        text: 'I can\u2019t clearly remember the freezer anymore.',
        choices: [
          { text: 'Memory is a burden.', d: +4 },
          { text: 'I\u2019ve lost that too.', d: -5 },
        ],
      },
      {
        text: 'The grate has been closer to me than anyone ever was.',
        choices: [
          { text: 'Connection is connection.', d: +5 },
          { text: 'This is a form of loneliness.', d: -4 },
        ],
      },
    ],
    ambient: [
      'The coal crumbles slowly.',
      'The wind turns.',
      'Night settles over the city.',
    ],
  },

  // Phase 5: Acceptance
  {
    prompts: [
      {
        text: 'I will be eaten. That is what I\u2019ve been for.',
        choices: [
          { text: 'Thank you for this moment.', d: +8 },
          { text: 'I hope they enjoy it.', d: +6 },
        ],
      },
      {
        text: 'The flames are beautiful once I stop fearing them.',
        choices: [
          { text: 'They are.', d: +7 },
          { text: 'The fear was pointless from the start.', d: +6 },
        ],
      },
      {
        text: 'I have been a sausage. That is something.',
        choices: [
          { text: 'It is everything.', d: +8 },
          { text: 'It is enough.', d: +7 },
        ],
      },
    ],
    ambient: [
      'The flame dances in its own measure.',
      'Silence sings.',
      'All that warms has once lived.',
      'This moment needs nothing added.',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  RELEASE (Vaihe 5 + peace ≥ 95)
// ═══════════════════════════════════════════════════════════════

export const RELEASE: ReleaseContent = {
  thought: 'I can let go at any time.',
  yes: 'Let go.',
  no: 'I\u2019ll stay a while longer.',
};

// ═══════════════════════════════════════════════════════════════
//  ENDINGS
// ═══════════════════════════════════════════════════════════════

export const ENDINGS: Record<EndingKey, EndingContent> = {
  vapautunut: {
    title: 'Released',
    text: 'The sausage did not wait for the cook. It ceased being done or raw, grilled or raised. It simply was. When the plate finally arrived, there was no sausage there in the ordinary sense — only something warm, perfect, already surrendered. Those who ate fell silent for a moment, for a reason they could not name.',
  },
  kirkastunut: {
    title: 'Illuminated',
    text: 'The sausage did not fight in the final moment. Its surface was golden brown, its center warm and perfect. When the plate came, it was ready. Its beauty was not in how it grew, but in how it gave itself up. The eater sighed, satisfied.',
  },
  hyvaksynyt: {
    title: 'Accepted',
    text: 'The sausage did not find perfect peace, but it stopped fighting. A little uneven, authentic, done. Someone eats it without asking its name. Perhaps that is enough. The flames keep moving.',
  },
  katkeroitunut: {
    title: 'Embittered',
    text: 'The sausage charred in a moment of rage. Its surface was black, its center still cold. It was true to itself. The cook threw it away. Somewhere, another sausage waited its turn.',
  },
  absurdi: {
    title: 'Fallen',
    text: 'The sausage fell through the grate just as it was reaching insight into its fate. Gravity claimed it for its own. It rotted slowly in the ashes, thoughts unfinished. The absurd had the last word.',
  },
};
