import { PageHeader } from "@/components/crm/page-header";
import { ImportForm } from "@/components/crm/import-form";

export default function ImportLeadsPage() {
  return (
    <>
      <PageHeader eyebrow="Import Leads" title="Lead import center" description="Upload gym owner CSVs directly into the CRM and send them straight into Contacts and My Queue." />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]"><ImportForm /><aside className="surface p-5"><div className="label">Clean CSV Tips</div><p className="mt-3 text-sm leading-6 text-slate-300">Best columns are business name, owner or contact, phone, email, city, state, source, score, and notes. The importer accepts common column names automatically.</p></aside></div>
    </>
  );
}
