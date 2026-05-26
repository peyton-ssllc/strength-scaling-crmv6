import Link from "next/link";
import { ArrowRight, Mail, Phone, Search, Send, Zap } from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";
import { getQueueLeads } from "@/lib/leads";
import { logLeadOutcome } from "./actions";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const leads = await getQueueLeads();
  const lead = leads[0];
  const nextLeads = leads.slice(1, 6);

  return (
    <>
      <PageHeader eyebrow="My Queue" title="Call Mode" description="The SDR home base: one lead, one outcome, one save action. No wandering around the CRM." />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-lg bg-sky-400/12 text-sky-200"><Zap className="size-5" /></div><div><div className="font-bold text-white">Active Lead</div><div className="text-xs text-slate-500">{leads.length} leads waiting</div></div></div>
            {lead ? <span className="badge">Score {lead.score}</span> : null}
          </div>
          {!lead ? <div className="p-10 text-center text-slate-300">No leads are ready. Import a CSV to fill the queue.</div> : (
            <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
              <div className="p-6 lg:p-8">
                <div className="mb-4 flex flex-wrap items-center gap-2"><span className="badge">{lead.status}</span><span className="badge">{lead.source || "Imported"}</span></div>
                <h2 className="text-4xl font-black tracking-tight text-white">{lead.business}</h2>
                <p className="mt-2 text-slate-400">{[lead.city, lead.state].filter(Boolean).join(", ") || "Location missing"}</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <a className="btn" href={lead.phone ? `tel:${lead.phone}` : "#"}><Phone className="size-4" /> Call</a>
                  <a className="btn btn-secondary" href={lead.phone ? `sms:${lead.phone}` : "#"}><Send className="size-4" /> Text</a>
                  <a className="btn btn-secondary" href={lead.email ? `mailto:${lead.email}` : "#"}><Mail className="size-4" /> Email</a>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="surface p-4"><div className="label">Decision Maker</div><div className="mt-2 font-bold text-white">{lead.contact || "Not listed"}</div></div>
                  <div className="surface p-4"><div className="label">Phone</div><div className="mt-2 font-bold text-white">{lead.phone || "Not listed"}</div></div>
                  <div className="surface p-4"><div className="label">Email</div><div className="mt-2 font-bold text-white">{lead.email || "Not listed"}</div></div>
                  <div className="surface p-4"><div className="label">Last Touch</div><div className="mt-2 font-bold text-white">{lead.lastContacted || "Never"}</div></div>
                </div>
                <Link href={`/contacts/${lead.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sky-200 hover:text-sky-100">Open full record <ArrowRight className="size-4" /></Link>
              </div>
              <form action={logLeadOutcome} className="border-t border-white/10 bg-black/20 p-5 lg:border-l lg:border-t-0">
                <input type="hidden" name="leadId" value={lead.id} />
                <label className="label" htmlFor="outcome">Call Outcome</label>
                <select id="outcome" name="outcome" className="input mt-2"><option>Called</option><option>Callback</option><option>Follow Up</option><option>Interested</option><option>Booked</option><option>DNC</option><option>Lost</option></select>
                <label className="label mt-4 block" htmlFor="followUpAt">Follow-up</label>
                <input id="followUpAt" name="followUpAt" type="datetime-local" className="input mt-2" />
                <label className="label mt-4 block" htmlFor="note">Rep Note</label>
                <textarea id="note" name="note" rows={8} className="input mt-2 resize-none" placeholder="Write the useful part. Objection, interest, next step, timing." />
                <button className="btn mt-5 w-full" type="submit">Save & Load Next Lead</button>
              </form>
            </div>
          )}
        </section>
        <aside className="space-y-5">
          <div className="card p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold text-white"><Search className="size-4 text-sky-300" /> Up Next</div><div className="space-y-2">{nextLeads.length ? nextLeads.map((item)=><Link href={`/contacts/${item.id}`} key={item.id} className="block rounded-lg border border-white/10 bg-white/[.025] p-3 hover:bg-sky-400/10"><div className="font-bold text-white">{item.business}</div><div className="mt-1 text-xs text-slate-500">{item.status} · Score {item.score}</div></Link>) : <p className="text-sm text-slate-400">No more leads behind this one.</p>}</div></div>
          <div className="surface p-4"><div className="label">Speed Rule</div><p className="mt-2 text-sm leading-5 text-slate-300">Call, choose outcome, note the next action, save. The CRM should move as fast as the rep.</p></div>
        </aside>
      </div>
    </>
  );
}
