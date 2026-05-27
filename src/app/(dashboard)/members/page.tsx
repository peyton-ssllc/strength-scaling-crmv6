import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/admin";
import { requireAdminProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

async function updateMemberRole(formData: FormData) {
  "use server";
  await requireAdminProfile();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "sdr");
  const supabase = createSupabaseAdminClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  redirect("/members");
}

export default async function MembersPage() {
  await requireAdminProfile();
  const supabase = createSupabaseAdminClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at")
    .order("created_at", { ascending: false });

  const safeMembers = (members ?? []) as Profile[];
  const admins = safeMembers.filter((member) => member.role === "admin").length;
  const sdrs = safeMembers.filter((member) => member.role === "sdr").length;
  const active = safeMembers.filter((member) => member.is_active !== false).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">Members</p>
        <h1 className="text-4xl font-black tracking-tight text-white">Team members</h1>
        <p className="mt-2 max-w-2xl text-slate-400">Admins can see all records. SDRs only see assigned contacts and queue leads.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[["Active Users", active], ["Admins", admins], ["SDRs", sdrs]].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-5">
            <div className="text-sm font-bold text-slate-400">{label}</div>
            <div className="mt-2 text-3xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
        <div className="grid grid-cols-[1.4fr_1.2fr_180px_120px] border-b border-white/10 bg-white/[0.02] px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          <div>Name</div><div>Email</div><div>Role</div><div>Status</div>
        </div>
        <div className="divide-y divide-white/10">
          {safeMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-[1.4fr_1.2fr_180px_120px] items-center gap-4 px-5 py-4">
              <div className="min-w-0"><div className="truncate text-sm font-black text-white">{member.full_name || member.email || "Unnamed User"}</div><div className="mt-1 truncate text-xs text-slate-500">{member.id}</div></div>
              <div className="truncate text-sm text-slate-300">{member.email || "No email"}</div>
              <form action={updateMemberRole} className="flex gap-2">
                <input type="hidden" name="id" value={member.id} />
                <select name="role" defaultValue={member.role || "sdr"} className="h-9 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-bold text-white">
                  <option value="admin">admin</option>
                  <option value="sdr">sdr</option>
                </select>
                <button className="h-9 rounded-lg bg-sky-400 px-3 text-xs font-black text-black">Save</button>
              </form>
              <div><span className={`rounded-full border px-3 py-1 text-xs font-black ${member.is_active === false ? "border-red-300/30 bg-red-400/10 text-red-200" : "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"}`}>{member.is_active === false ? "Inactive" : "Active"}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
