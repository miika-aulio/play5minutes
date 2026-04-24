import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../shared/supabase';

const GAMES = [
  {
    id: 'makkara',
    title: 'Sausage',
    subtitle: 'a grilling simulator about acceptance',
    path: '/makkara',
    duration: '~3 min',
  },
];

export default function Home() {
  const [connStatus, setConnStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

  useEffect(() => {
    (async () => {
      const { error } = await supabase.from('scores').select('id').limit(1);
      setConnStatus(error ? 'fail' : 'ok');
    })();
  }, []);

  return (
    <div className="home">
      <h1 className="home-title">play 5 minutes</h1>
      <p className="home-tag">Small games. None longer than five minutes.</p>

      <ul className="game-list">
        {GAMES.map(g => (
          <li key={g.id} className="game-card">
            <Link to={g.path}>
              <div className="game-card-head">
                <h2>{g.title}</h2>
                <span className="duration">{g.duration}</span>
              </div>
              <p>{g.subtitle}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className={`conn-status ${connStatus}`}>
        Supabase: {connStatus === 'checking' ? '…' : connStatus === 'ok' ? 'connected' : 'not connected'}
      </div>
    </div>
  );
}
