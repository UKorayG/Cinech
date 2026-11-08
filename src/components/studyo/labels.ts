import type { ApplicationFormat, ApplicationPipeline } from '@/hooks/useStudioApplications';

type Label = { readonly tr: string; readonly en: string };

export const FORMAT_LABELS: Record<ApplicationFormat, Label> = {
  kisa: { tr: 'Kısa film', en: 'Short film' },
  dizi: { tr: 'Dizi bölümü', en: 'Series episode' },
  uzun: { tr: 'Uzun metraj', en: 'Feature' },
};

export const PIPELINE_LABELS: Record<ApplicationPipeline, Label> = {
  remotion: { tr: 'Remotion', en: 'Remotion' },
  blender: { tr: 'Blender', en: 'Blender' },
  karma: { tr: 'Karma', en: 'Hybrid' },
  canli: { tr: 'Canlı çekim', en: 'Live action' },
};

export const FORMAT_IDS = Object.keys(FORMAT_LABELS) as ApplicationFormat[];
export const PIPELINE_IDS = Object.keys(PIPELINE_LABELS) as ApplicationPipeline[];

export const pick = (label: Label, en: boolean) => (en ? label.en : label.tr);

/** YYYY-AA biçimindeki ayı "Kasım 2026" / "November 2026" olarak yazar. */
export const formatMonth = (ym: string, en: boolean) => {
  const d = new Date(`${ym}-01T00:00:00`);
  if (Number.isNaN(d.getTime())) return ym;
  return d.toLocaleDateString(en ? 'en-GB' : 'tr-TR', { month: 'long', year: 'numeric' });
};

/** İçinde bulunulan ay, YYYY-AA; ay girdisinin alt sınırı. */
export const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
