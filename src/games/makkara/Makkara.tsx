import { useState } from 'react';
import { useGameLanguage } from './useGameLanguage';
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
  const L = STRINGS[lang];

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
          onBegin={() => setScreen('play')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'play' && (
        <PlayScreen L={L} onBack={() => setScreen('title')} />
      )}

      {screen === 'end' && (
        <EndScreen
          L={L}
          ending="hyvaksynyt"
          peace={50}
          choices={0}
          onRestart={() => setScreen('title')}
          onLeaderboard={() => setScreen('leaderboard')}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen L={L} onBack={() => setScreen('title')} />
      )}
    </div>
  );
}
