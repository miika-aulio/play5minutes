import { useEffect, useState } from 'react';
import { useGameState } from './useGameState';
import { useGrillAudio } from './useGrillAudio';
import { usePromptAudio } from './usePromptAudio';
import { STRINGS } from './content';
import TitleScreen from './screens/TitleScreen';
import PlayScreen from './screens/PlayScreen';
import EndScreen from './screens/EndScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import './Grilled.css';

type ScreenId = 'title' | 'play' | 'end' | 'leaderboard';

export default function Grilled() {
  const [screen, setScreen] = useState<ScreenId>('title');
  const { ui, start, choose, reset } = useGameState();
  const grill = useGrillAudio();
  const L = STRINGS;

  usePromptAudio(ui, grill.muted);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Grilled · play 5 minutes';
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    if (ui.phase === 'ended' && screen === 'play') {
      setScreen('end');
      grill.stop();
    }
  }, [ui.phase, screen]); // grill pois — uusi objektiliteraali joka renderöinnissä aiheuttaisi turhat ajokerrat

  function handleBegin() {
    start();
    grill.start();
    setScreen('play');
  }

  function handleRestart() {
    reset();
    grill.stop();
    setScreen('title');
  }

  // Fade-to-black -overlay last-words-vaiheessa.
  // Näkyy vain kun peli on play-ruudussa ja fade on käynnissä.
  const fadeOverlay = screen === 'play' && ui.fadeProgress > 0 && (
    <div
      className="grilled-fade-overlay"
      style={{ opacity: ui.fadeProgress }}
      aria-hidden="true"
    >
      {ui.phase === 'last-words' && ui.thought && (
        <div className="grilled-last-words">{ui.thought}</div>
      )}
    </div>
  );

  return (
    <div className="grilled-container">
      <button
        className="grilled-mute-toggle"
        onClick={grill.toggleMuted}
        aria-label={grill.muted ? 'Unmute' : 'Mute'}
        title={grill.muted ? 'Unmute' : 'Mute'}
      >
        {grill.muted ? '🔇' : '🔊'}
      </button>

      {screen === 'title' && (
        <TitleScreen
          L={L}
          onBegin={handleBegin}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'play' && <PlayScreen L={L} ui={ui} onChoose={choose} />}

      {screen === 'end' && ui.endingKey && (
        <EndScreen
          L={L}
          ending={ui.endingKey}
          peace={Math.round(ui.peace)}
          choices={ui.choicesMade}
          onRestart={handleRestart}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          L={L}
          onBack={() => setScreen(ui.endingKey ? 'end' : 'title')}
        />
      )}

      {fadeOverlay}
    </div>
  );
}
