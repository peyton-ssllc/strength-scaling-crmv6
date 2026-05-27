import { Suspense } from "react";
import { loginWithEmail } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

async function LoginForm({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params?.next || "/queue";
  const error = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
      <form
        action={loginWithEmail}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl"
      >
        <p className="mb-3 inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">
          Strength Scaling CRM
        </p>

        <h1 className="text-3xl font-black">Sign in</h1>
        <p className="mt-2 text-sm text-slate-400">
          Use your assigned Strength Scaling CRM login.
        </p>

        <input type="hidden" name="next" value={next} />

        <label className="mt-6 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Email
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-sky-300"
        />

        <label className="mt-4 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-sky-300"
        />

        {error ? (
          <p className="mt-3 text-sm font-bold text-red-300">
            {error === "missing" ? "Enter your email and password." : "Login failed. Check the email and password."}
          </p>
        ) : null}

        <button className="mt-6 h-12 w-full rounded-xl bg-sky-400 text-sm font-black text-black transition hover:bg-sky-300">
          Enter CRM
        </button>
      </form>
    </main>
  );
}

export default function LoginPage(props: LoginPageProps) {
  return (
    <Suspense fallback={null}>
      <LoginForm {...props} />
    </Suspense>
  );
}
