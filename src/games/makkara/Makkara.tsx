import { useEffect, useState } from 'react';
import { useGameLanguage } from './useGameLanguage';
import { useGameState } from './useGameState';
import { STRINGS } from './content';
import TitleScreen from './screens/TitleScreen';
import PlayScreen from './screens/PlayScreen';
import EndScreen from './screens/EndScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import './Makkara.css';

type ScreenId = 'title' | 'play' | 'end' | 'leaderboard';

export default function Makkara() {
  const { lang, setLang } = useGameLanguage();
  const [screen, setScreen] = useState<ScreenId>('title');
  const { ui, start, choose, reset } = useGameState(lang);
  const L = STRINGS[lang];

  // Siirry automaattisesti End-ruutuun kun peli päättyy
  useEffect(() => {
    if (ui.phase === 'ended' && screen === 'play') {
      setScreen('end');
    }
  }, [ui.phase, screen]);

  function handleBegin() {
    start();
    setScreen('play');
  }

  function handleRestart() {
    reset();
    setScreen('title');
  }

  return (
    <div className="makkara-container">
      <div className="makkara-lang-toggle">
        <button
          className={lang === 'fi' ? 'active' : ''}
          onClick={() => setLang('fi')}
          aria-label="Suomi"
        >
          FI
        </button>
        <button
          className={lang === 'en' ? 'active' : ''}
          onClick={() => setLang('en')}
          aria-label="English"
        >
          EN
        </button>
      </div>

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
          lang={lang}
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
