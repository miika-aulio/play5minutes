import { useEffect, useState } from 'react';
import type { LangStrings, EndingKey } from '../content';
import { ENDING_TIER } from '../content';
import { fetchLeaderboard, type ScoreRow } from '../../../shared/supabase';

interface Props {
  L: LangStrings;
  onBack: () => void;
}

type Status = 'loading' | 'ok' | 'empty' | 'error';

export default function LeaderboardScreen({ L, onBack }: Props) {
  const [status, setStatus] = useState<Status>('loading');
  const [rows, setRows] = useState<ScoreRow[]>([]);

  useEffect(() => {
    // Peruutusliiputin varmistaa, ettei tila päivity jos komponentti
    // unmount-taa ennen kuin kutsu valmistuu.
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLeaderboard('makkara', 20);
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
    <div className="makkara-leaderboard">
      <div className="makkara-lb-head">
        <div className="makkara-kicker">{L.lbKicker}</div>
        <h2 className="makkara-end-title">{L.lbTitle}</h2>
        <div className="makkara-kicker">{L.lbShared}</div>
      </div>

      <div className="makkara-lb-body">
        {status === 'loading' && (
          <div className="makkara-lb-msg">{L.lbLoading}</div>
        )}
        {status === 'empty' && (
          <div className="makkara-lb-msg">{L.lbEmpty}</div>
        )}
        {status === 'error' && (
          <div className="makkara-lb-msg">{L.lbError}</div>
        )}
        {status === 'ok' && (
          <table className="makkara-lb-table">
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
                // meta tulee jsonb-sarakkeesta; muotoilemme turvallisesti
                const ending = (row.meta?.ending as EndingKey) ?? 'hyvaksynyt';
                const peace = (row.meta?.peace as number) ?? 0;
                const tier = ENDING_TIER[ending] ?? 3;
                return (
                  <tr key={row.id}>
                    <td className="makkara-lb-rank">{i + 1}</td>
                    <td className="makkara-lb-name">{row.name}</td>
                    <td className={`makkara-lb-verdict tier-${tier}`}>
                      {L.endingShort[ending]}
                    </td>
                    <td className="makkara-lb-peace">{peace}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="makkara-end-actions" style={{ justifyContent: 'center' }}>
        <button className="makkara-btn" onClick={onBack}>
          {L.lbBack}
        </button>
      </div>
    </div>
  );
}
