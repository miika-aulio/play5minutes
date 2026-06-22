import { useEffect, useRef, useState } from 'react';
import type { EndingKey } from './content';
import type { Choice } from './gameData';
import { PROMPTS, RELEASE, PASSIVITY, pickLastWords } from './gameData';
import { isPromptAudioPlaying } from './usePromptAudio';

// ═══════════════════════════════════════════════════════════════
//  VAKIOT
// ═══════════════════════════════════════════════════════════════

const TOTAL_SECONDS = 300; // 5 min
const PHASE_THRESHOLDS = [0, 0.2, 0.4, 0.6, 0.8] as const;

const FIRST_PROMPT_DELAY = 800;
const NEXT_PROMPT_DELAY = 2200;
const PHASE_ADVANCE_DELAY = 1500;
const AMBIENT_CYCLE_DELAY = 7000;
const RELEASE_FADE_DELAY = 1800;
const ABSURDI_CHANCE = 0.03;

// Last words: kun kypsyys saavuttaa 95%, peli odottaa nykyisen
// ambient/monologin loppua, sitten näyttää viimeisen rivin.
// Samalla ruutu fadettuu mustaksi 3s kuluessa, ääni puhuu fade-ajan,
// ja vasta sen jälkeen siirrytään End-ruutuun.
const LAST_WORDS_TRIGGER_DONENESS = 0.95;
const LAST_WORDS_FADE_MS = 3000;       // ruutu fadettuu mustaksi 3s ajan
const LAST_WORDS_HOLD_MS = 1500;       // 1.5s mustaa hiljaisuutta jälkeen

// Passiivisuus-mekaniikka
const IDLE_DECAY_AFTER_MS = 10000;        // 10s passiivisuuden jälkeen peace alkaa laskea
const PASSIVITY_TRIGGER_AFTER_MS = 18000; // 18s jälkeen laukeaa passivity-monologi (kerran per vaihe)
const PASSIVITY_DISPLAY_MS = 6000;        // passivity-monologi näkyy ~6s ennen etenemistä
const IDLE_DECAY_RATE_PER_SEC = 1;        // peace-lasku / sek passiivisuudessa

// ═══════════════════════════════════════════════════════════════
//  TYYPIT
// ═══════════════════════════════════════════════════════════════

type GamePhase = 'idle' | 'prompt' | 'ambient' | 'release' | 'passivity' | 'last-words' | 'ended';

type MachineState = {
  running: boolean;
  phase: GamePhase;
  doneness: number;
  peace: number;
  phaseIdx: number;
  promptIdx: number;
  ambientIdx: number;
  ambientOrder: number[];
  choicesMade: number;
  waitingChoice: boolean;
  released: boolean;
  endingKey: EndingKey | null;
  pulseKey: number;
  idleStartedAt: number | null;
  passivityFiredInPhase: boolean;
  lastWordsText: string | null;
  lastWordsScheduled: boolean;
  phaseChangePending: number | null;
  fadeStartedAt: number | null;        // milloin fade-to-black alkoi (last-words)
};

export type UIState = {
  doneness: number;
  peace: number;
  phaseIdx: number;
  promptIdx: number;
  choicesMade: number;
  phase: GamePhase;
  thought: string | null;
  choices: Choice[] | null;
  waitingChoice: boolean;
  endingKey: EndingKey | null;
  pulseKey: number;
  fadeProgress: number;     // 0..1, last-words fade-to-black
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
    ambientOrder: [],
    choicesMade: 0,
    waitingChoice: false,
    released: false,
    endingKey: null,
    pulseKey: 0,
    idleStartedAt: null,
    passivityFiredInPhase: false,
    lastWordsText: null,
    lastWordsScheduled: false,
    phaseChangePending: null,
    fadeStartedAt: null,
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
    fadeProgress: 0,
  };
}

function deriveThought(m: MachineState): string | null {
  if (m.phase === 'idle' || m.phase === 'ended') return null;
  if (m.phase === 'last-words') return m.lastWordsText;
  if (m.phase === 'release') return RELEASE.thought;
  if (m.phase === 'passivity') return PASSIVITY[m.phaseIdx] ?? null;
  if (m.phase === 'ambient') {
    const phase = PROMPTS[m.phaseIdx];
    if (!phase || phase.ambient.length === 0) return null;
    // Käytä sekoitettua järjestystä jos käytettävissä, muuten suora indeksi
    const orderLen = m.ambientOrder.length;
    const realIdx =
      orderLen > 0
        ? m.ambientOrder[m.ambientIdx % orderLen]
        : m.ambientIdx % phase.ambient.length;
    return phase.ambient[realIdx];
  }
  const phase = PROMPTS[m.phaseIdx];
  const prompt = phase.prompts[m.promptIdx];
  return prompt ? prompt.text : null;
}

