type Props = {
  readonly tl?: string;
  readonly tr?: string;
  readonly bl?: string;
  readonly br?: string;
  /** Yazı ve işaret rengi */
  readonly tone?: 'cream' | 'ink' | 'red';
  readonly rec?: boolean;
};

const TEXT = {
  cream: 'text-cinech-cream/80',
  ink: 'text-cinech-ink/80',
  red: 'text-cinech-olive',
} as const;

const BORDER = {
  cream: 'border-cinech-cream/70',
  ink: 'border-cinech-ink/70',
  red: 'border-cinech-olive',
} as const;

/**
 * Köşe kayıt işaretleri ve köşeli parantezli HUD etiketleri ([CINECH], ▶ PLAY, ● REC).
 * Kapsayıcı `relative` olmalı. Dar ekranlarda yalnızca sol üst etiket görünür.
 */
export default function RetroHud({ tl, tr, bl, br, tone = 'cream', rec = false }: Props) {
  const text = TEXT[tone];
  const mark = `pointer-events-none absolute h-7 w-7 ${BORDER[tone]}`;
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-mono text-[11px] uppercase tracking-[0.25em]">
      <span className={`${mark} left-5 top-5 border-l-2 border-t-2`} />
      <span className={`${mark} right-5 top-5 border-r-2 border-t-2`} />
      <span className={`${mark} bottom-5 left-5 border-b-2 border-l-2`} />
      <span className={`${mark} bottom-5 right-5 border-b-2 border-r-2`} />
      {tl ? <span className={`absolute left-10 top-6 ${text}`}>{tl}</span> : null}
      {tr ? <span className={`absolute right-10 top-6 hidden sm:inline ${text}`}>{tr}</span> : null}
      {bl ? (
        <span className={`absolute bottom-6 left-10 hidden items-center gap-2 sm:flex ${text}`}>
          <span aria-hidden>▶</span> {bl}
        </span>
      ) : null}
      {br ? (
        <span className={`absolute bottom-6 right-10 hidden items-center gap-2 sm:flex ${text}`}>
          {rec ? <span aria-hidden className="h-2 w-2 animate-rec-blink rounded-full bg-cinech-olive" /> : null}
          {br}
        </span>
      ) : null}
    </div>
  );
}
