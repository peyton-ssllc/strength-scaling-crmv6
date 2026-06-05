import { createSupabaseAdminClient } from "@/lib/admin";
import { requireAdminProfile } from "@/lib/auth/server";
import {
  createMember,
  deactivateMember,
  reactivateMember,
  updateMemberRole,
} from "./actions";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
};

function roleLabel(role: string | null) {
  return role === "admin" ? "Admin" : "SDR";
}

function nameFor(profile: Profile) {
  return profile.full_name || profile.email || "Unnamed member";
}

export default async function MembersPage() {
  const currentAdmin = await requireAdminProfile();
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .order("is_active", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  const members = (data || []) as Profile[];
  const activeMembers = members.filter((member) => member.is_active !== false);
  const adminCount = activeMembers.filter((member) => member.role === "admin").length;
  const sdrCount = activeMembers.filter((member) => member.role !== "admin").length;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <span className="inline-flex w-fit rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-1 text-sm font-bold text-sky-100">
          Members
        </span>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Team members
          </h1>
          <p className="mt-3 max-w-3xl text-lg font-semibold text-slate-400">
            Admins can see all records. SDRs only see assigned contacts and queue leads.
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/25">
        <div className="mb-5">
          <h2 className="text-2xl font-black text-white">Add a member</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Create an admin or SDR login. Use a temporary password they can change later.
          </p>
        </div>

        <form action={createMember} className="grid gap-4 lg:grid-cols-[1.2fr_1.4fr_1fr_160px_auto]">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Full name
            </span>
            <input
              name="fullName"
              placeholder="Levi G."
              className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base font-bold text-white outline-none transition focus:border-sky-300/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Email
            </span>
            <input
              required
              name="email"
              type="email"
              placeholder="rep@strengthscaling.com"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base font-bold text-white outline-none transition focus:border-sky-300/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Temp password
            </span>
            <input
              required
              minLength={8}
              name="password"
              type="text"
              placeholder="8+ characters"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base font-bold text-white outline-none transition focus:border-sky-300/60"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
              Role
            </span>
            <select
              name="role"
              defaultValue="sdr"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-base font-bold text-white outline-none transition focus:border-sky-300/60"
            >
              <option value="sdr">SDR</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-7 h-12 rounded-xl bg-sky-400 px-6 text-base font-black text-black transition hover:bg-sky-300"
          >
            Add Member
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-7">
          <p className="text-lg font-black text-slate-400">Active Users</p>
          <p className="mt-5 text-4xl font-black text-white">{activeMembers.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-7">
          <p className="text-lg font-black text-slate-400">Admins</p>
          <p className="mt-5 text-4xl font-black text-white">{adminCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-7">
          <p className="text-lg font-black text-slate-400">SDRs</p>
          <p className="mt-5 text-4xl font-black text-white">{sdrCount}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/25">
        <div className="grid grid-cols-[1.2fr_1.3fr_280px_140px_220px] border-b border-white/10 px-7 py-4 text-xs font-black uppercase tracking-[0.35em] text-slate-500">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {members.length === 0 ? (
          <div className="px-7 py-10 text-lg font-bold text-slate-400">
            No members yet. Add the first admin above.
          </div>
        ) : (
          members.map((member) => {
            const isCurrentUser = member.id === currentAdmin.id;
            const isActive = member.is_active !== false;

            return (
              <div
                key={member.id}
                className="grid grid-cols-[1.2fr_1.3fr_280px_140px_220px] items-center gap-4 border-b border-white/10 px-7 py-5 last:border-b-0"
              >
                <div>
                  <p className="text-lg font-black text-white">{nameFor(member)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{member.id}</p>
                </div>

                <p className="text-base font-bold text-slate-300">{member.email || "No email"}</p>

                <form action={updateMemberRole} className="flex items-center gap-3">
                  <input type="hidden" name="id" value={member.id} />
                  <select
                    name="role"
                    defaultValue={member.role === "admin" ? "admin" : "sdr"}
                    disabled={!isActive}
                    className="h-12 w-32 rounded-xl border border-white/10 bg-black/30 px-4 text-base font-black text-white outline-none transition focus:border-sky-300/60 disabled:opacity-40"
                  >
                    <option value="admin">admin</option>
                    <option value="sdr">sdr</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!isActive}
                    className="h-12 rounded-xl bg-sky-400 px-5 text-base font-black text-black transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Save
                  </button>
                </form>

                <span
                  className={`w-fit rounded-full border px-4 py-2 text-sm font-black ${
                    isActive
                      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                      : "border-red-300/30 bg-red-400/10 text-red-200"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>

                <div className="flex items-center gap-3">
                  {isCurrentUser ? (
                    <span className="rounded-xl border border-white/10 px-4 py-3 text-sm font-black text-slate-400">
                      You
                    </span>
                  ) : isActive ? (
                    <form action={deactivateMember}>
                      <input type="hidden" name="id" value={member.id} />
                      <button
                        type="submit"
                        className="h-12 rounded-xl border border-red-300/25 bg-red-400/10 px-5 text-base font-black text-red-100 transition hover:bg-red-400/20"
                      >
                        Remove
                      </button>
                    </form>
                  ) : (
                    <form action={reactivateMember}>
                      <input type="hidden" name="id" value={member.id} />
                      <button
                        type="submit"
                        className="h-12 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-5 text-base font-black text-emerald-100 transition hover:bg-emerald-400/20"
                      >
                        Reactivate
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
