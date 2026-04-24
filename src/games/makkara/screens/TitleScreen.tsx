import type { LangStrings } from '../content';

interface Props {
  L: LangStrings;
  onBegin: () => void;
  onLeaderboard: () => void;
}

export default function TitleScreen({ L, onBegin, onLeaderboard }: Props) {
  return (
    <div className="makkara-title">
      <h1 className="makkara-title-text">{L.title}</h1>
      <p className="makkara-subtitle">{L.subtitle}</p>
      <div className="makkara-epigraph">
        <span>{L.epigraph}</span>
        <cite>{L.epigraphCite}</cite>
      </div>
      <button className="makkara-btn makkara-btn-primary" onClick={onBegin}>
        {L.begin}
      </button>
      <button className="makkara-btn-link" onClick={onLeaderboard}>
        {L.leaderboard}
      </button>
    </div>
  );
}
