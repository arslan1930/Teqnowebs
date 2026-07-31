export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const hasSupabaseConfig = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("YOUR_PROJECT") &&
    supabaseAnonKey !== "YOUR_ANON_KEY",
);

/** Default: local SQLite API (real database on the office PC). */
export const useLocalDb = !hasSupabaseConfig;

export const companyName = "Teqnowebs";
