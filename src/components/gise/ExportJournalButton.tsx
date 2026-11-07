'use client';

import { useState } from 'react';
import { Check, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GUEST_OWNER, filmById, type Journal } from '@/data/journal';

type Props = {
  readonly journal: Journal;
  readonly className?: string;
};

/** Defteri JSON dosyası olarak indirir: Blob + geçici <a download>. Hiçbir yere gönderilmez. */
export default function ExportJournalButton({ journal, className = '' }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [done, setDone] = useState(false);
  const disabled = journal.entries.length === 0;

  const download = () => {
    try {
      const payload = {
        app: 'cinech',
        kind: 'film-defteri',
        version: 1,
        exportedAt: new Date().toISOString(),
        owner: journal.owner,
        createdAt: journal.createdAt,
        entries: journal.entries.map((e) => ({ ...e, title: filmById(e.filmId)?.title ?? e.filmId })),
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const who = journal.owner === GUEST_OWNER ? GUEST_OWNER : journal.owner.slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cinech-defter-${who}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      /* indirme engellendiyse sessiz kal */
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      disabled={disabled}
      title={disabled ? (en ? 'The journal is empty' : 'Defter boş') : undefined}
      className={`btn-cream !px-4 !py-2 !text-xs disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {done ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      {done ? (en ? 'Downloaded' : 'İndirildi') : en ? 'Download journal (JSON)' : 'Defteri indir (JSON)'}
    </button>
  );
}
