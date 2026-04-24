import type { LangStrings } from '../content';

interface Props {
  L: LangStrings;
  onBack: () => void;
}

// Vaihe 1: vain placeholder.
// Vaihe 2: tähän tulee kypsyys-mittari, mielenrauha, monologi, valinnat.
export default function PlayScreen({ L, onBack }: Props) {
  return (
    <div className="makkara-play">
      <div className="makkara-coming-soon">
        <p>{L.comingSoon}</p>
        <button className="makkara-btn" onClick={onBack}>
          {L.backToPortfolio}
        </button>
      </div>
    </div>
  );
}
