type Props = {
  readonly className?: string;
  readonly tone?: 'ink' | 'cream';
  /** Derece; bandı hafif eğik koymak için */
  readonly tilt?: number;
  /** Bandın içinde akan yazı */
  readonly text?: string;
};

/** Film şeridi ayracı; isteğe bağlı eğim ve akan yazı. */
export default function FilmStrip({ className = '', tone = 'ink', tilt = 0, text }: Props) {
  const items = text ? Array.from({ length: 12 }, () => text) : [];
  return (
    <div className={`relative overflow-hidden ${className}`} aria-hidden>
      <div
        className={`film-strip ${tone === 'cream' ? 'film-strip--cream' : ''} flex h-14 items-center overflow-hidden`}
        style={{ transform: tilt ? `rotate(${tilt}deg) scaleX(1.1)` : undefined }}
      >
        {text ? (
          <div className="marquee-track">
            {[...items, ...items].map((t, i) => (
              <span
                key={i}
                className={`whitespace-nowrap px-6 font-display text-sm uppercase tracking-[0.3em] ${
                  tone === 'cream' ? 'text-cinech-ink' : 'text-cinech-cream'
                }`}
              >
                {t} <span className="mx-2 text-cinech-olive">●</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
