import type { Strings, EndingKey } from '../content';
import { ENDINGS } from '../gameData';

// Väliaikainen yksinkertaistus:
// - Poistettu nimen syöttö
// - Poistettu tulostaulun linkki
// - Säilytetty päätös, proosa, stats ja "Another life"
//
// Supabase-integraatio ja tulostaulu-UI säilytetty koodissa
// (shared/supabase.ts, LeaderboardScreen.tsx). Palautetaan myöhemmin
// kun useampi peli tai oikeasti halutaan tulostaulu näkyviin.

interface Props {
  L: Strings;
  ending: EndingKey;
  peace: number;
  choices: number;
  onRestart: () => void;
  // onLeaderboard säilytetty propseissa mahdollista paluuta varten,
  // mutta sitä ei kutsuta tällä hetkellä.
  onLeaderboard?: () => void;
}

export default function EndScreen({
  L,
  ending,
  peace,
  choices,
  onRestart,
}: Props) {
  const endingContent = ENDINGS[ending];

  return (
    <div className="grilled-end">
      <div className="grilled-kicker">{L.endKicker}</div>
      <h2 className="grilled-end-title">{endingContent.title}</h2>
      <p className="grilled-end-text">{endingContent.text}</p>
      <div className="grilled-end-stats">{L.formatStats(peace, choices)}</div>

      <div
        className="grilled-end-actions"
        style={{ justifyContent: 'center', maxWidth: '20ch' }}
      >
        <button className="grilled-btn" onClick={onRestart}>
          {L.restartBtn}
        </button>
      </div>
    </div>
  );
}
