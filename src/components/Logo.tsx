import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  sizeClassName?: string;
  ariaLabel?: string;
  /** Large brand treatment for the home hero. */
  variant?: "default" | "wordmark";
};

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="32" height="32" rx="8" fill="#2563eb" />
      <path d="M10 10h12v3.4h-4.3V22h-3.4v-8.6H10V10z" fill="#fff" />
    </svg>
  );
}

function Wordmark({ sizeClassName }: { sizeClassName: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-display font-bold tracking-tight ${sizeClassName} leading-none`}
    >
      <span className="text-ink">Teqno</span>
      <span className="text-accent">webs</span>
      <span className="text-signal">.</span>
    </span>
  );
}

export function Logo({
  href = "/",
  className = "",
  sizeClassName = "text-2xl",
  ariaLabel = "Teqnowebs home",
  variant = "default",
}: LogoProps) {
  if (variant === "wordmark") {
    return (
      <Link
        href={href}
        className={`inline-flex items-center gap-3 sm:gap-4 ${className}`}
        aria-label={ariaLabel}
      >
        <Mark className="h-10 w-10 shrink-0 sm:h-12 sm:w-12 md:h-14 md:w-14" />
        <Wordmark sizeClassName={sizeClassName} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 ${className}`}
      aria-label={ariaLabel}
    >
      <Mark className="h-7 w-7 shrink-0" />
      <Wordmark sizeClassName={sizeClassName} />
    </Link>
  );
}
