import { useEffect, useState } from 'react';
import type { Strings, EndingKey } from '../content';
import { ENDING_TIER } from '../content';
import { fetchLeaderboard, type ScoreRow } from '../../../shared/supabase';

interface Props {
  L: Strings;
  onBack: () => void;
}

type Status = 'loading' | 'ok' | 'empty' | 'error';

export default function LeaderboardScreen({ L, onBack }: Props) {
  const [status, setStatus] = useState<Status>('loading');
  const [rows, setRows] = useState<ScoreRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLeaderboard('grilled', 20);
        if (cancelled) return;
        if (data.length === 0) {
          setStatus('empty');
        } else {
          setRows(data);
          setStatus('ok');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grilled-leaderboard">
      <div className="grilled-lb-head">
        <div className="grilled-kicker">{L.lbKicker}</div>
        <h2 className="grilled-end-title">{L.lbTitle}</h2>
        <div className="grilled-kicker">{L.lbShared}</div>
      </div>

      <div className="grilled-lb-body">
        {status === 'loading' && (
          <div className="grilled-lb-msg">{L.lbLoading}</div>
        )}
        {status === 'empty' && (
          <div className="grilled-lb-msg">{L.lbEmpty}</div>
        )}
        {status === 'error' && (
          <div className="grilled-lb-msg">{L.lbError}</div>
        )}
        {status === 'ok' && (
          <table className="grilled-lb-table">
            <thead>
              <tr>
                <th>{L.lbRank}</th>
                <th>{L.lbName}</th>
                <th>{L.lbVerdict}</th>
                <th style={{ textAlign: 'right' }}>{L.lbPeace}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const ending = (row.meta?.ending as EndingKey) ?? 'hyvaksynyt';
                const peace = (row.meta?.peace as number) ?? 0;
                const tier = ENDING_TIER[ending] ?? 3;
                return (
                  <tr key={row.id}>
                    <td className="grilled-lb-rank">{i + 1}</td>
                    <td className="grilled-lb-name">{row.name}</td>
                    <td className={`grilled-lb-verdict tier-${tier}`}>
                      {L.endingShort[ending]}
                    </td>
                    <td className="grilled-lb-peace">{peace}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="grilled-end-actions"
        style={{ justifyContent: 'center' }}
      >
        <button className="grilled-btn" onClick={onBack}>
          {L.lbBack}
        </button>
      </div>
    </div>
  );
}
