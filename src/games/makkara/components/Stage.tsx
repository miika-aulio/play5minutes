import { useEffect, useRef } from 'react';

interface Props {
  doneness: number;   // 0..1
  pulseKey: number;   // inkrementoituu kun pelaaja tekee valinnan
}

const FLAME_COUNT = 22;
const GRATE_COUNT = 5;

export default function Stage({ doneness, pulseKey }: Props) {
  const sausageRef = useRef<HTMLDivElement>(null);

  // Pulssi-animaatio: kun pulseKey muuttuu, lisää .pulse-luokka hetkeksi.
  useEffect(() => {
    if (pulseKey === 0 || !sausageRef.current) return;
    const el = sausageRef.current;
    el.classList.remove('pulse');
    // Pakota reflow jotta animaatio uudelleenkäynnistyy
    void el.offsetWidth;
    el.classList.add('pulse');
    const timer = setTimeout(() => el.classList.remove('pulse'), 700);
    return () => clearTimeout(timer);
  }, [pulseKey]);

  // Makkaran väri muuttuu vaaleanpunaisesta hiiltyneeseen kypsyessä.
  const sausageStyle: React.CSSProperties = {
    // Käytetään CSS-muuttujia jotka on määritelty .makkara-sausagessa
    ['--sh' as string]: `${18 - doneness * 4}`,
    ['--ss' as string]: `${55 - doneness * 25}%`,
    ['--sl' as string]: `${62 - doneness * 48}%`,
  };

  return (
    <div className="makkara-stage">
      <div className="makkara-grill">
        <div className="makkara-embers" />
        <div className="makkara-flames">
          {Array.from({ length: FLAME_COUNT }).map((_, i) => (
            <span
              key={i}
              className="makkara-flame"
              style={{
                left: `${(i / (FLAME_COUNT - 1)) * 100}%`,
                animationDelay: `${(i * 1.6) / FLAME_COUNT}s`,
                animationDuration: `${1.2 + ((i * 37) % 100) / 120}s`,
                height: `${20 + ((i * 53) % 100) / 6}px`,
              }}
            />
          ))}
        </div>
        <div ref={sausageRef} className="makkara-sausage" style={sausageStyle} />
        <div className="makkara-grates">
          {Array.from({ length: GRATE_COUNT }).map((_, i) => (
            <span
              key={i}
              className="makkara-grate"
              style={{ top: `${(i / (GRATE_COUNT - 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
