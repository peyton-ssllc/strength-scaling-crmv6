import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/crm/page-header";
import { getLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await getLeads(500);
  return (
    <>
      <PageHeader eyebrow="Contacts" title="Lead database" description="A fast searchable view of every gym lead, status, score, and source." />
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 text-sm text-slate-400 md:w-96"><Search className="size-4" /> {contacts.length} contacts loaded</div>
          <div className="flex gap-2"><Link href="/contacts/new" className="btn btn-secondary"><Plus className="size-4" /> Add Contact</Link><Link href="/import-leads" className="btn">Import Leads</Link></div>
        </div>
        <div className="hidden grid-cols-[1.1fr_.8fr_.55fr_.35fr] border-b border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[.18em] text-slate-500 md:grid"><div>Lead</div><div>Contact</div><div>Status</div><div className="text-right">Score</div></div>
        <div className="divide-y divide-white/10">
          {contacts.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}`} className="table-row grid gap-3 p-4 md:grid-cols-[1.1fr_.8fr_.55fr_.35fr] md:items-center">
              <div><div className="font-black text-white">{contact.business}</div><div className="mt-1 text-sm text-slate-500">{[contact.city, contact.state].filter(Boolean).join(", ") || contact.source || "Imported lead"}</div></div>
              <div><div className="text-sm font-bold text-slate-200">{contact.contact || "No contact"}</div><div className="text-sm text-slate-500">{contact.phone || contact.email || "No contact info"}</div></div>
              <div><span className="badge">{contact.status}</span></div>
              <div className="text-right text-lg font-black text-sky-200">{contact.score}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
