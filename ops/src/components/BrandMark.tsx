export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <div className="inline-flex items-center gap-3">
      <svg viewBox="0 0 32 32" className={`${box} shrink-0`} aria-hidden>
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path d="M10 10h12v3.4h-4.3V22h-3.4v-8.6H10V10z" fill="#fff" />
      </svg>
      <span
        className={`font-display font-bold tracking-tight ${text}`}
        style={{ fontFamily: "var(--font-bricolage), system-ui, sans-serif" }}
      >
        <span className="text-[var(--ink)]">Teqno</span>
        <span className="text-[var(--accent)]">webs</span>
        <span className="text-[var(--muted)]">.</span>
      </span>
    </div>
  );
}
