"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/software", label: "Software" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium transition-colors text-ink-soft hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="cta-gradient px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            Get a quote
          </Link>
        </nav>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-5 flex-col gap-1.5">
            <span
              className={`h-0.5 w-full bg-ink transition ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-full bg-ink transition ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-full bg-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </div>
        </button>
      </div>
      {open ? (
        <nav
          className="border-b border-line bg-paper/95 px-5 py-4 backdrop-blur md:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-2.5">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-sm font-medium text-ink-soft"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="cta-gradient mt-2 inline-flex px-4 py-2.5 text-sm font-semibold text-white"
                onClick={() => setOpen(false)}
              >
                Get a quote
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
