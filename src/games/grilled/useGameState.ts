import { useEffect, useRef, useState } from 'react';
import type { EndingKey } from './content';
import type { Choice } from './gameData';
import { PROMPTS, RELEASE } from './gameData';

// ═══════════════════════════════════════════════════════════════
//  VAKIOT
// ═══════════════════════════════════════════════════════════════

const TOTAL_SECONDS = 300;
const PHASE_THRESHOLDS = [0, 0.2, 0.4, 0.6, 0.8] as const;

const FIRST_PROMPT_DELAY = 800;
const NEXT_PROMPT_DELAY = 2200;
const PHASE_ADVANCE_DELAY = 400;
const AMBIENT_CYCLE_DELAY = 5500;
const END_FADE_DELAY = 1500;
const RELEASE_FADE_DELAY = 1800;
const ABSURDI_CHANCE = 0.03;

// ═══════════════════════════════════════════════════════════════
//  TYYPIT
// ═══════════════════════════════════════════════════════════════

type GamePhase = 'idle' | 'prompt' | 'ambient' | 'release' | 'ended';

type MachineState = {
  running: boolean;
  phase: GamePhase;
  doneness: number;
  peace: number;
  phaseIdx: number;
  promptIdx: number;
  ambientIdx: number;
  choicesMade: number;
  waitingChoice: boolean;
  released: boolean;
  endingKey: EndingKey | null;
  pulseKey: number;
};

export type UIState = {
  doneness: number;
  peace: number;
  phaseIdx: number;
  promptIdx: number;         // ← lisätty ääni-integraatiota varten
  choicesMade: number;
  phase: GamePhase;
  thought: string | null;
  choices: Choice[] | null;
  waitingChoice: boolean;
  endingKey: EndingKey | null;
  pulseKey: number;
};

// ═══════════════════════════════════════════════════════════════
//  APURIT
// ═══════════════════════════════════════════════════════════════

function initialMachine(): MachineState {
  return {
    running: false,
    phase: 'idle',
    doneness: 0,
    peace: 50,
    phaseIdx: 0,
    promptIdx: 0,
    ambientIdx: 0,
    choicesMade: 0,
    waitingChoice: false,
    released: false,
    endingKey: null,
    pulseKey: 0,
  };
}

function initialUI(): UIState {
  return {
    doneness: 0,
    peace: 50,
    phaseIdx: 0,
    promptIdx: 0,
    choicesMade: 0,
    phase: 'idle',
    thought: null,
    choices: null,
    waitingChoice: false,
    endingKey: null,
    pulseKey: 0,
  };
}

function deriveThought(m: MachineState): string | null {
  if (m.phase === 'idle' || m.phase === 'ended') return null;
  if (m.phase === 'release') return RELEASE.thought;
  if (m.phase === 'ambient') {
    const phase = PROMPTS[m.phaseIdx];
    return phase.ambient[m.ambientIdx % phase.ambient.length];
  }
  const phase = PROMPTS[m.phaseIdx];
  const prompt = phase.prompts[m.promptIdx];
  return prompt ? prompt.text : null;
}

function deriveChoices(m: MachineState): Choice[] | null {
  if (m.phase === 'release') {
    return [
      { text: RELEASE.yes, d: 0, release: true },
      { text: RELEASE.no, d: 2 },
    ];
  }
  if (m.phase === 'prompt') {
    const phase = PROMPTS[m.phaseIdx];
    const prompt = phase.prompts[m.promptIdx];
    return prompt ? prompt.choices : null;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  HOOK
// ═══════════════════════════════════════════════════════════════

export function useGameState() {
  const [ui, setUI] = useState<UIState>(initialUI);

  const machineRef = useRef<MachineState>(initialMachine());
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTickRef = useRef<number>(0);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }
  function clearRaf() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }
  function clearAll() {
    clearRaf();
    clearTimer();
  }

  function syncUI() {
    const m = machineRef.current;
    setUI({
      doneness: m.doneness,
      peace: m.peace,
      phaseIdx: m.phaseIdx,
      promptIdx: m.promptIdx,
      choicesMade: m.choicesMade,
      phase: m.phase,
      thought: deriveThought(m),
      choices: deriveChoices(m),
      waitingChoice: m.waitingChoice,
      endingKey: m.endingKey,
      pulseKey: m.pulseKey,
    });
  }

  function tick(now: number) {
    const m = machineRef.current;
    if (!m.running) return;

    const dt = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;
    m.doneness = Math.min(1, m.doneness + dt / TOTAL_SECONDS);

    let targetPhase = 0;
    for (let i = PHASE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (m.doneness >= PHASE_THRESHOLDS[i]) {
        targetPhase = i;
        break;
      }
    }
    if (targetPhase > m.phaseIdx) {
      m.phaseIdx = targetPhase;
      m.promptIdx = 0;
      m.ambientIdx = 0;
      if (!m.waitingChoice) {
        schedulePrompt(PHASE_ADVANCE_DELAY);
      }
    }

    if (m.doneness >= 1) {
      m.running = false;
      syncUI();
      clearTimer();
      timerRef.current = setTimeout(() => endGame(), END_FADE_DELAY);
      return;
    }

    syncUI();
    rafRef.current = requestAnimationFrame(tick);
  }

  function schedulePrompt(delay: number) {
    clearTimer();
    timerRef.current = setTimeout(showNextPrompt, delay);
  }

  function showNextPrompt() {
    const m = machineRef.current;
    if (!m.running) return;

    if (m.phaseIdx === 4 && m.peace >= 95 && !m.released) {
      m.released = true;
      m.phase = 'release';
      m.waitingChoice = true;
      syncUI();
      return;
    }

    const phase = PROMPTS[m.phaseIdx];
    if (m.promptIdx >= phase.prompts.length) {
      m.phase = 'ambient';
      m.waitingChoice = false;
      syncUI();
      m.ambientIdx++;
      schedulePrompt(AMBIENT_CYCLE_DELAY);
      return;
    }

    m.phase = 'prompt';
    m.waitingChoice = true;
    syncUI();
  }

  function start() {
    clearAll();
    machineRef.current = { ...initialMachine(), running: true };
    syncUI();
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    schedulePrompt(FIRST_PROMPT_DELAY);
  }

  function choose(choice: Choice) {
    const m = machineRef.current;
    if (!m.waitingChoice) return;

    m.waitingChoice = false;
    m.peace = Math.max(0, Math.min(100, m.peace + choice.d));
    m.choicesMade++;
    m.promptIdx++;
    m.pulseKey++;

    if (choice.release) {
      syncUI();
      m.running = false;
      clearAll();
      timerRef.current = setTimeout(
        () => endGame('vapautunut'),
        RELEASE_FADE_DELAY,
      );
      return;
    }

    syncUI();
    schedulePrompt(NEXT_PROMPT_DELAY);
  }

  function endGame(override?: EndingKey) {
    const m = machineRef.current;
    m.running = false;
    clearAll();

    let key: EndingKey;
    if (override) {
      key = override;
    } else if (Math.random() < ABSURDI_CHANCE) {
      key = 'absurdi';
    } else if (m.peace >= 70) {
      key = 'kirkastunut';
    } else if (m.peace >= 40) {
      key = 'hyvaksynyt';
    } else {
      key = 'katkeroitunut';
    }

    m.endingKey = key;
    m.phase = 'ended';
    syncUI();
  }

  function reset() {
    clearAll();
    machineRef.current = initialMachine();
    syncUI();
  }

  useEffect(() => {
    return () => clearAll();
  }, []);

  return { ui, start, choose, reset };
}
