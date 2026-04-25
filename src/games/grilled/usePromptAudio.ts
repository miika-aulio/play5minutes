import { useEffect, useRef } from 'react';
import type { UIState } from './useGameState';
import { PROMPTS, LAST_WORDS_HIGH, LAST_WORDS_MID, LAST_WORDS_LOW } from './gameData';

// Soittaa monologin, ambient-rivin, passivity-rivin tai last-words-rivin ääniraidan.
//
// Tiedostot:
//   public/audio/p{phaseIdx}-{promptIdx}.mp3   (monologit)
//   public/audio/a{phaseIdx}-{ambientIdx}.mp3  (ambient)
//   public/audio/x{phaseIdx}.mp3               (passivity; yksi per vaihe)
//   public/audio/last-high.mp3                 (last words, peace ≥ 70)
//   public/audio/last-mid.mp3                  (last words, peace 40–69)
//   public/audio/last-low.mp3                  (last words, peace < 40)

const AUDIO_VOLUME = 0.95;
const PLAYBACK_START_DELAY_MS = 250; // pieni viive jotta edellinen ehtii pysähtyä

function findAmbientIndex(phaseIdx: number, thought: string): number {
  const phase = PROMPTS[phaseIdx];
  if (!phase) return -1;
  return phase.ambient.indexOf(thought);
}

function resolveAudioSrc(
  phase: UIState['phase'],
  phaseIdx: number,
  promptIdx: number,
  thought: string | null,
): string | null {
  if (phase === 'prompt') {
    return `/audio/p${phaseIdx}-${promptIdx}.mp3`;
  }
  if (phase === 'passivity') {
    return `/audio/x${phaseIdx}.mp3`;
  }
  if (phase === 'last-words' && thought) {
    if (thought === LAST_WORDS_HIGH) return '/audio/last-high.mp3';
    if (thought === LAST_WORDS_MID) return '/audio/last-mid.mp3';
    if (thought === LAST_WORDS_LOW) return '/audio/last-low.mp3';
    return null;
  }
  if (phase === 'ambient' && thought) {
    const idx = findAmbientIndex(phaseIdx, thought);
    if (idx < 0) return null;
    return `/audio/a${phaseIdx}-${idx}.mp3`;
  }
  return null;
}

export function usePromptAudio(ui: UIState, muted: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted);

  // Pidä mutedRef synkassa ja sovella nykyiseen toistoon
  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : AUDIO_VOLUME;
    }
  }, [muted]);

  useEffect(() => {
    // Pysäytä edellinen heti
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = ''; // vapauta lataus jos kesken
      audioRef.current = null;
    }

    const src = resolveAudioSrc(ui.phase, ui.phaseIdx, ui.promptIdx, ui.thought);
    if (!src) return;

    // Pieni viive antaa edellisen Audio-objektin pysähtyä rauhassa
    // ennen kuin uusi alkaa toistua. Estää lyhyen päällekkäisyyden.
    const startTimer = setTimeout(() => {
      const audio = new Audio(src);
      audio.volume = mutedRef.current ? 0 : AUDIO_VOLUME;
      audio.play().catch(() => {
        // Tiedosto puuttuu tai autoplay estetty — hiljainen ohitus
      });
      audioRef.current = audio;
    }, PLAYBACK_START_DELAY_MS);

    return () => {
      clearTimeout(startTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [ui.phase, ui.phaseIdx, ui.promptIdx, ui.thought]);
}
