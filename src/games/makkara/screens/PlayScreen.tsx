import type { LangStrings } from '../content';
import type { UIState } from '../useGameState';
import type { Choice } from '../gameData';
import Stage from '../components/Stage';
import Monologue from '../components/Monologue';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

interface Props {
  L: LangStrings;
  ui: UIState;
  onChoose: (choice: Choice) => void;
}

export default function PlayScreen({ L, ui, onChoose }: Props) {
  const donenessPct = Math.round(ui.doneness * 100);
  const peaceRounded = Math.round(ui.peace);

  return (
    <div className="makkara-play-screen">
      {/* Mittarit yläreunassa */}
      <div className="makkara-topbar">
        <div className="makkara-meter">
          <label>
            <span>{L.doneness}</span>
            <span className="val">{donenessPct}%</span>
          </label>
          <div className="makkara-bar">
            <div
              className="makkara-bar-fill doneness"
              style={{ transform: `scaleX(${ui.doneness})` }}
            />
          </div>
        </div>
        <div className="makkara-meter">
          <label>
            <span>{L.peace}</span>
            <span className="val">{peaceRounded}</span>
          </label>
          <div className="makkara-bar">
            <div
              className="makkara-bar-fill peace"
              style={{ transform: `scaleX(${ui.peace / 100})` }}
            />
          </div>
        </div>
      </div>

      {/* Grilli + makkara */}
      <Stage doneness={ui.doneness} pulseKey={ui.pulseKey} />

      {/* Vaiheen tunnus */}
      <div className="makkara-phase-indicator">
        <span className="num">{ROMAN[ui.phaseIdx]}</span>
        {L.phases[ui.phaseIdx]}
      </div>

      {/* Monologi + valinnat */}
      <Monologue
        thought={ui.thought}
        choices={ui.choices}
        waitingChoice={ui.waitingChoice}
        onChoose={onChoose}
      />
    </div>
  );
}
