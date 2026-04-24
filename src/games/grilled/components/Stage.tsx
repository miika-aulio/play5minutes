import { useEffect, useRef } from 'react';

interface Props {
  doneness: number;
  pulseKey: number;
}

const FLAME_COUNT = 22;
const GRATE_COUNT = 5;

export default function Stage({ doneness, pulseKey }: Props) {
  const sausageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pulseKey === 0 || !sausageRef.current) return;
    const el = sausageRef.current;
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
    const timer = setTimeout(() => el.classList.remove('pulse'), 700);
    return () => clearTimeout(timer);
  }, [pulseKey]);

  const sausageStyle: React.CSSProperties = {
    ['--sh' as string]: `${18 - doneness * 4}`,
    ['--ss' as string]: `${55 - doneness * 25}%`,
    ['--sl' as string]: `${62 - doneness * 48}%`,
  };

  return (
    <div className="grilled-stage">
      <div className="grilled-grill">
        <div className="grilled-embers" />
        <div className="grilled-flames">
          {Array.from({ length: FLAME_COUNT }).map((_, i) => (
            <span
              key={i}
              className="grilled-flame"
              style={{
                left: `${(i / (FLAME_COUNT - 1)) * 100}%`,
                animationDelay: `${(i * 1.6) / FLAME_COUNT}s`,
                animationDuration: `${1.2 + ((i * 37) % 100) / 120}s`,
                height: `${20 + ((i * 53) % 100) / 6}px`,
              }}
            />
          ))}
        </div>
        <div ref={sausageRef} className="grilled-sausage" style={sausageStyle} />
        <div className="grilled-grates">
          {Array.from({ length: GRATE_COUNT }).map((_, i) => (
            <span
              key={i}
              className="grilled-grate"
              style={{ top: `${(i / (GRATE_COUNT - 1)) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
