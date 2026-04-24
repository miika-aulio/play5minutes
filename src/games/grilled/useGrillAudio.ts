import { useEffect, useRef, useState } from 'react';

// Grillin ritinä soitetaan taustalla kun peli on aktiivinen.
// Selaimet estävät autoplayn: ääni startataan vasta kun käyttäjä
// on tehnyt käyttäjäeleen (esim. klikannut "Step onto the grill").

const STORAGE_KEY = 'grilled-muted';
const DEFAULT_VOLUME = 0.4;

function readInitialMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function useGrillAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMutedState] = useState<boolean>(readInitialMuted);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio('/grill.mp3');
    audio.loop = true;
    audio.volume = muted ? 0 : DEFAULT_VOLUME;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : DEFAULT_VOLUME;
    }
  }, [muted]);

  function start() {
    const audio = audioRef.current;
    if (!audio) return;
    setStarted(true);
    audio.play().catch(() => {
      // Selain esti toiston — käyttäjä voi yrittää uudelleen
    });
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    setStarted(false);
    audio.pause();
    audio.currentTime = 0;
  }

  function setMuted(next: boolean) {
    setMutedState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ei-kriittinen
    }
  }

  function toggleMuted() {
    setMuted(!muted);
  }

  return { muted, setMuted, toggleMuted, start, stop, started };
}
