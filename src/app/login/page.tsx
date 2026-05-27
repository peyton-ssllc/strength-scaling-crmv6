"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/queue";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#02050d] px-4 text-white">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-7">
        <div className="mb-6 grid size-12 place-items-center rounded-lg bg-sky-400/12 text-sky-300"><Lock className="size-6" /></div>
        <h1 className="text-3xl font-black">Strength Scaling CRM</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in with the account your admin created.</p>
        <div className="mt-6 grid gap-4">
          <div><label className="label">Email</label><input className="input mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          <div><label className="label">Password</label><input className="input mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        </div>
        {error ? <div className="mt-4 rounded-lg border border-red-300/30 bg-red-400/10 p-3 text-sm text-red-100">{error}</div> : null}
        <button className="btn mt-6 w-full" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
      </form>
    </main>
  );
}
