import { useEffect, useState } from 'react';
import type { Language } from './content';

const STORAGE_KEY = 'makkara-lang';

function detectInitialLang(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fi' || saved === 'en') return saved;
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('fi')) return 'fi';
  } catch {
    // localStorage ei saatavilla (privaattitila yms.) — hyväksytään hiljaisesti
  }
  return 'en';
}

export function useGameLanguage() {
  const [lang, setLangState] = useState<Language>(() => detectInitialLang());

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ei-kriittinen virhe
    }
  };

  // Pidä <html lang=".."> synkassa pelin kielen kanssa
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return { lang, setLang };
}
