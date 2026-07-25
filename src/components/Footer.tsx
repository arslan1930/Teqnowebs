import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

const serviceLinks = [
  { href: "/services#web", label: "Web development" },
  { href: "/services#design", label: "Graphic design" },
  { href: "/services#seo", label: "SEO & link building" },
  { href: "/software", label: "Custom software" },
];

const softwareLinks = [
  { href: "/software#sales", label: "Sales systems" },
  { href: "/software#invoicing", label: "Invoicing" },
  { href: "/software#warehouse", label: "Warehouse" },
  { href: "/software#tracking", label: "Order tracking" },
];

const companyLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/contact", label: "Get a quote" },
];

function PaymentIcon({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      title={title}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-3 text-ink shadow-sm transition hover:border-accent/40 hover:shadow-md"
    >
      <svg viewBox="0 0 48 32" className={className} role="img" aria-label={title} fill="none">
        {children}
      </svg>
    </span>
  );
}

export function Footer() {
  return (
    <footer className="footer-soft border-t border-line text-ink">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Websites, design, growth, and business software — built so your customers find you and
            your team can run the day-to-day.
          </p>
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-wide text-ink">Services</p>
          <ul className="mt-4 space-y-2.5">
            {serviceLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-wide text-ink">Software</p>
          <ul className="mt-4 space-y-2.5">
            {softwareLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-wide text-ink">Company</p>
          <ul className="mt-4 space-y-2.5">
            {companyLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-sm font-semibold tracking-wide text-ink">
              Accepted payment methods
            </p>
            <p className="mt-1 text-xs text-muted">
              Secure payments via bank transfer, PayPal, Wise, and card.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PaymentIcon title="Bank transfer" className="w-9 h-6">
              <path d="M24 4 6 12h36L24 4Z" fill="currentColor" opacity="0.9" />
              <rect x="9" y="14" width="3" height="10" rx="1" fill="currentColor" />
              <rect x="16" y="14" width="3" height="10" rx="1" fill="currentColor" />
              <rect x="23" y="14" width="3" height="10" rx="1" fill="currentColor" />
              <rect x="30" y="14" width="3" height="10" rx="1" fill="currentColor" />
              <rect x="6" y="26" width="36" height="3" rx="1.5" fill="currentColor" />
            </PaymentIcon>
            <span
              title="PayPal"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-3 text-ink shadow-sm transition hover:border-accent/40 hover:shadow-md"
            >
              <svg
                viewBox="0 0 80 32"
                className="w-16 h-6"
                role="img"
                aria-label="PayPal"
                fill="none"
              >
                <path
                  d="M12.5 6h8.9c4.3 0 7.2 2.2 6.5 6.9-.7 5-4.2 7.1-8.8 7.1h-2.3c-.6 0-1 .4-1.1 1l-1 6.4c-.1.5-.5.9-1 .9H9.2c-.5 0-.8-.4-.7-.9L11.4 7c.1-.6.6-1 1.1-1Z"
                  fill="#003087"
                />
                <path
                  d="M28 12.9c-.7 5-4.2 7.1-8.8 7.1h-2.3c-.6 0-1 .4-1.1 1l-1 6.4c-.1.5-.5.9-1 .9h-3.2l.1-.6c.1-.6.6-1 1.1-1h1.9c4.6 0 8.1-2.1 8.8-7.1.4-2.7-.4-4.6-1.9-5.7 1.9.6 3 2.2 2.4 5v-.1c1.6-3.5 4.5-5.9 4.5-5.9Z"
                  fill="#001C64"
                />
                <path
                  d="M31.5 6h8.9c4.3 0 7.2 2.2 6.5 6.9-.7 5-4.2 7.1-8.8 7.1h-2.3c-.6 0-1 .4-1.1 1l-1 6.4c-.1.5-.5.9-1 .9h-3.5c-.5 0-.8-.4-.7-.9L30.4 7c.1-.6.6-1 1.1-1Z"
                  fill="#0070E0"
                />
                <text
                  x="52"
                  y="22"
                  fontFamily="Arial, sans-serif"
                  fontSize="13"
                  fontWeight="700"
                  fill="#003087"
                >
                  Pay
                </text>
              </svg>
            </span>
            <span
              title="Wise"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-3 text-ink shadow-sm transition hover:border-accent/40 hover:shadow-md"
            >
              <svg
                viewBox="0 0 80 32"
                className="w-14 h-6"
                role="img"
                aria-label="Wise"
                fill="none"
              >
                <path
                  d="M8 8h10l-6 7 4 9-4-9 12-1-8 9h14"
                  stroke="#163300"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                />
                <text
                  x="42"
                  y="22"
                  fontFamily="Arial, sans-serif"
                  fontSize="14"
                  fontWeight="700"
                  fill="#163300"
                >
                  wise
                </text>
              </svg>
            </span>
            <PaymentIcon title="Mastercard" className="w-10 h-6">
              <circle cx="19" cy="16" r="10" fill="#EB001B" />
              <circle cx="29" cy="16" r="10" fill="#F79E1B" />
              <path d="M24 8.5a10 10 0 0 1 0 15 10 10 0 0 1 0-15Z" fill="#FF5F00" />
            </PaymentIcon>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Teqnowebs. All rights reserved.</p>
          <p>Web · Design · SEO · Software</p>
        </div>
      </div>
    </footer>
  );
}
