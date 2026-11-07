'use client';

import Image from 'next/image';
import type { Film } from '@/data/films';

type Props = {
  readonly film: Film;
  readonly className?: string;
  readonly interactive?: boolean;
  /** Başlık bloğunu gizle (ör. küçük önizlemelerde) */
  readonly hideText?: boolean;
};

/** Afişin tarzına göre dekoratif katmanlar; tümü CSS ile çizilir, görsel dosyası yoktur. */
function Layers({ film }: { readonly film: Film }) {
  const { accent, accent2 } = film.palette;
  switch (film.poster) {
    case 'noir':
      return (
        <>
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `repeating-linear-gradient(135deg, ${accent}66 0 12px, transparent 12px 44px)` }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-[70%]"
            style={{ background: `radial-gradient(circle at 50% 120%, ${film.palette.bg} 58%, ${accent2} 59%, ${accent2} 61%, transparent 62%)` }}
          />
          <div className="absolute left-[12%] top-[18%] h-[2px] w-[60%] rotate-[-20deg]" style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
        </>
      );
    case 'sun':
      return (
        <>
          <div
            className="absolute left-1/2 top-[14%] h-[52%] w-[62%] -translate-x-1/2 rounded-t-full"
            style={{
              background: `linear-gradient(180deg, ${accent2} 0%, ${accent} 100%)`,
              WebkitMaskImage: 'repeating-linear-gradient(180deg, #000 0 16px, transparent 16px 24px)',
              maskImage: 'repeating-linear-gradient(180deg, #000 0 16px, transparent 16px 24px)',
            }}
          />
          <div className="absolute inset-x-0 top-[66%] h-px" style={{ background: accent2, boxShadow: `0 0 20px ${accent2}` }} />
          <div
            className="absolute inset-x-[-40%] bottom-0 h-[34%] opacity-70"
            style={{
              background: `repeating-linear-gradient(90deg, ${accent}55 0 2px, transparent 2px 60px), repeating-linear-gradient(180deg, ${accent}55 0 2px, transparent 2px 28px)`,
              transform: 'perspective(220px) rotateX(55deg)',
              transformOrigin: 'top center',
            }}
          />
        </>
      );
    case 'orbit':
      return (
        <>
          <div
            className="absolute inset-0 opacity-70"
            style={{ backgroundImage: `radial-gradient(${accent2}cc 1px, transparent 1.5px)`, backgroundSize: '26px 26px' }}
          />
          <div
            className="absolute left-1/2 top-[38%] h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
            style={{ background: `repeating-radial-gradient(circle, transparent 0 38px, ${accent}55 38px 40px)` }}
          />
          <div className="absolute left-[58%] top-[30%] h-[22%] w-[22%] rounded-full" style={{ background: `radial-gradient(circle at 35% 35%, ${accent2}, ${accent} 55%, ${film.palette.bg} 100%)`, boxShadow: `0 0 40px ${accent}66` }} />
        </>
      );
    case 'storm':
      return (
        <>
          <div
            className="absolute inset-x-[-30%] bottom-[22%] top-[-30%] opacity-60"
            style={{ background: `conic-gradient(from 180deg at 50% 100%, ${accent}33 0 9deg, transparent 9deg 18deg)` }}
          />
          <div className="absolute left-1/2 top-[42%] h-[22%] w-[22%] -translate-x-1/2 rounded-full" style={{ background: accent2, boxShadow: `0 0 50px ${accent2}88` }} />
          <div className="absolute bottom-0 left-0 h-[34%] w-[42%] bg-[#0b0908]" style={{ clipPath: 'polygon(0 100%, 0 30%, 25% 30%, 35% 0, 60% 0, 70% 30%, 100% 30%, 100% 100%)' }} />
          <div className="absolute bottom-0 right-0 h-[28%] w-[48%] bg-[#0b0908]" style={{ clipPath: 'polygon(0 100%, 0 40%, 30% 40%, 40% 10%, 75% 10%, 85% 40%, 100% 40%, 100% 100%)' }} />
        </>
      );
    case 'grid':
      return (
        <>
          <div
            className="absolute inset-x-[-30%] bottom-0 h-[55%] opacity-80"
            style={{
              background: `repeating-linear-gradient(90deg, ${accent}44 0 2px, transparent 2px 48px), repeating-linear-gradient(180deg, ${accent}44 0 2px, transparent 2px 36px)`,
              transform: 'perspective(260px) rotateX(58deg)',
              transformOrigin: 'top center',
            }}
          />
          <div className="absolute bottom-[42%] left-[10%] h-[40%] w-[16%] bg-[#1d2024]" />
          <div className="absolute bottom-[42%] left-[32%] h-[55%] w-[20%] bg-[#262a2f]" />
          <div className="absolute bottom-[42%] right-[14%] h-[32%] w-[22%] bg-[#1a1d21]" />
          <div className="absolute bottom-[42%] right-[40%] h-[46%] w-[6%]" style={{ background: accent2, boxShadow: `0 0 20px ${accent2}` }} />
          <div className="absolute left-[18%] top-[14%] h-3 w-3 rounded-full" style={{ background: accent }} />
          <div className="absolute left-[24%] top-[20%] h-2 w-2 rounded-full" style={{ background: accent }} />
          <div className="absolute left-[30%] top-[12%] h-2 w-2 rounded-full" style={{ background: accent }} />
        </>
      );
    case 'marquee':
      return (
        <>
          {/* Ampul çerçevesi: dört kenarda nokta deseni */}
          <div className="absolute inset-x-4 top-4 h-4" style={{ backgroundImage: `radial-gradient(circle, ${accent2} 0 3px, transparent 4px)`, backgroundSize: '22px 16px', backgroundPosition: 'center' }} />
          <div className="absolute inset-x-4 bottom-4 h-4" style={{ backgroundImage: `radial-gradient(circle, ${accent2} 0 3px, transparent 4px)`, backgroundSize: '22px 16px', backgroundPosition: 'center' }} />
          <div className="absolute inset-y-4 left-4 w-4" style={{ backgroundImage: `radial-gradient(circle, ${accent2} 0 3px, transparent 4px)`, backgroundSize: '16px 22px', backgroundPosition: 'center' }} />
          <div className="absolute inset-y-4 right-4 w-4" style={{ backgroundImage: `radial-gradient(circle, ${accent2} 0 3px, transparent 4px)`, backgroundSize: '16px 22px', backgroundPosition: 'center' }} />
          <div className="absolute inset-8 rounded-sm border-2" style={{ borderColor: `${accent2}55` }} />
          <div className="absolute inset-x-[20%] top-[16%] h-[30%]" style={{ background: `conic-gradient(from 160deg at 50% 0%, ${accent2}44 0 20deg, transparent 20deg 40deg)` }} />
          <div className="absolute inset-x-[30%] top-[16%] h-[2px]" style={{ background: accent2, boxShadow: `0 0 14px ${accent2}` }} />
        </>
      );
    case 'monolith':
    default:
      return (
        <>
          <div className="absolute bottom-0 left-[28%] h-[55%] w-[14%] bg-[#1b1b20]/90" />
          <div className="absolute bottom-0 left-[46%] h-[70%] w-[18%] bg-[#232328]/90" />
          <div className="absolute bottom-0 right-[14%] h-[48%] w-[12%] bg-[#17171b]/90" />
          <div className="absolute left-[18%] top-0 h-full w-px opacity-80" style={{ background: `linear-gradient(180deg, transparent, ${accent2}, transparent)`, boxShadow: `0 0 12px ${accent2}` }} />
          <div className="absolute right-[26%] top-0 h-full w-px opacity-60" style={{ background: `linear-gradient(180deg, transparent, ${accent}, transparent)`, boxShadow: `0 0 12px ${accent}` }} />
        </>
      );
  }
}

