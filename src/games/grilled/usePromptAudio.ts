import { useEffect, useRef } from 'react';
import type { UIState } from './useGameState';
import { PROMPTS, LAST_WORDS_HIGH, LAST_WORDS_MID, LAST_WORDS_LOW } from './gameData';

// Soittaa monologin, ambient-rivin, passivity-rivin tai last-words-rivin
// ääniraidan käyttäen YHTÄ jaettua <audio>-elementtiä.
//
// Tärkeä periaate: jos uusi ääni pyydetään mutta nykyinen on vielä
// soimassa, *odotetaan kunnes nykyinen päättyy* ennen uuden aloittamista.
// Tämä estää ambient-rivien pilkkoutumisen kun seuraava tila vaihtuu
// ennen kuin nykyinen ääni on ehtinyt loppua.
//
// Poikkeus: jos uusi tila on 'prompt' tai 'release' (eli pelaaja teki
// valinnan), katkaistaan vanha heti. Pelaajan valinta ei saa odottaa.
//
// Tiedostot:
//   public/audio/p{phaseIdx}-{promptIdx}.mp3   (monologit)
//   public/audio/a{phaseIdx}-{ambientIdx}.mp3  (ambient)
//   public/audio/x{phaseIdx}.mp3               (passivity)
//   public/audio/last-high.mp3 / last-mid.mp3 / last-low.mp3

const AUDIO_VOLUME = 0.95;

let sharedAudio: HTMLAudioElement | null = null;

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = 'auto';
    sharedAudio.volume = AUDIO_VOLUME;
  }
  return sharedAudio;
}

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

// Tilatasoiset prioriteetit: kuinka tärkeästi uusi ääni saa katkaista vanhan.
// Korkeampi luku = saa katkaista. Sama tai pienempi = odota nykyisen loppua.
function priority(phase: UIState['phase']): number {
  switch (phase) {
    case 'prompt':     return 100; // pelaajan valinta käynnistyi → uusi ääni heti
    case 'release':    return 100; // erikoisvalinta → uusi ääni heti
    case 'passivity':  return 90;  // järjestelmä keskeyttää passiivisen pelaajan
    case 'ambient':    return 50;  // taustalauseet kunnioittavat toisiaan
    case 'last-words': return 30;  // pelin loppu — saa odottaa luonnollista hetkeä
    default:           return 0;
  }
}

export function isPromptAudioPlaying(): boolean {
  if (!sharedAudio) return false;
  return !sharedAudio.paused && !sharedAudio.ended && sharedAudio.currentTime > 0;
}

export function usePromptAudio(ui: UIState, muted: boolean) {
  const mutedRef = useRef(muted);
  const pendingSrcRef = useRef<string | null>(null);
  const pendingPriorityRef = useRef<number>(0);

  // Sovella mute-tila jaettuun elementtiin
  useEffect(() => {
    mutedRef.current = muted;
    const audio = getSharedAudio();
    audio.volume = muted ? 0 : AUDIO_VOLUME;
  }, [muted]);

  useEffect(() => {
    const src = resolveAudioSrc(ui.phase, ui.phaseIdx, ui.promptIdx, ui.thought);
    const audio = getSharedAudio();
    const newPriority = priority(ui.phase);

    // Ei soitettavaa: pysäytä varmuuden vuoksi vain jos nykyinen on
    // myös tyhjä-vastaava (ei 'prompt' tai 'ambient' jne.). Muuten anna
    // edellisen jatkua loppuun.
    if (!src) {
      // 'idle' tai 'ended' tai 'transition' jne. — älä häiritse nykyistä
      // toistoa, jos sellainen on käynnissä. Nykyinen pysäytetään
      // tilakoneen luonnollisen siirtymän kautta seuraavalla muutoksella.
      pendingSrcRef.current = null;
      return;
    }

    // Onko nykyinen ääni vielä soimassa?
    const currentlyPlaying = !audio.paused && !audio.ended && audio.currentTime > 0;

    if (currentlyPlaying && newPriority < 90) {
      // Uusi ääni odottaa nykyisen loppua.
      // Tallenna pyyntö ja kuuntele 'ended'-tapahtumaa.
      pendingSrcRef.current = src;
      pendingPriorityRef.current = newPriority;

      const playWhenReady = () => {
        // Tarkista että pyyntö on yhä voimassa (uudempi pyyntö ei ohittanut)
        if (pendingSrcRef.current !== src) return;
        const a = getSharedAudio();
        a.pause();
        a.currentTime = 0;
        a.src = src;
        a.volume = mutedRef.current ? 0 : AUDIO_VOLUME;
        a.play().catch(() => {});
        pendingSrcRef.current = null;
      };

      audio.addEventListener('ended', playWhenReady, { once: true });

      return () => {
        audio.removeEventListener('ended', playWhenReady);
      };
    }

    // Ei mitään soimassa, tai uusi pyyntö on tärkeämpi → toista heti
    pendingSrcRef.current = null;
    audio.pause();
    audio.currentTime = 0;
    audio.src = src;
    audio.volume = mutedRef.current ? 0 : AUDIO_VOLUME;
    audio.play().catch(() => {});
  }, [ui.phase, ui.phaseIdx, ui.promptIdx, ui.thought]);
}
