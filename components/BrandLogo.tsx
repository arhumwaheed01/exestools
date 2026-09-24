type BrandLogoProps = {
  className?: string;
  title?: string;
};

/** Spinner-wheel mark for ExesTools (header + brand). */
export function BrandLogo({ className = "h-8 w-8", title = "ExesTools" }: BrandLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
      <path d="M32 32 L32 6 A26 26 0 0 1 54.5 19 Z" fill="#06b6d4" />
      <path d="M32 32 L54.5 19 A26 26 0 0 1 54.5 45 Z" fill="#22c55e" />
      <path d="M32 32 L54.5 45 A26 26 0 0 1 32 58 Z" fill="#eab308" />
      <path d="M32 32 L32 58 A26 26 0 0 1 9.5 45 Z" fill="#f97316" />
      <path d="M32 32 L9.5 45 A26 26 0 0 1 9.5 19 Z" fill="#ec4899" />
      <path d="M32 32 L9.5 19 A26 26 0 0 1 32 6 Z" fill="#a855f7" />
      <circle cx="32" cy="32" r="7" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="32" cy="32" r="3" fill="#22d3ee" />
      <path d="M32 2 L36 10 H28 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
    </svg>
  );
}
