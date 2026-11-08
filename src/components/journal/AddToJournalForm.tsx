'use client';

import { useState } from 'react';
import { Ticket } from 'lucide-react';
import type { Film } from '@/data/films';
import type { NewEntry } from '@/hooks/useJournal';
import { useLanguage } from '@/contexts/LanguageContext';
import Stars from './Stars';

type Props = {
  readonly film: Film;
  readonly onSubmit: (entry: NewEntry) => void;
  readonly onCancel: () => void;
};

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** "İzledim" formu: tarih, puan ve kısa not; koçan deftere yapıştırılır. */
export default function AddToJournalForm({ film, onSubmit, onCancel }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [watchedAt, setWatchedAt] = useState(toLocalInput(new Date()));
  const [rating, setRating] = useState(4);
  const [note, setNote] = useState('');

  return (
    <form
      className="mt-5 rounded-md border-2 border-dashed border-cinech-brown/50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ filmId: film.id, watchedAt: new Date(watchedAt).toISOString(), rating, note: note.trim() });
      }}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-cinech-olive">
        [{en ? 'New stub' : 'Yeni koçan'}] · {film.title}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">{en ? 'Watched at' : 'İzleme zamanı'}</span>
          <input
            type="datetime-local"
            value={watchedAt}
            onChange={(e) => setWatchedAt(e.target.value)}
            className="mt-1 w-full rounded-sm border-2 border-cinech-ink/20 bg-cinech-cream px-3 py-2 text-sm text-cinech-ink outline-none focus:border-cinech-olive"
            required
          />
        </label>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">{en ? 'Rating' : 'Puan'}</span>
          <div className="mt-2">
            <Stars value={rating} onChange={setRating} size="md" />
          </div>
        </div>
      </div>
      <label className="mt-4 block">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cinech-ink/60">{en ? 'Note' : 'Not'}</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder={en ? 'What did it leave with you?' : 'Bu film sende ne bıraktı?'}
          className="mt-1 w-full rounded-sm border-2 border-cinech-ink/20 bg-cinech-cream p-3 font-script text-xl leading-tight text-cinech-ink outline-none placeholder:text-cinech-ink/30 focus:border-cinech-olive"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className="btn-olive !px-5 !py-2.5 !text-sm">
          <Ticket className="h-4 w-4" /> {en ? 'Paste the stub' : 'Koçanı yapıştır'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline !px-5 !py-2.5 !text-sm text-cinech-ink/70">
          {en ? 'Cancel' : 'Vazgeç'}
        </button>
      </div>
    </form>
  );
}
