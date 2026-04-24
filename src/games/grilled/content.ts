// UI-merkkijonot ja metadatan tyypit.
// English only — ei enää Record<Language, ...>-kerrosta.

export const ENDING_KEYS = [
  'vapautunut',
  'kirkastunut',
  'hyvaksynyt',
  'katkeroitunut',
  'absurdi',
] as const;
export type EndingKey = (typeof ENDING_KEYS)[number];

// Päätöksen "taso" tulostaulun järjestämistä varten.
// score = tier*1000 + peace
export const ENDING_TIER: Record<EndingKey, number> = {
  vapautunut: 5,
  kirkastunut: 4,
  hyvaksynyt: 3,
  katkeroitunut: 2,
  absurdi: 1,
};

export type Strings = {
  title: string;
  subtitle: string;
  epigraph: string;
  epigraphCite: string;
  begin: string;
  leaderboard: string;
  doneness: string;
  peace: string;
  phases: readonly [string, string, string, string, string];
  endKicker: string;
  restartBtn: string;
  namePlaceholder: string;
  submitBtn: string;
  submitNote: string;
  submitOk: string;
  submitErr: string;
  anonymous: string;
  lbTitle: string;
  lbKicker: string;
  lbShared: string;
  lbEmpty: string;
  lbLoading: string;
  lbError: string;
  lbBack: string;
  lbRank: string;
  lbName: string;
  lbVerdict: string;
  lbPeace: string;
  endingShort: Record<EndingKey, string>;
  formatStats: (peace: number, choices: number) => string;
};

export const STRINGS: Strings = {
  title: 'Grilled',
  subtitle: 'a grilling simulator about acceptance',
  epigraph: '"One must imagine Sisyphus happy."',
  epigraphCite: '— Camus',
  begin: 'Step onto the grill',
  leaderboard: 'Leaderboard',
  doneness: 'Doneness',
  peace: 'Peace',
  phases: ['Denial', 'Anger', 'Bargaining', 'Depression', 'Acceptance'],
  endKicker: 'Verdict',
  restartBtn: 'Another life',
  namePlaceholder: 'Your name',
  submitBtn: 'Submit',
  submitNote: 'Your score will be visible to all players',
  submitOk: 'Submitted.',
  submitErr: 'Submission failed.',
  anonymous: 'Anonymous',
  lbTitle: 'Leaderboard',
  lbKicker: 'All-time',
  lbShared: 'Visible to all players',
  lbEmpty: 'No results yet. Be the first.',
  lbLoading: 'Loading…',
  lbError: 'Could not load leaderboard.',
  lbBack: 'Back',
  lbRank: '#',
  lbName: 'Name',
  lbVerdict: 'Verdict',
  lbPeace: 'Peace',
  endingShort: {
    vapautunut: 'Released',
    kirkastunut: 'Illuminated',
    hyvaksynyt: 'Accepted',
    katkeroitunut: 'Embittered',
    absurdi: 'Fallen',
  },
  formatStats: (peace, choices) => `Peace ${peace} · Choices ${choices}`,
};
