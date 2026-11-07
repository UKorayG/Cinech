'use client';

import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ApplicationFormat, ApplicationPipeline, NewApplication } from '@/hooks/useStudioApplications';
import { FORMAT_IDS, FORMAT_LABELS, PIPELINE_IDS, PIPELINE_LABELS, currentMonth, pick } from './labels';

type Props = {
  readonly onSubmit: (input: NewApplication) => void;
};

const LOGLINE_MAX = 200;
const TITLE_MAX = 80;

const INPUT =
  'mt-1 w-full rounded-sm border-2 border-cinech-ink/20 bg-cinech-cream px-3 py-2 text-sm text-cinech-ink outline-none placeholder:text-cinech-ink/30 focus:border-cinech-olive';
const LABEL = 'font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60';
const ERROR = 'mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cinech-brown';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE = /^@?[\w.-]{3,32}$/;

type Errors = Partial<Record<'title' | 'logline' | 'duration' | 'targetRelease' | 'contact' | 'rules', string>>;

type ChipGroupProps<T extends string> = {
  readonly label: string;
  readonly value: T;
  readonly options: readonly { readonly id: T; readonly label: string }[];
  readonly onChange: (value: T) => void;
};

/** Tek seçimli çip grubu (format, iş akışı). */
function ChipGroup<T extends string>({ label, value, options, onChange }: ChipGroupProps<T>) {
  return (
    <fieldset>
      <legend className={LABEL}>{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              className={`rounded-full border-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                active
                  ? 'border-cinech-olive bg-cinech-olive text-cinech-cream shadow-hard-sm'
                  : 'border-cinech-ink/30 text-cinech-ink/70 hover:border-cinech-olive hover:text-cinech-olive'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Stüdyoya başvuru formu: proje künyesi, iş akışı, hedef ay, iletişim ve kural onayı. */
export default function StudioApplicationForm({ onSubmit }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';

  const [title, setTitle] = useState('');
  const [logline, setLogline] = useState('');
  const [format, setFormat] = useState<ApplicationFormat>('kisa');
  const [duration, setDuration] = useState('12');
  const [pipeline, setPipeline] = useState<ApplicationPipeline>('remotion');
  const [targetRelease, setTargetRelease] = useState('');
  const [contact, setContact] = useState('');
  const [rules, setRules] = useState(false);
  const [touched, setTouched] = useState(false);

  const minMonth = useMemo(() => currentMonth(), []);

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};
    if (!title.trim()) e.title = en ? 'Title is required' : 'Başlık gerekli';
    if (!logline.trim()) e.logline = en ? 'Logline is required' : 'Logline gerekli';
    else if (logline.length > LOGLINE_MAX) e.logline = en ? `Max ${LOGLINE_MAX} characters` : `En fazla ${LOGLINE_MAX} karakter`;
    const minutes = Number(duration);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 600)
      e.duration = en ? 'Between 1 and 600 minutes' : '1 ile 600 dakika arasında';
    if (!/^\d{4}-\d{2}$/.test(targetRelease)) e.targetRelease = en ? 'Pick a month' : 'Bir ay seç';
    else if (targetRelease < minMonth) e.targetRelease = en ? 'Must not be in the past' : 'Geçmiş bir ay olamaz';
    const c = contact.trim();
    if (!c) e.contact = en ? 'E-mail or handle is required' : 'E-posta ya da kullanıcı adı gerekli';
    else if (!EMAIL.test(c) && !HANDLE.test(c)) e.contact = en ? 'Enter an e-mail or a handle' : 'Bir e-posta ya da kullanıcı adı yaz';
    if (!rules) e.rules = en ? 'Accept the studio rules' : 'Stüdyo kurallarını kabul et';
    return e;
  }, [title, logline, duration, targetRelease, contact, rules, en, minMonth]);

  const invalid = Object.keys(errors).length > 0;
  const show = (k: keyof Errors) => (touched && errors[k] ? <div className={ERROR}>{errors[k]}</div> : null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) {
      setTouched(true);
      return;
    }
    onSubmit({
      title: title.trim(),
      logline: logline.trim(),
      format,
      durationMinutes: Number(duration),
      pipeline,
      targetRelease,
      contact: contact.trim(),
      rulesAccepted: true,
    });
    setTitle('');
    setLogline('');
    setDuration('12');
    setTargetRelease('');
    setContact('');
    setRules(false);
    setTouched(false);
  };

  const formatOptions = FORMAT_IDS.map((id) => ({ id, label: pick(FORMAT_LABELS[id], en) }));
  const pipelineOptions = PIPELINE_IDS.map((id) => ({ id, label: pick(PIPELINE_LABELS[id], en) }));

  return (
    <form onSubmit={submit} noValidate className="paper rounded-md border-2 border-cinech-ink p-6 text-cinech-ink shadow-hard">
      <div className="flex items-center justify-between border-b-2 border-dashed border-cinech-brown/50 pb-4">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
          [{en ? 'Application form' : 'Başvuru formu'}]
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/50">{en ? 'Local draft' : 'Yerel kayıt'}</div>
      </div>

      <div className="mt-5 grid gap-5">
        <label className="block">
          <span className={LABEL}>{en ? 'Project title' : 'Proje adı'}</span>
          <input
            type="text"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={en ? 'e.g. Salt Lake, Episode 2' : 'örn. Tuz Gölü, Bölüm 2'}
            className={`${INPUT} font-display text-xl uppercase tracking-wide`}
          />
          {show('title')}
        </label>

        <label className="block">
          <span className="flex items-center justify-between">
            <span className={LABEL}>Logline</span>
            <span
              className={`font-mono text-[10px] tracking-[0.2em] ${
                logline.length > LOGLINE_MAX ? 'text-cinech-brown' : 'text-cinech-ink/50'
              }`}
            >
              {logline.length}/{LOGLINE_MAX}
            </span>
          </span>
          <textarea
            value={logline}
            onChange={(e) => setLogline(e.target.value.slice(0, LOGLINE_MAX))}
            rows={3}
            placeholder={en ? 'One sentence: who wants what, and what stands in the way?' : 'Tek cümle: kim neyi istiyor, önünde ne var?'}
            className={`${INPUT} resize-none font-script text-xl leading-tight`}
          />
          {show('logline')}
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <ChipGroup label={en ? 'Format' : 'Format'} value={format} options={formatOptions} onChange={setFormat} />
          <label className="block">
            <span className={LABEL}>{en ? 'Planned duration (min)' : 'Planlanan süre (dk)'}</span>
            <input
              type="number"
              min={1}
              max={600}
              step={1}
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`${INPUT} font-display text-xl`}
            />
            {show('duration')}
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <ChipGroup label={en ? 'Pipeline' : 'İş akışı'} value={pipeline} options={pipelineOptions} onChange={setPipeline} />
          <label className="block">
            <span className={LABEL}>{en ? 'Target release' : 'Hedef gösterim'}</span>
            <input
              type="month"
              min={minMonth}
              value={targetRelease}
              onChange={(e) => setTargetRelease(e.target.value)}
              className={INPUT}
            />
            {show('targetRelease')}
          </label>
        </div>

        <label className="block">
          <span className={LABEL}>{en ? 'Contact (e-mail or handle)' : 'İletişim (e-posta ya da kullanıcı adı)'}</span>
          <input
            type="text"
            autoComplete="off"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={en ? 'name@example.com or @handle' : 'ad@ornek.com ya da @kullanici'}
            className={INPUT}
          />
          {show('contact')}
        </label>

        <div className="rounded-sm border-2 border-dashed border-cinech-brown/40 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={rules}
              onChange={(e) => setRules(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-cinech-olive"
            />
            <span className="text-sm leading-relaxed text-cinech-ink/80">
              {en ? 'I have read and accept the ' : ''}
              <span className="font-bold text-cinech-ink">{en ? 'Studio rules' : 'Stüdyo kurallarını'}</span>
              {en ? '.' : ' okudum, kabul ediyorum.'}
            </span>
          </label>
          {show('rules')}
          <details className="mt-3">
            <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-olive">
              {en ? 'Read the rules' : 'Kuralları oku'}
            </summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-cinech-ink/70">
              <li>{en ? 'The work must be original; no third-party material without permission.' : 'Yapım özgün olmalı; üçüncü kişilere ait içerik izinsiz kullanılmaz.'}</li>
              <li>{en ? 'Every episode entering the catalogue screens on Cinech; the DAO vote sets the schedule.' : "Kataloğa giren her bölüm Cinech'te gösterilir; gösterim takvimini DAO oyu belirler."}</li>
              <li>{en ? 'The producer delivers the source project (Remotion or Blender) to the studio archive.' : 'Yapımcı, kaynak projeyi (Remotion ya da Blender) stüdyo arşivine teslim eder.'}</li>
            </ol>
          </details>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/50">
          {en ? 'Saved in this browser' : 'Bu tarayıcıda saklanır'}
        </div>
        <button type="submit" className="btn-olive !px-5 !py-2.5 !text-sm">
          <Send className="h-4 w-4" /> {en ? 'Submit application' : 'Başvuruyu gönder'}
        </button>
      </div>
    </form>
  );
}
