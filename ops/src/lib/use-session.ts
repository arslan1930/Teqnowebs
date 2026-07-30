"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "./api-client";
import type { User } from "./types";

export function useSession(opts?: { adminOnly?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { user: u } = await apiGet<{ user: User | null }>("/api/auth/me");
        if (!active) return;
        if (!u) {
          router.replace("/login");
          return;
        }
        if (opts?.adminOnly && u.role !== "admin") {
          router.replace("/home");
          return;
        }
        setUser(u);
      } catch {
        if (active) router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router, opts?.adminOnly]);

  return { user, loading };
}