// Fisher-Yates shuffle — palauttaa uuden taulukon indeksejä [0..n-1]
// satunnaisessa järjestyksessä.
function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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
    // Laske fade-edistyminen 0..1 fadeStartedAt-aikaleimasta
    let fadeProgress = 0;
    if (m.fadeStartedAt !== null) {
      const elapsed = performance.now() - m.fadeStartedAt;
      fadeProgress = Math.min(1, elapsed / LAST_WORDS_FADE_MS);
    }
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
      fadeProgress,
    });
  }

  function tick(now: number) {
    const m = machineRef.current;
    if (!m.running) return;

    const dt = Math.min((now - lastTickRef.current) / 1000, 1);
    lastTickRef.current = now;
    m.doneness = Math.min(1, m.doneness + dt / TOTAL_SECONDS);

    // Passiivisuus-mekaniikka: odottaako pelaaja valintaa liian kauan?
    if (
      m.phase === 'prompt' &&
      m.waitingChoice &&
      m.idleStartedAt !== null
    ) {
      const idleMs = now - m.idleStartedAt;

      // Peace-lasku 10 sekunnin jälkeen
      if (idleMs > IDLE_DECAY_AFTER_MS) {
        m.peace = Math.max(0, m.peace - IDLE_DECAY_RATE_PER_SEC * dt);
      }

      // Passivity-monologi 18 sekunnin jälkeen (kerran per vaihe)
      if (idleMs > PASSIVITY_TRIGGER_AFTER_MS && !m.passivityFiredInPhase) {
        firePassivity();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
    }

    // Vaihekynnysten tarkistus
    let targetPhase = 0;
    for (let i = PHASE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (m.doneness >= PHASE_THRESHOLDS[i]) {
        targetPhase = i;
        break;
      }
    }
    if (targetPhase > m.phaseIdx) {
      // Deferred: ambient, passivity ja mid-prompt odottavat seuraavaa
      // showNextPrompt-kutsua ennen vaiheen vaihtamista. Näin vaihtoon
      // liittyvä promptIdx-nollaus tapahtuu oikeaan aikaan eikä choose()
      // ohita uuden vaiheen ensimmäistä monologia.
      if (m.phase === 'ambient' || m.phase === 'passivity' || m.waitingChoice) {
        m.phaseChangePending = targetPhase;
      } else {
        applyPhaseChange(targetPhase);
      }
    }

    // Kypsyys jäätyy 95%:iin kun last-words on aikataulutettu —
    // peli ei pääty ennen kuin viimeinen rivi on luettu.
    if (m.lastWordsScheduled) {
      m.doneness = Math.min(m.doneness, LAST_WORDS_TRIGGER_DONENESS);
    }

    // Last words -laukaisu kun kypsyys saavuttaa 95%:
    // - Aikataulutetaan vain kerran (lastWordsScheduled-flag)
    // - Lopullinen teksti valitaan triggerLastWords-funktiossa
    //   peace-arvon perusteella (joka voi vielä muuttua valinnalla)
    if (
      !m.lastWordsScheduled &&
      m.doneness >= LAST_WORDS_TRIGGER_DONENESS
    ) {
      m.lastWordsScheduled = true;
      // Passivity ja mid-prompt odottavat seuraavaa showNextPrompt-kutsua.
      // Release-tilassa pelaaja on saanut mahdollisuutensa — siirrytään heti.
      if (m.phase === 'passivity' || (m.waitingChoice && m.phase === 'prompt')) {
        // showNextPrompt tai choose kutsuvat triggerLastWords myöhemmin
      } else {
        if (m.phase === 'release') m.waitingChoice = false;
        triggerLastWords();
      }
    }

    syncUI();
    rafRef.current = requestAnimationFrame(tick);
  }

  // Aloita last-words-näyttö: vaihda tila, näytä rivi ja aikatauluta
  // siirtyminen End-ruutuun.
  function triggerLastWords() {
    const m = machineRef.current;
    if (m.phase === 'last-words' || m.phase === 'ended') return;

    clearTimer();
    m.phase = 'last-words';
    m.waitingChoice = false;
    m.idleStartedAt = null;
    m.lastWordsText = pickLastWords(m.peace); // tuoreet peace-arvot
    m.fadeStartedAt = performance.now();      // aloita fade-to-black samanaikaisesti
    syncUI();

    // Odota vähintään fade-animaatio (3s), sitten ääniklippi loppuun
    // (polling — ei oletuksia tiedoston pituudesta), sitten 1.5s hiljaisuutta.
    function waitForEnd() {
      const fadeElapsed = performance.now() - (machineRef.current.fadeStartedAt ?? 0);
      if (fadeElapsed < LAST_WORDS_FADE_MS || isPromptAudioPlaying()) {
        timerRef.current = setTimeout(waitForEnd, 100);
      } else {
        timerRef.current = setTimeout(() => endGame(), LAST_WORDS_HOLD_MS);
      }
    }
    timerRef.current = setTimeout(waitForEnd, 100);
  }

  function schedulePrompt(delay: number) {
    clearTimer();
    timerRef.current = setTimeout(showNextPrompt, delay);
  }

  // Suorittaa vaiheen vaihdon. Tätä kutsutaan joko suoraan tickistä
  // (jos pelaaja ei ole ambient/passivity-tilassa) tai showNextPrompt:sta
  // kun viivästetty vaihto on aikataulutettu.
  function applyPhaseChange(targetPhase: number) {
    const m = machineRef.current;
    m.phaseIdx = targetPhase;
    m.promptIdx = 0;
    m.ambientIdx = 0;
    m.ambientOrder = shuffledIndices(PROMPTS[targetPhase].ambient.length);
    m.passivityFiredInPhase = false;
    m.phaseChangePending = null;
    if (!m.waitingChoice) {
      schedulePrompt(PHASE_ADVANCE_DELAY);
    }
  }

  function showNextPrompt() {
    const m = machineRef.current;
    if (!m.running) return;

    // Jos vaiheen vaihto on viivästetty (esim. odotettiin että ambient-rivi
    // ehtii loppua), suorita se nyt ennen muuta logiikkaa.
    if (m.phaseChangePending !== null && m.phaseChangePending > m.phaseIdx) {
      const target = m.phaseChangePending;
      applyPhaseChange(target);
      // applyPhaseChange aikatauluttaa seuraavan promptin omilla viiveillään,
      // joten poistutaan tästä funktiosta.
      return;
    }

    // Jos last-words on jo aikataulutettu, siirrytään suoraan siihen
    // sen sijaan että näytettäisiin uutta promptia tai ambienttia.
    if (m.lastWordsScheduled) {
      triggerLastWords();
      return;
    }

    // Vaihe 5 + mielenrauha ≥ 95 → tarjoa vapautuminen (kerran)
    if (m.phaseIdx === 4 && m.peace >= 95 && !m.released) {
      m.released = true;
      m.phase = 'release';
      m.waitingChoice = true;
      m.idleStartedAt = null;
      syncUI();
      return;
    }

    const phase = PROMPTS[m.phaseIdx];
    if (m.promptIdx >= phase.prompts.length) {
      m.phase = 'ambient';
      m.waitingChoice = false;
      m.idleStartedAt = null;
      syncUI();
      m.ambientIdx++;
      schedulePrompt(AMBIENT_CYCLE_DELAY);
      return;
    }

    m.phase = 'prompt';
    m.waitingChoice = true;
    m.idleStartedAt = performance.now();
    syncUI();
  }

  // Passivity-monologi laukeaa kun pelaaja on odottanut liian kauan.
  // Näyttää tekstin ~4 sekuntia, sitten etenee seuraavaan prompttiin.
  function firePassivity() {
    const m = machineRef.current;
    m.phase = 'passivity';
    m.waitingChoice = false;
    m.idleStartedAt = null;
    m.passivityFiredInPhase = true;
    // Passiivisuus etenee "virtuaalisena valintana": promptIdx kasvaa,
    // mutta peace ei muutu (pelaaja ei ole tehnyt valintaa, vain menettänyt mahdollisuuden)
    m.promptIdx++;
    syncUI();

    clearTimer();
    timerRef.current = setTimeout(() => {
      showNextPrompt();
    }, PASSIVITY_DISPLAY_MS);
  }

  function start() {
    clearAll();
    machineRef.current = {
      ...initialMachine(),
      running: true,
      ambientOrder: shuffledIndices(PROMPTS[0].ambient.length),
    };
    syncUI();
    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    schedulePrompt(FIRST_PROMPT_DELAY);
  }

  function choose(choice: Choice) {
    const m = machineRef.current;
    if (!m.waitingChoice) return;

    m.waitingChoice = false;
    m.idleStartedAt = null;
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
