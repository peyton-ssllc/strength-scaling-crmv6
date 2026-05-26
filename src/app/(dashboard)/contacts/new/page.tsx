import { PageHeader } from "@/components/crm/page-header";
import { createContact } from "../actions";

export default function NewContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contacts" title="Add contact" description="Manually add a gym lead or potential client without importing a CSV." />
      <form action={createContact} className="card grid gap-5 p-6">
        <div className="grid gap-4 md:grid-cols-2"><div><label className="label">Business Name *</label><input name="businessName" className="input mt-2" required /></div><div><label className="label">Primary Contact</label><input name="contactName" className="input mt-2" /></div><div><label className="label">Owner Name</label><input name="ownerName" className="input mt-2" /></div><div><label className="label">Phone</label><input name="phone" className="input mt-2" /></div><div><label className="label">Email</label><input name="email" type="email" className="input mt-2" /></div><div><label className="label">Website</label><input name="website" className="input mt-2" /></div><div><label className="label">City</label><input name="city" className="input mt-2" /></div><div><label className="label">State</label><input name="state" className="input mt-2" /></div><div><label className="label">Status</label><select name="status" className="input mt-2"><option>New</option><option>Called</option><option>Follow Up</option><option>Interested</option><option>Booked</option><option>Lost</option><option>DNC</option></select></div><div><label className="label">Score</label><input name="score" type="number" min="0" max="100" defaultValue="50" className="input mt-2" /></div><div><label className="label">Source</label><input name="source" defaultValue="Manual Entry" className="input mt-2" /></div></div>
        <div><label className="label">Notes</label><textarea name="notes" rows={5} className="input mt-2 resize-none" /></div>
        <button className="btn w-fit" type="submit">Create Contact</button>
      </form>
    </>
  );
}
