export function LogoMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return <svg className={className} viewBox="0 0 80 96" aria-hidden="true" focusable="false">
    <g className={animated ? "opening-tile" : undefined}>
      <rect x="16" y="10" width="48" height="48" rx="7" transform="rotate(15 40 34)" fill="#b9b8f5" />
    </g>
    <rect x="16" y="80" width="48" height="8" rx="4" fill="#777a9e" />
  </svg>;
}
