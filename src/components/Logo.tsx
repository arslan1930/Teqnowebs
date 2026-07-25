import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  sizeClassName?: string;
  ariaLabel?: string;
  /** Large brand treatment for the home hero (text wordmark). */
  variant?: "default" | "wordmark";
};

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
        className={`inline-flex items-baseline font-display font-bold tracking-tight ${className}`}
        aria-label={ariaLabel}
      >
        <span className={`${sizeClassName} leading-none`}>
          <span className="text-ink">Teqno</span>
          <span className="text-accent">webs</span>
          <span className={`${sizeClassName} text-signal`}>.</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-display font-bold tracking-tight ${className}`}
      aria-label={ariaLabel}
    >
      <Image
        src="/logo.svg"
        alt=""
        width={160}
        height={28}
        className="h-7 w-auto"
        priority
      />
    </Link>
  );
}
