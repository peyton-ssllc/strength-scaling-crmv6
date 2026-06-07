import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarClock, ChevronLeft, ChevronRight, Mail, MapPin, NotebookPen, Phone, UserRound } from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";
import { getLeadActivities, getLeadById, getLeadNavigation, getLeadOwner, getTeamMembers } from "@/lib/leads";
import { deleteContact } from "../actions";
import { addContactNote, addContactToPipeline, assignContactOwner, logContactOutcome } from "./actions";

export const dynamic = "force-dynamic";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function dateTime(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function isPipelineAccount(contact: Awaited<ReturnType<typeof getLeadById>>) {
  if (!contact) return false;
  return contact.source === "Pipeline Manual Entry" || contact.pipelineStatus !== "next_up" || contact.monthlyRetainer > 0 || contact.estimatedMonthlyProfit > 0 || Boolean(contact.pipelineNotes);
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    call: "Call",
    note: "Note",
    email: "Email",
    text: "Text",
    status_change: "Update",
    meeting_booked: "Meeting",
    pipeline_stage_changed: "Pipeline"
  };
  return labels[type] || type;
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getLeadById(id);
  if (!contact) notFound();

  const inPipeline = isPipelineAccount(contact);

  const [activities, members, owner, navigation] = await Promise.all([
    getLeadActivities(id),
    getTeamMembers(),
    getLeadOwner(contact.assignedTo),
    getLeadNavigation(id)
  ]);

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/contacts" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white"><ArrowLeft className="size-4" /> Back to contacts</Link>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-slate-400">
            {navigation.currentIndex >= 0 ? `${navigation.currentIndex + 1} of ${navigation.total}` : `${navigation.total} contacts`}
          </div>
          {navigation.previous ? (
            <Link href={`/contacts/${navigation.previous.id}`} className="inline-flex items-center gap-2 rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-sm font-black text-sky-100 hover:bg-sky-400/20">
              <ChevronLeft className="size-4" />
              <span className="max-w-40 truncate">{navigation.previous.business}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-black text-slate-600">
              <ChevronLeft className="size-4" />
              Previous
            </span>
          )}
          {navigation.next ? (
            <Link href={`/contacts/${navigation.next.id}`} className="inline-flex items-center gap-2 rounded-xl border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-sm font-black text-sky-100 hover:bg-sky-400/20">
              <span className="max-w-40 truncate">{navigation.next.business}</span>
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-black text-slate-600">
              Next
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
      </div>
      <PageHeader eyebrow="Contact Record" title={contact.business} description="Owner, notes, contact details, call logging, pipeline context, and complete timestamped activity." />

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="space-y-5">
          <div className="card p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2"><span className="badge">{contact.status}</span><span className="badge">Score {contact.score}</span><span className="badge">{contact.source || "CRM"}</span></div>
                <h2 className="text-3xl font-black text-white">{contact.business}</h2>
                <p className="mt-1 text-slate-400">{contact.contact || "No contact name"}</p>
              </div>
              <form action={deleteContact}><input type="hidden" name="leadId" value={contact.id} /><button type="submit" className="rounded-lg border border-red-300/30 bg-red-400/10 px-4 py-2 text-sm font-black text-red-200">Delete</button></form>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <a href={contact.phone ? `tel:${contact.phone}` : "#"} className="surface flex items-center gap-3 p-4"><Phone className="size-4 text-sky-300" /><div><div className="label">Phone</div><div className="font-bold text-white">{contact.phone || "No phone"}</div></div></a>
              <a href={contact.email ? `mailto:${contact.email}` : "#"} className="surface flex items-center gap-3 p-4"><Mail className="size-4 text-sky-300" /><div><div className="label">Email</div><div className="font-bold text-white">{contact.email || "No email"}</div></div></a>
              <div className="surface flex items-center gap-3 p-4"><MapPin className="size-4 text-sky-300" /><div><div className="label">Location</div><div className="font-bold text-white">{[contact.city, contact.state].filter(Boolean).join(", ") || "No location"}</div></div></div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2 font-black text-white"><UserRound className="size-5 text-sky-300" /> Contact Owner</div>
              <form action={assignContactOwner} className="grid gap-3">
                <input type="hidden" name="leadId" value={contact.id} />
                <select name="ownerId" defaultValue={contact.assignedTo} className="input">
                  <option value="">Unassigned</option>
                  {members.map((member: any) => <option key={member.id} value={member.id}>{member.full_name || member.email} · {member.role}</option>)}
                </select>
                <button className="btn w-fit" type="submit">Update Owner</button>
              </form>
              <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4"><div className="label">Current Owner</div><div className="mt-1 font-bold text-white">{owner?.full_name || owner?.email || "Unassigned"}</div></div>
            </div>

            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2 font-black text-white"><Building2 className="size-5 text-sky-300" /> Pipeline Snapshot</div>{inPipeline ? <Link href="/pipeline-clients" className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200">In Pipeline</Link> : <form action={addContactToPipeline}><input type="hidden" name="leadId" value={contact.id} /><button type="submit" className="rounded-lg border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-xs font-black text-sky-200">Add to Pipeline</button></form>}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="surface p-4"><div className="label">Rank</div><div className="mt-1 font-black text-white">{contact.pipelineRank || "Warm"}</div></div>
                <div className="surface p-4"><div className="label">Stage</div><div className="mt-1 font-black text-white">{contact.pipelineStatus || "Next Up"}</div></div>
                <div className="surface p-4"><div className="label">Retainer</div><div className="mt-1 font-black text-white">{money(contact.monthlyRetainer)}</div></div>
                <div className="surface p-4"><div className="label">Monthly Profit</div><div className="mt-1 font-black text-white">{money(contact.estimatedMonthlyProfit)}</div></div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2 font-black text-white"><NotebookPen className="size-5 text-sky-300" /> Add Timestamped Note</div>
            <form action={addContactNote} className="grid gap-4">
              <input type="hidden" name="leadId" value={contact.id} />
              <textarea name="note" rows={5} className="input resize-none" placeholder="Add a note anytime. It will be saved to the activity timeline with the current time." />
              <button className="btn w-fit" type="submit">Save Note</button>
            </form>
          </div>

          <div className="card p-6">
            <div className="mb-4 font-black text-white">Log Call Outcome</div>
            <form action={logContactOutcome} className="grid gap-4">
              <input type="hidden" name="leadId" value={contact.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="outcome">Outcome</label><select id="outcome" name="outcome" className="input mt-2"><option>Called</option><option>Callback</option><option>Follow Up</option><option>Interested</option><option>Booked</option><option>DNC</option><option>Lost</option></select></div>
                <div><label className="label">Quick Actions</label><div className="mt-2 grid grid-cols-2 gap-2"><a className="btn btn-secondary" href={contact.phone ? `tel:${contact.phone}` : "#"}>Call</a><a className="btn btn-secondary" href={contact.phone ? `sms:${contact.phone}` : "#"}>Text</a></div></div>
              </div>
              <div><label className="label" htmlFor="note">Call Note</label><textarea id="note" name="note" rows={5} className="input mt-2 resize-none" placeholder="Outcome, objection, next step, and timing." /></div>
              <button type="submit" className="btn w-fit">Save Call Log</button>
            </form>
          </div>
        </section>

        <aside className="card p-6">
          <div className="mb-5 flex items-center justify-between"><div className="label">Activity Timeline</div><CalendarClock className="size-5 text-sky-300" /></div>
          <div className="space-y-3">
            {activities.length ? activities.map((item) => <div key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><div className="font-black text-white">{item.outcome || typeLabel(item.type)}</div><span className="badge">{typeLabel(item.type)}</span></div><div className="mt-1 text-xs text-slate-500">{dateTime(item.createdAt)}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-5 text-slate-300">{item.note || "No note"}</p></div>) : <p className="text-sm text-slate-400">No activity yet. Add a note or log the first call.</p>}
          </div>
        </aside>
      </div>
    </>
  );
}
