import Link from "next/link";
import { Plus, Search, Upload } from "lucide-react";
import { getContacts } from "@/lib/contacts-service";

function statusClass(status: string) {
  if (status === "Booked") return "border-emerald-300/30 bg-emerald-400/10 text-emerald-200";
  if (status === "Interested") return "border-sky-300/30 bg-sky-400/10 text-sky-200";
  if (status === "Called") return "border-blue-300/30 bg-blue-400/10 text-blue-200";
  if (status === "Follow Up") return "border-amber-300/30 bg-amber-400/10 text-amber-200";
  if (status === "DNC" || status === "Lost") return "border-red-300/30 bg-red-400/10 text-red-200";
  return "border-white/10 bg-white/[0.06] text-slate-200";
}

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 inline-flex rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">
          Contacts
        </p>
        <h1 className="text-4xl font-black tracking-tight text-white">Lead database</h1>
        <p className="mt-2 text-slate-400">
          A clean searchable view of every gym lead, owner, status, and score.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex h-11 max-w-md items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-slate-400">
            <Search className="size-4 text-slate-500" />
            <span>{contacts.length} contacts loaded</span>
          </div>

          <div className="flex gap-3">
            <Link
              href="/contacts/new"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white transition hover:bg-white/[0.08]"
            >
              <Plus className="size-4" />
              Add Contact
            </Link>

            <Link
              href="/import-leads"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-400 px-4 text-sm font-black text-black transition hover:bg-sky-300"
            >
              <Upload className="size-4" />
              Import Leads
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr_180px_90px] border-b border-white/10 bg-white/[0.02] px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500">
          <div>Lead</div>
          <div>Contact</div>
          <div>Status</div>
          <div className="text-right">Score</div>
        </div>

        <div className="divide-y divide-white/10">
          {contacts.map((contact) => (
            <Link
              key={contact.id}
              href={`/contacts/${contact.id}`}
              className="grid grid-cols-[1.4fr_1fr_180px_90px] items-center gap-4 px-5 py-4 transition hover:bg-white/[0.04]"
            >
              <div className="min-w-0">
                <div className="truncate text-base font-black text-white">
                  {contact.business}
                </div>
                <div className="mt-1 truncate text-sm text-slate-500">
                  {[contact.city, contact.state].filter(Boolean).join(", ") ||
                    contact.source ||
                    "No location"}
                </div>
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-200">
                  {contact.contact || "No contact name"}
                </div>
                <div className="mt-1 truncate text-sm text-slate-500">
                  {contact.phone || contact.email || "No contact info"}
                </div>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
                    contact.status
                  )}`}
                >
                  {contact.status}
                </span>
              </div>

              <div className="text-right text-lg font-black text-sky-200">
                {contact.score}
              </div>
            </Link>
          ))}

          {contacts.length === 0 && (
            <div className="px-5 py-12 text-center text-slate-500">
              No contacts yet. Import a CSV or add your first contact.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
