"use server";

import { revalidatePath } from "next/cache";
import { importCsvLeads } from "@/lib/import";
import { requireCurrentProfile } from "@/lib/auth/server";

export type UploadLeadsState = { ok: boolean; message: string };

export async function uploadLeads(_previousState: UploadLeadsState, formData: FormData): Promise<UploadLeadsState> {
  try {
    const profile = await requireCurrentProfile();
    const file = formData.get("file");
    const assignedToValue = formData.get("assigned_to");
    const selectedOwner = typeof assignedToValue === "string" && assignedToValue.trim() ? assignedToValue.trim() : null;
    const assignedTo = profile.role === "admin" ? selectedOwner : profile.id;
    if (!(file instanceof File)) return { ok: false, message: "Choose a CSV file first." };
    const text = await file.text();
    const result = await importCsvLeads(text, file.name, assignedTo);
    revalidatePath("/contacts");
    revalidatePath("/queue");
    revalidatePath("/dashboard");
    revalidatePath("/pipeline-clients");
    return { ok: true, message: `Imported ${result.inserted} leads. ${assignedTo ? "Owner assigned." : "No owner selected."}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Import failed." };
  }
}
