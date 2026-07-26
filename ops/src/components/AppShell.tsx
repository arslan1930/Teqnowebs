"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { apiSend } from "@/lib/api-client";
import type { User } from "@/lib/types";

const staffLinks = [
  { href: "/home", label: "Home" },
  { href: "/tasks", label: "Inventory" },
  { href: "/clients", label: "Clients" },
];

const adminLinks = [
  ...staffLinks,
  { href: "/pnl", label: "P&L" },
  { href: "/team", label: "Team" },
  { href: "/import", label: "Import" },
];

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = user.role === "admin" ? adminLinks : staffLinks;

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <BrandMark size="sm" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--muted)]">
            {user.fullName} · {user.role}
          </span>
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
            onClick={async () => {
              await apiSend("/api/auth/logout", "POST");
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <nav className="mt-6 flex flex-wrap gap-2">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border px-4 py-1.5 text-sm font-medium"
              style={{
                background: active ? "var(--accent)" : "#fff",
                borderColor: active ? "var(--accent)" : "var(--line)",
                color: active ? "#fff" : "var(--ink)",
              }}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
