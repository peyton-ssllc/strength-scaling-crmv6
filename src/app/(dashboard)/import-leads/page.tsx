import { ImportForm } from "@/components/crm/import-form";
import { createSupabaseAdminClient } from "@/lib/admin";
import { requireCurrentProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

async function getAssignableUsers() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("id, full_name, email, role, is_active").eq("is_active", true).order("full_name", { ascending: true });
  return (data ?? []).map((user) => ({ id: user.id, name: user.full_name || user.email || "Unnamed User", email: user.email || "" }));
}

export default async function ImportLeadsPage() {
  const profile = await requireCurrentProfile();
  const users = profile.role === "admin" ? await getAssignableUsers() : [];
  return (
    <div className="space-y-8"><div><p className="mb-3 inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">Import Leads</p><h1 className="text-4xl font-black tracking-tight text-white">Lead import center</h1><p className="mt-2 max-w-2xl text-slate-400">Upload gym owner CSVs directly into the CRM. Admins can assign imports to a rep.</p></div><div className="grid gap-5 xl:grid-cols-[1fr_380px]"><ImportForm users={users} canChooseOwner={profile.role === "admin"} /><aside className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-6"><h2 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-sky-200">Clean CSV Tips</h2><p className="text-sm leading-7 text-slate-300">Best columns are business_name, contact_name, phone, email, city, state, website, notes, source, and monthly_retainer. SDR imports are automatically assigned to their own login.</p></aside></div></div>
  );
}
