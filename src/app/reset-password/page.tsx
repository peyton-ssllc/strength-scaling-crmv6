import { Suspense } from "react";
import { updateRecoveredPassword } from "./actions";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

async function ResetPasswordForm({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020817] px-6 text-white">
      <form
        action={updateRecoveredPassword}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl"
      >
        <div className="mb-5 flex items-center gap-3">
          <img src="/brand/strength-scaling-logo.png" alt="Strength Scaling" className="size-14 object-contain" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">Strength Scaling</p>
            <p className="text-sm font-semibold text-slate-500">CRM</p>
          </div>
        </div>

        <h1 className="text-3xl font-black">Reset password</h1>
        <p className="mt-2 text-sm text-slate-400">
          Choose a new password for this CRM account.
        </p>

        <label className="mt-6 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          New password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-sky-300"
        />

        <label className="mt-4 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Confirm password
        </label>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-white outline-none focus:border-sky-300"
        />

        {error ? (
          <p className="mt-3 text-sm font-bold text-red-300">
            {error === "short"
              ? "Use at least 8 characters."
              : error === "mismatch"
                ? "The passwords do not match."
                : "That reset link is no longer valid. Send a new recovery email."}
          </p>
        ) : null}

        <button className="mt-6 h-12 w-full rounded-xl bg-sky-400 text-sm font-black text-black transition hover:bg-sky-300">
          Save new password
        </button>
      </form>
    </main>
  );
}

export default function ResetPasswordPage(props: ResetPasswordPageProps) {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm {...props} />
    </Suspense>
  );
}
