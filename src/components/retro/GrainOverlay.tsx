const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>",
  );

/** Tüm sayfanın üstünde sabit, hareketsiz kâğıt/film greni. Tek bir statik doku, maliyeti yok. */
export default function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[900] opacity-[0.16] mix-blend-multiply"
      style={{ backgroundImage: `url("${NOISE}")`, backgroundSize: '320px 320px' }}
    />
  );
}
