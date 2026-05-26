"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";
import { uploadLeads } from "@/app/(dashboard)/import-leads/actions";

async function submitAction(_: { message: string }, formData: FormData) {
  try {
    const result = await uploadLeads(formData);
    return { message: `Imported ${result.inserted} leads. Open Contacts or My Queue to work them.` };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Import failed" };
  }
}

export function ImportForm() {
  const [state, action, pending] = useActionState(submitAction, { message: "" });
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action} className="card p-6">
      <label className="label" htmlFor="file">CSV file</label>
      <input id="file" name="file" type="file" accept=".csv,text/csv" className="input mt-2 file:mr-4 file:rounded-md file:border-0 file:bg-sky-300 file:px-3 file:py-2 file:font-bold file:text-slate-950" required />
      <button className="btn mt-5" type="submit" disabled={pending}><Upload className="size-4" /> {pending ? "Importing..." : "Import Leads"}</button>
      {state.message ? <p className="mt-4 text-sm text-slate-300">{state.message}</p> : null}
      <div className="mt-6 rounded-lg border border-white/10 bg-black/25 p-4 text-sm text-slate-400">Supported columns: business, gym name, contact, owner, phone, email, city, state, website, notes, score, source.</div>
    </form>
  );
}
