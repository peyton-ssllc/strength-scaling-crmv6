import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { createFirstAdmin } from "./actions";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if ((count || 0) > 0) redirect("/login");

  return (
    <main className="grid min-h-screen place-items-center bg-[#02050d] px-4 text-white">
      <form action={createFirstAdmin} className="card w-full max-w-md p-7">
        <div className="mb-6 grid size-12 place-items-center rounded-lg bg-sky-400/12 text-sky-300"><Lock className="size-6" /></div>
        <h1 className="text-3xl font-black">Create First Admin</h1>
        <p className="mt-2 text-sm text-slate-400">This page only works before any team profiles exist.</p>
        <div className="mt-6 grid gap-4"><div><label className="label">Full Name</label><input name="fullName" className="input mt-2" required /></div><div><label className="label">Email</label><input name="email" type="email" className="input mt-2" required /></div><div><label className="label">Password</label><input name="password" type="text" minLength={8} className="input mt-2" required /></div></div>
        <button className="btn mt-6 w-full" type="submit">Create Admin</button>
      </form>
    </main>
  );
}
