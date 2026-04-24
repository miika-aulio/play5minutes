import { useEffect, useRef, useState } from 'react';

// Grillin ritinä saumattomana loopina Web Audio API:lla.
// HTML5 <audio> + loop=true jättää pienen tauon jokaiseen kierrokseen;
// AudioBufferSourceNode looppaa täysin saumattomasti.

const STORAGE_KEY = 'grilled-muted';
const DEFAULT_VOLUME = 0.4;

function readInitialMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

// Singleton — sama AudioContext ja buffer jaetaan komponenttien renderien yli,
// jotta React StrictMode ei aiheuta tuplaa päällekkäistä toistoa.
let sharedContext: AudioContext | null = null;
let sharedBuffer: AudioBuffer | null = null;
let bufferLoadPromise: Promise<AudioBuffer> | null = null;

function getContext(): AudioContext {
  if (!sharedContext) {
    // @ts-expect-error - webkitAudioContext on Safari < 14:n fallback
    const Ctor = window.AudioContext || window.webkitAudioContext;
    sharedContext = new Ctor();
  }
  return sharedContext;
}

async function loadBuffer(ctx: AudioContext): Promise<AudioBuffer> {
  if (sharedBuffer) return sharedBuffer;
  if (bufferLoadPromise) return bufferLoadPromise;
  bufferLoadPromise = (async () => {
    const res = await fetch('/grill.mp3');
    const arrayBuffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    sharedBuffer = audioBuffer;
    return audioBuffer;
  })();
  return bufferLoadPromise;
}

export function useGrillAudio() {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [muted, setMutedState] = useState<boolean>(readInitialMuted);
  const [started, setStarted] = useState(false);

  // Sovella mute-tila nykyiseen toistoon
  useEffect(() => {
    if (gainRef.current) {
      const ctx = getContext();
      gainRef.current.gain.setValueAtTime(
        muted ? 0 : DEFAULT_VOLUME,
        ctx.currentTime,
      );
    }
  }, [muted]);

  // Siivous unmountissa
  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch {
          // jo pysäytetty
        }
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
    };
  }, []);

  async function start() {
    const ctx = getContext();
    // Selaimet suspendoivat AudioContextin ennen käyttäjäelettä
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const buffer = await loadBuffer(ctx);

    // Jos jo soi, älä aloita toista
    if (sourceRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    // loopStart ja loopEnd implisiittisesti buffer.duration — saumaton

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(muted ? 0 : DEFAULT_VOLUME, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    sourceRef.current = source;
    gainRef.current = gain;
    setStarted(true);
  }

  function stop() {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // jo pysäytetty
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
    setStarted(false);
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
