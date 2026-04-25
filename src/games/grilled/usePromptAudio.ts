import { useEffect, useRef } from 'react';
import type { UIState } from './useGameState';
import { PROMPTS } from './gameData';

// Soittaa monologin, ambient-rivin tai passivity-rivin ääniraidan.
//
// Tiedostot:
//   public/audio/p{phaseIdx}-{promptIdx}.mp3   (monologit)
//   public/audio/a{phaseIdx}-{ambientIdx}.mp3  (ambient)
//   public/audio/x{phaseIdx}.mp3               (passivity; yksi per vaihe)

const AUDIO_VOLUME = 0.95;

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

  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : AUDIO_VOLUME;
    }
  }, [muted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const src = resolveAudioSrc(ui.phase, ui.phaseIdx, ui.promptIdx, ui.thought);
    if (!src) return;

    const audio = new Audio(src);
    audio.volume = mutedRef.current ? 0 : AUDIO_VOLUME;
    audio.play().catch(() => {
      // Tiedosto puuttuu tai autoplay estetty — hiljainen ohitus
    });
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, [ui.phase, ui.phaseIdx, ui.promptIdx, ui.thought]);
}
