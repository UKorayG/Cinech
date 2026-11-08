'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Clapperboard, Ticket, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStudioApplications, type NewApplication, type StudioApplication } from '@/hooks/useStudioApplications';
import { GUEST_OWNER, shortAddress } from '@/data/journal';
import { PRODUCERS } from '@/data/producers';
import RetroHud from '@/components/retro/RetroHud';
import FilmStrip from '@/components/retro/FilmStrip';
import Reveal from '@/components/retro/Reveal';
import { Display, Script } from '@/components/retro/Display';
import ProducerCard from '@/components/studyo/ProducerCard';
import StudioApplicationForm from '@/components/studyo/StudioApplicationForm';
import ApplicationStub from '@/components/studyo/ApplicationStub';
import StudioRoadmap from '@/components/studyo/StudioRoadmap';

const T = {
  title: { tr: 'Stüdyo', en: 'Studio' },
  script: { tr: 'filmler burada doğar', en: 'where films are born' },
  manifesto: { tr: 'Manifesto', en: 'Manifesto' },
  manifestoText: {
    tr: 'Cinech Stüdyo bir üretim hattı: yapımcılar bölümleri bugün kodla (Remotion) üretir, Blender entegrasyonu yakında eklenir. Biten bölüm kataloğa yayınlanır; hangi hikâyenin devam edeceğine topluluk DAO üzerinden oy verir.',
    en: 'Cinech Studio is a pipeline: producers make episodes with code (Remotion) today, with Blender integration coming soon. A finished episode is published to the catalogue; the community votes through the DAO on which story continues.',
  },
  step1: { tr: 'Kodla üret', en: 'Make with code' },
  step1Sub: { tr: 'Remotion · Blender (yakında)', en: 'Remotion · Blender (soon)' },
  step2: { tr: 'Kataloğa yayınla', en: 'Publish to the catalogue' },
  step2Sub: { tr: 'Afiş, bölüm, gösterim', en: 'Poster, episode, screening' },
  step3: { tr: 'DAO oylar', en: 'The DAO votes' },
  step3Sub: { tr: 'Sıradaki hikâye', en: 'The next story' },
  strip: { tr: 'ÜRET · YAYINLA · OYLA', en: 'MAKE · PUBLISH · VOTE' },
  applications: { tr: 'başvuru', en: 'applications' },
  producers: { tr: 'Yapımcılar', en: 'Producers' },
  producersText: {
    tr: 'Platodaki her stüdyonun bir kimlik kartı var. Afişe dokun, filmi aç.',
    en: 'Every studio on the lot carries an ID card. Tap a poster to open the film.',
  },
  studios: { tr: 'stüdyo', en: 'studios' },
  apply: { tr: 'Stüdyoya başvur', en: 'Apply to the Studio' },
  applyText: {
    tr: 'Bir bölüm öner. Başvuru bu tarayıcıda, cüzdan bağlıysa adresine bağlı saklanır; değerlendirme akışı bir sonraki aşamada.',
    en: 'Pitch an episode. The application is saved in this browser, bound to your address when a wallet is connected; the review flow comes next.',
  },
  received: { tr: 'Başvurun alındı', en: 'Application received' },
  receivedText: { tr: 'Numarayı sakla; koçanın bu.', en: 'Keep the number; this is your stub.' },
  mine: { tr: 'Başvurularım', en: 'Your applications' },
  guest: { tr: 'misafir', en: 'guest' },
  guestHint: {
    tr: 'Misafir olarak kaydediyorsun; cüzdan bağlarsan başvurular adresine bağlanır.',
    en: 'Saving as a guest; connect a wallet to bind applications to your address.',
  },
  emptyTitle: { tr: 'Henüz başvuru yok', en: 'No applications yet' },
  emptyText: { tr: 'Formu doldur; ilk koçanın burada görünür.', en: 'Fill in the form; your first stub appears here.' },
  roadmap: { tr: 'Stüdyo yol haritası', en: 'Studio roadmap' },
  roadmapScript: { tr: 'adım adım', en: 'step by step' },
  noDates: { tr: '[Tarih yok]', en: '[No dates]' },
  daoText: { tr: 'Sıradaki hikâyeye DAO karar veriyor.', en: 'Which story gets made next is decided in the DAO.' },
  goDao: { tr: "DAO'ya git", en: 'Go to the DAO' },
} as const;

type Key = keyof typeof T;

