import { useEffect, useState } from 'react';
import { useGameState } from './useGameState';
import { useGrillAudio } from './useGrillAudio';
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

  // Aseta selaimen välilehden otsikko tämän pelin ajaksi
  useEffect(() => {
    const prev = document.title;
    document.title = 'Grilled · play 5 minutes';
    return () => {
      document.title = prev;
    };
  }, []);

  // Siirry automaattisesti End-ruutuun kun peli päättyy
  useEffect(() => {
    if (ui.phase === 'ended' && screen === 'play') {
      setScreen('end');
      grill.stop();
    }
  }, [ui.phase, screen, grill]);

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
    </div>
  );
}
