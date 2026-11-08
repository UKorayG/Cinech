'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Send, X, RotateCcw } from 'lucide-react';
import { FILMS } from '@/data/films';
import { MAX_ENTRIES_PER_OWNER, contestFilm, type ContestEntry } from '@/data/contest';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SubmitInput, SubmitResult } from '@/hooks/useContest';
import TicketCard from '@/components/retro/TicketCard';
import FilmFrame from '@/components/retro/FilmFrame';
import { MAX_DATA_URL_LENGTH, dataUrlKilobytes, resizeImageFile } from './resizeImage';

type Props = {
  readonly onSubmit: (input: SubmitInput) => SubmitResult;
  readonly closed: boolean;
  /** Bu sahibin kalan gönderim hakkı */
  readonly remaining: number;
};

const FIELD =
  'mt-1 w-full rounded-sm border-2 border-cinech-ink/20 bg-cinech-cream px-3 py-2 text-sm text-cinech-ink outline-none placeholder:text-cinech-ink/30 focus:border-cinech-olive';
const LABEL = 'font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60';

/** "Afişini gönder": başlık, kullanıcı adı, film ve görsel; görsel tarayıcıda küçültülür. Gönderim sonrası koçan. */
export default function SubmitForm({ onSubmit, closed, remaining }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [filmId, setFilmId] = useState(FILMS[0]?.id ?? '');
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<ContestEntry | null>(null);

  const onFile = async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(en ? 'Please choose an image file (JPEG, PNG or WebP).' : 'Lütfen bir görsel dosyası seç (JPEG, PNG ya da WebP).');
      return;
    }
    setBusy(true);
    try {
      const url = await resizeImageFile(file);
      if (url.length > MAX_DATA_URL_LENGTH) {
        setImage(null);
        setError(
          en
            ? `The poster is still ${dataUrlKilobytes(url)} KB after resizing; the limit is 400 KB. Try a simpler or smaller image.`
            : `Afiş küçültüldükten sonra bile ${dataUrlKilobytes(url)} KB; sınır 400 KB. Daha sade ya da daha küçük bir görsel dene.`,
        );
      } else {
        setImage(url);
      }
    } catch {
      setImage(null);
      setError(en ? 'That image could not be read. Try a JPEG or PNG.' : 'Görsel okunamadı. JPEG ya da PNG dene.');
    } finally {
      setBusy(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError(en ? 'Give your poster a title.' : 'Afişine bir başlık ver.');
    if (!author.trim()) return setError(en ? 'Add a handle so we can credit you.' : 'Seni anabilmemiz için bir kullanıcı adı yaz.');
    if (!image) return setError(en ? 'Upload the poster image.' : 'Afiş görselini yükle.');
    const result = onSubmit({ title, author, filmId, image });
    if (result.ok) {
      setDone(result.entry);
      setTitle('');
      setAuthor('');
      clearImage();
      return;
    }
    const reasons = {
      closed: en ? 'The contest is closed; submissions are no longer accepted.' : 'Yarışma kapandı; gönderim alınmıyor.',
      limit: en ? `You already have ${MAX_ENTRIES_PER_OWNER} posters on the wall.` : `Duvarda zaten ${MAX_ENTRIES_PER_OWNER} afişin var.`,
      storage: en ? 'This device has no room left to store the poster. Remove an older one and try again.' : 'Bu cihazda afişi saklayacak yer kalmadı. Eski bir afişi indirip yeniden dene.',
      film: en ? 'Pick a film from the catalogue.' : 'Katalogdan bir film seç.',
    } as const;
    setError(reasons[result.reason]);
  };

  if (done) {
    const film = contestFilm(done);
    const when = new Date(done.submittedAt).toLocaleString(en ? 'en-GB' : 'tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return (
      <div className="mx-auto max-w-2xl pt-6">
        <TicketCard label={en ? '[Submitted]' : '[Gönderildi]'} title={done.title} tilt={-1.5}>
          <div className="flex flex-wrap items-center gap-5">
            <div className="w-24 shrink-0 overflow-hidden rounded-sm bg-cinech-ink shadow-hard-sm">
              <div className="aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element -- yerel data URL */}
                <img src={done.image} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-olive">№ {done.id.replace('afis-', '').toUpperCase()}</div>
              <div className="mt-2 text-sm leading-relaxed text-cinech-ink/80">
                {done.author} · {film?.title ?? '—'}
                <br />
                {when}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-cinech-ink/65">
                {en
                  ? 'Your poster is on the wall. It and its votes are stored on this device; connect a wallet to sign later entries with your address.'
                  : 'Afişin duvarda. Afiş ve oylar bu cihazda saklanır; sonraki gönderimleri adresinle imzalamak için cüzdanını bağla.'}
              </p>
            </div>
            <div className="-rotate-6 self-start rounded-sm border-[3px] border-cinech-olive px-3 py-1.5 font-display text-xl uppercase leading-none tracking-wide text-cinech-olive">
              {en ? 'Received' : 'Alındı'}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t-2 border-dashed border-cinech-brown/40 pt-4">
            {remaining > 0 && !closed ? (
              <button type="button" onClick={() => setDone(null)} className="btn-olive !px-5 !py-2.5 !text-sm">
                <RotateCcw className="h-4 w-4" /> {en ? 'Submit another' : 'Bir afiş daha'}
              </button>
            ) : null}
            <span className="self-center font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">
              {en ? `Submissions left: ${remaining}/${MAX_ENTRIES_PER_OWNER}` : `Kalan gönderim: ${remaining}/${MAX_ENTRIES_PER_OWNER}`}
            </span>
          </div>
        </TicketCard>
      </div>
    );
  }

  const blocked = closed || remaining <= 0;

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 rounded-md border-2 border-dashed border-cinech-brown/50 p-5 md:grid-cols-[3fr_2fr] md:p-7">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
          [{en ? 'New poster' : 'Yeni afiş'}] · {en ? `Submissions left: ${remaining}/${MAX_ENTRIES_PER_OWNER}` : `Kalan gönderim: ${remaining}/${MAX_ENTRIES_PER_OWNER}`}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={LABEL}>{en ? 'Poster title' : 'Afiş başlığı'}</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={48} placeholder={en ? 'e.g. Silver Phoenix' : 'ör. Gümüş Anka'} className={FIELD} disabled={blocked} />
          </label>
          <label className="block">
            <span className={LABEL}>{en ? 'Your handle' : 'Kullanıcı adın'}</span>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={24} placeholder="@gecekusu" className={FIELD} disabled={blocked} />
          </label>
        </div>
        <label className="mt-4 block">
          <span className={LABEL}>{en ? 'Film' : 'Film'}</span>
          <select value={filmId} onChange={(e) => setFilmId(e.target.value)} className={`${FIELD} appearance-none`} disabled={blocked}>
            {FILMS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
                {f.episode ? ` · ${f.episode}` : ''}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4">
          <span className={LABEL}>{en ? 'Poster image' : 'Afiş görseli'}</span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className={`btn-outline !px-5 !py-2.5 !text-xs text-cinech-ink ${blocked || busy ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}>
              <ImagePlus className="h-4 w-4" /> {busy ? (en ? 'Resizing…' : 'Küçültülüyor…') : image ? (en ? 'Replace image' : 'Görseli değiştir') : en ? 'Choose image' : 'Görsel seç'}
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} disabled={blocked || busy} />
            </label>
            {image ? (
              <button type="button" onClick={clearImage} className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60 hover:text-cinech-olive">
                <X className="h-3.5 w-3.5" /> {en ? 'Remove' : 'Kaldır'} · {dataUrlKilobytes(image)} KB
              </button>
            ) : null}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-cinech-ink/60">
            {en
              ? 'Portrait works best. The image is resized to a 600 px long edge in your browser and stored on this device (max 400 KB).'
              : 'Dikey oran en iyisi. Görsel tarayıcında uzun kenarı 600 piksel olacak şekilde küçültülür ve bu cihazda saklanır (en fazla 400 KB).'}
          </p>
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-sm border-2 border-cinech-brown/60 bg-cinech-cream-dark px-3 py-2 text-xs text-cinech-brown">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-olive !px-5 !py-2.5 !text-sm" disabled={blocked || busy}>
            <Send className="h-4 w-4" /> {en ? 'Pin it to the wall' : 'Duvara as'}
          </button>
          {closed ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">{en ? 'Contest closed' : 'Yarışma kapandı'}</span>
          ) : remaining <= 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">{en ? 'Submission limit reached' : 'Gönderim sınırına ulaşıldı'}</span>
          ) : null}
        </div>
      </div>

      <div className="flex items-start justify-center">
        <div className="w-full max-w-[240px]">
          <FilmFrame>
            <div className="aspect-[3/4] w-full">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element -- yerel data URL önizlemesi
                <img src={image} alt={en ? 'Poster preview' : 'Afiş önizleme'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <ImagePlus className="h-6 w-6 text-cinech-cream/40" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-cream/50">{en ? 'Preview' : 'Önizleme'}</span>
                  <span className="font-script text-2xl leading-none text-cinech-cream/60">{title.trim() || (en ? 'untitled' : 'adsız')}</span>
                </div>
              )}
            </div>
          </FilmFrame>
          <div className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/50">
            {author.trim() ? author.trim() : '@…'} · {FILMS.find((f) => f.id === filmId)?.title ?? '—'}
          </div>
        </div>
      </div>
    </form>
  );
}
