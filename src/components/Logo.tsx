import Link from "next/link";

type LogoProps = {
  href?: string;
  className?: string;
  sizeClassName?: string;
  ariaLabel?: string;
};

export function Logo({
  href = "/",
  className = "",
  sizeClassName = "text-2xl",
  ariaLabel = "Teqnowebs home",
}: LogoProps) {
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
