import { PageHeader } from "@/components/crm/page-header";
import { createContact } from "../../contacts/actions";

export default function NewPipelineAccountPage() {
  return (
    <>
      <PageHeader eyebrow="Pipeline & Clients" title="New account" description="Add a potential client to the pipeline with notes, value context, and next-step status." />
      <form action={createContact} className="card grid gap-5 p-6">
        <input type="hidden" name="source" value="Pipeline Manual Entry" />
        <div className="grid gap-4 md:grid-cols-2"><div><label className="label">Business Name *</label><input name="businessName" className="input mt-2" required /></div><div><label className="label">Primary Contact</label><input name="contactName" className="input mt-2" /></div><div><label className="label">Phone</label><input name="phone" className="input mt-2" /></div><div><label className="label">Email</label><input name="email" type="email" className="input mt-2" /></div><div><label className="label">Website</label><input name="website" className="input mt-2" /></div><div><label className="label">Status</label><select name="status" defaultValue="Interested" className="input mt-2"><option>Interested</option><option>Follow Up</option><option>Booked</option><option>Called</option><option>Lost</option></select></div><div><label className="label">Lead Ranking Score</label><input name="score" type="number" min="0" max="100" defaultValue="75" className="input mt-2" /></div><div><label className="label">City</label><input name="city" className="input mt-2" /></div></div>
        <div><label className="label">Pipeline Notes</label><textarea name="notes" rows={7} className="input mt-2 resize-none" placeholder="Pricing, offer discussed, package fit, objection, next step, decision makers." /></div>
        <button className="btn w-fit" type="submit">Save Account</button>
      </form>
    </>
  );
}