export default function StudioPage() {
  const { language } = useLanguage();
  const en = language === 'en';
  const t = (k: Key) => (en ? T[k].en : T[k].tr);
  const { address } = useAccount();
  const { owner, applications, ready, add, remove } = useStudioApplications(address);
  const [saved, setSaved] = useState<StudioApplication | null>(null);

  const isGuest = owner === GUEST_OWNER;
  /** Onay koçanı yalnızca kayıt hâlâ bu sahibin listesindeyse görünür */
  const savedApp = saved ? applications.find((a) => a.id === saved.id && a.createdAt === saved.createdAt) ?? null : null;
  const others = useMemo(
    () => [...applications].filter((a) => a.id !== savedApp?.id).sort((a, b) => b.no - a.no),
    [applications, savedApp?.id],
  );

  const handleSubmit = (input: NewApplication) => {
    const application = add(input);
    setSaved(application);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.getElementById('basvuru-onay')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  };

  const steps = [
    [t('step1'), t('step1Sub')],
    [t('step2'), t('step2Sub')],
    [t('step3'), t('step3Sub')],
  ] as const;

  return (
    <div>
      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud
          tl={en ? '[Studio] 09' : '[Stüdyo] 09'}
          tr={`[${shortAddress(owner)}]`}
          bl="PLAY"
          br={`REC ${String(applications.length).padStart(2, '0')} ${t('applications')}`}
          rec
        />
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-6">
          <Reveal className="relative">
            <Display as="h1" className="text-6xl text-cinech-cream md:text-8xl">
              {t('title')}
            </Display>
            <Script className="pointer-events-none absolute -bottom-4 left-[10%] -rotate-6 whitespace-nowrap text-4xl text-cinech-ink/90 md:text-6xl">
              {t('script')}
            </Script>
          </Reveal>
          <Reveal delay={0.15} className="w-full max-w-xl">
            <div className="paper rounded-md p-5 text-cinech-ink shadow-hard">
              <div className="flex items-center gap-3">
                <Clapperboard className="h-5 w-5 text-cinech-olive" aria-hidden />
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">{t('manifesto')}</div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-cinech-ink/75">{t('manifestoText')}</p>
              <ol className="mt-4 grid gap-3 border-t-2 border-dashed border-cinech-brown/40 pt-4 sm:grid-cols-3">
                {steps.map(([label, sub], i) => (
                  <li key={label} className="min-w-0">
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cinech-olive">{String(i + 1).padStart(2, '0')}</div>
                    <div className="mt-1 font-display text-lg uppercase leading-none tracking-wide">{label}</div>
                    <div className="mt-1 text-[11px] text-cinech-ink/60">{sub}</div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      <FilmStrip text={t('strip')} />

      <section className="paper relative py-16 text-cinech-ink">
        <RetroHud tl={en ? '[Producers] 01' : '[Yapımcılar] 01'} tr={`[${PRODUCERS.length} ${t('studios')}]`} tone="ink" />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12">
            <Display className="text-5xl text-cinech-olive md:text-7xl" shadow="ink">
              {t('producers')}
            </Display>
            <p className="mt-3 max-w-xl text-sm text-cinech-ink/70">{t('producersText')}</p>
          </Reveal>
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
            {PRODUCERS.map((producer, i) => (
              <Reveal key={producer.id} delay={(i % 3) * 0.08} className="h-full">
                <ProducerCard producer={producer} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="basvuru" className="relative bg-cinech-ink py-16 text-cinech-cream">
        <RetroHud tl={en ? '[Application] 02' : '[Başvuru] 02'} tr={`[${shortAddress(owner)}]`} />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-10">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="red">
              {t('apply')}
            </Display>
            <p className="mt-3 max-w-xl text-sm text-cinech-cream/65">{t('applyText')}</p>
          </Reveal>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <Reveal>
              <StudioApplicationForm onSubmit={handleSubmit} />
            </Reveal>
            <div className="grid content-start gap-8">
              {savedApp ? (
                <div id="basvuru-onay" className="scroll-mt-24 rounded-md border-2 border-dashed border-cinech-cream/40 p-4">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream">
                    <Ticket className="h-4 w-4" aria-hidden /> {t('received')} · {savedApp.id}
                  </div>
                  <p className="mt-1 text-xs text-cinech-cream/60">{t('receivedText')}</p>
                  <div className="mt-4">
                    <ApplicationStub
                      key={`${savedApp.id}-${savedApp.createdAt}`}
                      application={savedApp}
                      highlight
                      onRemove={() => {
                        remove(savedApp.id);
                        setSaved(null);
                      }}
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-cream/70">
                  <span>
                    [{t('mine')}] {String(applications.length).padStart(2, '0')}
                  </span>
                  <span>{isGuest ? t('guest') : shortAddress(owner)}</span>
                </div>
                {isGuest ? <p className="mb-4 text-xs text-cinech-cream/50">{t('guestHint')}</p> : null}
                {ready && applications.length === 0 ? (
                  <div className="rounded-md border-2 border-dashed border-cinech-cream/30 p-8 text-center">
                    <div className="font-display text-2xl uppercase tracking-wide text-cinech-cream/80">{t('emptyTitle')}</div>
                    <p className="mt-2 text-xs text-cinech-cream/55">{t('emptyText')}</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {others.map((application, i) => (
                      <ApplicationStub key={`${application.id}-${application.createdAt}`} application={application} index={i} onRemove={() => remove(application.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-cinech-olive py-16 text-cinech-cream">
        <RetroHud tl={en ? '[Roadmap] 03' : '[Yol haritası] 03'} tr={t('noDates')} />
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="relative mb-12">
            <Display className="text-5xl text-cinech-cream md:text-7xl" shadow="ink">
              {t('roadmap')}
            </Display>
            <Script className="pointer-events-none absolute -bottom-3 left-[8%] -rotate-6 whitespace-nowrap text-3xl text-cinech-ink/90 md:text-5xl">
              {t('roadmapScript')}
            </Script>
          </Reveal>
          <StudioRoadmap />
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-cinech-cream/30 pt-6">
            <p className="text-sm text-cinech-cream/70">{t('daoText')}</p>
            <Link href="/dao" className="btn-cream !px-5 !py-2.5 !text-sm">
              {t('goDao')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
