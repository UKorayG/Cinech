import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FILMS, filmBySlug } from '@/data/films';
import FilmDetail from '@/components/film/FilmDetail';

type Params = { readonly slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return FILMS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const film = filmBySlug(slug);
  if (!film) return {};
  const title = film.episode ? `${film.title} · ${film.episode}` : film.title;
  return {
    title: `${title} · Cinech`,
    description: film.tagline,
    openGraph: {
      title,
      description: film.synopsis,
      type: 'video.movie',
      images: film.image ? [{ url: film.image }] : undefined,
    },
  };
}

export default async function FilmPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const film = filmBySlug(slug);
  if (!film) notFound();
  return <FilmDetail film={film} />;
}
