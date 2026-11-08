'use client';

import { CodeXml, Box, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Reveal from '@/components/retro/Reveal';

type Status = 'ready' | 'soon' | 'planned';

const ITEMS: readonly {
  readonly id: string;
  readonly status: Status;
  readonly icon: typeof CodeXml;
  readonly title: { readonly tr: string; readonly en: string };
  readonly text: { readonly tr: string; readonly en: string };
}[] = [
  {
    id: 'remotion',
    status: 'ready',
    icon: CodeXml,
    title: { tr: 'Remotion şablonları', en: 'Remotion templates' },
    text: {
      tr: 'Bölüm açılışı, alt yazı ve jenerik için hazır kompozisyonlar. Kodla kur, kataloğa gönder.',
      en: 'Ready compositions for episode openers, captions and credits. Set it up in code, send it to the catalogue.',
    },
  },
  {
    id: 'blender',
    status: 'soon',
    icon: Box,
    title: { tr: 'Blender eklentisi', en: 'Blender add-on' },
    text: {
      tr: "Sahneleri Blender'dan Remotion zaman çizelgesine taşıyan köprü.",
      en: 'A bridge that carries scenes from Blender into the Remotion timeline.',
    },
  },
  {
    id: 'preview',
    status: 'planned',
    icon: Eye,
    title: { tr: 'Topluluk ön gösterimi', en: 'Community preview' },
    text: {
      tr: 'Bölüm kataloğa girmeden önce DAO üyelerine kapalı gösterim.',
      en: 'A closed screening for DAO members before an episode enters the catalogue.',
    },
  },
];

const STATUS = {
  ready: { tr: 'hazır', en: 'ready', chip: 'border-cinech-olive bg-cinech-olive text-cinech-cream' },
  soon: { tr: 'yakında', en: 'coming soon', chip: 'border-cinech-brown text-cinech-brown' },
  planned: { tr: 'planlanıyor', en: 'planned', chip: 'border-dashed border-cinech-ink/50 text-cinech-ink/60' },
} as const;

/** Stüdyo yol haritası: üç durak, tarih yok; durum çipleriyle. */
export default function StudioRoadmap() {
  const { language } = useLanguage();
  const en = language === 'en';
  return (
    <div className="relative grid gap-8 lg:grid-cols-3">
      <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-cinech-cream/40 lg:block" aria-hidden />
      {ITEMS.map((item, i) => {
        const Icon = item.icon;
        const status = STATUS[item.status];
        const tilt = (i - 1) * 1.2;
        return (
          <Reveal key={item.id} delay={i * 0.08} rotate={tilt} className="h-full">
            <article
              className="paper relative flex h-full flex-col rounded-md border-2 border-cinech-ink p-6 text-cinech-ink shadow-hard"
              style={{ transform: `rotate(${tilt}deg)` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm border-2 border-cinech-ink bg-cinech-cream shadow-hard-sm">
                  <Icon className="h-6 w-6 text-cinech-olive" aria-hidden />
                </div>
                <span className={`rounded-full border-2 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] ${status.chip}`}>
                  {en ? status.en : status.tr}
                </span>
              </div>
              <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-olive">
                [{en ? 'Stop' : 'Durak'}] {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-1 font-display text-2xl uppercase leading-none tracking-wide">{en ? item.title.en : item.title.tr}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cinech-ink/75">{en ? item.text.en : item.text.tr}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
