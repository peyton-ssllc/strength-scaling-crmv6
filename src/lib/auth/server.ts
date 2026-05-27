import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseAdminClient } from "@/lib/supabase";

function env(value: string | undefined) {
  return String(value || "").trim();
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = env(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = env(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always set cookies; middleware handles refreshes.
        }
      }
    }
  });
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("profiles").select("id,full_name,email,role,is_active").eq("id", user.id).maybeSingle();
  return data;
}
