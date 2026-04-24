// Keskitetty sisältömoduuli: tyypit, vakiot, käännökset.
// Pelidata (monologit, päätökset yms.) laajenee Vaiheessa 2.

export const ENDING_KEYS = [
  'vapautunut',
  'kirkastunut',
  'hyvaksynyt',
  'katkeroitunut',
  'absurdi',
] as const;
export type EndingKey = (typeof ENDING_KEYS)[number];

// Päätöksen "taso" tulostaulun järjestämistä varten.
// Korkeampi = parempi. Käytetään score-laskennassa: score = tier*1000 + peace.
export const ENDING_TIER: Record<EndingKey, number> = {
  vapautunut: 5,
  kirkastunut: 4,
  hyvaksynyt: 3,
  katkeroitunut: 2,
  absurdi: 1,
};

export type Language = 'fi' | 'en';

export type LangStrings = {
  title: string;
  subtitle: string;
  epigraph: string;
  epigraphCite: string;
  begin: string;
  leaderboard: string;
  backToPortfolio: string;
  doneness: string;
  peace: string;
  phases: readonly [string, string, string, string, string];
  comingSoon: string;
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

export const STRINGS: Record<Language, LangStrings> = {
  fi: {
    title: 'Makkara',
    subtitle: 'grillaussimulaattori hyväksymisestä',
    epigraph: '"Meidän on kuviteltava Sisyfos onnelliseksi."',
    epigraphCite: '— Camus',
    begin: 'Astu grillille',
    leaderboard: 'Tulostaulu',
    backToPortfolio: '← takaisin',
    doneness: 'Kypsyys',
    peace: 'Mielenrauha',
    phases: ['Kieltäminen', 'Viha', 'Kaupankäynti', 'Masennus', 'Hyväksyminen'],
    comingSoon: 'Peli tulossa pian. Tässä vaiheessa näet vain rakenteen.',
    endKicker: 'Päätös',
    restartBtn: 'Toinen elämä',
    namePlaceholder: 'Nimesi',
    submitBtn: 'Lähetä',
    submitNote: 'Tulos näkyy kaikille pelaajille',
    submitOk: 'Lähetetty.',
    submitErr: 'Lähetys epäonnistui.',
    anonymous: 'Tuntematon',
    lbTitle: 'Tulostaulu',
    lbKicker: 'Kaikkien aikojen',
    lbShared: 'Näkyy kaikille pelaajille',
    lbEmpty: 'Ei vielä tuloksia. Ole ensimmäinen.',
    lbLoading: 'Ladataan…',
    lbError: 'Tulostaulun lataus epäonnistui.',
    lbBack: 'Takaisin',
    lbRank: '#',
    lbName: 'Nimi',
    lbVerdict: 'Päätös',
    lbPeace: 'Rauha',
    endingShort: {
      vapautunut: 'Vapautunut',
      kirkastunut: 'Kirkastunut',
      hyvaksynyt: 'Hyväksynyt',
      katkeroitunut: 'Katkeroitunut',
      absurdi: 'Pudonnut',
    },
    formatStats: (peace, choices) =>
      `Mielenrauha ${peace} · Valintoja ${choices}`,
  },
  en: {
    title: 'Sausage',
    subtitle: 'a grilling simulator about acceptance',
    epigraph: '"One must imagine Sisyphus happy."',
    epigraphCite: '— Camus',
    begin: 'Step onto the grill',
    leaderboard: 'Leaderboard',
    backToPortfolio: '← back',
    doneness: 'Doneness',
    peace: 'Peace',
    phases: ['Denial', 'Anger', 'Bargaining', 'Depression', 'Acceptance'],
    comingSoon: 'Game coming soon. You currently see only the scaffolding.',
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
  },
};
