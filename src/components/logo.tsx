import Link from "next/link";

/** The pharmacy cross with a map dot punched through its centre: "the cross, located". */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M12 3h8a1 1 0 0 1 1 1v7h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7v7a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-7H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h7V4a1 1 0 0 1 1-1Z"
        fill="currentColor"
      />
      <circle cx="16" cy="16" r="3.4" fill="var(--color-paper)" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-green" aria-label="Dwa, home">
      <LogoMark />
      <span className="font-display text-[1.35rem] font-bold tracking-tight text-ink">dwa</span>
    </Link>
  );
}
