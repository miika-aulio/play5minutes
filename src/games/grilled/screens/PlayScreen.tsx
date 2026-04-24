import type { Strings } from '../content';
import type { UIState } from '../useGameState';
import type { Choice } from '../gameData';
import Stage from '../components/Stage';
import Monologue from '../components/Monologue';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

interface Props {
  L: Strings;
  ui: UIState;
  onChoose: (choice: Choice) => void;
}

export default function PlayScreen({ L, ui, onChoose }: Props) {
  const donenessPct = Math.round(ui.doneness * 100);
  const peaceRounded = Math.round(ui.peace);

  return (
    <div className="grilled-play-screen">
      <div className="grilled-topbar">
        <div className="grilled-meter">
          <label>
            <span>{L.doneness}</span>
            <span className="val">{donenessPct}%</span>
          </label>
          <div className="grilled-bar">
            <div
              className="grilled-bar-fill doneness"
              style={{ transform: `scaleX(${ui.doneness})` }}
            />
          </div>
        </div>
        <div className="grilled-meter">
          <label>
            <span>{L.peace}</span>
            <span className="val">{peaceRounded}</span>
          </label>
          <div className="grilled-bar">
            <div
              className="grilled-bar-fill peace"
              style={{ transform: `scaleX(${ui.peace / 100})` }}
            />
          </div>
        </div>
      </div>

      <Stage doneness={ui.doneness} pulseKey={ui.pulseKey} />

      <div className="grilled-phase-indicator">
        <span className="num">{ROMAN[ui.phaseIdx]}</span>
        {L.phases[ui.phaseIdx]}
      </div>

      <Monologue
        thought={ui.thought}
        choices={ui.choices}
        waitingChoice={ui.waitingChoice}
        onChoose={onChoose}
      />
    </div>
  );
}
