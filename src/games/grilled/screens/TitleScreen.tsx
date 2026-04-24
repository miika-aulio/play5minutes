import type { Strings } from '../content';

interface Props {
  L: Strings;
  onBegin: () => void;
  onLeaderboard: () => void;
}

export default function TitleScreen({ L, onBegin, onLeaderboard }: Props) {
  return (
    <div className="grilled-title">
      <h1 className="grilled-title-text">{L.title}</h1>
      <p className="grilled-subtitle">{L.subtitle}</p>
      <div className="grilled-epigraph">
        <span>{L.epigraph}</span>
        <cite>{L.epigraphCite}</cite>
      </div>
      <button className="grilled-btn grilled-btn-primary" onClick={onBegin}>
        {L.begin}
      </button>
      <button className="grilled-btn-link" onClick={onLeaderboard}>
        {L.leaderboard}
      </button>
    </div>
  );
}
