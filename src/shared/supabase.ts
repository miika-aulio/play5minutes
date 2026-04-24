import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('Supabase env vars missing. Check .env.local.');
}

export const supabase = createClient(url, anonKey);

export type ScoreRow = {
  id: string;
  game_id: string;
  name: string;
  score: number;
  meta: Record<string, unknown>;
  created_at: string;
};

export async function submitScore(
  gameId: string,
  name: string,
  score: number,
  meta: Record<string, unknown> = {}
) {
  const clean = name.trim().slice(0, 16) || 'Anonymous';
  const { error } = await supabase
    .from('scores')
    .insert({ game_id: gameId, name: clean, score, meta });
  if (error) throw error;
}

export async function fetchLeaderboard(gameId: string, limit = 20) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ScoreRow[];
}
