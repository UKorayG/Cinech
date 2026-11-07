type DisplayProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly shadow?: 'ink' | 'cream' | 'red' | 'none';
  readonly as?: 'h1' | 'h2' | 'h3' | 'div' | 'span';
};

const SHADOW = { ink: 'text-hard', cream: 'text-hard-cream', red: 'text-hard-olive', none: '' } as const;

/** Retro afiş başlığı: Anton, büyük harf, blok gölge. */
export function Display({ children, className = '', shadow = 'ink', as: Tag = 'h2' }: DisplayProps) {
  return (
    <Tag className={`font-display uppercase leading-[0.9] tracking-wide ${SHADOW[shadow]} ${className}`}>{children}</Tag>
  );
}

/** Kırmızı el yazısı vurgu; başlığın üstüne biner. */
export function Script({
  children,
  className = '',
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  return <span className={`font-script leading-none ${className}`}>{children}</span>;
}
