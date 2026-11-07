/** Üstünde ve altında perforasyon bandı olan film karesi çerçevesi. */
export default function FilmFrame({
  children,
  className = '',
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-md bg-cinech-ink ${className}`}>
      <div className="film-strip h-5" aria-hidden />
      <div className="bg-cinech-ink">{children}</div>
      <div className="film-strip h-5" aria-hidden />
    </div>
  );
}
