/** Kırmızı raptiye */
export default function Pin({ className = '' }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={`h-9 w-7 drop-shadow-[2px_3px_0_rgba(28,33,24,0.5)] ${className}`} aria-hidden>
      <path d="M16 40 L13 24 h6 Z" fill="#1C2118" />
      <rect x="9" y="18" width="14" height="7" rx="2" fill="#5E381B" />
      <path d="M6 18 h20 l-3 -5 h-14 Z" fill="#7A4A24" />
      <rect x="10" y="3" width="12" height="11" rx="3" fill="#9A6333" />
      <rect x="12" y="4" width="3" height="8" rx="1.5" fill="#EAE4D2" opacity="0.6" />
    </svg>
  );
}
