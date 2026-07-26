"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSessionProfile } from "@/lib/attendance";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      const profile = await getSessionProfile();
      if (!active) return;
      router.replace(profile ? "/dashboard/" : "/login/");
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <p className="text-sm text-[var(--muted)]">Loading attendance…</p>
    </main>
  );
}
