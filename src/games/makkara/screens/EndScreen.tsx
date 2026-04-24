import { useState } from 'react';
import type { LangStrings, EndingKey } from '../content';
import { ENDING_TIER } from '../content';
import { submitScore } from '../../../shared/supabase';

interface Props {
  L: LangStrings;
  ending: EndingKey;
  peace: number;
  choices: number;
  onRestart: () => void;
  onLeaderboard: () => void;
}

type Status = 'idle' | 'submitting' | 'done' | 'error';

export default function EndScreen({
  L,
  ending,
  peace,
  choices,
  onRestart,
  onLeaderboard,
}: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit() {
    setStatus('submitting');
    try {
      // Score encoding: tier * 1000 + peace.
      // Esim. Kirkastunut (tier 4) + peace 87 -> 4087.
      // Näin yksi SQL-sarake riittää ja ORDER BY score DESC toimii suoraan.
      const score = ENDING_TIER[ending] * 1000 + peace;
      const finalName = name.trim() || L.anonymous;
      await submitScore('makkara', finalName, score, {
        ending,
        peace,
        choices,
      });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="makkara-end">
      <div className="makkara-kicker">{L.endKicker}</div>
      <h2 className="makkara-end-title">{L.endingShort[ending]}</h2>
      <div className="makkara-end-stats">{L.formatStats(peace, choices)}</div>

      {status !== 'done' ? (
        <div className="makkara-submit-form">
          <div className="makkara-kicker">{L.submitNote}</div>
          <input
            className="makkara-name-input"
            placeholder={L.namePlaceholder}
            maxLength={16}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'submitting'}
          />
          <button
            className="makkara-btn"
            onClick={handleSubmit}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? L.lbLoading : L.submitBtn}
          </button>
          {status === 'error' && (
            <div className="makkara-submit-feedback error">{L.submitErr}</div>
          )}
        </div>
      ) : (
        <div className="makkara-submit-feedback ok">{L.submitOk}</div>
      )}

      <div className="makkara-end-actions">
        <button className="makkara-btn" onClick={onLeaderboard}>
          {L.lbTitle}
        </button>
        <button className="makkara-btn" onClick={onRestart}>
          {L.restartBtn}
        </button>
      </div>
    </div>
  );
}
