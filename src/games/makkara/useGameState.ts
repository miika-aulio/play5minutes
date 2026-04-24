import { useEffect, useRef, useState } from 'react';
import type { Language, EndingKey } from './content';
import type { Choice } from './gameData';
import { PROMPTS, RELEASE } from './gameData';

// ═══════════════════════════════════════════════════════════════
//  VAKIOT
// ═══════════════════════════════════════════════════════════════

const TOTAL_SECONDS = 190; // ~3 min 10s (kokonaiskypsymisaika)
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

/** Sisäinen tilakone — pidetään refissä, ei triggeröi uudelleenrenderöintiä. */
type MachineState = {
  running: boolean;
  phase: GamePhase;
  doneness: number;        // 0..1
  peace: number;           // 0..100
  phaseIdx: number;        // 0..4
  promptIdx: number;       // vaiheen sisäinen monologi-indeksi
  ambientIdx: number;
  choicesMade: number;
  waitingChoice: boolean;
  released: boolean;       // onko Vapautunut-tarjous jo annettu
  endingKey: EndingKey | null;
  pulseKey: number;        // inkrementoituu joka valinnalla (makkaran pulse-animaatio)
};

/** Ulospäin näkyvä tila — tämä ohjaa React-renderöintiä. */
export type UIState = {
  doneness: number;
  peace: number;
  phaseIdx: number;
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
    choicesMade: 0,
    phase: 'idle',
    thought: null,
    choices: null,
    waitingChoice: false,
    endingKey: null,
    pulseKey: 0,
  };
}

/** Johda näytettävä ajatusteksti tilakoneen tilasta + kielestä. */
function deriveThought(m: MachineState, lang: Language): string | null {
  if (m.phase === 'idle' || m.phase === 'ended') return null;
  if (m.phase === 'release') return RELEASE[lang].thought;
  if (m.phase === 'ambient') {
    const phase = PROMPTS[lang][m.phaseIdx];
    return phase.ambient[m.ambientIdx % phase.ambient.length];
  }
  // phase === 'prompt'
  const phase = PROMPTS[lang][m.phaseIdx];
  const prompt = phase.prompts[m.promptIdx];
  return prompt ? prompt.text : null;
}

/** Johda näytettävät valintavaihtoehdot. Ambient-tilassa ei ole valintoja. */
function deriveChoices(m: MachineState, lang: Language): Choice[] | null {
  if (m.phase === 'release') {
    const r = RELEASE[lang];
    return [
      { text: r.yes, d: 0, release: true },
      { text: r.no, d: 2 },
    ];
  }
  if (m.phase === 'prompt') {
    const phase = PROMPTS[lang][m.phaseIdx];
    const prompt = phase.prompts[m.promptIdx];
    return prompt ? prompt.choices : null;
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  HOOK
// ═══════════════════════════════════════════════════════════════

export function useGameState(lang: Language) {
  const [ui, setUI] = useState<UIState>(initialUI);

  // Refs — nämä eivät triggeröi uudelleenrenderöintiä ja ovat stabiileja.
  const machineRef = useRef<MachineState>(initialMachine());
  const langRef = useRef<Language>(lang);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTickRef = useRef<number>(0);

  // ─── apurit ajastimille ────────────────────────────────────
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

  // ─── tilan julkistus ───────────────────────────────────────
  function syncUI() {
    const m = machineRef.current;
    const l = langRef.current;
    setUI({
      doneness: m.doneness,
      peace: m.peace,
      phaseIdx: m.phaseIdx,
      choicesMade: m.choicesMade,
      phase: m.phase,
      thought: deriveThought(m, l),
      choices: deriveChoices(m, l),
      waitingChoice: m.waitingChoice,
      endingKey: m.endingKey,
      pulseKey: m.pulseKey,
    });
  }

  // ─── peli-loop ─────────────────────────────────────────────
  function tick(now: number) {
    const m = machineRef.current;
    if (!m.running) return;

    const dt = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;
    m.doneness = Math.min(1, m.doneness + dt / TOTAL_SECONDS);

    // Tarkista onko ylitetty uusi vaihekynnys
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
      // Jos ei olla odottamassa valintaa, aikatauluta uusi monologi.
      // Jos odotetaan, vaihe vaihtuu taustalla mutta monologi ei keskeydy.
      if (!m.waitingChoice) {
        schedulePrompt(PHASE_ADVANCE_DELAY);
      }
    }

    // Peli päättyy kun kypsyys saavuttaa 100%
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

  // ─── monologien ajoitus ────────────────────────────────────
  function schedulePrompt(delay: number) {
    clearTimer();
    timerRef.current = setTimeout(showNextPrompt, delay);
  }

  function showNextPrompt() {
    const m = machineRef.current;
    if (!m.running) return;
    const l = langRef.current;

    // Vaihe 5 + mielenrauha ≥ 95 → tarjoa vapautuminen (kerran)
    if (m.phaseIdx === 4 && m.peace >= 95 && !m.released) {
      m.released = true;
      m.phase = 'release';
      m.waitingChoice = true;
      syncUI();
      return;
    }

    const phase = PROMPTS[l][m.phaseIdx];
    if (m.promptIdx >= phase.prompts.length) {
      // Kaikki vaiheen monologit käyty → ambient-kierto
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

  // ─── julkiset actionit ─────────────────────────────────────
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

  // ─── efektit ───────────────────────────────────────────────

  // Pidä langRef synkassa ja päivitä UI kun kieli vaihtuu
  useEffect(() => {
    langRef.current = lang;
    syncUI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Siivoa ajastimet unmountissa
  useEffect(() => {
    return () => clearAll();
  }, []);

  return { ui, start, choose, reset };
}
