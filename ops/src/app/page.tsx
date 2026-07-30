"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import type { User } from "@/lib/types";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        const { user } = await apiGet<{ user: User | null }>("/api/auth/me");
        router.replace(user ? "/home" : "/login");
      } catch {
        router.replace("/login");
      }
    })();
  }, [router]);
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <p className="text-sm text-[var(--muted)]">Loading Ops…</p>
    </main>
  );
}
