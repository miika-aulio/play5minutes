import { useState } from 'react';
import type { Strings, EndingKey } from '../content';
import { ENDING_TIER } from '../content';
import { ENDINGS } from '../gameData';
import { submitScore } from '../../../shared/supabase';

interface Props {
  L: Strings;
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

  const endingContent = ENDINGS[ending];

  async function handleSubmit() {
    setStatus('submitting');
    try {
      const score = ENDING_TIER[ending] * 1000 + peace;
      const finalName = name.trim() || L.anonymous;
      await submitScore('grilled', finalName, score, {
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
    <div className="grilled-end">
      <div className="grilled-kicker">{L.endKicker}</div>
      <h2 className="grilled-end-title">{endingContent.title}</h2>
      <p className="grilled-end-text">{endingContent.text}</p>
      <div className="grilled-end-stats">{L.formatStats(peace, choices)}</div>

      {status !== 'done' ? (
        <div className="grilled-submit-form">
          <div className="grilled-kicker">{L.submitNote}</div>
          <input
            className="grilled-name-input"
            placeholder={L.namePlaceholder}
            maxLength={16}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'submitting'}
          />
          <button
            className="grilled-btn"
            onClick={handleSubmit}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? L.lbLoading : L.submitBtn}
          </button>
          {status === 'error' && (
            <div className="grilled-submit-feedback error">{L.submitErr}</div>
          )}
        </div>
      ) : (
        <div className="grilled-submit-feedback ok">{L.submitOk}</div>
      )}

      <div className="grilled-end-actions">
        <button className="grilled-btn" onClick={onLeaderboard}>
          {L.lbTitle}
        </button>
        <button className="grilled-btn" onClick={onRestart}>
          {L.restartBtn}
        </button>
      </div>
    </div>
  );
}