/** Kodla üretilen afiş: filmin paletinden gradyan, film şeridi kenarları ve tarza özel kompozisyon. */
export default function FilmPoster({ film, className = '', interactive = true, hideText = false }: Props) {
  const { palette } = film;
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl ${
        interactive ? 'transition-transform duration-500 hover:-translate-y-1' : ''
      } ${className}`}
      style={{
        background: `radial-gradient(120% 80% at 80% 0%, ${palette.accent2}33 0%, transparent 55%), radial-gradient(90% 70% at 10% 100%, ${palette.accent}44 0%, transparent 60%), linear-gradient(180deg, ${palette.bg} 0%, #050506 100%)`,
      }}
    >
      {film.image ? (
        <>
          <Image
            src={film.image}
            alt={film.title}
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
            style={{ objectPosition: film.imageFocus ?? '50% 30%' }}
            priority={Boolean(film.featured)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </>
      ) : (
        <Layers film={film} />
      )}
      <div
        className="absolute inset-y-0 left-0 w-5 opacity-60"
        style={{ background: `repeating-linear-gradient(180deg, transparent 0 10px, ${palette.accent}55 10px 22px)` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-5 opacity-60"
        style={{ background: `repeating-linear-gradient(180deg, transparent 0 10px, ${palette.accent2}55 10px 22px)` }}
      />
      <div className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
      {hideText ? null : (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 pl-9">
          {film.episode ? (
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.35em]" style={{ color: palette.accent2 }}>
              {film.episode}
            </div>
          ) : null}
          <div className="font-display text-5xl uppercase leading-none tracking-wide text-cinech-cream">{film.title}</div>
          <div className="mt-2 text-sm text-cinech-cream/70">{film.tagline}</div>
        </div>
      )}
    </div>
  );
}
