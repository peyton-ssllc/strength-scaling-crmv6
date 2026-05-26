import { PageHeader } from "@/components/crm/page-header";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { createRepLogin } from "./actions";

export const dynamic = "force-dynamic";

async function getMembers() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("id,full_name,email,role,is_active,created_at").order("created_at", { ascending: false });
  return data || [];
}

export default async function MembersPage() {
  const members = await getMembers();
  return (
    <>
      <PageHeader eyebrow="Members" title="Rep logins" description="Create SDR and admin accounts for your team. Give each rep their email and temporary password." />
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <form action={createRepLogin} className="card grid gap-4 p-6"><div><label className="label">Full Name</label><input name="fullName" className="input mt-2" /></div><div><label className="label">Email *</label><input name="email" type="email" className="input mt-2" required /></div><div><label className="label">Temporary Password *</label><input name="password" type="text" minLength={8} className="input mt-2" required /></div><div><label className="label">Role</label><select name="role" className="input mt-2"><option value="sdr">SDR Rep</option><option value="admin">Admin</option></select></div><button className="btn" type="submit">Create Login</button><p className="text-xs leading-5 text-slate-500">This creates a Supabase Auth user and profile. Full login protection can be added in the next auth pass.</p></form>
        <section className="card overflow-hidden"><div className="border-b border-white/10 p-4 font-black text-white">Team Members</div>{members.length ? members.map((member: any) => <div key={member.id} className="grid gap-2 border-b border-white/10 p-4 md:grid-cols-[1fr_160px_100px]"><div><div className="font-bold text-white">{member.full_name || member.email}</div><div className="text-sm text-slate-500">{member.email}</div></div><span className="badge w-fit">{member.role === "admin" ? "Admin" : "SDR Rep"}</span><div className="text-sm text-slate-400">{member.is_active ? "Active" : "Inactive"}</div></div>) : <div className="p-5 text-sm text-slate-400">No members created yet.</div>}</section>
      </div>
    </>
  );
}
