"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";
import { uploadLeads, type UploadLeadsState } from "@/app/(dashboard)/import-leads/actions";

type AssignableUser = {
  id: string;
  name: string;
  email: string;
};

const initialState: UploadLeadsState = {
  ok: false,
  message: "",
};

export function ImportForm({ users }: { users: AssignableUser[] }) {
  const [state, formAction, pending] = useActionState(uploadLeads, initialState);

  return (
    <form action={formAction} className="rounded-2xl border border-white/10 bg-slate-950/70 p-6">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            Assign Imported Leads To
          </label>
          <select
            name="assigned_to"
            className="h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm font-bold text-white outline-none focus:border-sky-300"
            defaultValue=""
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            CSV File
          </label>
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm font-bold text-white file:mr-4 file:rounded-lg file:border-0 file:bg-sky-400 file:px-4 file:py-2 file:font-black file:text-black"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-sky-400 px-5 text-sm font-black text-black transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="size-4" />
          {pending ? "Importing..." : "Import Leads"}
        </button>

        {state.message ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-bold ${
              state.ok
                ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                : "border-red-300/30 bg-red-400/10 text-red-200"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-6 text-slate-400">
          Supported columns: business_name, gym_name, contact_name, owner_name, phone,
          email, city, state, website, notes, score, source, status, pipeline_status,
          pipeline_rank, monthly_retainer, estimated_monthly_profit. The dropdown above
          assigns the internal contact owner.
        </div>
      </div>
    </form>
  );
}
