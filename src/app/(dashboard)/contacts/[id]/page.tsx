import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";
import { getLeadActivities, getLeadById } from "@/lib/leads";
import { logContactOutcome } from "./actions";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getLeadById(id);
  if (!contact) notFound();
  const activities = await getLeadActivities(id);

  return (
    <>
      <Link href="/contacts" className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="size-4" /> Back to contacts</Link>
      <PageHeader eyebrow="Contact" title={contact.business} description="Lead details, call logging, notes, and activity timeline." />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="space-y-5">
          <div className="card p-6">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black text-white">{contact.business}</h2><p className="text-slate-400">{contact.contact || "No contact name"}</p></div><span className="badge">{contact.status}</span></div>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <a href={contact.phone ? `tel:${contact.phone}` : "#"} className="surface flex items-center gap-3 p-3"><Phone className="size-4 text-sky-300" /> {contact.phone || "No phone"}</a>
              <a href={contact.email ? `mailto:${contact.email}` : "#"} className="surface flex items-center gap-3 p-3"><Mail className="size-4 text-sky-300" /> {contact.email || "No email"}</a>
              <div className="surface flex items-center gap-3 p-3"><MapPin className="size-4 text-sky-300" /> {[contact.city, contact.state].filter(Boolean).join(", ") || "No location"}</div>
            </div>
            <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4"><div className="label">Current Notes</div><p className="mt-2 text-sm text-slate-300">{contact.notes || "No notes yet."}</p></div>
          </div>

          <div className="card p-6">
            <div className="mb-4 font-black text-white">Log Call Outcome</div>
            <form action={logContactOutcome} className="grid gap-4">
              <input type="hidden" name="leadId" value={contact.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="outcome">Outcome</label><select id="outcome" name="outcome" className="input mt-2"><option>Called</option><option>Callback</option><option>Follow Up</option><option>Interested</option><option>Booked</option><option>DNC</option><option>Lost</option></select></div>
                <div><label className="label">Quick Actions</label><div className="mt-2 grid grid-cols-2 gap-2"><a className="btn btn-secondary" href={contact.phone ? `tel:${contact.phone}` : "#"}>Call</a><a className="btn btn-secondary" href={contact.phone ? `sms:${contact.phone}` : "#"}>Text</a></div></div>
              </div>
              <div><label className="label" htmlFor="note">Note</label><textarea id="note" name="note" rows={5} className="input mt-2 resize-none" placeholder="Outcome, objection, next step, and timing." /></div>
              <button type="submit" className="btn w-fit">Save Call Log</button>
            </form>
          </div>
        </section>

        <aside className="card p-6">
          <div className="label mb-4">Activity Timeline</div>
          <div className="space-y-3">
            {activities.length ? activities.map((item) => <div key={item.id} className="rounded-lg border border-white/10 p-3"><div className="font-semibold text-white">{item.outcome || item.type}</div><div className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</div><p className="mt-2 text-sm text-slate-300">{item.note || "No note"}</p></div>) : <p className="text-sm text-slate-400">No activity yet. Log the first call here or from My Queue.</p>}
          </div>
        </aside>
      </div>
    </>
  );
}
