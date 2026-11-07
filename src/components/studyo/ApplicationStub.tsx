'use client';

import { motion } from 'framer-motion';
import { Trash2, Clock, Layers, CalendarDays, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StudioApplication } from '@/hooks/useStudioApplications';
import { FORMAT_LABELS, PIPELINE_LABELS, formatMonth, pick } from './labels';

type Props = {
  readonly application: StudioApplication;
  readonly index?: number;
  /** Yeni kaydedilen başvuru: damga ve giriş animasyonu ile */
  readonly highlight?: boolean;
  readonly onRemove?: () => void;
};

/** Başvuru koçanı: sol tarafta numara ve durum, sağda künye; silme düğmesi isteğe bağlı. */
export default function ApplicationStub({ application, index = 0, highlight = false, onRemove }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const tilt = highlight ? -1.5 : ((index % 2) * 2 - 1) * 1;
  const created = new Date(application.createdAt).toLocaleDateString(en ? 'en-GB' : 'tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.article
      className="paper relative flex overflow-hidden rounded-md border-2 border-cinech-ink text-cinech-ink shadow-hard"
      initial={highlight ? { opacity: 0, scale: 0.92, rotate: -6 } : { rotate: tilt }}
      animate={highlight ? { opacity: 1, scale: 1, rotate: tilt } : undefined}
      whileHover={{ rotate: 0, y: -4, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Sol koçan: numara ve durum */}
      <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-2 border-r-2 border-dashed border-cinech-brown/60 bg-cinech-olive px-3 py-5 text-center text-cinech-cream">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-70">№</div>
        <div className="font-display text-xl leading-none tracking-wide">{application.id}</div>
        <div className="mt-1 rounded-full border border-cinech-cream/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em]">
          {en ? 'received' : application.status}
        </div>
      </div>

      <div className="relative min-w-0 flex-1 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-olive">
            {pick(FORMAT_LABELS[application.format], en)} · {created}
          </div>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full p-1 text-cinech-ink/40 transition-colors hover:text-cinech-brown"
              aria-label={en ? 'Delete application' : 'Başvuruyu sil'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <h3 className="mt-1 break-words font-display text-2xl uppercase leading-none tracking-wide">{application.title}</h3>
        <p className="mt-2 font-script text-xl leading-tight text-cinech-ink/85">“{application.logline}”</p>
        <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-ink/65">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-cinech-olive" aria-hidden />
            <dt className="sr-only">{en ? 'Pipeline' : 'İş akışı'}</dt>
            <dd>{pick(PIPELINE_LABELS[application.pipeline], en)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-cinech-olive" aria-hidden />
            <dt className="sr-only">{en ? 'Duration' : 'Süre'}</dt>
            <dd>
              {application.durationMinutes} {en ? 'min' : 'dk'}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3 w-3 text-cinech-olive" aria-hidden />
            <dt className="sr-only">{en ? 'Target release' : 'Hedef gösterim'}</dt>
            <dd>{formatMonth(application.targetRelease, en)}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Mail className="h-3 w-3 text-cinech-olive" aria-hidden />
            <dt className="sr-only">{en ? 'Contact' : 'İletişim'}</dt>
            <dd className="truncate normal-case tracking-normal">{application.contact}</dd>
          </div>
        </dl>

        {highlight ? (
          <motion.div
            className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rounded-sm border-[3px] border-cinech-olive px-3 py-1 font-display text-2xl uppercase tracking-widest text-cinech-olive mix-blend-multiply sm:block"
            initial={{ opacity: 0, scale: 1.6, rotate: -18 }}
            animate={{ opacity: 0.85, scale: 1, rotate: -12 }}
            transition={{ delay: 0.35, duration: 0.25, ease: 'easeOut' }}
            aria-hidden
          >
            {en ? 'received' : 'alındı'}
          </motion.div>
        ) : null}
      </div>
    </motion.article>
  );
}
