import type { Film } from '@/data/films';

/** RFC 5545 metin kaçışları */
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Uzun satırları katla (75 oktet sınırı; çok baytlı karakterler için 60'ta kes) */
const fold = (line: string) => {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 60) {
    out.push(rest.slice(0, 60));
    rest = ` ${rest.slice(60)}`;
  }
  out.push(rest);
  return out.join('\r\n');
};

const compact = (iso: string) => iso.replace(/-/g, '');
const nextDay = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return compact(d.toISOString().slice(0, 10));
};
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

type Opts = { readonly lang: 'tr' | 'en'; readonly origin: string };

const summaryOf = (film: Film, en: boolean) =>
  `Cinech · ${film.title}${film.episode ? ` · ${film.episode}` : ''} ${en ? 'screening' : 'gösterimi'}`;

/** Gösterim tarihli filmlerden tüm gün etkinliklerle bir takvim üret */
export const buildIcs = (films: readonly Film[], { lang, origin }: Opts): string => {
  const en = lang === 'en';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cinech//Gosterim Programi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(en ? 'Cinech screenings' : 'Cinech gösterimleri')}`,
  ];
  for (const film of films) {
    if (!film.releaseDate) continue;
    const summary = summaryOf(film, en);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${film.id}-${film.releaseDate}@cinech`,
      `DTSTAMP:${stamp()}`,
      `DTSTART;VALUE=DATE:${compact(film.releaseDate)}`,
      `DTEND;VALUE=DATE:${nextDay(film.releaseDate)}`,
      `SUMMARY:${esc(summary)}`,
      `DESCRIPTION:${esc(`${film.tagline}\n${film.synopsis}\n${origin}/film/${film.slug}`)}`,
      `URL:${origin}/film/${film.slug}`,
      `CATEGORIES:${esc(film.genre.split(' · ').join(','))}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(en ? `Tomorrow: ${summary}` : `Yarın: ${summary}`)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return `${lines.map(fold).join('\r\n')}\r\n`;
};

/** Takvim dosyasını tarayıcıdan indir */
export const downloadIcs = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Google Takvim "etkinlik ekle" bağlantısı (yalnızca film bilgisi taşır) */
export const googleCalendarUrl = (film: Film, { lang, origin }: Opts): string | null => {
  if (!film.releaseDate) return null;
  const en = lang === 'en';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summaryOf(film, en),
    dates: `${compact(film.releaseDate)}/${nextDay(film.releaseDate)}`,
    details: `${film.tagline}\n${origin}/film/${film.slug}`,
    location: 'Cinech',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
