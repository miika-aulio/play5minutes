import { useEffect, useRef } from 'react';
import type { UIState } from './useGameState';

// Soittaa yhden monologin MP3-tiedoston kun uusi prompt näytetään.
// Tiedostot: public/audio/p{phaseIdx}-{promptIdx}.mp3 (esim. p0-0.mp3)
//
// Logiikka:
// - Ääni alkaa kun ui.phase === 'prompt' JA ui.waitingChoice === true
//   (eli uusi monologi juuri näytettiin pelaajalle).
// - Vanha ääni pysäytetään kun uusi alkaa tai kun siirrytään pois prompt-tilasta.
// - Ambient, release ja end-tilat eivät toista ääntä.
// - Mute-tila vaikuttaa välittömästi nykyiseen toistoon (volume = 0).

const AUDIO_VOLUME = 0.95;

export function usePromptAudio(ui: UIState, muted: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(muted);

  // Pidä mutedRef synkassa ja sovella volume-muutos nykyiseen toistoon
  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : AUDIO_VOLUME;
    }
  }, [muted]);

  // Uusi prompt näytetty → soita ääni
  useEffect(() => {
    // Pysäytä edellinen
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Soita vain kun käyttäjä odottaa valintaa (eli monologi on juuri näytetty)
    if (ui.phase !== 'prompt' || !ui.waitingChoice) return;

    const src = `/audio/p${ui.phaseIdx}-${ui.promptIdx}.mp3`;
    const audio = new Audio(src);
    audio.volume = mutedRef.current ? 0 : AUDIO_VOLUME;
    audio.play().catch(() => {
      // Tiedosto puuttuu tai autoplay estetty — hiljainen ohitus
    });
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, [ui.phase, ui.waitingChoice, ui.phaseIdx, ui.promptIdx]);
}
