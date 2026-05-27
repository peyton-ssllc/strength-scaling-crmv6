import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/auth/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
