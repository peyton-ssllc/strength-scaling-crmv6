import { createBrowserClient } from "@supabase/ssr";

function env(value: string | undefined) {
  return String(value || "").trim();
}

export function createSupabaseBrowserClient() {
  const supabaseUrl = env(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = env(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createBrowserClient(supabaseUrl, anonKey);
}
